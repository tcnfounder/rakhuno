"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Meta Pixel «Rakhuno»: owned by the Atakan Dindar portfolio and linked to ad account 810047513628155. */
export const META_PIXEL_ID = "873287603818661";
import { CONSENT_KEY, COUNTRY_COOKIE, OPT_IN_REGIONS } from "@/lib/consent";

type Fbq = (...args: unknown[]) => void;

function getFbq(): Fbq | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { fbq?: Fbq }).fbq;
}

/**
 * Same regional rule as GA4: outside the EEA, UK and Switzerland the Pixel runs by default
 * and «Відхилити» revokes it; inside them it waits for «Прийняти». The country comes from the
 * middleware cookie; without it (unknown country) the Pixel stays revoked until consent.
 * While revoked, fbq queues events and sends nothing.
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
        try{var c=localStorage.getItem('${CONSENT_KEY}');var m=document.cookie.match(/(?:^|; )${COUNTRY_COOKIE}=([A-Z]{2})/);var cc=m?m[1]:'';var optIn=!cc||${JSON.stringify(OPT_IN_REGIONS).replace(/"/g, "'")}.indexOf(cc)!==-1;if(c==='rejected'||(c!=='accepted'&&optIn)){fbq('consent','revoke');}}catch(e){fbq('consent','revoke');}
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
