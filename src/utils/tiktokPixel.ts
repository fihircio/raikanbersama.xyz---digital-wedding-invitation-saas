/**
 * TikTok Pixel (client-side) instrumentation.
 *
 * Mirrors the Meta pixel module: no-op when VITE_TIKTOK_PIXEL_ID is unset, never
 * throws, and lazily injects the vendor script so unconfigured environments make
 * zero third-party requests.
 *
 * Event names are TikTok's standard set, which differ from Meta's:
 *   ViewContent · AddToCart · InitiateCheckout · CompletePayment
 */

type Params = Record<string, unknown>;

interface TtqWindow extends Window {
    TiktokAnalyticsObject?: string;
    ttq?: TtqStub;
}

/**
 * TikTok's loader expects ttq to exist as an array with every public method
 * deferred onto it ("setAndDefer"). A bare function stub silently throws on
 * `.load()` / `.track()`, so events never queue.
 */
interface TtqStub extends Array<unknown[]> {
    load?: (id: string) => void;
    page?: (params?: Params) => void;
    track?: (event: string, params?: Params) => void;
    [key: string]: unknown;
}

const PIXEL_ID = (import.meta.env.VITE_TIKTOK_PIXEL_ID || '').trim();

let bootstrapped = false;

const TTQ_METHODS = [
    'page', 'track', 'identify', 'instances', 'debug', 'on', 'off',
    'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
];

export const isTikTokEnabled = (): boolean =>
    Boolean(PIXEL_ID) && typeof window !== 'undefined';

const buildStub = (): TtqStub => {
    const ttq: TtqStub = [] as unknown as TtqStub;
    const setAndDefer = (target: TtqStub, method: string) => {
        (target as Record<string, unknown>)[method] = function (...args: unknown[]) {
            target.push([method, ...args]);
        };
    };
    TTQ_METHODS.forEach((method) => setAndDefer(ttq, method));
    return ttq;
};

const boot = (): boolean => {
    if (!isTikTokEnabled()) {
        return false;
    }
    const w = window as TtqWindow;
    if (bootstrapped && w.ttq) {
        return true;
    }

    w.TiktokAnalyticsObject = 'ttq';
    if (!w.ttq) {
        w.ttq = buildStub();
    }

    if (!bootstrapped) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${PIXEL_ID}&lib=ttq`;
        document.head.appendChild(script);
        w.ttq.load?.(PIXEL_ID);
        bootstrapped = true;
    }

    return true;
};

const send = (eventName: string, params?: Params): void => {
    try {
        if (!boot()) {
            return;
        }
        const w = window as TtqWindow;
        w.ttq?.track(eventName, params || {});
    } catch (error) {
        console.warn('TikTok event failed:', eventName, error);
    }
};

export const ttqPage = (): void => {
    try {
        if (!boot()) {
            return;
        }
        (window as TtqWindow).ttq?.page();
    } catch (error) {
        console.warn('TikTok page failed:', error);
    }
};

export const ttqViewContent = (name: string, params?: Params): void => {
    send('ViewContent', {
        content_name: name,
        content_type: 'product',
        ...params,
    });
};

export const ttqAddToCart = (params: {
    contentId?: string;
    contentName?: string;
    value?: number;
    currency?: string;
}): void => {
    send('AddToCart', {
        content_id: params.contentId,
        content_name: params.contentName,
        content_type: 'product',
        value: params.value,
        currency: params.currency || 'MYR',
    });
};

export const ttqInitiateCheckout = (params: {
    contentId?: string;
    contentName?: string;
    value?: number;
    currency?: string;
    quantity?: number;
}): void => {
    send('InitiateCheckout', {
        content_id: params.contentId,
        content_name: params.contentName,
        content_type: 'product',
        value: params.value,
        currency: params.currency || 'MYR',
        quantity: params.quantity || 1,
    });
};

/** The authoritative CompletePayment is sent server-side via the Events API. */
export const ttqCompletePayment = (params: {
    contentId?: string;
    contentName?: string;
    value?: number;
    currency?: string;
    orderId?: string;
}): void => {
    send('CompletePayment', {
        content_id: params.contentId,
        content_name: params.contentName,
        content_type: 'product',
        value: params.value,
        currency: params.currency || 'MYR',
        order_id: params.orderId,
    });
};

export default {
    isTikTokEnabled,
    page: ttqPage,
    viewContent: ttqViewContent,
    addToCart: ttqAddToCart,
    initiateCheckout: ttqInitiateCheckout,
    completePayment: ttqCompletePayment,
};
