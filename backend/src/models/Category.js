const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Category must belong to a restaurant'],
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure unique category name per restaurant
// (only for non-deleted categories to allow reuse after soft delete)
categorySchema.index({ name: 1, restaurantId: 1, isDeleted: 1 });

// Index for efficient querying by restaurant
categorySchema.index({ restaurantId: 1, isDeleted: 1 });

// Soft delete method
categorySchema.methods.softDelete = async function() {
  this.isDeleted = true;
  return await this.save();
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
