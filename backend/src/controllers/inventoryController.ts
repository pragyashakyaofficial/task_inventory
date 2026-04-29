import { Request, Response, NextFunction } from 'express';
import Inventory from '../models/Inventory';
import InventoryLog from '../models/InventoryLog';
import Restaurant from '../models/Restaurant';
import { getReorderSuggestion  } from '../services/aiService';

interface AuthRequest extends Request {
  user?: any;
}

// Get all inventory items for a restaurant
export const getAllInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId, categoryId, status } = req.query as any;

    // Determine restaurant filter
    let targetRestaurantId: any;
    if (req.user?.role === 'manager') {
      targetRestaurantId = req.user.restaurantId;
    } else if (restaurantId) {
      targetRestaurantId = restaurantId;
    } else {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    // Build filter
    const filter: any = {
      restaurantId: targetRestaurantId,
      isDeleted: false
    };

    if (categoryId) filter.categoryId = categoryId;

    const items = await Inventory.find(filter)
      .populate('categoryId', 'name')
      .populate('lastUpdatedBy', 'name')
      .sort({ name: 1 });

    // Add computed fields to response
    const mappedItems = items.map(item => ({
      ...item.toObject(),
      status: item.getStatus(),
      suggestedOrder: item.maxStock - item.currentStock
    }));

    // Filter by status if requested
    const result = status
      ? mappedItems.filter(item => item.status === status)
      : mappedItems;

    res.status(200).json({
      count: result.length,
      inventory: result
    });
  } catch (error) {
    next(error);
  }
};

// Get single inventory item
export const getInventoryItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
export const createInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      category,
      categoryId,
      restaurantId,
      unit = 'pcs',
      sku,
      price,
      description,
      currentStock = 0,
      minThreshold = 0,
      maxStock = 100,
      minimumStock,
      quantity
    } = req.body;

    // Determine restaurant
    let targetRestaurantId = restaurantId;
    if (req.user?.role === 'manager') {
      targetRestaurantId = req.user.restaurantId;
    }

    if (!targetRestaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    // Resolve categoryId from category name if not provided
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && category) {
      const Category = require('../models/Category').default;
      const foundCategory = await Category.findOne({
        name: category.trim(),
        restaurantId: targetRestaurantId,
        isDeleted: false
      });
      if (!foundCategory) {
        return res.status(400).json({ message: `Category "${category}" not found` });
      }
      resolvedCategoryId = foundCategory._id;
    }

    if (!resolvedCategoryId) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const item = await Inventory.create({
      name: name.trim(),
      categoryId: resolvedCategoryId,
      restaurantId: targetRestaurantId,
      unit,
      sku,
      price: price || 0,
      description,
      currentStock: quantity !== undefined ? quantity : currentStock,
      minThreshold: minimumStock !== undefined ? minimumStock : minThreshold,
      maxStock,
      lastUpdatedBy: req.user?.id
    });

    const populatedItem = await Inventory.findById(item._id)
      .populate('categoryId', 'name');

    if (!populatedItem) {
      return res.status(500).json({ message: 'Failed to retrieve created item' });
    }

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
export const updateInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body as Record<string, any>;

    const item = await Inventory.findById(id);

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check access
    if (req.user?.role === 'manager' &&
        req.user.restaurantId?.toString() !== item.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    // Prevent changing restaurant directly via this route
    delete updates.restaurantId;

    // Resolve category name to categoryId if needed
    if (updates.category && !updates.categoryId) {
      const Category = require('../models/Category').default;
      const foundCategory = await Category.findOne({
        name: updates.category.trim(),
        restaurantId: item.restaurantId,
        isDeleted: false
      });
      if (foundCategory) {
        updates.categoryId = foundCategory._id;
      }
      delete updates.category;
    }

    // Map frontend field names to backend field names
    if (updates.quantity !== undefined) {
      updates.currentStock = updates.quantity;
      delete updates.quantity;
    }
    if (updates.minimumStock !== undefined) {
      updates.minThreshold = updates.minimumStock;
      delete updates.minimumStock;
    }
    if (updates.maxQuantity !== undefined) {
      updates.maxStock = updates.maxQuantity;
      delete updates.maxQuantity;
    }

    // Track if stock changed for logging
    const stockChanged = updates.currentStock !== undefined &&
                         updates.currentStock !== item.currentStock;
    const previousStock = item.currentStock;

    // Apply updates
    (Object.keys(updates) as Array<keyof typeof updates>).forEach(key => {
      if (updates[key] !== undefined) {
        (item as any)[key] = updates[key];
      }
    });

    item.lastUpdatedBy = req.user?.id;
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
        createdBy: req.user?.id
      });
    }

    const populatedItem = await Inventory.findById(item._id)
      .populate('categoryId', 'name')
      .populate('lastUpdatedBy', 'name');

    if (!populatedItem) {
      return res.status(500).json({ message: 'Failed to retrieve updated item' });
    }

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
export const updateStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { newStock, note } = req.body as any;

    if (newStock === undefined || newStock < 0) {
      return res.status(400).json({ message: 'Valid new stock value is required' });
    }

    const item = await Inventory.findById(id);

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check access
    if (req.user?.role === 'manager' &&
        req.user.restaurantId?.toString() !== item.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    await item.updateStock(newStock, req.user?.id, note || 'Stock adjustment');

    const populatedItem = await Inventory.findById(item._id)
      .populate('categoryId', 'name')
      .populate('lastUpdatedBy', 'name');

    if (!populatedItem) {
      return res.status(500).json({ message: 'Failed to retrieve updated item' });
    }

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
export const deleteInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findById(id);

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check access
    if (req.user?.role === 'manager' &&
        req.user.restaurantId?.toString() !== item.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    await item.softDelete(req.user?.id);

    res.status(200).json({
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get reorder plan (items with LOW or OUT status) - PUBLIC ENDPOINT
export const getReorderPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.query as any;

    // Determine restaurant - support both authenticated and public access
    let targetRestaurantId: any;
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
        return res.status(404).json({
          success: false,
          suggestions: [],
          message: 'No restaurants found. Please seed the database first.'
        });
      }
    }

    const reorderItems = await Inventory.getReorderPlan(targetRestaurantId);

    // Build suggestions with AI-powered reasoning (fallback if AI unavailable)
    const suggestions = await Promise.all(
      reorderItems.map(async (item: any) => {
        let aiResult;
        try {
          aiResult = await getReorderSuggestion({
            name: item.name,
            quantity: item.currentStock,
            status: item.status,
            minThreshold: item.minThreshold,
            maxStock: item.maxStock,
          });
        } catch {
          aiResult = null;
        }

        const shouldReorder = aiResult ? aiResult.shouldReorder : item.status !== 'OK';
        const suggestedQuantity = aiResult
          ? aiResult.suggestedQuantity
          : item.suggestedOrder;
        const reason = aiResult
          ? aiResult.reason
          : `${item.name} is ${item.status === 'OUT' ? 'out of stock' : 'below minimum threshold'}. Suggest ordering ${item.suggestedOrder} ${item.unit}.`;

        return {
          itemId: item._id,
          name: item.name,
          category: item.category,
          currentQuantity: item.currentStock,
          minThreshold: item.minThreshold,
          maxStock: item.maxStock,
          unit: item.unit,
          status: item.status,
          shouldReorder,
          suggestedQuantity,
          reason,
          price: (item as any).price || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      suggestions,
      message: suggestions.length === 0
        ? 'All items are sufficiently stocked.'
        : `Found ${suggestions.length} items that need reordering.`,
    });
  } catch (error) {
    next(error);
  }
};

// Get inventory summary/stats
export const getInventoryStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.query as any;

    // Determine restaurant
    let targetRestaurantId: any;
    if (req.user?.role === 'manager') {
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
export const predictReorder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findById(id)
      .populate('categoryId', 'name')
      .populate('restaurantId', 'name location');

    if (!item || item.isDeleted) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check access
    if (req.user?.role === 'manager' &&
        req.user.restaurantId?.toString() !== (item.restaurantId as any)._id.toString()) {
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
