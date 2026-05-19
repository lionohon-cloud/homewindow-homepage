type GtagEvent =
  | "start_review"
  | "lookup_customer_success"
  | "lookup_customer_fail"
  | "pick_review_type"
  | "submit_review";

declare global {
  interface Window {
    gtag?: (cmd: string, eventName: string, params?: Record<string, unknown>) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackReview(event: GtagEvent, params: Record<string, unknown> = {}) {
  try {
    window.gtag?.("event", event, params);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
  } catch {
    /* noop */
  }
}
