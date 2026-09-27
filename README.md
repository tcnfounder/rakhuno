# Rakhuno

Простий [рахунок-фактура](https://rakhuno.com/invoice) та email-нагадування про податки для ФОП.

**Live:** [rakhuno.com](https://rakhuno.com)

## Stack

- Next.js (App Router) + Tailwind
- OpenNext → Cloudflare Workers
- KV (`LEADS`) + Brevo for email
- html2canvas / jsPDF for Ukrainian PDF invoices

## Local

```bash
npm install
npm run dev
```

## Deploy

### GitHub → Cloudflare (recommended)

1. Repo **Settings → Secrets and variables → Actions**
2. Secrets:
   - `CLOUDFLARE_API_TOKEN` — Cloudflare token with **Edit Cloudflare Workers**
   - `CLOUDFLARE_ACCOUNT_ID` — `102794b6995d415c78ed2978c4e7b241`
3. Optional **Variables** (build-time):
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
4. Push to `main` (or **Actions → Deploy to Cloudflare → Run workflow**)

Workflow: `.github/workflows/deploy.yml`

### Manual (local)

```bash
npm run deploy
```

Requires Wrangler auth and Cloudflare bindings (see `wrangler.jsonc`).

### Railway

```bash
# after linking the GitHub repo in Railway
npm run build && npm run start
```

Set env vars in Railway:

- `BREVO_API_KEY`
- `BREVO_LIST_ID` (e.g. `3`)

Optional (build-time / `NEXT_PUBLIC_*` for Cloudflare or Railway):

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — GA4 (e.g. `G-XXXXXXXX`)
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — Google Search Console meta content

Leads fall back to log/CSV when Cloudflare KV is unavailable.

## Notes

- Not tax advice. Reminders are generic FOP schedule hints.
- Seller invoice data stays in browser `localStorage`.
