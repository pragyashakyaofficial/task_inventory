import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

// JWT defaults (used when env vars are not set, e.g. fresh setup from .env.example)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// Helper to sign token
const signToken = (id: any) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

// Create and send token in response
const createSendToken = async (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id);

  // Populate restaurant if exists
  const populatedUser = await User.findById(user._id).populate('restaurantId', 'name location status');
  if (!populatedUser) throw new Error('User not found after update');

  res.status(statusCode).json({
    token,
    user: {
      id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: populatedUser.role,
      restaurant: populatedUser.restaurantId,
      status: populatedUser.status
    }
  });
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email'
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked (before password check)
    if (user.isLocked()) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is locked. Please try again later.'
      });
    }

    // Check password
    if (!(await user.comparePassword(password))) {
      await user.incLoginAttempts();
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        status: 'error',
        message: 'Account is inactive. Please contact admin.'
      });
    }

    // Reset attempts on successful login
    await user.resetLoginAttempts();
    user.lastLogin = new Date(Date.now());
    await user.save({ validateBeforeSave: false });

    await createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
