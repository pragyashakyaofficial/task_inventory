import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';

interface AuthRequest extends Request { user?: any; }

// Get all categories for a restaurant
export const getAllCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.query as any;

    // Determine restaurant filter
    const filter: any = { isDeleted: false };

    if (req.user?.role === 'manager') {
      filter.restaurantId = req.user.restaurantId;
    } else if (restaurantId) {
      filter.restaurantId = restaurantId;
    } else {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    res.status(200).json({
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// Get single category
export const getCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category || category.isDeleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== category.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};

// Create category
export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, restaurantId } = req.body;

    // Determine restaurant
    let targetRestaurantId = restaurantId;
    if (req.user.role === 'manager') {
      targetRestaurantId = req.user.restaurantId;
    }

    if (!targetRestaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    // Check if category already exists for this restaurant
    const existing = await Category.findOne({
      name: name.trim(),
      restaurantId: targetRestaurantId,
      isDeleted: false
    });

    if (existing) {
      return res.status(422).json({ message: 'Category already exists for this restaurant' });
    }

    const category = await Category.create({
      name: name.trim(),
      restaurantId: targetRestaurantId
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

// Update category
export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findById(id);

    if (!category || category.isDeleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== category.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    // Check for name conflict
    const existing = await Category.findOne({
      name: name.trim(),
      restaurantId: category.restaurantId,
      isDeleted: false,
      _id: { $ne: id }
    });

    if (existing) {
      return res.status(422).json({ message: 'Category with this name already exists' });
    }

    category.name = name.trim();
    await category.save();

    res.status(200).json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

// Delete category (soft delete)
export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category || category.isDeleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check access
    if (req.user.role === 'manager' &&
        req.user.restaurantId?.toString() !== category.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied. Not your restaurant.' });
    }

    await (category as any).softDelete();

    res.status(200).json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
