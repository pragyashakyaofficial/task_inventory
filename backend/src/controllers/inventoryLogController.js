const InventoryLog = require('../models/InventoryLog');

// Get all logs for a restaurant
exports.getAllLogs = async (req, res, next) => {
  try {
    const { restaurantId, inventoryId, action, limit = 50, page = 1 } = req.query;

    // Determine restaurant filter
    let targetRestaurantId;
    if (req.user.role === 'manager') {
      targetRestaurantId = req.user.restaurantId;
    } else if (restaurantId) {
      targetRestaurantId = restaurantId;
    } else {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    // Build filter
    let filter = { restaurantId: targetRestaurantId };
    if (inventoryId) filter.inventoryId = inventoryId;
    if (action) filter.action = action;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await InventoryLog.find(filter)
      .populate('inventoryId', 'name unit')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await InventoryLog.countDocuments(filter);

    res.status(200).json({
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      logs
    });
  } catch (error) {
    next(error);
  }
};

// Get logs for a specific inventory item
exports.getItemLogs = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const { limit = 100 } = req.query;

    // First, check if user has access to this inventory item
    const Inventory = require('../models/Inventory');
    const item = await Inventory.findById(inventoryId);

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== item.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    const logs = await InventoryLog.find({ inventoryId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

// Get activity summary
exports.getActivitySummary = async (req, res, next) => {
  try {
    const { restaurantId, days = 7 } = req.query;

    // Determine restaurant
    let targetRestaurantId;
    if (req.user.role === 'manager') {
      targetRestaurantId = req.user.restaurantId;
    } else if (restaurantId) {
      targetRestaurantId = restaurantId;
    } else {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const summary = await InventoryLog.getActivitySummary(targetRestaurantId, parseInt(days));

    // Format summary
    const formatted = {
      total: summary.reduce((acc, item) => acc + item.count, 0),
      byAction: {}
    };

    summary.forEach(item => {
      formatted.byAction[item._id] = {
        count: item.count,
        totalQuantity: item.totalQuantity
      };
    });

    res.status(200).json({
      days: parseInt(days),
      summary: formatted
    });
  } catch (error) {
    next(error);
  }
};

// Get recent activity
exports.getRecentActivity = async (req, res, next) => {
  try {
    const { restaurantId, limit = 50 } = req.query;

    // Determine restaurant
    let targetRestaurantId;
    if (req.user.role === 'manager') {
      targetRestaurantId = req.user.restaurantId;
    } else if (restaurantId) {
      targetRestaurantId = restaurantId;
    } else {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const activity = await InventoryLog.getRecentActivity(targetRestaurantId, parseInt(limit));

    res.status(200).json({
      count: activity.length,
      activity
    });
  } catch (error) {
    next(error);
  }
};
