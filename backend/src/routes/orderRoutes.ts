import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  createOrder,
  getOrders,
  getOrder,
  receiveOrder,
  deleteOrder,
} from '../controllers/orderController';

const router = Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrder)
  .delete(deleteOrder);

router.patch('/:id/receive', receiveOrder);

export default router;
