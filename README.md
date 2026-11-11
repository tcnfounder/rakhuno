# Rakhuno

Простий [рахунок-фактура](https://rakhuno.com/invoice) та email-нагадування про податки для ФОП.

**Live:** [rakhuno.com](https://rakhuno.com)  
**App host:** [Vercel](https://vercel.com) project `rakhuno` ← GitHub `main` auto-deploy (since 2026-10-23)

## Stack

- Next.js (App Router) + Tailwind
- **Compute:** Vercel
- Brevo for email leads and the welcome / day 3 / day 7 drip
- html2canvas / jsPDF for Ukrainian PDF invoices

## Local

```bash
npm install
npm run dev
```

## Deploy (GitHub → Vercel)

**Push / merge to `main` → Vercel builds and deploys.** Env changes need a redeploy.

### Vercel env vars (Production)

Without the first two, `/api/leads` saves nothing: the PDF still unlocks, the email goes only to the log.
Check with `curl -s https://rakhuno.com/api/health` → `"leads": true`.

- `BREVO_API_KEY` (sensitive)
- `BREVO_LIST_ID` = `3`
- `BREVO_WELCOME_TEMPLATE_ID` = `1` — immediate welcome
- `BREVO_DAY3_TEMPLATE_ID` = `3` — scheduled +3 days
- `BREVO_DAY7_TEMPLATE_ID` = `2` — sent by the daily cron
- `CRON_SECRET` (sensitive) — Vercel sends it to `/api/cron/drip` (schedule in `vercel.json`)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — optional; code falls back to the Rakhuno GA4 id
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — Search Console meta (optional)

`Dockerfile` and `railway.json` are from the Railway period (until 2026-10-23) and are not used by Vercel.

### Optional: Cloudflare OpenNext Worker

Legacy path remains in repo (`npm run deploy`, optional Actions workflow) for previews only.

## Growth / ads

See [docs/GROWTH-STRATEGY.md](docs/GROWTH-STRATEGY.md) for channel strategy, KPI cadence, and Google Ads change log.

## Notes

- Not tax advice. Reminders are generic FOP schedule hints.
- Seller invoice data stays in browser `localStorage`.
- Without Brevo env, leads are only logged (`[brevo] … lead not saved`) and GA4 gets `lead_sync_error`.
