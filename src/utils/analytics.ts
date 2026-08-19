// Google Analytics 4 (gtag.js) Integration

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Fallback to provided measurement ID if environment variable is not set
const DEFAULT_MEASUREMENT_ID = 'G-VCQFW0JKFX';

export const getMeasurementId = (): string => {
  return (
    import.meta.env.VITE_GA_MEASUREMENT_ID ||
    DEFAULT_MEASUREMENT_ID
  );
};

let isInitialized = false;

/**
 * Initializes Google Analytics 4 by dynamically loading the gtag script
 */
export const initGA = (): void => {
  if (typeof window === 'undefined') return;

  const measurementId = getMeasurementId();
  if (!measurementId) return;

  if (isInitialized || document.getElementById('ga-gtag')) {
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // We manually trigger page views on route/hash changes
  });

  // Inject Google Tag Manager Script tag
  const script = document.createElement('script');
  script.id = 'ga-gtag';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  isInitialized = true;
};

/**
 * Tracks a page view in GA4
 * @param path The current path / hash (e.g. '#cv', '#blog', '#blog/ksp-compiler-plugin')
 * @param title Optional title of the page or article
 */
export const trackPageView = (path: string, title?: string): void => {
  if (typeof window === 'undefined') return;

  const measurementId = getMeasurementId();
  if (!measurementId) return;

  // Ensure GA is initialized
  if (!isInitialized) {
    initGA();
  }

  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path || window.location.pathname + window.location.hash,
      page_location: window.location.href,
      page_title: title || document.title,
      send_to: measurementId,
    });
  }
};

/**
 * Tracks a custom event in GA4
 * @param eventName Name of the event (e.g. 'download_cv', 'switch_theme', 'read_article')
 * @param params Additional event parameters
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}): void => {
  if (typeof window === 'undefined') return;

  const measurementId = getMeasurementId();
  if (!measurementId) return;

  if (!isInitialized) {
    initGA();
  }

  if (window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      send_to: measurementId,
    });
  }
};
