"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Meta Pixel «Rakhuno» (Events Manager dataset). */
export const META_PIXEL_ID = "1127580029738794";
const CONSENT_KEY = "rakhuno_cookie_consent";

type Fbq = (...args: unknown[]) => void;

function getFbq(): Fbq | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { fbq?: Fbq }).fbq;
}

/**
 * Loads the Pixel with consent revoked unless the visitor already accepted cookies.
 * While revoked, fbq queues events and sends nothing; CookieBar grants on «Прийняти».
 * The init script sends the first PageView; client-side route changes send the rest.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (pathname?.startsWith("/api/")) return;
    getFbq()?.("track", "PageView");
  }, [pathname]);

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        try{if(localStorage.getItem('${CONSENT_KEY}')!=='accepted'){fbq('consent','revoke');}}catch(e){fbq('consent','revoke');}
        fbq('init','${META_PIXEL_ID}');
        if((location.pathname||'').indexOf('/api/')!==0){fbq('track','PageView');}
      `}
    </Script>
  );
}

/**
 * Meta «Lead» on the same verified moment as GA4 generate_lead and the Ads conversion.
 * eventID reuses the Ads order id so a later Conversions API event can deduplicate.
 */
export function trackMetaLead(eventId: string) {
  getFbq()?.("track", "Lead", { content_name: "invoice_pdf" }, { eventID: eventId });
}
