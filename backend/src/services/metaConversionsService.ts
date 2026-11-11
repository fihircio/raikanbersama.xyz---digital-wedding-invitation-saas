import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger';

/**
 * Meta Conversions API (CAPI) service.
 *
 * Sends server-side marketing events directly to Meta so that conversions are
 * still recorded when the browser Pixel is blocked, the user closes the tab
 * before returning from Billplz, or an ad blocker strips fbevents.js.
 *
 * Design rules:
 * - Never throw. A Meta outage must never break a paid order or a checkout.
 * - No-op with a warning when credentials are missing (local dev, CI).
 * - All PII is normalized and SHA-256 hashed before it leaves the server.
 * - event_id is deterministic per event so that Billplz webhook retries
 *   cannot inflate conversion counts.
 */

const PIXEL_ID = process.env.META_PIXEL_ID || '968435972628878';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || '';
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE || '';
const API_VERSION = process.env.META_CAPI_API_VERSION || 'v23.0';
const ENABLED = process.env.META_CAPI_ENABLED !== 'false';
const TIMEOUT_MS = 10000;

export type CapiActionSource = 'website' | 'system_generated' | 'other';

export interface CapiUserData {
    email?: string | null;
    phone?: string | null;
    fullName?: string | null;
    externalId?: string | null;
    country?: string | null;
    fbp?: string | null;
    fbc?: string | null;
    clientIpAddress?: string | null;
    clientUserAgent?: string | null;
}

export interface CapiEventInput {
    eventName: string;
    eventId: string;
    userData: CapiUserData;
    customData?: Record<string, unknown>;
    eventSourceUrl?: string;
    actionSource?: CapiActionSource;
    eventTime?: number;
}

const sha256 = (value: string): string =>
    crypto.createHash('sha256').update(value).digest('hex');

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/**
 * Meta requires phone numbers in E.164 format without the leading "+".
 * Local Malaysian numbers are typed as "0123456789", so we convert them
 * to "60123456789" before hashing.
 */
const normalizePhone = (phone: string): string => {
    const digits = phone.replace(/[^0-9]/g, '');
    if (!digits) {
        return '';
    }
    if (digits.startsWith('0')) {
        return `6${digits}`;
    }
    return digits;
};

const normalizeName = (name: string): string =>
    name.trim().replace(/\s+/g, ' ').toLowerCase();

const buildUserData = (userData: CapiUserData): Record<string, string> => {
    const result: Record<string, string> = {};

    if (userData.email) {
        const email = normalizeEmail(userData.email);
        if (email) {
            result.em = sha256(email);
        }
    }

    if (userData.phone) {
        const phone = normalizePhone(userData.phone);
        if (phone) {
            result.ph = sha256(phone);
        }
    }

    if (userData.fullName) {
        const name = normalizeName(userData.fullName);
        if (name) {
            const parts = name.split(' ');
            result.fn = sha256(parts[0]);
            const lastName = parts.slice(1).join(' ');
            if (lastName) {
                result.ln = sha256(lastName);
            }
        }
    }

    if (userData.externalId) {
        result.external_id = sha256(userData.externalId.trim().toLowerCase());
    }

    if (userData.country) {
        const country = userData.country.trim().toLowerCase();
        if (country) {
            result.country = sha256(country);
        }
    }

    // Browser/session identifiers must be sent raw, never hashed.
    if (userData.fbp) {
        result.fbp = userData.fbp;
    }
    if (userData.fbc) {
        result.fbc = userData.fbc;
    }
    if (userData.clientIpAddress) {
        result.client_ip_address = userData.clientIpAddress;
    }
    if (userData.clientUserAgent) {
        result.client_user_agent = userData.clientUserAgent;
    }

    return result;
};

export const isConfigured = (): boolean => {
    return ENABLED && Boolean(PIXEL_ID && ACCESS_TOKEN);
};

export const newEventId = (seed?: string): string => {
    if (seed) {
        return `srv-${seed}`;
    }
    return `srv-${crypto.randomBytes(16).toString('hex')}`;
};

/**
 * Low-level transport. Returns true when Meta acknowledged the event.
 */
export const sendEvent = async (input: CapiEventInput): Promise<boolean> => {
    if (!isConfigured()) {
        logger.warn(
            `Meta CAPI skipped "${input.eventName}": META_CAPI_ACCESS_TOKEN or META_PIXEL_ID is not configured.`
        );
        return false;
    }

    const event = {
        event_name: input.eventName,
        event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: input.actionSource ?? 'website',
        user_data: buildUserData(input.userData),
        custom_data: input.customData,
    };

    const body: Record<string, string> = {
        data: JSON.stringify([event]),
        access_token: ACCESS_TOKEN,
    };

    if (TEST_EVENT_CODE) {
        body.test_event_code = TEST_EVENT_CODE;
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

    try {
        const response = await axios.post(url, body, { timeout: TIMEOUT_MS });
        const received = response.data?.events_received;
        logger.info(
            `Meta CAPI sent "${input.eventName}" (event_id=${input.eventId}) pixel=${PIXEL_ID} events_received=${received} fbtrace_id=${response.data?.fbtrace_id}`
        );
        return true;
    } catch (error) {
        // Never propagate: tracking failure must not affect payment state.
        if (axios.isAxiosError(error)) {
            logger.error(
                `Meta CAPI failed "${input.eventName}" (event_id=${input.eventId}): status=${error.response?.status} body=${JSON.stringify(error.response?.data)}`
            );
        } else {
            logger.error(`Meta CAPI failed "${input.eventName}":`, error);
        }
        return false;
    }
};

export interface PurchaseEventParams {
    orderId: string;
    userId: string;
    amount: number;
    planTier: string;
    email?: string | null;
    phone?: string | null;
    fullName?: string | null;
    couponCode?: string | null;
    eventSourceUrl?: string;
}

/**
 * Authoritative Purchase event. event_id is derived from the order id, so a
 * repeated Billplz webhook produces the same id and Meta discards the duplicate.
 */
export const trackPurchase = async (params: PurchaseEventParams): Promise<boolean> => {
    return sendEvent({
        eventName: 'Purchase',
        eventId: `purchase-${params.orderId}`,
        eventSourceUrl: params.eventSourceUrl,
        actionSource: 'website',
        userData: {
            email: params.email,
            phone: params.phone,
            fullName: params.fullName,
            externalId: params.userId,
            country: 'my',
        },
        customData: {
            value: Number(params.amount),
            currency: 'MYR',
            content_ids: [params.planTier],
            content_type: 'product',
            content_name: `RaikanBersama ${params.planTier}`,
            order_id: params.orderId,
            num_items: 1,
            ...(params.couponCode ? { coupon: params.couponCode } : {}),
        },
    });
};

export interface InitiateCheckoutEventParams {
    eventId: string;
    orderId: string;
    userId: string;
    amount: number;
    planTier: string;
    email?: string | null;
    phone?: string | null;
    fullName?: string | null;
    couponCode?: string | null;
    eventSourceUrl?: string;
    fbp?: string | null;
    fbc?: string | null;
    clientIpAddress?: string | null;
    clientUserAgent?: string | null;
}

/**
 * Server-side mirror of the browser InitiateCheckout. Only sent when the
 * browser supplied the same event_id, otherwise we would double count.
 */
export const trackInitiateCheckout = async (
    params: InitiateCheckoutEventParams
): Promise<boolean> => {
    return sendEvent({
        eventName: 'InitiateCheckout',
        eventId: params.eventId,
        eventSourceUrl: params.eventSourceUrl,
        actionSource: 'website',
        userData: {
            email: params.email,
            phone: params.phone,
            fullName: params.fullName,
            externalId: params.userId,
            country: 'my',
            fbp: params.fbp,
            fbc: params.fbc,
            clientIpAddress: params.clientIpAddress,
            clientUserAgent: params.clientUserAgent,
        },
        customData: {
            value: Number(params.amount),
            currency: 'MYR',
            content_ids: [params.planTier],
            content_type: 'product',
            content_name: `RaikanBersama ${params.planTier}`,
            order_id: params.orderId,
            num_items: 1,
            ...(params.couponCode ? { coupon: params.couponCode } : {}),
        },
    });
};

export default {
    isConfigured,
    newEventId,
    sendEvent,
    trackPurchase,
    trackInitiateCheckout,
};
