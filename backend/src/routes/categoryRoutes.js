const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.protect);

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Category name is required')
  ],
  categoryController.createCategory
);

router.patch('/:id', [
  body('name').notEmpty().withMessage('Category name is required')
], categoryController.updateCategory);

router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
