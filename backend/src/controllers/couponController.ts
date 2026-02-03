import { Request, Response } from 'express';
import { Coupon, Affiliate } from '../models';
import { DiscountType } from '../types/models';
import { Op } from 'sequelize';
import logger from '../utils/logger';

export class CouponController {
    /**
     * Validate a coupon code
     */
    public async validateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const { code } = req.body;
            const searchCode = code?.trim();
            logger.info(`Validating coupon searchCode: "${searchCode}"`);

            if (!searchCode) {
                res.status(400).json({
                    success: false,
                    message: 'Coupon code is required.'
                });
                return;
            }

            let coupon = await Coupon.findOne({
                where: {
                    code: { [Op.iLike]: searchCode },
                    is_active: true,
                    [Op.or]: [
                        { expiry_date: null },
                        { expiry_date: { [Op.gt]: new Date() } }
                    ]
                },
                include: [{
                    model: Affiliate,
                    as: 'affiliate',
                    attributes: ['business_name']
                }]
            });

            if (!coupon) {
                logger.info(`Coupon "${searchCode}" not found in Coupons table. Checking Affiliates table for fallback...`);
                // Fallback: Check if this is an affiliate referral code
                const fallbackAffiliate = await Affiliate.findOne({
                    where: {
                        referral_code: { [Op.iLike]: searchCode },
                        status: 'active'
                    }
                });

                if (fallbackAffiliate) {
                    logger.info(`Found active affiliate "${fallbackAffiliate.business_name}" with referral code "${searchCode}". Creating dynamic coupon...`);
                    // Create the missing coupon record automatically
                    coupon = await Coupon.create({
                        code: searchCode,
                        discount_type: DiscountType.PERCENTAGE,
                        discount_value: 10,
                        affiliate_id: fallbackAffiliate.id,
                        is_active: true,
                        current_uses: 0
                    } as any);

                    // Re-fetch with affiliate data
                    coupon = await Coupon.findByPk(coupon.id, {
                        include: [{
                            model: Affiliate,
                            as: 'affiliate',
                            attributes: ['business_name']
                        }]
                    });
                }
            }

            if (!coupon) {
                logger.warn(`Coupon not found or inactive/expired: "${searchCode}"`);
                res.status(404).json({
                    success: false,
                    message: 'Invalid or expired coupon code.'
                });
                return;
            }

            // Check usage limit
            if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
                res.status(400).json({
                    success: false,
                    message: 'Coupon usage limit has been reached.'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Coupon is valid.',
                data: {
                    code: coupon.code,
                    discount_type: coupon.discount_type,
                    discount_value: coupon.discount_value,
                    business_name: coupon.affiliate?.business_name || 'General'
                }
            });
        } catch (error) {
            logger.error('Error validating coupon:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while validating the coupon.'
            });
        }
    }
}

export default new CouponController();
