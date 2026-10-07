// Google Analytics 4 (gtag.js) Integration with Zero-Cookie Mode
// Privacy-first: no _ga cookies stored, fully compliant with GDPR/ePrivacy without cookie banners.

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const DEFAULT_MEASUREMENT_ID = 'G-VCQFW0JKFX';

export const getMeasurementId = (): string => {
  return (
    import.meta.env.VITE_GA_MEASUREMENT_ID ||
    DEFAULT_MEASUREMENT_ID
  );
};

let isInitialized = false;

/**
 * Initializes Google Analytics 4 in Privacy-First / Zero-Cookie Mode
 * (client_storage: 'none' ensures no cookies are set on the user's browser)
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

  // Configure GA4 in zero-cookie, anonymized mode
  window.gtag('config', measurementId, {
    send_page_view: false, // Manually sent on route/tab change
    client_storage: 'none', // Disables cookies completely (_ga cookies avoided)
    anonymize_ip: true, // Anonymize visitor IP address
    allow_google_signals: false, // Disables advertising cross-device signals
    allow_ad_personalization_signals: false,
    restricted_data_processing: true,
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
 * Base custom event tracker
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

/**
 * Tracks a page / route view in GA4
 */
export const trackPageView = (path: string, title?: string): void => {
  if (typeof window === 'undefined') return;

  const measurementId = getMeasurementId();
  if (!measurementId) return;

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

/* =========================================================================
   Typed High-Level Event Tracking Functions
   ========================================================================= */

// Navigation & Preferences
export const trackTabSwitch = (tab: 'cv' | 'blog'): void => {
  trackEvent('tab_switch', { tab_name: tab });
};

export const trackThemeChange = (themeId: string): void => {
  trackEvent('theme_change', { theme_name: themeId });
};

// Resume & Recruiter Interactions
export const trackPrintCV = (trigger: 'print_button' | 'keyboard_shortcut' = 'print_button'): void => {
  trackEvent('print_cv', { trigger });
};

export const trackCopyEmail = (location: 'header' | 'footer' | 'contact_section'): void => {
  trackEvent('copy_email', { location });
};

export const trackContactClick = (
  channel: 'email' | 'github' | 'linkedin' | 'twitter' | 'medium',
  url: string
): void => {
  trackEvent('contact_click', { channel, url });
};

export const trackExperienceExpand = (companyName: string): void => {
  trackEvent('experience_expand', { company_name: companyName });
};

export const trackProjectClick = (projectName: string, url: string): void => {
  trackEvent('project_click', { project_name: projectName, url });
};

export const trackTalkClick = (talkTitle: string, url: string): void => {
  trackEvent('talk_click', { talk_title: talkTitle, url });
};

// Blog & Engagement Tracking
export const trackArticleOpen = (slug: string, title: string, category: string): void => {
  trackEvent('article_open', { article_slug: slug, article_title: title, category });
};

export const trackTocClick = (slug: string, headingId: string, headingText: string): void => {
  trackEvent('toc_click', {
    article_slug: slug,
    heading_id: headingId,
    heading_text: headingText,
  });
};

export const trackScrollDepth = (slug: string, percent: 25 | 50 | 75 | 100): void => {
  trackEvent('scroll_depth', {
    article_slug: slug,
    scroll_percent: percent,
  });
};

export const trackReadingTime = (slug: string, secondsSpent: number): void => {
  trackEvent('reading_time', {
    article_slug: slug,
    seconds_spent: secondsSpent,
  });
};

export const trackCopyCodeSnippet = (slug: string, language: string): void => {
  trackEvent('copy_code_snippet', {
    article_slug: slug,
    code_language: language,
  });
};

export const trackShareArticle = (
  slug: string,
  platform: 'twitter' | 'linkedin' | 'clipboard'
): void => {
  trackEvent('share_article', {
    article_slug: slug,
    platform,
  });
};

export const trackExternalLinkClick = (
  url: string,
  linkText: string,
  context: string = 'general'
): void => {
  trackEvent('external_link_click', {
    url,
    link_text: linkText,
    context,
  });
};
