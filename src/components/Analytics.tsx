import Script from "next/script";

/** Google Ads (same Ads account as Jettfy — Rakhuno conversions). */
const ADS_ID = "AW-18117109986";

/** Optional GA4 — set NEXT_PUBLIC_GA_MEASUREMENT_ID (e.g. G-XXXXXXXX). */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  // Load gtag via Ads ID so conversion tracking works even without GA4.
  const primaryId = gaId || ADS_ID;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          // Skip API / asset noise (IndexNow pings, cron) so GSC/SEO reads stay clean.
          var path = (location && location.pathname) || '';
          if (path.indexOf('/api/') === 0) { /* no page_view */ }
          else {
            ${
              gaId
                ? `gtag('config', '${gaId}', {
              anonymize_ip: true,
              send_page_view: true
            });`
                : ""
            }
            gtag('config', '${ADS_ID}');
          }
        `}
      </Script>
    </>
  );
}
