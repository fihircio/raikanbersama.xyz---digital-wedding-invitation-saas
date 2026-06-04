declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const META_PIXEL_ID = '968435972628878';

const track = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
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

export const trackInitiateCheckout = (params: Record<string, unknown>) => {
  track('InitiateCheckout', {
    currency: 'MYR',
    ...params,
  });
};

export const trackAddToCart = (params: Record<string, unknown>) => {
  track('AddToCart', {
    currency: 'MYR',
    ...params,
  });
};

export const trackCustom = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }

  window.fbq('trackCustom', eventName, params || {});
};

export {};
