const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Inventory = require('../models/Inventory');

exports.getGlobalStats = async (req, res, next) => {
  try {
    const [restaurantCount, userCount, inventoryCount] = await Promise.all([
      Restaurant.countDocuments({ isDeleted: false }),
      User.countDocuments({ status: 'ACTIVE' }),
      Inventory.countDocuments({ isDeleted: false })
    ]);

    res.status(200).json({
      stats: {
        restaurants: restaurantCount,
        users: userCount,
        inventory: inventoryCount
      }
    });
  } catch (error) {
    next(error);
  }
};
