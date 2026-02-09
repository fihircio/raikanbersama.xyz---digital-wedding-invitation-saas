
import { Order, Coupon, Invitation, Affiliate, AffiliateEarning } from '../models';
import { OrderStatus } from '../types/models';
import logger from '../utils/logger';

export const PaymentService = {
    /**
     * Complete an order: Update status, increment coupon, record affiliate earning, and upgrade invitation.
     */
    completeOrder: async (order: Order, paymentMethod: string = 'Billplz') => {
        try {
            // 1. Update Order Status
            await order.update({
                status: OrderStatus.COMPLETED,
                payment_method: paymentMethod
            });
            logger.info(`Order ${order.id} marked as COMPLETED via ${paymentMethod}`);

            // 2. Handle Coupon & Affiliate Logic
            if (order.coupon_id) {
                const coupon = await Coupon.findByPk(order.coupon_id, {
                    include: [{
                        model: Affiliate,
                        as: 'affiliate'
                    }]
                });

                if (coupon) {
                    // Increment usage
                    await coupon.increment('current_uses');
                    logger.info(`Incremented usage for coupon ID: ${order.coupon_id}`);

                    // Process Affiliate Commission & Tier
                    if (coupon.affiliate_id && coupon.affiliate) {
                        // Calculate commission based on ACTUAL paid amount
                        // If amount is 0 (100% off), commission is 0.
                        const commissionAmount = Number(order.amount) * (Number(coupon.affiliate.commission_rate) / 100);

                        await AffiliateEarning.create({
                            affiliate_id: coupon.affiliate_id,
                            order_id: order.id,
                            amount: commissionAmount,
                            commission_rate: coupon.affiliate.commission_rate,
                            status: 'pending'
                        } as any);

                        await coupon.affiliate.increment('earnings_total', { by: commissionAmount });
                        logger.info(`Recorded commission of RM ${commissionAmount} for affiliate ${coupon.affiliate_id} (Order Amount: ${order.amount})`);

                        // AFFILIATE TIER SYSTEM: Check for upgrade
                        // Even if commission is 0, the SALE counts towards the tier.
                        try {
                            const totalSalesCount = await AffiliateEarning.count({
                                where: { affiliate_id: coupon.affiliate_id }
                            });

                            let upgradeMsg = '';

                            // Tier 3 Transition (Completed 25+ sales)
                            if (totalSalesCount >= 25) {
                                if (Number(coupon.affiliate.commission_rate) < 25.00) {
                                    await coupon.affiliate.update({ commission_rate: 25.00 });
                                    upgradeMsg += `Rate -> 25% (Tier 3). `;
                                }
                                if (coupon.max_uses !== null) {
                                    await coupon.update({ max_uses: null });
                                    upgradeMsg += `Limit -> Unlimited. `;
                                }
                            }
                            // Tier 2 Transition (Completed 10+ sales)
                            else if (totalSalesCount >= 10) {
                                if (Number(coupon.affiliate.commission_rate) < 22.00) {
                                    await coupon.affiliate.update({ commission_rate: 22.00 });
                                    upgradeMsg += `Rate -> 22% (Tier 2). `;
                                }
                                // Only expand limit if it's currently restricting growth (e.g. 10)
                                if (coupon.max_uses !== null && coupon.max_uses < 25) {
                                    await coupon.update({ max_uses: 25 });
                                    upgradeMsg += `Limit -> 25. `;
                                }
                            }

                            if (upgradeMsg) {
                                logger.info(`Affiliate ${coupon.affiliate_id} Auto-Upgraded [Sales: ${totalSalesCount}]: ${upgradeMsg}`);
                            }
                        } catch (tierError) {
                            logger.error(`Error processing tier upgrade for affiliate ${coupon.affiliate_id}:`, tierError);
                        }
                    }
                }
            }

            // 3. Upgrade Invitation to Paid
            if (order.invitation_id) {
                const invitation = await Invitation.findByPk(order.invitation_id);
                if (invitation) {
                    const settings = { ...invitation.settings, package_plan: order.plan_tier, is_paid: true };
                    await invitation.update({ settings });
                    logger.info(`Invitation ${order.invitation_id} upgraded to ${order.plan_tier} and marked as PAID`);
                }
            }

            return true;
        } catch (error) {
            logger.error(`Error completing order ${order.id}:`, error);
            throw error;
        }
    }
};
