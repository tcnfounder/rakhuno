# Rakhuno

Простий [рахунок-фактура](https://rakhuno.com/invoice) та email-нагадування про податки для ФОП.

**Live:** [rakhuno.com](https://rakhuno.com)  
**App host:** [Railway](https://railway.com) ← GitHub `main` auto-deploy  
**Edge:** Cloudflare Worker `rakhuno-proxy` → `rakhuno-production.up.railway.app`  
**Direct Railway URL:** https://rakhuno-production.up.railway.app

## Stack

- Next.js (App Router) + Tailwind
- **Compute:** Railway (`npm run build` / `npm run start`)
- **Domain / CDN:** Cloudflare (Worker proxy `rakhuno-proxy` on `rakhuno.com` + `www`)
- Brevo for email leads
- html2canvas / jsPDF for Ukrainian PDF invoices

## Local

```bash
npm install
npm run dev
```

## Deploy (GitHub → Railway)

Repo is linked in Railway. **Push / merge to `main` → Railway builds and deploys.** No GitHub Actions required for production.

### Railway env vars

- `BREVO_API_KEY`
- `BREVO_LIST_ID` (e.g. `3`)
- `BREVO_WELCOME_TEMPLATE_ID` (default `1`) — immediate welcome
- `BREVO_DAY3_TEMPLATE_ID` (default `3`) — scheduled +3 days
- `BREVO_DAY7_TEMPLATE_ID` (default `2`) — queued; in-process Railway cron schedules within Brevo’s 3-day limit
- `CRON_SECRET` — enables hourly Day 7 drip on the Railway web service (+ protects `/api/cron/drip`)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (e.g. `G-XXXXXXXX`) — already live on Railway if set
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — Search Console meta (optional)

### Domain architecture (already live)

1. Old OpenNext Worker custom domains on `rakhuno` were removed
2. Cloudflare Worker **`rakhuno-proxy`** is attached to `rakhuno.com` + `www.rakhuno.com`
3. Proxy fetches Railway origin `rakhuno-production.up.railway.app` (rewrites redirects)
4. GA4 / SEO ship from Railway; edge stays on Cloudflare

Do **not** re-attach custom domains to the legacy `rakhuno` OpenNext Worker or traffic will go stale again.

### Optional: Cloudflare OpenNext Worker

Legacy path remains in repo (`npm run deploy`, optional Actions workflow) for previews only.

## Notes

- Not tax advice. Reminders are generic FOP schedule hints.
- Seller invoice data stays in browser `localStorage`.
- Leads fall back to log/CSV when Cloudflare KV is unavailable (Railway path).
