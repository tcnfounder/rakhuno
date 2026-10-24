/** Google Ads conversion: Rakhuno — Invoice oluşturma / kayıt */
const ADS_CONVERSION_ID = "18117109986";
const ADS_CONVERSION_LABEL = "pc0jCMTom40dEOLR9L5D";

/**
 * Image pixel, not gtag send_to. Loading AW-18117109986 also configures the
 * Jettfy GA4 destination and copies Rakhuno sessions into that property.
 */
function adsConversionPixelUrl(transactionId: string): string {
  const params = new URLSearchParams({
    label: ADS_CONVERSION_LABEL,
    guid: "ON",
    script: "0",
    value: "1.0",
    currency_code: "UAH",
    oid: transactionId,
  });
  try {
    const gclid = sessionStorage.getItem("rakhuno_gclid");
    if (gclid) params.set("gclid", gclid);
  } catch {
    /* private mode / blocked storage */
  }
  return "https://www.googleadservices.com/pagead/conversion/" + ADS_CONVERSION_ID + "/?" + params.toString();
}


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

/** Stable Ads order id so the same email cannot count twice. */
export async function leadTransactionId(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`rakhuno:${normalized}`),
  );
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

/** Fire the Ads conversion without initializing the AW gtag destination. */
export async function trackAdsConversion(email: string) {
  if (typeof window === "undefined") return;
  const transactionId = await leadTransactionId(email);
  const url = adsConversionPixelUrl(transactionId);
  const img = new Image(1, 1);
  img.alt = "";
  img.src = url;
  const bucket = window as unknown as { __rakhunoConv?: HTMLImageElement[] };
  bucket.__rakhunoConv = bucket.__rakhunoConv || [];
  bucket.__rakhunoConv.push(img);
}
