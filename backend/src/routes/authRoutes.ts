import * as express from 'express';
import * as authController from '../controllers/authController';
import * as authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.use(authMiddleware.protect);
router.post('/logout', authController.logout);

export default router;
