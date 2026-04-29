import * as express from 'express';
import { body  } from 'express-validator';
import * as authController from '../controllers/authController';
import * as authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 chars'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 chars'),
  body('role').optional().isIn(['superadmin', 'manager']).withMessage('Role must be superadmin or manager'),
  body('restaurantId').optional().isMongoId().withMessage('Invalid restaurant ID')
];

// Public routes - authLimiter temporarily disabled for development
router.post('/register', registerValidation, authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protected routes
router.use(authMiddleware.protect);
router.get('/profile', authController.getProfile);
router.post('/logout', authController.logout);
router.patch('/update-password', authController.updatePassword);

export default router;
