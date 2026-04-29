import * as express from 'express';
import * as inventoryController from '../controllers/inventoryController';
import * as authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (no auth required)
router.get('/reorder-plan', inventoryController.getReorderPlan);

// Protected routes (require authentication)
router.use(authMiddleware.protect);

router.get('/', inventoryController.getAllInventory);
router.get('/stats', inventoryController.getInventoryStats);

export default router;
