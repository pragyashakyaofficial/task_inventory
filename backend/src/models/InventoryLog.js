const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: [true, 'Log must reference an inventory item'],
    index: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Log must belong to a restaurant'],
    index: true
  },
  action: {
    type: String,
    enum: ['ADD', 'REMOVE', 'ADJUST'],
    required: [true, 'Please specify the action type']
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify the quantity change']
  },
  previousStock: {
    type: Number,
    required: [true, 'Please specify the previous stock level']
  },
  newStock: {
    type: Number,
    required: [true, 'Please specify the new stock level']
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Note cannot exceed 500 characters'],
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Log must reference the user who made the change'],
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
inventoryLogSchema.index({ restaurantId: 1, createdAt: -1 });
inventoryLogSchema.index({ inventoryId: 1, createdAt: -1 });
inventoryLogSchema.index({ createdBy: 1, createdAt: -1 });
inventoryLogSchema.index({ restaurantId: 1, action: 1, createdAt: -1 });

// Static method to get recent activity for a restaurant
inventoryLogSchema.statics.getRecentActivity = async function(restaurantId, limit = 50) {
  return await this.find({ restaurantId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('inventoryId', 'name unit')
    .populate('createdBy', 'name email');
};

// Static method to get activity for a specific inventory item
inventoryLogSchema.statics.getItemHistory = async function(inventoryId, limit = 100) {
  return await this.find({ inventoryId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'name email');
};

// Static method to get summary stats for a restaurant
inventoryLogSchema.statics.getActivitySummary = async function(restaurantId, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        totalQuantity: { $sum: { $abs: '$quantity' } }
      }
    }
  ]);
};

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

module.exports = InventoryLog;
