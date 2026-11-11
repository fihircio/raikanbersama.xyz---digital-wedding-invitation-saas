declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const META_PIXEL_ID = '968435972628878';

/**
 * Generates a client-side event id.
 *
 * The same id is sent to Meta (via the browser Pixel) and to our backend
 * (which forwards it through the Conversions API with the same event_id).
 * Meta then deduplicates the pair into a single conversion instead of
 * counting both.
 */
export const newEventId = (): string => {
  const webCrypto = typeof crypto !== 'undefined' ? (crypto as Crypto & { randomUUID?: () => string }) : undefined;
  if (webCrypto && typeof webCrypto.randomUUID === 'function') {
    return webCrypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Returns the Meta browser/session identifiers so the backend can include
 * them in server-side events. These are not PII and must stay unhashed.
 */
export const getMetaBrowserIds = (): { fbp: string | null; fbc: string | null } => ({
  fbp: readCookie('_fbp'),
  fbc: readCookie('_fbc'),
});

const track = (eventName: string, params?: Record<string, unknown>, eventId?: string) => {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }

  if (eventId) {
    window.fbq('track', eventName, params || {}, { eventID: eventId });
    return;
  }

  if (params) {
    window.fbq('track', eventName, params);
    return;
  }

  window.fbq('track', eventName);
};

export const trackPageView = () => {
  track('PageView');
};

export const trackViewContent = (contentName: string, params?: Record<string, unknown>) => {
  track('ViewContent', {
    content_name: contentName,
    ...params,
  });
};

export const trackInitiateCheckout = (params: Record<string, unknown>, eventId?: string): string => {
  const id = eventId || newEventId();
  track('InitiateCheckout', {
    currency: 'MYR',
    ...params,
  }, id);
  return id;
};

export const trackAddToCart = (params: Record<string, unknown>, eventId?: string) => {
  track('AddToCart', {
    currency: 'MYR',
    ...params,
  }, eventId);
};

export const trackCustom = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }

  window.fbq('trackCustom', eventName, params || {});
};

export {};
