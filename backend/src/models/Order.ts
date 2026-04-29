import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: [true, 'Order must reference an inventory item'],
    index: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Order must belong to a restaurant'],
    index: true
  },
  quantityOrdered: {
    type: Number,
    required: [true, 'Please specify ordered quantity'],
    min: [0.01, 'Ordered quantity must be greater than 0']
  },
  unit: {
    type: String,
    default: 'pcs'
  },
  isReceived: {
    type: Boolean,
    default: false
  },
  orderedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Orderer is required']
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
orderSchema.index({ restaurantId: 1, isReceived: 1 });
orderSchema.index({ restaurantId: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
