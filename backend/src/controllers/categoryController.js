const Category = require('../models/Category');

// Get all categories for a restaurant
exports.getAllCategories = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;

    // Determine restaurant filter
    let filter = { isDeleted: false };

    if (req.user.role === 'manager') {
      // Manager can only see their restaurant's categories
      filter.restaurantId = req.user.restaurantId;
    } else if (restaurantId) {
      // Superadmin can filter by any restaurant
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
exports.getCategory = async (req, res, next) => {
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
exports.createCategory = async (req, res, next) => {
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
exports.updateCategory = async (req, res, next) => {
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
exports.deleteCategory = async (req, res, next) => {
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

    await category.softDelete();

    res.status(200).json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
