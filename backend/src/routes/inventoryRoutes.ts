import * as express from 'express';
import { body  } from 'express-validator';
import * as inventoryController from '../controllers/inventoryController';
import * as authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (no auth required)
router.get('/reorder-plan', inventoryController.getReorderPlan);

// Protected routes (require authentication)
router.use(authMiddleware.protect);

router.get('/', inventoryController.getAllInventory);
router.get('/stats', inventoryController.getInventoryStats);
router.get('/:id', inventoryController.getInventoryItem);
router.post('/:id', inventoryController.predictReorder);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Item name is required'),
    body('categoryId').isMongoId().withMessage('Valid category ID is required'),
    body('unit').isIn(['kg', 'litre', 'pcs']).withMessage('Unit must be kg, litre, or pcs'),
    body('currentStock').optional().isNumeric().withMessage('Current stock must be a number'),
    body('minThreshold').optional().isNumeric().withMessage('Min threshold must be a number'),
    body('maxStock').optional().isNumeric().withMessage('Max stock must be a number')
  ],
  inventoryController.createInventory
);

router.patch('/:id', inventoryController.updateInventory);

router.patch('/:id/stock', [
  body('newStock').isNumeric().withMessage('New stock must be a number'),
  body('note').optional().isString()
], inventoryController.updateStock);

router.delete('/:id', inventoryController.deleteInventory);

export default router;
