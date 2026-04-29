const express = require('express');
const { body } = require('express-validator');
const stockRequestController = require('../controllers/stockRequestController');
const authMiddleware = require('../middleware/authMiddleware');

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

module.exports = router;
