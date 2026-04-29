import * as express from 'express';
import { body  } from 'express-validator';
import * as stockRequestController from '../controllers/stockRequestController';
import * as authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.protect);

// Routes
router.get('/', stockRequestController.getStockRequests);
router.get('/:id', stockRequestController.getStockRequest);

router.post(
  '/',
  [
    body('inventoryId').notEmpty().withMessage('Inventory ID is required'),
    body('requestedQuantity').isInt({ min: 1 }).withMessage('Requested quantity must be at least 1')
  ],
  stockRequestController.createStockRequest
);

router.patch('/:id/approve', stockRequestController.approveStockRequest);
router.patch('/:id/reject', stockRequestController.rejectStockRequest);
router.patch('/:id/fulfill', stockRequestController.fulfillStockRequest);

export default router;
