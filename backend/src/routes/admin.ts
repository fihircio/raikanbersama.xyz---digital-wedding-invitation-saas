import { Router } from 'express';
import adminController from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform metrics and recent activity
 * @access  Admin
 */
router.get('/stats', adminController.getStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and search
 * @access  Admin
 */
router.get('/users', adminController.getUsers);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user role or membership
 * @access  Admin
 */
router.put('/users/:id', adminController.updateUser);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with pagination
 * @access  Admin
 */
router.get('/orders', adminController.getOrders);

/**
 * @route   GET /api/admin/affiliates
 * @desc    Get all affiliate applications
 * @access  Admin
 */
router.get('/affiliates', adminController.getAffiliates);

/**
 * @route   PUT /api/admin/affiliates/:id
 * @desc    Approve/Reject affiliate
 * @access  Admin
 */
router.put('/affiliates/:id', adminController.updateAffiliateStatus);

/**
 * @route   GET /api/admin/contacts
 * @desc    Get all contact messages
 * @access  Admin
 */
router.get('/contacts', adminController.getContactMessages);

/**
 * @route   PUT /api/admin/contacts/:id
 * @desc    Mark contact message as read/archived
 * @access  Admin
 */
router.put('/contacts/:id', adminController.updateContactMessageStatus);

/**
 * @route   GET /api/admin/coupons
 * @desc    Get all coupons
 * @access  Admin
 */
router.get('/coupons', adminController.getCoupons);

/**
 * @route   POST /api/admin/coupons
 * @desc    Create a new coupon
 * @access  Admin
 */
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

export default router;
