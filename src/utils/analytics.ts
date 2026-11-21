/**
 * Single entry point for client-side conversion tracking.
 *
 * Call sites import from here instead of a specific vendor module, so adding or
 * removing a platform never means editing page components. Each platform no-ops
 * independently when its ID is unset, so a partially configured environment
 * still tracks on whichever platforms are configured.
 *
 * Platforms: Meta pixel, GA4, TikTok pixel.
 *
 * The public signatures deliberately mirror the existing Meta-style parameters
 * (content_name / content_ids / value), so call sites only change their import
 * line and the per-platform translation happens here.
 */

import {
    trackPageView as metaPageView,
    trackViewContent as metaViewContent,
    trackAddToCart as metaAddToCart,
    trackInitiateCheckout as metaInitiateCheckout,
} from './metaPixel';
import { ga4PageView, ga4ViewItem, ga4AddToCart, ga4BeginCheckout } from './ga4';
import { ttqPage, ttqViewContent, ttqAddToCart, ttqInitiateCheckout } from './tiktokPixel';

type MetaStyleParams = Record<string, unknown>;

const firstId = (params?: MetaStyleParams): string | undefined => {
    const ids = params?.content_ids;
    if (Array.isArray(ids) && ids.length) {
        return String(ids[0]);
    }
    return undefined;
};

export const trackPageView = (): void => {
    metaPageView();
    ga4PageView();
    ttqPage();
};

export const trackViewContent = (
    contentName: string,
    params?: MetaStyleParams
): void => {
    metaViewContent(contentName, params);
    ga4ViewItem(contentName, params);
    ttqViewContent(contentName, params);
};

export const trackAddToCart = (params: MetaStyleParams, eventId?: string): void => {
    metaAddToCart(params, eventId);

    const id = firstId(params);
    const name = params?.content_name ? String(params.content_name) : id;
    const value = params?.value as number | undefined;

    ga4AddToCart({ itemId: id, itemName: name, value });
    ttqAddToCart({ contentId: id, contentName: name, value });
};

export const trackInitiateCheckout = (
    params: MetaStyleParams,
    eventId?: string
): string => {
    const id = metaInitiateCheckout(params, eventId);

    const contentId = firstId(params);
    const contentName = params?.content_name ? String(params.content_name) : contentId;
    const value = params?.value as number | undefined;
    const coupon = params?.coupon as string | undefined;

    ga4BeginCheckout({ itemId: contentId, itemName: contentName, value, coupon });
    ttqInitiateCheckout({ contentId, contentName, value });

    return id;
};

export { trackCustom } from './metaPixel';
export { newEventId, getMetaBrowserIds } from './metaPixel';
export { isGa4Enabled } from './ga4';
export { isTikTokEnabled } from './tiktokPixel';
