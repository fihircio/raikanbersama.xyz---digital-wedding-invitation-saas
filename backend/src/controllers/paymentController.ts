import { Request, Response } from 'express';
import { Order, Invitation, User, Coupon, Affiliate, AffiliateEarning } from '../models';
import { OrderStatus, MembershipTier, DiscountType } from '../types/models';
import { Op } from 'sequelize';
import logger from '../utils/logger';

const CHIP_API_KEY = 'JAzcbKJSUaFSieI1RloCfDYwyvqzY583WOrW6GKkcMdVUbLDSN-bqmpZxZiocPyw3j-fOE9vyzsMwbjVL4vkOg==';
const CHIP_BRAND_ID = '72ffa539-afc9-412f-bdc5-b1368145e6b9';
const CHIP_ENDPOINT = 'https://gate.chip-in.asia/api/v1/purchases/';

/**
 * Handle checkout session creation
 */
export const createCheckout = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { planId, invitationId, couponCode, successUrl, cancelUrl } = req.body;

        // Map plan IDs to amounts
        const planPrices: Record<string, number> = {
            'lite': 29.00,
            'pro': 49.00,
            'elite': 69.00
        };

        let amount = planPrices[planId];
        if (!amount) {
            res.status(400).json({ success: false, error: 'Invalid plan selected' });
            return;
        }

        let couponId = null;
        if (couponCode) {
            const coupon = await Coupon.findOne({
                where: {
                    code: { [Op.iLike]: couponCode },
                    is_active: true,
                    [Op.or]: [
                        { expiry_date: null },
                        { expiry_date: { [Op.gt]: new Date() } }
                    ]
                }
            });

            if (coupon && (coupon.max_uses === null || coupon.current_uses < coupon.max_uses)) {
                if (coupon.discount_type === DiscountType.PERCENTAGE) {
                    amount = amount * (1 - (Number(coupon.discount_value) / 100));
                } else {
                    amount = Math.max(0, amount - Number(coupon.discount_value));
                }
                couponId = coupon.id;
                logger.info(`Applied coupon ${couponCode} to order. New amount: ${amount}`);
            }
        }

        // Get user details for CHIP
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // Create pending order
        const order = await Order.create({
            user_id: userId,
            invitation_id: invitationId,
            amount: amount,
            status: OrderStatus.PENDING,
            plan_tier: planId as MembershipTier,
            coupon_id: couponId
        });

        // Call CHIP API
        const response = await fetch(CHIP_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CHIP_API_KEY}`
            },
            body: JSON.stringify({
                brand_id: CHIP_BRAND_ID,
                client: {
                    email: user.email,
                    full_name: user.name || 'RaikanBersama User',
                    phone: user.phone_number || ''
                },
                purchase: {
                    products: [
                        {
                            name: `RaikanBersama ${planId.toUpperCase()} Plan`,
                            price: Math.round(amount * 100) // CHIP expects cents
                        }
                    ],
                    currency: 'MYR'
                },
                success_redirect: successUrl || `${process.env.FRONTEND_URL}/#/orders?status=success`,
                failure_redirect: cancelUrl || `${process.env.FRONTEND_URL}/#/orders?status=cancelled`,
                reference: order.id
            })
        });

        const chipData: any = await response.json();

        if (!response.ok) {
            logger.error('CHIP API Error:', chipData);
            res.status(500).json({ success: false, error: 'Payment gateway error', details: chipData });
            return;
        }

        // Update order with payment ID
        await order.update({ payment_id: chipData.id });

        res.json({
            success: true,
            checkout_url: chipData.checkout_url
        });
    } catch (error) {
        logger.error('Error creating checkout:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * Handle CHIP Webhook
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const payload = req.body;
        const { id, status, reference } = payload;

        logger.info(`Received CHIP Webhook for order ${reference}, status: ${status}`);

        const order = await Order.findByPk(reference);
        if (!order) {
            logger.error(`Order not found for reference: ${reference}`);
            res.status(404).send('Order not found');
            return;
        }

        if (status === 'paid') {
            await order.update({ status: OrderStatus.COMPLETED });

            // Increment coupon usage and calculate affiliate commission if applicable
            if (order.coupon_id) {
                const coupon = await Coupon.findByPk(order.coupon_id, {
                    include: [{
                        model: Affiliate,
                        as: 'affiliate'
                    }]
                });

                if (coupon) {
                    await coupon.increment('current_uses');
                    logger.info(`Incremented usage for coupon ID: ${order.coupon_id}`);

                    // Calculate and record affiliate commission if coupon is linked to an affiliate
                    if (coupon.affiliate_id && coupon.affiliate) {
                        const commissionAmount = Number(order.amount) * (Number(coupon.affiliate.commission_rate) / 100);

                        await AffiliateEarning.create({
                            affiliate_id: coupon.affiliate_id,
                            order_id: order.id,
                            amount: commissionAmount,
                            commission_rate: coupon.affiliate.commission_rate,
                            status: 'pending' // Default from enum
                        } as any);

                        await coupon.affiliate.increment('earnings_total', { by: commissionAmount });
                        logger.info(`Recorded commission of RM ${commissionAmount} for affiliate ${coupon.affiliate_id}`);
                    }
                }
            }

            // Update associated invitation
            if (order.invitation_id) {
                const invitation = await Invitation.findByPk(order.invitation_id);
                if (invitation) {
                    const settings = { ...invitation.settings, package_plan: order.plan_tier, is_paid: true };
                    await invitation.update({ settings });
                    logger.info(`Invitation ${order.invitation_id} upgraded to ${order.plan_tier} and marked as PAID`);
                }
            }
        } else if (status === 'failed' || status === 'cancelled') {
            await order.update({ status: OrderStatus.FAILED });
        }

        res.status(200).send('Webhook processed');
    } catch (error) {
        logger.error('Error processing webhook:', error);
        res.status(500).send('Internal server error');
    }
};
