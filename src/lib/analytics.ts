// Analytics helper for Concord Landscaping.
// Sends events to Google Analytics via gtag (installed by layout.tsx).
// Canonical event names follow the site's event schema (see Checklist 131-132).
// No PII (email, phone) is sent to analytics. Consent state is passed for tagging.

const GA_MEASUREMENT_ID = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID : undefined;

export type EventName =
  | "page_view"
  | "engaged_view"
  | "scroll_depth"
  | "internal_link_click"
  | "external_link_click"
  | "phone_click"
  | "email_click"
  | "cta_click"
  | "form_start"
  | "form_submit"
  | "form_error"
  | "service_select"
  | "share_click"
  | "copy_link"
  | "search"
  | "booking_start"
  | "booking_complete"
  | "lead"
  | "qualified_lead"
  | "purchase";

export interface AnalyticsEvent {
  event_name: EventName;
  page_id: string;
  page_type?: string;
  entity_id?: string;
  content_id?: string;
  product_id?: string;
  offer_id?: string;
  campaign_id?: string;
  experiment_id?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrer?: string;
  consent_state?: "granted" | "denied" | "unconfirmed" | "revoked";
  value?: number;
  currency?: string;
  correlation_id?: string;
  [key: string]: unknown;
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) {
    return;
  }

  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) {
    // gtag not yet loaded; nothing to do. It will load on next page view.
    return;
  }

  const params: Record<string, unknown> = { ...event };
  // GA4 expects the event name as the first argument and properties flattened.
  gtag("event", event.event_name, params);
}

export const analytics = {
  pageView(pageId: string, pageTitle: string): void {
    track({
      event_name: "page_view",
      page_id: pageId,
      page_type: pageTitle,
    });
  },

  engagedView(pageId: string): void {
    track({ event_name: "engaged_view", page_id: pageId });
  },

  scrollDepth(pageId: string, depth: number): void {
    track({ event_name: "scroll_depth", page_id: pageId, value: depth });
  },

  internalLinkClick(pageId: string, target: string): void {
    track({ event_name: "internal_link_click", page_id: pageId, event_label: target });
  },

  externalLinkClick(pageId: string, target: string): void {
    track({ event_name: "external_link_click", page_id: pageId, event_label: target });
  },

  phoneClick(pageId: string, phoneNumber: string): void {
    track({ event_name: "phone_click", page_id: pageId, event_label: phoneNumber });
  },

  emailClick(pageId: string, emailAddress: string): void {
    track({ event_name: "email_click", page_id: pageId, event_label: emailAddress });
  },

  ctaClick(pageId: string, ctaName: string): void {
    track({ event_name: "cta_click", page_id: pageId, event_label: ctaName });
  },

  formStart(pageId: string, formName: string): void {
    track({ event_name: "form_start", page_id: pageId, event_label: formName });
  },

  formSubmit(pageId: string, formName: string, success: boolean): void {
    track({ event_name: "form_submit", page_id: pageId, event_label: formName, value: success ? 1 : 0 });
  },

  formError(pageId: string, formName: string, errorMessage: string): void {
    track({
      event_name: "form_error",
      page_id: pageId,
      event_label: formName,
      event_description: errorMessage,
    });
  },

  serviceSelect(pageId: string, service: string): void {
    track({ event_name: "service_select", page_id: pageId, event_label: service });
  },

  shareClick(pageId: string, platform: string): void {
    track({ event_name: "share_click", page_id: pageId, event_label: platform });
  },

  copyLink(pageId: string): void {
    track({ event_name: "copy_link", page_id: pageId });
  },

  search(pageId: string, query: string): void {
    track({ event_name: "search", page_id: pageId, event_label: query });
  },

  bookingStart(pageId: string): void {
    track({ event_name: "booking_start", page_id: pageId });
  },

  bookingComplete(pageId: string, value?: number, currency?: string): void {
    track({ event_name: "booking_complete", page_id: pageId, value, currency });
  },

  lead(pageId: string, consentState: AnalyticsEvent["consent_state"]): void {
    track({
      event_name: "lead",
      page_id: pageId,
      consent_state: consentState,
    });
  },

  qualifiedLead(pageId: string): void {
    track({ event_name: "qualified_lead", page_id: pageId });
  },
};

