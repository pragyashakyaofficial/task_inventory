const express = require('express');
const { body } = require('express-validator');
const restaurantController = require('../controllers/restaurantController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.protect);

// Routes accessible by both superadmin and manager
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurant);
router.get('/:id/users', restaurantController.getRestaurantWithUsers);

// Superadmin only routes
router.use(authMiddleware.restrictTo('superadmin'));

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Restaurant name is required'),
    body('location').notEmpty().withMessage('Location is required')
  ],
  restaurantController.createRestaurant
);

router.patch('/:id', restaurantController.updateRestaurant);

router.patch('/:id/status', [
  body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE')
], restaurantController.updateStatus);

router.delete('/:id', restaurantController.deleteRestaurant);

module.exports = router;
