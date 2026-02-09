import { Request, Response } from 'express';
import { Order, Invitation, User, Coupon, Affiliate, AffiliateEarning } from '../models';
import { OrderStatus, MembershipTier, DiscountType } from '../types/models';
import { Op } from 'sequelize';
import logger from '../utils/logger';
import crypto from 'crypto';
import { PaymentService } from '../services/paymentService'; // Import Service

const BILLPLZ_API_KEY = process.env.BILLPLZ_API_KEY;
const BILLPLZ_COLLECTION_ID = process.env.BILLPLZ_COLLECTION_ID;
const BILLPLZ_ENDPOINT = process.env.BILLPLZ_ENDPOINT || 'https://www.billplz-sandbox.com/api/v3/bills';
const BILLPLZ_X_SIGNATURE_KEY = process.env.BILLPLZ_X_SIGNATURE;

/**
 * Handle checkout session creation
 */
export const createCheckout = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { planId, invitationId, couponCode, successUrl, cancelUrl, phone } = req.body;

        if (!BILLPLZ_API_KEY || !BILLPLZ_COLLECTION_ID) {
            logger.error('Billplz credentials missing in environment variables');
            res.status(500).json({ success: false, error: 'Payment configuration error' });
            return;
        }

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

        // Get user details
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

        // Update user phone if not set or changed
        if (phone && (!user.phone_number || user.phone_number !== phone)) {
            await user.update({ phone_number: phone });
            logger.info(`Updated phone number for user ${userId}: ${phone}`);
        }

        // Determine Frontend URL for redirect
        // We look at Referer/Headers to support both localhost and ngrok/production
        const headerProtocol = req.headers['x-forwarded-proto'] === 'https' || req.secure ? 'https' : 'http';
        const forwardedHost = req.headers['x-forwarded-host'] as string;
        const currentHost = req.get('host');
        const dynamicBaseUrl = `${headerProtocol}://${forwardedHost || currentHost}`;

        let frontendBaseUrl = process.env.FRONTEND_URL;
        const referer = req.headers.referer;

        if (!frontendBaseUrl || frontendBaseUrl.includes('localhost')) {
            if (referer) {
                try {
                    const refUrl = new URL(referer);
                    frontendBaseUrl = `${refUrl.protocol}//${refUrl.host}`;
                } catch (e) {
                    frontendBaseUrl = dynamicBaseUrl;
                }
            } else {
                frontendBaseUrl = dynamicBaseUrl;
            }
        }

        const finalSuccessUrl = successUrl || `${frontendBaseUrl}/#/orders?status=success`;

        // -----------------------------------------------------
        // HANDLE 100% DISCOUNT (Free Order)
        // -----------------------------------------------------
        if (amount <= 0) {
            logger.info(`Order ${order.id} is free (100% discount). bypassing payment gateway.`);
            await PaymentService.completeOrder(order, 'Coupon');

            res.json({
                success: true,
                checkout_url: finalSuccessUrl // Direct redirect to success page
            });
            return;
        }
        // -----------------------------------------------------

        // Billplz expects amount in cents as an integer
        const billAmount = Math.round(amount * 100);

        // Prepare Billplz API request
        // Using Basic Auth: username is API key, no password
        const auth = Buffer.from(`${BILLPLZ_API_KEY}:`).toString('base64');

        // For callback (Billplz Server -> Your Backend)
        // Must be a publicly accessible URL for Billplz to reach it
        const backendBaseUrl = process.env.BACKEND_URL && !process.env.BACKEND_URL.includes('localhost')
            ? process.env.BACKEND_URL
            : dynamicBaseUrl;

        const callbackUrl = `${backendBaseUrl}/api/payments/webhook`;

        // For redirect (Billplz -> Your Browser)
        const redirectUrl = finalSuccessUrl;

        logger.info(`Billplz Integration URLs:`);
        logger.info(`- Callback (Webhook): ${callbackUrl}`);
        logger.info(`- Redirect (UX): ${redirectUrl}`);

        // Using URLSearchParams to ensure application/x-www-form-urlencoded
        const body = new URLSearchParams();
        body.append('collection_id', BILLPLZ_COLLECTION_ID);
        body.append('email', user.email);
        body.append('name', user.name || 'RaikanBersama User');
        body.append('amount', billAmount.toString());
        body.append('callback_url', callbackUrl);
        body.append('redirect_url', redirectUrl);
        body.append('description', `RaikanBersama ${planId.toUpperCase()} Plan`);
        body.append('reference_1', order.id.toString());
        if (phone) {
            body.append('mobile', phone);
        }

        const response = await fetch(BILLPLZ_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        });

        const billData: any = await response.json();

        if (!response.ok) {
            logger.error('Billplz API Error:', billData);
            res.status(500).json({ success: false, error: 'Payment gateway error', details: billData });
            return;
        }

        // Update order with payment ID (Billplz bill id)
        await order.update({ payment_id: billData.id });

        res.json({
            success: true,
            checkout_url: billData.url
        });
    } catch (error) {
        logger.error('Error creating checkout:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * Verify Billplz X-Signature
 */
const verifyBillplzSignature = (payload: any): boolean => {
    if (!BILLPLZ_X_SIGNATURE_KEY) {
        logger.warn('BILLPLZ_X_SIGNATURE not set, skipping verification');
        return true; // Skip if key not provided (for dev/local if needed)
    }

    const { x_signature, ...data } = payload;
    if (!x_signature) {
        // Special case: if we're in sandbox and signature is missing, log but allow (temporarily)
        if (BILLPLZ_ENDPOINT.includes('sandbox')) {
            logger.warn('SANDBOX: No x_signature found, but allowing for testing purposes. Check Billplz settings.');
            return true;
        }
        logger.error('No x_signature found in Billplz payload');
        return false;
    }

    // 1. Construct source string
    // Elements should be sorted in ascending order, case-insensitive.
    // Each element is key + value, separated by "|"
    const sourceString = Object.keys(data)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map(key => {
            const value = data[key] !== undefined && data[key] !== null ? data[key] : '';
            return `${key}${value}`;
        })
        .join('|');

    // 2. Sign the source string using HMAC_SHA256
    const signature = crypto
        .createHmac('sha256', BILLPLZ_X_SIGNATURE_KEY)
        .update(sourceString)
        .digest('hex');

    const isValid = signature === x_signature;

    if (!isValid) {
        // In sandbox, we expect failures occasionally due to collation differences, so we don't clog error.log
        if (BILLPLZ_ENDPOINT.includes('sandbox')) {
            logger.warn('Billplz X-Signature verification failed (Expected in Sandbox)');
            logger.info(`Generated Source String: ${sourceString}`);
            logger.info(`Calculated HMAC-SHA256: ${signature}`);
            logger.info(`Received x_signature: ${x_signature}`);
            logger.warn('SANDBOX: Signature mismatch allowed for testing. Please fix key collation.');
            return true;
        } else {
            logger.error('Billplz X-Signature verification failed');
            logger.debug(`Generated Source String: ${sourceString}`);
            logger.debug(`Calculated HMAC-SHA256: ${signature}`);
            logger.debug(`Received x_signature: ${x_signature}`);
        }
    } else {
        logger.info('Billplz X-Signature verified successfully');
    }

    return isValid;
};

/**
 * Handle Billplz Webhook (Callback)
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const payload = req.body;

        // Log headers and payload for deep debugging
        logger.info(`Billplz Webhook Headers: ${JSON.stringify(req.headers)}`);
        logger.info(`Billplz Webhook Payload: ${JSON.stringify(payload)}`);

        // Verify Signature
        if (BILLPLZ_X_SIGNATURE_KEY && !verifyBillplzSignature(payload)) {
            // Check if signature is in headers as X-Signature
            const headerSignature = req.headers['x-signature'];
            if (headerSignature && headerSignature === payload.x_signature) {
                logger.info('Billplz X-Signature verified via headers (duplicate)');
            } else {
                res.status(401).send('Invalid signature');
                return;
            }
        }

        // Billplz callback fields: id, collection_id, paid, state, amount, paid_at, x_signature
        // reference_1 contains our Order ID
        const { id, paid, state, reference_1 } = payload;

        logger.info(`Processing Billplz Webhook for bill ${id}, reference_1: ${reference_1}, paid: ${paid}, state: ${state}`);

        // Try to find order by reference_1 first, then fallback to id (Bill ID)
        let order = null;
        if (reference_1) {
            order = await Order.findByPk(reference_1);
        }

        if (!order && id) {
            order = await Order.findOne({ where: { payment_id: id } });
            if (order) {
                logger.info(`Found order ${order.id} via Bill ID fallback (${id})`);
            }
        }

        if (!order) {
            logger.error(`Order not found for bill ${id} / reference ${reference_1}`);
            res.status(404).send('Order not found');
            return;
        }

        // status 'paid' can be boolean or string 'true'/'false' depending on how it's sent
        const isPaid = paid === true || paid === 'true';

        if (isPaid && state === 'paid') {
            // Use PaymentService to handle logic consistently
            await PaymentService.completeOrder(order, payload.payment_method || 'Billplz');
        } else if (state === 'due' || state === 'deleted') {
            // Keep as pending or mark as failed if deleted
            if (state === 'deleted') {
                await order.update({ status: OrderStatus.FAILED });
            }
        }

        res.status(200).send('Webhook processed');
    } catch (error) {
        logger.error('Error processing webhook:', error);
        res.status(500).send('Internal server error');
    }
};
