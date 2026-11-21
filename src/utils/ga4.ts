/**
 * Google Analytics 4 (GA4) client-side instrumentation.
 *
 * Why this exists: the site had no Google tag at all, so Google had no record of
 * a single visit. GA4 is the measurement layer that Google Ads conversion
 * tracking and Search campaign reporting both depend on.
 *
 * Design rules, matching the Meta pixel module:
 * - No-op silently when VITE_GA4_MEASUREMENT_ID is unset (local dev, previews).
 * - Never throw: analytics must never break a page render or a checkout.
 * - Load lazily on first event so an unconfigured environment ships zero
 *   third-party requests.
 */

type Params = Record<string, unknown>;

interface GtagWindow extends Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
}

const MEASUREMENT_ID = (import.meta.env.VITE_GA4_MEASUREMENT_ID || '').trim();

let bootstrapped = false;

export const isGa4Enabled = (): boolean =>
    Boolean(MEASUREMENT_ID) && typeof window !== 'undefined';

const boot = (): boolean => {
    if (!isGa4Enabled()) {
        return false;
    }
    const w = window as GtagWindow;
    if (bootstrapped) {
        return true;
    }

    w.dataLayer = w.dataLayer || [];
    // gtag must push the arguments object itself, not an array.
    w.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);

    w.gtag('js', new Date());
    // The SPA tracks page views itself, so suppress the automatic one.
    w.gtag('config', MEASUREMENT_ID, { send_page_view: false });

    bootstrapped = true;
    return true;
};

const send = (eventName: string, params?: Params): void => {
    try {
        if (!boot()) {
            return;
        }
        const w = window as GtagWindow;
        w.gtag?.('event', eventName, params || {});
    } catch (error) {
        console.warn('GA4 event failed:', eventName, error);
    }
};

export const ga4PageView = (path?: string, title?: string): void => {
    if (typeof window === 'undefined') {
        return;
    }
    send('page_view', {
        page_path: path || `${window.location.pathname}${window.location.search}`,
        page_title: title || document.title,
        page_location: window.location.href,
    });
};

export interface Ga4Item {
    item_id: string;
    item_name: string;
    price?: number;
    quantity?: number;
}

export const ga4ViewItem = (name: string, params?: Params): void => {
    send('view_item', {
        item_name: name,
        ...params,
        items: [{ item_id: name.toLowerCase(), item_name: name, quantity: 1 }],
    });
};

export const ga4AddToCart = (params: {
    itemId?: string;
    itemName?: string;
    value?: number;
    currency?: string;
}): void => {
    send('add_to_cart', {
        currency: params.currency || 'MYR',
        value: params.value,
        items: params.itemId
            ? [{
                item_id: params.itemId,
                item_name: params.itemName || params.itemId,
                price: params.value,
                quantity: 1,
            }]
            : undefined,
    });
};

export const ga4BeginCheckout = (params: {
    itemId?: string;
    itemName?: string;
    value?: number;
    currency?: string;
    coupon?: string;
}): void => {
    send('begin_checkout', {
        currency: params.currency || 'MYR',
        value: params.value,
        coupon: params.coupon,
        items: params.itemId
            ? [{
                item_id: params.itemId,
                item_name: params.itemName || params.itemId,
                price: params.value,
                quantity: 1,
            }]
            : undefined,
    });
};

/**
 * Client-side purchase. The authoritative purchase is sent server-side through
 * the Measurement Protocol (GA4 deduplicates on transaction_id), so this is for
 * the case where the customer does return to the success page.
 */
export const ga4Purchase = (params: {
    transactionId: string;
    value: number;
    currency?: string;
    itemId?: string;
    itemName?: string;
    coupon?: string;
}): void => {
    send('purchase', {
        transaction_id: params.transactionId,
        value: params.value,
        currency: params.currency || 'MYR',
        coupon: params.coupon,
        items: [{
            item_id: params.itemId || params.transactionId,
            item_name: params.itemName || 'Invitation',
            price: params.value,
            quantity: 1,
        }],
    });
};

export default {
    isGa4Enabled,
    pageView: ga4PageView,
    viewItem: ga4ViewItem,
    addToCart: ga4AddToCart,
    beginCheckout: ga4BeginCheckout,
    purchase: ga4Purchase,
};
