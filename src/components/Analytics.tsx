import Script from "next/script";

/** Google Ads (same Ads account as Jettfy — Rakhuno conversions). */
const ADS_ID = "AW-18117109986";

/** Optional GA4 — set NEXT_PUBLIC_GA_MEASUREMENT_ID (e.g. G-XXXXXXXX). */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  return (
    <>
      {/* Load gtag by Ads ID so conversion verification is reliable. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          (function () {
            try {
              var keys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','gbraid','wbraid'];
              var p = new URLSearchParams(location.search);
              keys.forEach(function (k) {
                var v = p.get(k);
                if (v) sessionStorage.setItem('rakhuno_' + k, v);
              });
            } catch (e) {}
          })();
          var path = (location && location.pathname) || '';
          if (path.indexOf('/api/') === 0) { /* no page_view */ }
          else {
            gtag('config', '${ADS_ID}');
            ${gaId ? `gtag('config', '${gaId}', { anonymize_ip: true, send_page_view: true });` : ""}
          }
        `}
      </Script>
    </>
  );
}
