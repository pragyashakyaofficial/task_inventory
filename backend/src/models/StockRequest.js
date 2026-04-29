const mongoose = require('mongoose');

const stockRequestSchema = new mongoose.Schema({
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: [true, 'Stock request must reference an inventory item'],
    index: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Stock request must belong to a restaurant'],
    index: true
  },
  requestedQuantity: {
    type: Number,
    required: [true, 'Please specify requested quantity'],
    min: [1, 'Requested quantity must be at least 1']
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock snapshot is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester is required']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
stockRequestSchema.index({ restaurantId: 1, status: 1 });
stockRequestSchema.index({ inventoryId: 1, status: 1 });
stockRequestSchema.index({ createdAt: -1 });

const StockRequest = mongoose.model('StockRequest', stockRequestSchema);

module.exports = StockRequest;
