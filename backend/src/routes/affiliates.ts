import { Router } from 'express';
import affiliateController from '../controllers/affiliateController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/affiliates/apply
 * @desc    Submit an affiliate application
 * @access  Private (Authenticated)
 */
router.post('/apply', authenticate, affiliateController.apply);

/**
 * @route   GET /api/affiliates/my-status
 * @desc    Get current user's affiliate status
 * @access  Private (Authenticated)
 */
router.get('/my-status', authenticate, affiliateController.getMyStatus);
router.get('/my-earnings', authenticate, affiliateController.getMyEarnings);

export default router;
