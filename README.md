# Rakhuno

Простий [рахунок-фактура](https://rakhuno.com/invoice) та email-нагадування про податки для ФОП.

**Production:** [Railway](https://railway.com) ← GitHub `main` auto-deploy  
**Public URL (Railway):** https://rakhuno-production.up.railway.app  
**Custom domain goal:** [rakhuno.com](https://rakhuno.com) → point DNS to Railway

## Stack

- Next.js (App Router) + Tailwind
- **Host:** Railway (`npm run build` / `npm run start`)
- Brevo for email leads (KV only on optional Cloudflare path)
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
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (e.g. `G-XXXXXXXX`) — already live on Railway if set
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — Search Console meta (optional)

### Point rakhuno.com to Railway

1. Railway project → **Settings → Networking / Domains** → add `rakhuno.com` and `www.rakhuno.com`
2. Copy the DNS records Railway shows (usually CNAME → `*.up.railway.app`)
3. In Cloudflare DNS (domain registrar DNS): set those records for `@` / `www`
4. Remove **Workers custom domains** for `rakhuno.com` / `www` / `app` if they still steal traffic (Wrangler `routes` / CF dashboard)
5. Wait for DNS → open `https://rakhuno.com` — should show Railway headers / new SEO + GA4
6. Search Console → confirm sitemap `https://rakhuno.com/sitemap.xml`

### Optional: Cloudflare Workers

Legacy OpenNext path remains in repo (`npm run deploy`, optional Actions workflow). Not production while the domain is on Railway.

## Notes

- Not tax advice. Reminders are generic FOP schedule hints.
- Seller invoice data stays in browser `localStorage`.
- Leads fall back to log/CSV when Cloudflare KV is unavailable (Railway path).
