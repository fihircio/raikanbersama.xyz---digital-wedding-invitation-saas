import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get all orders for current user
router.get('/', authenticate, orderController.getUserOrders);

// Get order by ID
router.get('/:id', authenticate, orderController.getOrderById);

export default router;
