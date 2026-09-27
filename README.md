# Rakhuno

Simple invoice + tax-reminder SaaS for Ukrainian FOPs.  
Domain: **https://rakhuno.com**

## Stack
- Next.js (App Router)
- Tailwind
- Client PDF via `html2canvas` + `jsPDF`
- Lead capture → `data/leads.csv` (swap to Brevo/Loops later)

## Local
```bash
cd rakhuno
npm install
npm run dev
```
Open http://localhost:3000

## Ship to rakhuno.com (Vercel — fastest)
1. Push this folder to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add domain `rakhuno.com` + `www`
4. At your registrar, set Vercel DNS records shown in the dashboard
5. Deploy

## This week (GTM)
1. Ship landing + `/invoice` email gate
2. Connect Brevo free: import `leads.csv` or webhook `/api/leads` → Brevo API
3. Load the 5 drips from `content/drip-emails-uk.md`
4. Publish 5 SEO pages (next sprint): фоп 3 група, рахунок фактура, єдиний податок…
5. Soft-share in 5 Telegram FOP groups (native edit first)
6. Skip Instagram

## Payments (when Pro is ready)
Paddle or Lemon Squeezy checkout on `/pro` — no UA company required if your MoR country is supported.

## Disclaimer
Not tax advice. Reminder-only copy in product UI.
