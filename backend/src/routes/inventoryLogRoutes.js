const express = require('express');
const { query } = require('express-validator');
const inventoryLogController = require('../controllers/inventoryLogController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.protect);

// Get all logs (with filtering)
router.get('/', [
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be 1-500'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be 1-365')
], inventoryLogController.getAllLogs);

// Get recent activity
router.get('/recent', inventoryLogController.getRecentActivity);

// Get activity summary
router.get('/summary', inventoryLogController.getActivitySummary);

// Get logs for specific inventory item
router.get('/item/:inventoryId', inventoryLogController.getItemLogs);

module.exports = router;
