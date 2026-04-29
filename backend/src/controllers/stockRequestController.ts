import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request { user?: any; }
import StockRequest from '../models/StockRequest';
import Inventory from '../models/Inventory';

// Create a new stock request
export const createStockRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { inventoryId, requestedQuantity, notes } = req.body;

    if (!requestedQuantity || requestedQuantity < 1) {
      return res.status(400).json({ message: 'Valid requested quantity is required' });
    }

    // Find the inventory item
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory || inventory.isDeleted) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== inventory.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    // Create stock request
    const stockRequest = await StockRequest.create({
      inventoryId,
      restaurantId: inventory.restaurantId,
      requestedQuantity,
      currentStock: inventory.currentStock,
      requestedBy: req.user.id,
      notes
    });

    const populatedRequest = await StockRequest.findById(stockRequest._id)
      .populate('inventoryId', 'name categoryId unit currentStock minThreshold maxStock')
      .populate('requestedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Stock request created successfully',
      stockRequest: populatedRequest
    });
  } catch (error) {
    next(error);
  }
};

// Get all stock requests for a restaurant
export const getStockRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId, status } = req.query;

    let targetRestaurantId;
    if (req.user.role === 'manager') {
      targetRestaurantId = req.user.restaurantId;
    } else if (restaurantId) {
      targetRestaurantId = restaurantId;
    } else {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const filter: any = {
      restaurantId: targetRestaurantId
    };

    if (status) {
      filter.status = status;
    }

    const stockRequests = await StockRequest.find(filter)
      .populate('inventoryId', 'name categoryId unit currentStock minThreshold maxStock')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stockRequests.length,
      stockRequests
    });
  } catch (error) {
    next(error);
  }
};

// Get single stock request
export const getStockRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const stockRequest = await StockRequest.findById(id)
      .populate('inventoryId', 'name categoryId unit currentStock minThreshold maxStock')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!stockRequest) {
      return res.status(404).json({ message: 'Stock request not found' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== stockRequest.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    res.status(200).json({
      success: true,
      stockRequest
    });
  } catch (error) {
    next(error);
  }
};

// Approve a stock request
export const approveStockRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const stockRequest = await StockRequest.findById(id);
    if (!stockRequest) {
      return res.status(404).json({ message: 'Stock request not found' });
    }

    if (stockRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Stock request has already been processed' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== stockRequest.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    stockRequest.status = 'approved';
    stockRequest.approvedBy = req.user.id;
    await stockRequest.save();

    const populatedRequest = await StockRequest.findById(stockRequest._id)
      .populate('inventoryId', 'name categoryId unit currentStock minThreshold maxStock')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Stock request approved successfully',
      stockRequest: populatedRequest
    });
  } catch (error) {
    next(error);
  }
};

// Reject a stock request
export const rejectStockRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const stockRequest = await StockRequest.findById(id);
    if (!stockRequest) {
      return res.status(404).json({ message: 'Stock request not found' });
    }

    if (stockRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Stock request has already been processed' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== stockRequest.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    stockRequest.status = 'rejected';
    stockRequest.approvedBy = req.user.id;
    await stockRequest.save();

    const populatedRequest = await StockRequest.findById(stockRequest._id)
      .populate('inventoryId', 'name categoryId unit currentStock minThreshold maxStock')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Stock request rejected',
      stockRequest: populatedRequest
    });
  } catch (error) {
    next(error);
  }
};

// Fulfill a stock request (update inventory stock)
export const fulfillStockRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const stockRequest = await StockRequest.findById(id);
    if (!stockRequest) {
      return res.status(404).json({ message: 'Stock request not found' });
    }

    if (stockRequest.status !== 'approved') {
      return res.status(400).json({ message: 'Stock request must be approved before fulfillment' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== stockRequest.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    // Update inventory stock
    const inventory = await Inventory.findById(stockRequest.inventoryId);
    if (!inventory || inventory.isDeleted) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const newStock = inventory.currentStock + stockRequest.requestedQuantity;
    await inventory.updateStock(newStock, req.user.id, `Stock request fulfillment: ${stockRequest.requestedQuantity} units`);

    stockRequest.status = 'fulfilled';
    await stockRequest.save();

    const populatedRequest = await StockRequest.findById(stockRequest._id)
      .populate('inventoryId', 'name categoryId unit currentStock minThreshold maxStock')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Stock request fulfilled and inventory updated',
      stockRequest: populatedRequest
    });
  } catch (error) {
    next(error);
  }
};
