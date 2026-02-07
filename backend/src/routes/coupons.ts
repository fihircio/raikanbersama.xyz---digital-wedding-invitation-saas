import { Router } from 'express';
import couponController from '../controllers/couponController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Validate coupon (Protected)
router.post('/validate', authenticate, couponController.validateCoupon);

export default router;
