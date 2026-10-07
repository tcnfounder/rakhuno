/** Google Ads conversion: Rakhuno — Invoice oluşturma / kayıt */
const ADS_CONVERSION_SEND_TO = "AW-18117109986/pc0jCMTom40dEOLR9L5D";

const CAMPAIGN_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
] as const;

/** Persist first-touch campaign params for the session (fixes GA4 Unassigned on /invoice). */
export function captureCampaignParams() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of CAMPAIGN_PARAM_KEYS) {
      const value = params.get(key)?.trim();
      if (value) sessionStorage.setItem(`rakhuno_${key}`, value);
    }
  } catch {
    /* private mode / blocked storage */
  }
}

/** Campaign params captured on landing (for lead events). */
export function getCampaignParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  try {
    for (const key of CAMPAIGN_PARAM_KEYS) {
      const value = sessionStorage.getItem(`rakhuno_${key}`);
      if (value) out[key] = value;
    }
  } catch {
    return out;
  }
  return out;
}

function getGtag(): ((...args: unknown[]) => void) | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window as unknown as {
      gtag?: (...args: unknown[]) => void;
    }
  ).gtag;
}

/** GA4 event helper — no-ops when gtag is unavailable. */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  const gtag = getGtag();
  if (typeof gtag !== "function") return;
  gtag("event", name, params || {});
}

/** Fire Google Ads signup/invoice conversion; retry briefly if gtag is still loading. */
export function trackAdsConversion() {
  if (typeof window === "undefined") return;

  const fire = () => {
    const gtag = getGtag();
    if (typeof gtag !== "function") return false;
    // Keep payload minimal + explicit send_to so Ads verification matches the action.
    gtag("event", "conversion", {
      send_to: ADS_CONVERSION_SEND_TO,
      value: 1.0,
      currency: "UAH",
      transaction_id: `rakhuno_${Date.now()}`,
    });
    return true;
  };

  if (fire()) return;

  let attempts = 0;
  const maxAttempts = 40; // ~20s
  const timer = window.setInterval(() => {
    attempts += 1;
    if (fire() || attempts >= maxAttempts) {
      window.clearInterval(timer);
    }
  }, 500);
}
