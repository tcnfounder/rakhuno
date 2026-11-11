import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getWorkerEnv } from "@/lib/brevo-drip";
import { unsubscribeToken } from "@/lib/tax-reminders";

function page(title: string, text: string, status = 200) {
  const html = `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · Rakhuno</title></head>
<body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#07110e;color:#f7faf8;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;">
<div style="max-width:420px;text-align:center;"><p style="font-size:22px;font-weight:700;margin:0 0 12px;">${title}</p><p style="color:#a9b8b0;line-height:1.5;margin:0 0 20px;">${text}</p><a href="https://rakhuno.com" style="color:#c6f26d;">rakhuno.com</a></div></body></html>`;
  return new NextResponse(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" } });
}

/** One-click unsubscribe from the reminder emails: removes the contact from the leads list. */
export async function GET(req: NextRequest) {
  const env = await getWorkerEnv();
  const email = (req.nextUrl.searchParams.get("e") || "").trim().toLowerCase();
  const token = req.nextUrl.searchParams.get("t") || "";
  if (!email || !token || !env.CRON_SECRET) return page("Посилання недійсне", "Спробуйте ще раз з останнього листа.", 400);

  const expected = Buffer.from(unsubscribeToken(email, env.CRON_SECRET));
  const given = Buffer.from(token);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return page("Посилання недійсне", "Спробуйте ще раз з останнього листа.", 400);
  }

  if (env.BREVO_API_KEY && env.BREVO_LIST_ID) {
    const res = await fetch(`https://api.brevo.com/v3/contacts/lists/${Number(env.BREVO_LIST_ID)}/contacts/remove`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", "api-key": env.BREVO_API_KEY },
      body: JSON.stringify({ emails: [email] }),
    });
    // 400 "contact already removed" is fine: the visitor is unsubscribed either way.
    if (!res.ok && res.status !== 400) {
      console.error("[unsubscribe]", res.status, await res.text());
      return page("Не вдалося відписатися", "Напишіть нам на info@rakhuno.com — відпишемо вручну.", 500);
    }
  }
  return page("Ви відписалися", "Більше не надсилатимемо нагадувань про податки на цю адресу.");
}
