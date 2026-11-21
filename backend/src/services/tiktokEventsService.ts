import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger';

/**
 * TikTok Events API (server-side) service.
 *
 * Mirrors the Meta CAPI service: the authoritative `CompletePayment` is sent
 * from the payment webhook, because a customer can close the Billplz tab and
 * never return to the success page.
 *
 * Design rules:
 * - Never throw. A TikTok outage must never break a paid order.
 * - No-op with a warning when credentials are missing (local dev, CI).
 * - PII is normalized and SHA-256 hashed before it leaves the server.
 * - event_id is deterministic per order so webhook retries cannot double count.
 */

const PIXEL_CODE = process.env.TIKTOK_PIXEL_ID || '';
const ACCESS_TOKEN = process.env.TIKTOK_EVENTS_ACCESS_TOKEN || '';
const TEST_EVENT_CODE = process.env.TIKTOK_TEST_EVENT_CODE || '';
const API_VERSION = process.env.TIKTOK_EVENTS_API_VERSION || 'v1.3';
const ENABLED = process.env.TIKTOK_EVENTS_ENABLED !== 'false';
const TIMEOUT_MS = 10000;
const ENDPOINT = `https://business-api.tiktok.com/open_api/${API_VERSION}/event/track/`;

export interface TikTokUserData {
    email?: string | null;
    phone?: string | null;
    externalId?: string | null;
    ttclid?: string | null;
    ttp?: string | null;
    clientIpAddress?: string | null;
    clientUserAgent?: string | null;
}

export interface TikTokEventInput {
    eventName: string;
    eventId: string;
    userData: TikTokUserData;
    properties?: Record<string, unknown>;
    eventTime?: Date;
    eventSourceUrl?: string;
}

const sha256 = (value: string): string =>
    crypto.createHash('sha256').update(value).digest('hex');

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/** TikTok expects E.164 digits without a leading "+", same as Meta. */
const normalizePhone = (phone: string): string => {
    const digits = phone.replace(/[^0-9]/g, '');
    if (!digits) return '';
    return digits.startsWith('0') ? `6${digits}` : digits;
};

const buildUser = (userData: TikTokUserData): Record<string, string> => {
    const out: Record<string, string> = {};

    if (userData.email) {
        const email = normalizeEmail(userData.email);
        if (email) out.email = sha256(email);
    }
    if (userData.phone) {
        const phone = normalizePhone(userData.phone);
        if (phone) out.phone = sha256(phone);
    }
    if (userData.externalId) {
        out.external_id = sha256(userData.externalId.trim().toLowerCase());
    }

    // Click/session identifiers are sent raw, never hashed.
    if (userData.ttclid) out.ttclid = userData.ttclid;
    if (userData.ttp) out.ttp = userData.ttp;
    if (userData.clientIpAddress) out.ip = userData.clientIpAddress;
    if (userData.clientUserAgent) out.user_agent = userData.clientUserAgent;

    return out;
};

export const isConfigured = (): boolean =>
    ENABLED && Boolean(PIXEL_CODE && ACCESS_TOKEN);

export const sendEvent = async (input: TikTokEventInput): Promise<boolean> => {
    if (!isConfigured()) {
        logger.warn(
            `TikTok Events API skipped "${input.eventName}": TIKTOK_PIXEL_ID or TIKTOK_EVENTS_ACCESS_TOKEN not configured.`
        );
        return false;
    }

    const event: Record<string, unknown> = {
        event: input.eventName,
        event_time: Math.floor((input.eventTime ?? new Date()).getTime() / 1000),
        event_id: input.eventId,
        user: buildUser(input.userData),
        ...(input.properties ? { properties: input.properties } : {}),
        ...(input.eventSourceUrl ? { page: { url: input.eventSourceUrl } } : {}),
    };

    // TikTok rejects events older than 7 days.
    const ageSeconds = Math.floor(Date.now() / 1000) - (event.event_time as number);
    if (ageSeconds > 604800) {
        logger.warn(`TikTok Events API skipped "${input.eventName}": event is ${ageSeconds}s old (max 604800s).`);
        return false;
    }

    const body: Record<string, unknown> = {
        event_source: 'web',
        event_source_id: PIXEL_CODE,
        data: [event],
        ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
    };

    try {
        const response = await axios.post(ENDPOINT, body, {
            timeout: TIMEOUT_MS,
            headers: {
                'Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json',
            },
        });

        const code = response.data?.code;
        if (code !== 0) {
            logger.error(
                `TikTok Events API rejected "${input.eventName}" (event_id=${input.eventId}): code=${code} message=${response.data?.message}`
            );
            return false;
        }

        logger.info(
            `TikTok Events API sent "${input.eventName}" (event_id=${input.eventId}) pixel=${PIXEL_CODE}`
        );
        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            logger.error(
                `TikTok Events API failed "${input.eventName}": status=${error.response?.status} body=${JSON.stringify(error.response?.data)?.slice(0, 300)}`
            );
        } else {
            logger.error(`TikTok Events API failed "${input.eventName}":`, error);
        }
        return false;
    }
};

export interface CompletePaymentParams {
    orderId: string;
    userId: string;
    amount: number;
    planTier: string;
    email?: string | null;
    phone?: string | null;
    couponCode?: string | null;
    eventSourceUrl?: string;
}

/** Authoritative payment event. event_id derives from the order id so retries dedupe. */
export const trackCompletePayment = async (
    params: CompletePaymentParams
): Promise<boolean> => {
    return sendEvent({
        eventName: 'CompletePayment',
        eventId: `payment-${params.orderId}`,
        eventSourceUrl: params.eventSourceUrl,
        userData: {
            email: params.email,
            phone: params.phone,
            externalId: params.userId,
        },
        properties: {
            content_type: 'product',
            content_id: params.planTier,
            content_name: `RaikanBersama ${params.planTier}`,
            value: Number(params.amount),
            currency: 'MYR',
            order_id: params.orderId,
            quantity: 1,
            ...(params.couponCode ? { coupon: params.couponCode } : {}),
        },
    });
};

export default {
    isConfigured,
    sendEvent,
    trackCompletePayment,
};
