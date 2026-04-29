import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Inventory from '../models/Inventory';

interface AuthRequest extends Request {
  user?: any;
}

// Create a new order
export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { itemId, quantityOrdered, unit, remarks } = req.body;

    if (!itemId || quantityOrdered === undefined) {
      return res.status(400).json({ message: 'Item ID and quantity are required' });
    }

    // Determine restaurant
    let restaurantId = req.body.restaurantId;
    if (req.user?.role === 'manager') {
      restaurantId = req.user.restaurantId;
    }

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    // Verify item exists
    const item = await Inventory.findOne({ _id: itemId, restaurantId, isDeleted: false });
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const order = await Order.create({
      itemId,
      restaurantId,
      quantityOrdered,
      unit: unit || item.unit || 'pcs',
      orderedBy: req.user?.id,
      remarks,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('itemId', 'name category unit price sku')
      .populate('orderedBy', 'name email');

    res.status(201).json({
      message: 'Order placed successfully',
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (with filter: pending or received)
export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let restaurantId = req.query.restaurantId as string;
    if (req.user?.role === 'manager') {
      restaurantId = req.user.restaurantId;
    }

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const { isReceived, status } = req.query;
    const filter: any = { restaurantId };

    if (isReceived !== undefined) {
      filter.isReceived = isReceived === 'true';
    }

    const orders = await Order.find(filter)
      .populate('itemId', 'name category unit price sku')
      .populate('orderedBy', 'name email')
      .populate('receivedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single order
export const getOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('itemId', 'name category unit price sku')
      .populate('orderedBy', 'name email')
      .populate('receivedBy', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
};

// Mark order as received
export const receiveOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check access
    if (req.user?.role === 'manager' &&
        req.user.restaurantId?.toString() !== order.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    if (order.isReceived) {
      return res.status(400).json({ message: 'Order already received' });
    }

    order.isReceived = true;
    order.receivedBy = req.user?.id;
    if (remarks) order.remarks = remarks;
    await order.save();

    // Update inventory stock
    const inventoryItem = await Inventory.findById(order.itemId);
    if (inventoryItem && !inventoryItem.isDeleted) {
      inventoryItem.currentStock += order.quantityOrdered;
      inventoryItem.lastUpdatedBy = req.user?.id;
      await inventoryItem.save();
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('itemId', 'name category unit price sku')
      .populate('orderedBy', 'name email')
      .populate('receivedBy', 'name email');

    res.status(200).json({
      message: 'Order marked as received and inventory updated',
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// Delete an order
export const deleteOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check access
    if (req.user?.role === 'manager' &&
        req.user.restaurantId?.toString() !== order.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    await order.deleteOne();

    res.status(200).json({
      message: 'Order deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
