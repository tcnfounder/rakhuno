/** Canonical origin — apex (no www). */
export const CANONICAL_SITE_ORIGIN = "https://rakhuno.com";

/**
 * Canonical site origin. Set `NEXT_PUBLIC_SITE_URL=https://rakhuno.com` in production.
 * `www.rakhuno.com` is normalized to apex.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const base = (raw || CANONICAL_SITE_ORIGIN).replace(/\/$/, "");

  try {
    const url = new URL(base);
    if (url.hostname === "www.rakhuno.com") {
      url.hostname = "rakhuno.com";
    }
    return url.origin;
  } catch {
    return CANONICAL_SITE_ORIGIN;
  }
}

/** Absolute URL for a path (e.g. `/invoice`). */
export function siteUrl(path = "/"): string {
  const origin = getSiteUrl();
  if (path === "/" || path === "") return origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
