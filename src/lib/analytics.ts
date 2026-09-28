/** GA4 event helper — no-ops when gtag is unavailable. */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === "undefined") return;
  const gtag = (
    window as unknown as {
      gtag?: (...args: unknown[]) => void;
    }
  ).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", name, params || {});
}
