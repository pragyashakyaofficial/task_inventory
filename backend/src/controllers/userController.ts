import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request { user?: any; }
import User from '../models/User';
import Restaurant from '../models/Restaurant';
import mongoose from 'mongoose';

// Get all users (superadmin only)
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, status, restaurantId } = req.query;
    const filter: any = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (restaurantId) filter.restaurantId = restaurantId;

    const users = await User.find(filter)
      .populate('restaurantId', 'name location status')
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Get users by restaurant (for superadmin managing a restaurant)
export const getUsersByRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;

    const users = await User.find({
      restaurantId,
      role: 'manager'
    })
      .populate('restaurantId', 'name location status')
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Get single user
export const getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('restaurantId', 'name location status')
      .select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// Create manager (superadmin only)
export const createManager = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, restaurantId } = req.body;

    console.log('Creating manager with data:', { name, email, restaurantId });

    // Validate required fields
    if (!name || !email || !password || !restaurantId) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        missing: {
          name: !name,
          email: !email,
          password: !password,
          restaurantId: !restaurantId
        }
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant ID format' });
    }

    // Validate restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({ message: 'User already exists with this email' });
    }

    console.log('All validations passed, creating user...');
    const newManager = await User.create({
      name,
      email,
      password,
      role: 'manager',
      restaurantId,
      status: 'ACTIVE'
    });

    const manager = await User.findById(newManager._id)
      .populate('restaurantId', 'name location status')
      .select('-password -refreshToken');

    res.status(201).json({
      message: 'Manager created successfully',
      user: manager
    });
  } catch (error: unknown) {
    console.error('Error creating manager:', error);
    
    // Handle validation errors specifically
    if (error instanceof Error && (error as any).name === 'ValidationError') {
      const errors = Object.values((error as any).errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }
    
    // Handle duplicate key errors
    if (error instanceof Error && (error as any).code === 11000) {
      return res.status(422).json({ 
        message: 'User already exists with this email' 
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user (superadmin can update anyone, manager can only update self)
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates.role;
    delete updates.refreshToken;

    // If manager, can only update self
    if (req.user.role === 'manager' && req.user.id !== id) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    // If changing restaurant, validate it exists
    if (updates.restaurantId) {
      const restaurant = await Restaurant.findById(updates.restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('restaurantId', 'name location status')
      .select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// Update user status (activate/deactivate)
export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(422).json({ message: 'Status must be ACTIVE or INACTIVE' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('restaurantId', 'name location status')
      .select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: `User ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (superadmin only) - soft delete via status
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user.id === id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status: 'INACTIVE' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile with full details
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('restaurantId', 'name location status')
      .select('-password -refreshToken');

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
