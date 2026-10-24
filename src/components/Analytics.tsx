import Script from "next/script";
import { CookieBar } from "@/components/CookieBar";

/**
 * GA4 «Rakhuno» web stream. Pages are prerendered, so the ID is baked in at build time;
 * keep a fallback so a build without NEXT_PUBLIC_* env (e.g. Docker) still tracks.
 * Ads conversions stay on the invoice send_to in src/lib/analytics.ts. Do not config AW- here:
 * that tag's GA4 destination copies Rakhuno sessions into the Jettfy property.
 */
const GA4_ID = "G-G71XV1YQJ0";
/** Not the Rakhuno stream. A stale Railway value must not override the fallback. */
const REJECTED_GA_ID = "G-PCKSHLEWQE";
const CONSENT_KEY = "rakhuno_cookie_consent";

export function Analytics() {
  const fromEnv = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const gaId = fromEnv && fromEnv !== REJECTED_GA_ID ? fromEnv : GA4_ID;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
          gtag('set','ads_data_redaction',true);
          gtag('set','url_passthrough',true);
          try{if(localStorage.getItem('${CONSENT_KEY}')==='accepted'){gtag('consent','update',{analytics_storage:'granted'});}}catch(e){}
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
            gtag('config', '${gaId}', { anonymize_ip: true, send_page_view: true });
          }
        `}
      </Script>
      <CookieBar
        storageKey={CONSENT_KEY}
        lang="uk"
        accent="#1f6b4a"
        bg="#fffdf8"
        fg="#1c1915"
        muted="#5e574e"
        policyHref="/privacy"
        policyLabel="Політика конфіденційності"
      />
    </>
  );
}
