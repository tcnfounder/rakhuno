/** localStorage key written by the cookie bar: "accepted" | "rejected". */
export const CONSENT_KEY = "rakhuno_cookie_consent";

/** Country cookie set by middleware from Vercel's `x-vercel-ip-country` header. */
export const COUNTRY_COOKIE = "rk_cc";

/**
 * Opt-in regions (EEA, UK, Switzerland): analytics and ad storage stay off until «Прийняти».
 * Everywhere else, including Ukraine, they are on by default and «Відхилити» turns them off.
 */
export const OPT_IN_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "IS", "LI", "NO", "GB", "CH",
];
