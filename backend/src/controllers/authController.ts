import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

// Helper to sign tokens
const signToken = (id: any, secret: string, expires: string | number) => {
  return jwt.sign({ id }, secret, { expiresIn: expires as any });
};

// Create and send tokens in response
const createSendToken = async (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id, process.env.JWT_SECRET!, process.env.JWT_EXPIRES_IN || '30d');
  const refreshToken = signToken(user._id, process.env.JWT_REFRESH_SECRET!, process.env.JWT_REFRESH_EXPIRES_IN || '60d');

  // Save refresh token to DB
  await User.findByIdAndUpdate(user._id, { refreshToken }, { validateBeforeSave: false });

  // Populate restaurant if exists
  const populatedUser = await User.findById(user._id).populate('restaurantId', 'name location status');
  if (!populatedUser) throw new Error('User not found after update');

  res.status(statusCode).json({
    token,
    refreshToken,
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

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        status: 'error',
        message: 'Please provide email and password'
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

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    (user as any).refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token is required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    const user = await User.findById(decoded.id);

    if (!user || (user as any).refreshToken !== refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const token = signToken(user._id, process.env.JWT_SECRET!, process.env.JWT_EXPIRES_IN || '30d');

    res.status(200).json({
      token
    });
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired refresh token'
    });
  }
};
