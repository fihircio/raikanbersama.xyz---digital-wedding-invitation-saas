import { Response } from 'express';
import { User, Invitation, Order, RSVP, Affiliate, ContactMessage, Coupon } from '../models';
import { AuthenticatedRequest } from '../types/api';
import { UserRole, OrderStatus, AffiliateStatus, ContactMessageStatus, DiscountType } from '../types/models';
import { Sequelize, Op } from 'sequelize';
import logger from '../utils/logger';

/**
 * Admin Controller
 * Handles administrative operations and statistics
 */
class AdminController {

    /**
     * Get overall platform statistics
     */
    public async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const totalUsers = await User.count();
            const totalInvitations = await Invitation.count();
            const totalOrders = await Order.count();
            const totalAffiliates = await Affiliate.count();
            const totalMessages = await ContactMessage.count({ where: { status: ContactMessageStatus.NEW } });

            const totalRevenueResult = await Order.findAll({
                where: { status: OrderStatus.COMPLETED },
                attributes: [
                    [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalRevenue']
                ],
                raw: true
            });

            const totalRevenue = (totalRevenueResult[0] as any).totalRevenue || 0;

            const recentUsers = await User.findAll({
                limit: 5,
                order: [['created_at', 'DESC']],
                attributes: ['id', 'name', 'email', 'created_at', 'membership_tier']
            });

            const recentOrders = await Order.findAll({
                limit: 5,
                order: [['created_at', 'DESC']],
                include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
            });

            res.status(200).json({
                success: true,
                data: {
                    metrics: {
                        totalUsers,
                        totalInvitations,
                        totalOrders,
                        totalAffiliates,
                        totalMessages,
                        totalRevenue: parseFloat(totalRevenue.toString())
                    },
                    recentUsers,
                    recentOrders
                }
            });
        } catch (error) {
            logger.error('Error fetching admin stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch administrative statistics.'
            });
        }
    }

    /**
     * Get list of users with pagination and search
     */
    public async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const offset = (page - 1) * limit;

            const where: any = {};
            if (search) {
                where[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } }
                ];
            }

            const { count, rows: users } = await User.findAndCountAll({
                where,
                limit,
                offset,
                order: [['created_at', 'DESC']],
                attributes: { exclude: ['password'] },
                include: [{
                    model: Invitation,
                    as: 'invitations',
                    attributes: ['id', 'slug', 'bride_name', 'groom_name'],
                    include: [{
                        model: Order,
                        as: 'orders',
                        attributes: ['status'],
                        where: { status: OrderStatus.COMPLETED },
                        required: false
                    }]
                }]
            });

            res.status(200).json({
                success: true,
                data: {
                    users,
                    pagination: {
                        total: count,
                        page,
                        limit,
                        totalPages: Math.ceil(count / limit)
                    }
                }
            });
        } catch (error) {
            logger.error('Error fetching users for admin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch users.'
            });
        }
    }

    /**
     * Get list of orders with pagination
     */
    public async getOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const { count, rows: orders } = await Order.findAndCountAll({
                limit,
                offset,
                order: [['created_at', 'DESC']],
                include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
            });

            res.status(200).json({
                success: true,
                data: {
                    orders,
                    pagination: {
                        total: count,
                        page,
                        limit,
                        totalPages: Math.ceil(count / limit)
                    }
                }
            });
        } catch (error) {
            logger.error('Error fetching orders for admin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch orders.'
            });
        }
    }

    /**
     * Update user role or membership
     */
    public async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { role, membership_tier } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                res.status(404).json({ success: false, error: 'User not found.' });
                return;
            }

            if (role) user.role = role;
            if (membership_tier) user.membership_tier = membership_tier;

            await user.save();

            res.status(200).json({
                success: true,
                message: 'User updated successfully.',
                data: user
            });
        } catch (error) {
            logger.error('Error updating user by admin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update user.'
            });
        }
    }

    /**
     * Get list of affiliates
     */
    public async getAffiliates(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const { count, rows: affiliates } = await Affiliate.findAndCountAll({
                limit,
                offset,
                order: [['created_at', 'DESC']],
                include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
            });

            res.status(200).json({
                success: true,
                data: affiliates,
                pagination: {
                    total: count,
                    page,
                    limit,
                    pages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            logger.error('Error fetching affiliates for admin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch affiliates.'
            });
        }
    }

    /**
     * Approve or reject affiliate
     */
    public async updateAffiliateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status, referral_code } = req.body;

            const affiliate = await Affiliate.findByPk(id);
            if (!affiliate) {
                res.status(404).json({ success: false, error: 'Affiliate profile not found.' });
                return;
            }

            if (status) affiliate.status = status;
            const oldReferralCode = affiliate.referral_code;
            if (referral_code) affiliate.referral_code = referral_code;

            await affiliate.save();

            // If referral code changed, update the associated coupon as well
            if (referral_code && oldReferralCode && referral_code !== oldReferralCode) {
                await Coupon.update(
                    { code: referral_code },
                    { where: { affiliate_id: affiliate.id, code: oldReferralCode } }
                );
                logger.info(`Updated coupon code from "${oldReferralCode}" to "${referral_code}" for affiliate ${affiliate.id}`);
            }

            // If approved, create a default coupon for them
            if (status === AffiliateStatus.ACTIVE) {
                const existingCoupon = await Coupon.findOne({ where: { affiliate_id: affiliate.id } });
                if (!existingCoupon) {
                    const newCoupon = await Coupon.create({
                        code: affiliate.referral_code || `AFF${Math.floor(Math.random() * 10000)}`,
                        discount_type: DiscountType.PERCENTAGE,
                        discount_value: 10, // Default 10% discount
                        affiliate_id: affiliate.id,
                        max_uses: null,
                        is_active: true,
                        current_uses: 0
                    } as any);
                    logger.info(`Automatically created coupon "${newCoupon.code}" for affiliate ${affiliate.id}`);
                } else {
                    await existingCoupon.update({ is_active: true });
                    logger.info(`Re-activated existing coupon "${existingCoupon.code}" for affiliate ${affiliate.id}`);
                }
            } else if (status === AffiliateStatus.REJECTED) {
                // Deactivate coupons if revoked
                await Coupon.update({ is_active: false }, { where: { affiliate_id: affiliate.id } });
            }

            res.status(200).json({
                success: true,
                message: 'Affiliate status updated successfully.',
                data: affiliate
            });
        } catch (error) {
            logger.error('Error updating affiliate status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update affiliate status.'
            });
        }
    }

    /**
     * Get contact messages
     */
    public async getContactMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const { count, rows: messages } = await ContactMessage.findAndCountAll({
                limit,
                offset,
                order: [['created_at', 'DESC']]
            });

            res.status(200).json({
                success: true,
                data: messages,
                pagination: {
                    total: count,
                    page,
                    limit,
                    pages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            logger.error('Error fetching contact messages for admin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch contact messages.'
            });
        }
    }

    /**
     * Update contact message status
     */
    public async updateContactMessageStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const message = await ContactMessage.findByPk(id);
            if (!message) {
                res.status(404).json({ success: false, error: 'Message not found.' });
                return;
            }

            if (status) message.status = status;
            await message.save();

            res.status(200).json({
                success: true,
                message: 'Message updated successfully.',
                data: message
            });
        } catch (error) {
            logger.error('Error updating contact message:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update message.'
            });
        }
    }

    /**
     * Get coupons
     */
    public async getCoupons(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const { count, rows: coupons } = await Coupon.findAndCountAll({
                limit,
                offset,
                order: [['created_at', 'DESC']],
                include: [{ model: Affiliate, as: 'affiliate', include: [{ model: User, as: 'user', attributes: ['name'] }] }]
            });

            res.status(200).json({
                success: true,
                data: coupons,
                pagination: {
                    total: count,
                    page,
                    limit,
                    pages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            logger.error('Error fetching coupons for admin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch coupons.'
            });
        }
    }

    /**
     * Create coupon
     */
    public async createCoupon(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { code, discount_type, discount_value, affiliate_id, max_uses, expiry_date } = req.body;
            logger.info('Creating coupon with data:', { code, discount_type, discount_value, affiliate_id });

            const coupon = await Coupon.create({
                code,
                discount_type: discount_type || DiscountType.PERCENTAGE,
                discount_value,
                affiliate_id: (affiliate_id === '' || !affiliate_id) ? null : affiliate_id,
                max_uses,
                expiry_date: (!expiry_date || expiry_date === '' || expiry_date === 'Invalid date') ? null : expiry_date,
                is_active: true,
                current_uses: 0
            } as any);

            // Fetch the coupon with affiliate data to return a complete object
            const couponWithData = await Coupon.findByPk(coupon.id, {
                include: [{ model: Affiliate, as: 'affiliate', include: [{ model: User, as: 'user', attributes: ['name'] }] }]
            });

            res.status(201).json({
                success: true,
                message: 'Coupon created successfully.',
                data: couponWithData
            });
        } catch (error) {
            logger.error('Error creating coupon:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create coupon.'
            });
        }
    }

    /**
     * Update coupon
     */
    public async updateCoupon(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { code, discount_type, discount_value, affiliate_id, max_uses, expiry_date, is_active } = req.body;

            const coupon = await Coupon.findByPk(id);
            if (!coupon) {
                res.status(404).json({ success: false, error: 'Coupon not found.' });
                return;
            }

            if (code) coupon.code = code;
            if (discount_type) coupon.discount_type = discount_type;
            if (discount_value !== undefined) coupon.discount_value = discount_value;
            if (max_uses !== undefined) coupon.max_uses = max_uses;
            if (is_active !== undefined) coupon.is_active = is_active;

            // Handle affiliate_id conversion
            if (affiliate_id !== undefined) {
                coupon.affiliate_id = (affiliate_id === '' || !affiliate_id) ? null : affiliate_id as any;
            }

            // Handle expiry_date conversion
            if (expiry_date !== undefined) {
                coupon.expiry_date = (!expiry_date || expiry_date === '' || expiry_date === 'Invalid date') ? null : expiry_date as any;
            }

            await coupon.save();

            const updatedCoupon = await Coupon.findByPk(id, {
                include: [{ model: Affiliate, as: 'affiliate', include: [{ model: User, as: 'user', attributes: ['name'] }] }]
            });

            res.status(200).json({
                success: true,
                message: 'Coupon updated successfully.',
                data: updatedCoupon
            });
        } catch (error) {
            logger.error('Error updating coupon:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update coupon.'
            });
        }
    }
    /**
     * Delete coupon
     */
    public async deleteCoupon(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const coupon = await Coupon.findByPk(id);

            if (!coupon) {
                res.status(404).json({
                    success: false,
                    error: 'Coupon not found.'
                });
                return;
            }

            await coupon.destroy();

            res.json({
                success: true,
                message: 'Coupon deleted successfully.'
            });
        } catch (error) {
            logger.error('Error deleting coupon:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete coupon.'
            });
        }
    }

    public async deleteInvitation(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const invitation = await Invitation.findByPk(id, {
                include: [{
                    model: Order,
                    as: 'orders',
                    where: { status: OrderStatus.COMPLETED },
                    required: false
                }]
            });

            if (!invitation) {
                res.status(404).json({
                    success: false,
                    error: 'Invitation not found.'
                });
                return;
            }

            // Check if there are any completed orders
            const hasCompletedOrder = (invitation as any).orders && (invitation as any).orders.length > 0;

            if (hasCompletedOrder) {
                res.status(403).json({
                    success: false,
                    error: 'Cannot delete a paid invitation.'
                });
                return;
            }

            await invitation.destroy();

            res.status(200).json({
                success: true,
                message: 'Invitation deleted successfully.'
            });
        } catch (error) {
            logger.error('Error deleting invitation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete invitation.'
            });
        }
    }
}

export default new AdminController();
