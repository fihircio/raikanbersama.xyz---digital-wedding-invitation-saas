import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger';

/**
 * GA4 Measurement Protocol (server-side) service.
 *
 * The browser tag can be blocked or the customer can close the tab before the
 * Billplz redirect returns, so the authoritative `purchase` is sent from the
 * payment webhook instead of the success page.
 *
 * Design rules, matching the Meta CAPI service:
 * - Never throw. Analytics must never break a paid order.
 * - No-op with a warning when credentials are missing (local dev, CI).
 * - GA4 deduplicates on transaction_id, so a webhook retry cannot double count.
 */

const MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || '';
const API_SECRET = process.env.GA4_API_SECRET || '';
const DEBUG = process.env.GA4_MP_DEBUG === 'true';
const ENABLED = process.env.GA4_MP_ENABLED !== 'false';
const TIMEOUT_MS = 10000;
const ENDPOINT = 'https://www.google-analytics.com/mp/collect';

export interface Ga4UserData {
    clientId?: string | null;
    userId?: string | null;
}

export interface Ga4PurchaseParams {
    transactionId: string;
    value: number;
    currency?: string;
    itemId?: string;
    itemName?: string;
    coupon?: string | null;
    clientId?: string | null;
    userId?: string | null;
    /** Unix seconds; GA4 rejects events older than 72 hours. */
    eventTime?: number;
}

export const isConfigured = (): boolean =>
    ENABLED && Boolean(MEASUREMENT_ID && API_SECRET);

/**
 * GA4 requires a client_id. When the browser identifier is unavailable (webhook
 * path), derive a stable synthetic one from the order so repeat sends for the
 * same order collapse onto the same client instead of creating ghosts.
 */
export const syntheticClientId = (seed: string): string => {
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const a = parseInt(hash.slice(0, 8), 16);
    const b = parseInt(hash.slice(8, 16), 16);
    return `${a}.${b}`;
};

const post = async (payload: Record<string, unknown>, label: string): Promise<boolean> => {
    if (!isConfigured()) {
        logger.warn(`GA4 MP skipped "${label}": GA4_MEASUREMENT_ID or GA4_API_SECRET not configured.`);
        return false;
    }

    const url = `${ENDPOINT}?measurement_id=${encodeURIComponent(MEASUREMENT_ID)}&api_secret=${encodeURIComponent(API_SECRET)}`;

    try {
        const response = await axios.post(url, payload, {
            timeout: TIMEOUT_MS,
            headers: { 'Content-Type': 'application/json' },
        });
        // The MP endpoint returns 204 with an empty body on success.
        logger.info(`GA4 MP sent "${label}" status=${response.status}`);
        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            logger.error(
                `GA4 MP failed "${label}": status=${error.response?.status} body=${JSON.stringify(error.response?.data)?.slice(0, 300)}`
            );
        } else {
            logger.error(`GA4 MP failed "${label}":`, error);
        }
        return false;
    }
};

export const trackPurchase = async (params: Ga4PurchaseParams): Promise<boolean> => {
    const clientId = params.clientId || syntheticClientId(params.transactionId);

    const payload = {
        client_id: clientId,
        ...(params.userId ? { user_id: params.userId } : {}),
        ...(DEBUG ? { validation_behavior: 'ENFORCE_RECOMMENDATIONS' } : {}),
        events: [
            {
                name: 'purchase',
                params: {
                    transaction_id: params.transactionId,
                    value: Number(params.value),
                    currency: params.currency || 'MYR',
                    ...(params.coupon ? { coupon: params.coupon } : {}),
                    ...(params.eventTime ? { timestamp_micros: params.eventTime * 1000000 } : {}),
                    items: [
                        {
                            item_id: params.itemId || params.transactionId,
                            item_name: params.itemName || 'Invitation',
                            price: Number(params.value),
                            quantity: 1,
                        },
                    ],
                },
            },
        ],
    };

    return post(payload, `purchase:${params.transactionId}`);
};

export default {
    isConfigured,
    syntheticClientId,
    trackPurchase,
};
