import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult  } from 'express-validator';

interface AuthRequest extends Request {
  user?: any;
}

// Helper to sign tokens
const signToken = (id: any, secret: string, expires: string | number) => {
  return jwt.sign({ id }, secret, { expiresIn: expires as any });
};

// Create and send tokens in response
const createSendToken = async (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id, process.env.JWT_SECRET!, process.env.JWT_EXPIRES_IN || '7d');
  const refreshToken = signToken(user._id, process.env.JWT_REFRESH_SECRET!, process.env.JWT_REFRESH_EXPIRES_IN || '30d');

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

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors: Record<string, string[]> = {};
      errors.array().forEach((err: any) => {
        if (!formattedErrors[err.path]) formattedErrors[err.path] = [];
        formattedErrors[err.path].push(err.msg);
      });
      return res.status(422).json({
        status: 'error',
        message: 'Validation failed',
        errors: formattedErrors
      });
    }

    const { name, email, password, role, restaurantId } = req.body;

    // Only superadmin can register new users (managers)
    // Or this is the first user (superadmin seed)
    const existingSuperadmin = await User.findOne({ role: 'superadmin' });
    const isFirstUser = !existingSuperadmin;

    // If not first user, check if requester is superadmin
    if (!isFirstUser) {
      // Check auth header for token to verify requester is superadmin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized. Only superadmin can create users.'
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const requester = await User.findById(decoded.id);

      if (!requester || requester.role !== 'superadmin') {
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden. Only superadmin can create users.'
        });
      }
    }

    // Validate role
    const validRoles = ['superadmin', 'manager'];
    const userRole = isFirstUser ? 'superadmin' : (role || 'manager');
    if (!validRoles.includes(userRole)) {
      return res.status(422).json({
        status: 'error',
        message: 'Invalid role. Must be superadmin or manager.'
      });
    }

    // Managers must have a restaurant
    if (userRole === 'manager' && !restaurantId) {
      return res.status(422).json({
        status: 'error',
        message: 'Restaurant ID is required for manager role.'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(422).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: userRole,
      restaurantId: userRole === 'manager' ? restaurantId : null
    });

    await createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
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

    if (!user || !(await user.comparePassword(password))) {
      if (user) {
        await user.incLoginAttempts();
      }
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is locked. Please try again later.'
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
    const token = signToken(user._id, process.env.JWT_SECRET!, process.env.JWT_EXPIRES_IN || '7d');
    
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

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id).populate('restaurantId', 'name location status');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurant: user.restaurantId,
      status: user.status,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide old and new password' });
    }

    const user = await User.findById(req.user?.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!(await user.comparePassword(oldPassword))) {
      return res.status(401).json({ message: 'Invalid old password' });
    }

    user.password = newPassword;
    await user.save();

    await createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as any;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email address' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    (user as any).resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    (user as any).resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // In a real app, send email here. For now, return token for testing
    res.status(200).json({
      success: true,
      message: 'Token sent to email (Mocked)',
      resetToken
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(String(req.params.token)).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }
    } as any);

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    user.password = (req.body as any).password;
    (user as any).resetPasswordToken = undefined;
    (user as any).resetPasswordExpiry = undefined;
    await user.save();

    await createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};
