import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request { user?: any; }
import Restaurant from '../models/Restaurant';
import User from '../models/User';

// Get all restaurants (superadmin sees all, manager sees only theirs)
export const getAllRestaurants = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filter: any = { isDeleted: false };

    // Managers can only see their assigned restaurant
    if (req.user?.role === 'manager') {
      filter._id = req.user.restaurantId;
    }

    const restaurants = await Restaurant.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      count: restaurants.length,
      restaurants
    });
  } catch (error) {
    next(error);
  }
};

// Get single restaurant
export const getRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Managers can only access their own restaurant
    if (req.user.role === 'manager' && req.user.restaurantId?.toString() !== id) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant || restaurant.isDeleted) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json({ restaurant });
  } catch (error) {
    next(error);
  }
};

// Create restaurant (superadmin only)
export const createRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, location, logo, establishedYear, status } = req.body;

    const restaurant = await Restaurant.create({
      name,
      location,
      logo,
      establishedYear,
      status: status || 'ACTIVE'
    });

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant
    });
  } catch (error) {
    next(error);
  }
};

// Update restaurant
export const updateRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Managers can only update their own restaurant
    if (req.user.role === 'manager' && req.user.restaurantId?.toString() !== id) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!restaurant || restaurant.isDeleted) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json({
      message: 'Restaurant updated successfully',
      restaurant
    });
  } catch (error) {
    next(error);
  }
};

// Update restaurant status
export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(422).json({ message: 'Status must be ACTIVE or INACTIVE' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!restaurant || restaurant.isDeleted) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json({
      message: `Restaurant ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
      restaurant
    });
  } catch (error) {
    next(error);
  }
};

// Delete restaurant (soft delete - superadmin only)
export const deleteRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant || restaurant.isDeleted) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Soft delete
    await (restaurant as any).softDelete();

    // Deactivate all managers of this restaurant
    await User.updateMany(
      { restaurantId: id, role: 'manager' },
      { status: 'INACTIVE' }
    );

    res.status(200).json({
      message: 'Restaurant deleted and associated managers deactivated'
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant with users
export const getRestaurantWithUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Managers can only access their own restaurant
    if (req.user.role === 'manager' && req.user.restaurantId?.toString() !== id) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant || restaurant.isDeleted) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const users = await User.find({ restaurantId: id, role: 'manager' })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.status(200).json({
      restaurant,
      managers: users
    });
  } catch (error) {
    next(error);
  }
};
