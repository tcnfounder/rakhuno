# Cloudflare setup for Rakhuno

## Already done in this repo
- OpenNext Cloudflare adapter (`@opennextjs/cloudflare`)
- `wrangler.jsonc` Worker name: `rakhuno`
- KV namespace `RAKHUNO_LEADS` id: `07624bb9d3664a0ab3131478728ff85b` (binding `LEADS`)
- `/api/leads` writes to KV in production (CSV fallback in local `next dev`)

## Deploy (after Wrangler login)
```bash
cd rakhuno
npm run deploy
```

Live URL will be: `https://rakhuno.<your-subdomain>.workers.dev`

## Attach rakhuno.com
1. Add site `rakhuno.com` in Cloudflare Dashboard (change nameservers at registrar).
2. Add to `wrangler.jsonc`:
```jsonc
"routes": [
  { "pattern": "rakhuno.com", "custom_domain": true },
  { "pattern": "www.rakhuno.com", "custom_domain": true }
]
```
3. `npm run deploy` again.

Custom domains only work when the zone's nameservers are on Cloudflare.
