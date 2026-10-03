/** Google Ads conversion: Rakhuno — Invoice oluşturma / kayıt */
const ADS_CONVERSION_SEND_TO = "AW-18117109986/pc0jCMTom40dEOLR9L5D";

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
      currency: "TRY",
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
