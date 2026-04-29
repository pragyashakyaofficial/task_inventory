import mongoose from 'mongoose';

// Document interface
export interface IInventory {
  name: string;
  categoryId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  unit: string;
  sku?: string;
  price?: number;
  description?: string;
  currentStock: number;
  minThreshold: number;
  maxStock: number;
  lastUpdatedBy?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Instance methods interface
export interface IInventoryMethods {
  getStatus(): 'OUT' | 'LOW' | 'OK';
  isLowStock(): boolean;
  isOutOfStock(): boolean;
  needsReorder(): boolean;
  updateStock(newStock: number, userId: mongoose.Types.ObjectId, note?: string): Promise<any>;
  softDelete(userId: mongoose.Types.ObjectId): Promise<any>;
}

// Static methods interface
export interface IInventoryModel extends mongoose.Model<IInventory, {}, IInventoryMethods> {
  getReorderPlan(restaurantId: mongoose.Types.ObjectId): Promise<any[]>;
}

const inventorySchema = new mongoose.Schema<IInventory, IInventoryModel, IInventoryMethods>({
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
    required: [true, 'Please specify a unit'],
    default: 'pcs'
  },
  sku: {
    type: String,
    trim: true,
    sparse: true
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
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
  if (this.currentStock >= this.minThreshold) return 0;
  return this.minThreshold - this.currentStock;
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

// Method to update stock
inventorySchema.methods.updateStock = async function(newStock: number, userId: mongoose.Types.ObjectId, note: string = '') {
  this.currentStock = newStock;
  this.lastUpdatedBy = userId;

  return await this.save();
};

// Soft delete method
inventorySchema.methods.softDelete = async function(userId: mongoose.Types.ObjectId) {
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
  
  return items.map((item: any) => ({
    _id: item._id,
    name: item.name,
    category: item.categoryId?.name || 'Unknown',
    currentStock: item.currentStock,
    minThreshold: item.minThreshold,
    maxStock: item.maxStock,
    unit: item.unit,
    status: item.getStatus(),
    suggestedOrder: item.minThreshold - item.currentStock
  }));
};

// Include virtuals in JSON output
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

const Inventory = mongoose.model<IInventory, IInventoryModel>('Inventory', inventorySchema);

export default Inventory;
