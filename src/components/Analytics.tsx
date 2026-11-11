import Script from "next/script";
import { CookieBar } from "@/components/CookieBar";
import { MetaPixel } from "@/components/MetaPixel";
import { CONSENT_KEY, OPT_IN_REGIONS } from "@/lib/consent";

/**
 * GA4 «Rakhuno» web stream. Pages are prerendered, so the ID is baked in at build time;
 * keep a fallback so a build without NEXT_PUBLIC_* env (e.g. Docker) still tracks.
 * Ads conversions stay on the invoice send_to in src/lib/analytics.ts. Do not config AW- here:
 * that tag's GA4 destination copies Rakhuno sessions into the Jettfy property.
 */
const GA4_ID = "G-G71XV1YQJ0";
/** Not the Rakhuno stream. A stale Railway value must not override the fallback. */
const REJECTED_GA_ID = "G-PCKSHLEWQE";
const DENIED = "analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'";
const GRANTED = "analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'";

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
          gtag('consent','default',{${DENIED},region:${JSON.stringify(OPT_IN_REGIONS).replace(/"/g, "'")},wait_for_update:500});
          gtag('consent','default',{${GRANTED}});
          gtag('set','ads_data_redaction',true);
          gtag('set','url_passthrough',true);
          try{var c=localStorage.getItem('${CONSENT_KEY}');if(c==='accepted'){gtag('consent','update',{${GRANTED}});}else if(c==='rejected'){gtag('consent','update',{${DENIED}});}}catch(e){}
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
      <MetaPixel />
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
