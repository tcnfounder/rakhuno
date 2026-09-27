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

```bash
npm run deploy
```

Requires Wrangler auth and Cloudflare bindings (see `wrangler.jsonc`).

## Notes

- Not tax advice. Reminders are generic FOP schedule hints.
- Seller invoice data stays in browser `localStorage`.
