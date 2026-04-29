const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a restaurant name'],
    trim: true,
    maxlength: [100, 'Restaurant name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  establishedYear: {
    type: Number,
    min: [1800, 'Established year must be after 1800'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for filtering active restaurants
restaurantSchema.index({ status: 1, isDeleted: 1 });

// Soft delete method
restaurantSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.status = 'INACTIVE';
  return await this.save();
};

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
