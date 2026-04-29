// @ts-nocheck
import Inventory from '../models/Inventory';
import InventoryLog from '../models/InventoryLog';
import Restaurant from '../models/Restaurant';
import { getReorderSuggestion  } from '../services/aiService';

// Get all inventory items for a restaurant
export const getAllInventory = async (req: any, res: any, next: any) => {
  try {
    const { restaurantId, categoryId, status } = req.query;

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
    let filter = {
      restaurantId: targetRestaurantId,
      isDeleted: false
    };

    if (categoryId) filter.categoryId = categoryId;

    let items = await Inventory.find(filter)
      .populate('categoryId', 'name')
      .populate('lastUpdatedBy', 'name')
      .sort({ name: 1 });

    // Add computed fields to response
    items = items.map(item => ({
      ...item.toObject(),
      status: item.getStatus(),
      suggestedOrder: item.maxStock - item.currentStock
    }));

    // Filter by status if requested
    if (status) {
      items = items.filter(item => item.status === status);
    }

    res.status(200).json({
      count: items.length,
      inventory: items
    });
  } catch (error) {
    next(error);
  }
};

// Get single inventory item
export const getInventoryItem = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findById(id)
      .populate('categoryId', 'name')
      .populate('lastUpdatedBy', 'name')
      .populate('restaurantId', 'name location');

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== item.restaurantId._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    res.status(200).json({
      inventory: {
        ...item.toObject(),
        status: item.getStatus(),
        suggestedOrder: item.maxStock - item.currentStock
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create inventory item
export const createInventory = async (req: any, res: any, next: any) => {
  try {
    const {
      name,
      categoryId,
      restaurantId,
      unit,
      currentStock = 0,
      minThreshold = 0,
      maxStock = 100
    } = req.body;

    // Determine restaurant
    let targetRestaurantId = restaurantId;
    if (req.user.role === 'manager') {
      targetRestaurantId = req.user.restaurantId;
    }

    if (!targetRestaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const item = await Inventory.create({
      name: name.trim(),
      categoryId,
      restaurantId: targetRestaurantId,
      unit,
      currentStock,
      minThreshold,
      maxStock,
      lastUpdatedBy: req.user.id
    });

    const populatedItem = await Inventory.findById(item._id)
      .populate('categoryId', 'name');

    res.status(201).json({
      message: 'Inventory item created successfully',
      inventory: {
        ...populatedItem.toObject(),
        status: populatedItem.getStatus(),
        suggestedOrder: populatedItem.maxStock - populatedItem.currentStock
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update inventory item
export const updateInventory = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await Inventory.findById(id);

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== item.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    // Prevent changing restaurant or category directly via this route
    delete updates.restaurantId;

    // Track if stock changed for logging
    const stockChanged = updates.currentStock !== undefined &&
                         updates.currentStock !== item.currentStock;
    const previousStock = item.currentStock;

    // Apply updates
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        item[key] = updates[key];
      }
    });

    item.lastUpdatedBy = req.user.id;
    await item.save();

    // Create log if stock changed
    if (stockChanged) {
      await InventoryLog.create({
        inventoryId: item._id,
        restaurantId: item.restaurantId,
        action: updates.currentStock > previousStock ? 'ADD' :
                updates.currentStock < previousStock ? 'REMOVE' : 'ADJUST',
        quantity: updates.currentStock - previousStock,
        previousStock,
        newStock: updates.currentStock,
        note: req.body.note || 'Stock updated',
        createdBy: req.user.id
      });
    }

    const populatedItem = await Inventory.findById(item._id)
      .populate('categoryId', 'name')
      .populate('lastUpdatedBy', 'name');

    res.status(200).json({
      message: 'Inventory item updated successfully',
      inventory: {
        ...populatedItem.toObject(),
        status: populatedItem.getStatus(),
        suggestedOrder: populatedItem.maxStock - populatedItem.currentStock
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update stock (dedicated endpoint for stock changes)
export const updateStock = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { newStock, note } = req.body;

    if (newStock === undefined || newStock < 0) {
      return res.status(400).json({ message: 'Valid new stock value is required' });
    }

    const item = await Inventory.findById(id);

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== item.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    await item.updateStock(newStock, req.user.id, note || 'Stock adjustment');

    const populatedItem = await Inventory.findById(item._id)
      .populate('categoryId', 'name')
      .populate('lastUpdatedBy', 'name');

    res.status(200).json({
      message: 'Stock updated successfully',
      inventory: {
        ...populatedItem.toObject(),
        status: populatedItem.getStatus(),
        suggestedOrder: populatedItem.maxStock - populatedItem.currentStock
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete inventory item (soft delete)
export const deleteInventory = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findById(id);

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== item.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    await item.softDelete(req.user.id);

    res.status(200).json({
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get reorder plan (items with LOW or OUT status) - PUBLIC ENDPOINT
export const getReorderPlan = async (req: any, res: any, next: any) => {
  try {
    const { restaurantId } = req.query;

    // Determine restaurant - support both authenticated and public access
    let targetRestaurantId;
    if (req.user && req.user.role === 'manager') {
      // Authenticated manager - use their restaurant
      targetRestaurantId = req.user.restaurantId;
    } else if (restaurantId) {
      // Public access or admin - use provided restaurant ID
      targetRestaurantId = restaurantId;
    } else {
      // For demo purposes, return first restaurant's data if no ID provided
      const firstRestaurant = await Restaurant.findOne();
      if (firstRestaurant) {
        targetRestaurantId = firstRestaurant._id;
      } else {
        return res.status(404).json({ message: 'No restaurants found. Please seed the database first.' });
      }
    }

    const reorderItems = await Inventory.getReorderPlan(targetRestaurantId);

    res.status(200).json({
      count: reorderItems.length,
      reorderPlan: reorderItems
    });
  } catch (error) {
    next(error);
  }
};

// Get inventory summary/stats
export const getInventoryStats = async (req: any, res: any, next: any) => {
  try {
    const { restaurantId } = req.query;

    // Determine restaurant
    let targetRestaurantId;
    if (req.user.role === 'manager') {
      targetRestaurantId = req.user.restaurantId;
    } else if (restaurantId) {
      targetRestaurantId = restaurantId;
    } else {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const items = await Inventory.find({
      restaurantId: targetRestaurantId,
      isDeleted: false
    });

    const stats = {
      total: items.length,
      outOfStock: items.filter(i => i.currentStock === 0).length,
      lowStock: items.filter(i => i.currentStock > 0 && i.currentStock <= i.minThreshold).length,
      ok: items.filter(i => i.currentStock > i.minThreshold).length
    };

    // Get critical stock alerts (items that are out of stock or low stock)
    const criticalStockAlerts = items
      .filter(i => i.currentStock <= i.minThreshold)
      .map(item => ({
        ...item.toObject(),
        status: item.currentStock === 0 ? 'out-of-stock' : 'low-stock'
      }));

    res.status(200).json({
      stats,
      criticalStockAlerts
    });
  } catch (error) {
    next(error);
  }
};

// AI-powered reorder prediction for a specific item
export const predictReorder = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findById(id)
      .populate('categoryId', 'name')
      .populate('restaurantId', 'name location');

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== item.restaurantId._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    // Call AI service for prediction
    const aiPrediction = await getReorderSuggestion({
      name: item.name,
      quantity: item.currentStock,
      status: item.getStatus(),
      minThreshold: item.minThreshold,
      maxStock: item.maxStock
    });

    // Determine when to reorder based on prediction
    let when = 'No immediate action needed';
    if (aiPrediction.shouldReorder) {
      if (item.currentStock === 0) {
        when = 'Immediately - Item is out of stock';
      } else if (item.currentStock <= item.minThreshold) {
        when = 'Within 1-2 days - Stock is critically low';
      } else {
        when = 'Within 3-5 days - Plan ahead for demand';
      }
    }

    res.status(200).json({
      suggestedQuantity: aiPrediction.suggestedQuantity,
      when: when,
      reason: aiPrediction.reason
    });
  } catch (error) {
    next(error);
  }
};
