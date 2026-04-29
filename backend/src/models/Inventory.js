const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an item name'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Inventory item must belong to a category'],
    index: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Inventory item must belong to a restaurant'],
    index: true
  },
  unit: {
    type: String,
    enum: ['kg', 'litre', 'pcs'],
    required: [true, 'Please specify a unit']
  },
  currentStock: {
    type: Number,
    required: [true, 'Please provide current stock level'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minThreshold: {
    type: Number,
    required: [true, 'Please provide minimum threshold'],
    min: [0, 'Threshold cannot be negative'],
    default: 0
  },
  maxStock: {
    type: Number,
    required: [true, 'Please provide maximum stock level'],
    min: [0, 'Max stock cannot be negative'],
    default: 100
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
inventorySchema.index({ restaurantId: 1, isDeleted: 1 });
inventorySchema.index({ restaurantId: 1, categoryId: 1, isDeleted: 1 });
inventorySchema.index({ restaurantId: 1, currentStock: 1, minThreshold: 1 });

// Virtual field for computed status
inventorySchema.virtual('status').get(function() {
  if (this.currentStock === 0) return 'OUT';
  if (this.currentStock <= this.minThreshold) return 'LOW';
  return 'OK';
});

// Virtual field for suggested reorder quantity
inventorySchema.virtual('suggestedOrder').get(function() {
  if (this.currentStock >= this.maxStock) return 0;
  return this.maxStock - this.currentStock;
});

// Method to compute status (for use in queries)
inventorySchema.methods.getStatus = function() {
  if (this.currentStock === 0) return 'OUT';
  if (this.currentStock <= this.minThreshold) return 'LOW';
  return 'OK';
};

// Method to check if stock is low
inventorySchema.methods.isLowStock = function() {
  return this.currentStock <= this.minThreshold && this.currentStock > 0;
};

// Method to check if stock is out
inventorySchema.methods.isOutOfStock = function() {
  return this.currentStock === 0;
};

// Method to check if reorder is needed
inventorySchema.methods.needsReorder = function() {
  return this.currentStock <= this.minThreshold;
};

// Method to update stock with logging
inventorySchema.methods.updateStock = async function(newStock, userId, note = '') {
  const previousStock = this.currentStock;
  this.currentStock = newStock;
  this.lastUpdatedBy = userId;
  
  const saved = await this.save();
  
  // Create inventory log entry
  const InventoryLog = mongoose.model('InventoryLog');
  const action = newStock > previousStock ? 'ADD' : newStock < previousStock ? 'REMOVE' : 'ADJUST';
  
  await InventoryLog.create({
    inventoryId: this._id,
    restaurantId: this.restaurantId,
    action,
    quantity: newStock - previousStock,
    previousStock,
    newStock,
    note,
    createdBy: userId
  });
  
  return saved;
};

// Soft delete method
inventorySchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.lastUpdatedBy = userId;
  return await this.save();
};

// Static method to get reorder plan for a restaurant
inventorySchema.statics.getReorderPlan = async function(restaurantId) {
  const items = await this.find({
    restaurantId,
    isDeleted: false,
    $expr: { $lte: ['$currentStock', '$minThreshold'] }
  }).populate('categoryId', 'name');
  
  return items.map(item => ({
    _id: item._id,
    name: item.name,
    category: item.categoryId?.name || 'Unknown',
    currentStock: item.currentStock,
    minThreshold: item.minThreshold,
    maxStock: item.maxStock,
    unit: item.unit,
    status: item.getStatus(),
    suggestedOrder: item.maxStock - item.currentStock
  }));
};

// Include virtuals in JSON output
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
