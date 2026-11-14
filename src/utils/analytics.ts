// Optional privacy-conscious analytics integration (activates only with VITE_GA_MEASUREMENT_ID and user consent)
const CONSENT_STORAGE_KEY = 'typesprint_cookie_consent_v1';

export type CookieConsentStatus = 'accepted' | 'essential' | null;

export function getCookieConsent(): CookieConsentStatus {
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === 'accepted' || val === 'essential') return val;
    return null;
  } catch {
    return null;
  }
}

export function setCookieConsent(status: 'accepted' | 'essential') {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, status);
  } catch {
    // ignore
  }
  if (status === 'accepted') {
    initAnalyticsIfConfigured();
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __gaInitialized?: boolean;
  }
}

export function initAnalyticsIfConfigured() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId || typeof window === 'undefined' || window.__gaInitialized) {
    return;
  }
  if (getCookieConsent() !== 'accepted') {
    return;
  }

  window.__gaInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

export function trackPageView(path: string, title?: string) {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId || typeof window === 'undefined' || !window.gtag || getCookieConsent() !== 'accepted') {
    return;
  }
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
}
