import { Request, Response, NextFunction } from 'express';
import Inventory from '../models/Inventory';
import Restaurant from '../models/Restaurant';
import { getReorderSuggestion  } from '../services/aiService';

// Get all inventory items for a restaurant
export const getAllInventory = async (req: Request, res: Response, next: NextFunction) => {
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
      suggestedOrder: item.minThreshold - item.currentStock
    }));

    // Filter by status if requested
    const result = status
      ? mappedItems.filter(item => item.status === status)
      : mappedItems;

    res.status(200).json({
      status: 'success',
      count: result.length,
      inventory: result
    });
  } catch (error) {
    next(error);
  }
};

// Get reorder plan (items with LOW or OUT status) - PUBLIC ENDPOINT
export const getReorderPlan = async (req: Request, res: Response, next: NextFunction) => {
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
          status: 'error',
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
          aiGenerated: !!aiResult,
          price: (item as any).price || 0,
        };
      })
    );

    res.status(200).json({
      status: 'success',
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
export const getInventoryStats = async (req: Request, res: Response, next: NextFunction) => {
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
      inStock: items.filter(i => i.currentStock > i.minThreshold).length
    };

    // Get critical stock alerts (items that are out of stock or low stock)
    const criticalStockAlerts = items
      .filter(i => i.currentStock <= i.minThreshold)
      .map(item => ({
        ...item.toObject(),
        status: item.currentStock === 0 ? 'out-of-stock' : 'low-stock'
      }));

    res.status(200).json({
      status: 'success',
      stats,
      criticalStockAlerts
    });
  } catch (error) {
    next(error);
  }
};
