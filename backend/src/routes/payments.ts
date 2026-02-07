import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import couponController from '../controllers/couponController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Initiate checkout (Protected)
router.post('/checkout', authenticate, paymentController.createCheckout);

// CHIP Webhook (Public)
router.post('/webhook', paymentController.handleWebhook);

export default router;
