const express = require('express');
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.protect);

// Routes
router.get('/', inventoryController.getAllInventory);
router.get('/reorder-plan', inventoryController.getReorderPlan);
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

module.exports = router;
