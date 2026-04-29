const express = require('express');
const { body, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
    const formattedErrors = {};
    errors.array().forEach(err => {
      if (!formattedErrors[err.path]) formattedErrors[err.path] = [];
      formattedErrors[err.path].push(err.msg);
    });
    return res.status(422).json({
      status: 'error',
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  next();
};

// All routes require authentication
router.use(authMiddleware.protect);

// Get current user
router.get('/me', userController.getMe);

// Superadmin only routes
router.use(authMiddleware.restrictTo('superadmin'));

router.get('/', userController.getAllUsers);
router.get('/restaurant/:restaurantId', userController.getUsersByRestaurant);
router.get('/:id', userController.getUser);

// Create manager
router.post(
  '/manager',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('restaurantId').notEmpty().withMessage('Restaurant ID is required')
  ],
  handleValidationErrors,
  userController.createManager
);

// Update user
router.patch('/:id', userController.updateUser);

// Update status
router.patch('/:id/status', [
  body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE')
], userController.updateStatus);

// Deactivate user
router.delete('/:id', userController.deleteUser);

module.exports = router;
