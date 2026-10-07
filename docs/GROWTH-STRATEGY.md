# Rakhuno — growth & product strategy

Last updated: 2026-10-07. Baseline: **3 verified Brevo leads**, GA4 property live since 2026-09-27, Search campaign **Rakhuno Search UA — Invoice** (~100 TRY/day).

## North star

**Verified email leads** where a FOP completes invoice PDF unlock (`SOURCE=invoice_pdf` in Brevo, `generate_lead` in GA4). Secondary: organic impressions/clicks in GSC for guide cluster → `/invoice`.

## Current state (facts)

| Channel | Signal |
|---------|--------|
| **Product** | `/invoice` works; Brevo drip wired; 3 real contacts in list #3 |
| **Organic** | GSC ~110 impressions / 3 clicks (Sep–Oct); guides indexing |
| **Paid** | ~15% CTR; spend ~650+ TRY first week; Ads reports 3 conversions (align with GA4 key event) |
| **Attribution** | Was weak (`Unassigned` in GA4); fixed in code via UTM/gclid session capture |

## Phase 1 — Measure correctly (week 1–2)

1. GA4: mark **`generate_lead`** as primary conversion; import/link to Google Ads.
2. Weekly KPI sheet: Brevo unique `invoice_pdf`, GA4 leads by `sessionDefaultChannelGroup`, GSC clicks, Ads cost & conv.
3. Keep Brevo list clean (no smoke emails in list #3).

**Exit criteria:** Paid vs organic lead count trustworthy for 14 days.

## Phase 2 — Paid efficiency (week 2–4)

1. **Search only**, Ukraine, tool-intent keywords (exact-heavy). Template/download/utility negatives stay.
2. Do **not** raise budget until **≥10 leads** and stable CPL (~target: explore ≤150 TRY/lead at current CPC).
3. Review search terms every 3 days; add negatives for `бланк`, `шаблон`, `скач`, utilities, RU queries.
4. RSA → always `https://rakhuno.com/invoice`.

**Exit criteria:** ≥30% of new leads from paid at CPL not worse than 2× organic “cost” (organic = content time only).

## Phase 3 — Organic compounding (parallel, month 1–3)

1. **Do not** bid on queries where a guide already ranks top 20 (avoid cannibalization); use GSC query report.
2. Prioritize guides with impressions, low CTR: `blank-rakhunku-faktury`, `zrazok-rahunku-faktury`, `rahunok-faktura`.
3. IndexNow + sitemap on meaningful content changes only.
4. One new guide / month max — only if DataForSEO/GSC shows a gap (e.g. “рахунок фоп 3 група”).

**Exit criteria:** GSC ≥500 impressions/month and ≥20 clicks/month without paid help.

## Phase 4 — Retention & monetization (month 2+)

1. **Email:** welcome + day 3 + day 7 drip — measure open/click in Brevo; subject lines UA FOP taxes.
2. **Activation:** second invoice within 30 days (localStorage profile present = proxy).
3. **Monetization (later):** paid tier only after **≥100 MAU** or **≥50 monthly leads** — e.g. saved history cloud, multi-user, accountant export. Stay free for core PDF until then.

## What we explicitly avoid

- Broad match expansion, PMax, Display (burns budget on template seekers).
- Competing with Checkbox/Medoc positioning — stay “light invoice + reminders”.
- Turkish/RU landing pages — UA only.

## Google Ads change log (2026-10-07)

Applied via API on campaign `24303377012`:

- Removed negatives blocking tool intent: `pdf`, `як створити рахунок фактуру`, `як зробити`, `як виставити`, related FOP phrases.
- Added **EXACT** winners: `рахунок фактура`, `рахунок фактура онлайн`, `рахунок онлайн`, `виставити рахунок`, `рахунок на оплату`, `сформувати рахунок онлайн`, `створити рахунок фактуру`, `створити рахунок на оплату`.
- **Paused** previous PHRASE keywords (same themes) to reduce bleed.

Manual follow-up in Google UI:

- Confirm `generate_lead` / Ads conversion action match.
- Optional: remove duplicate negatives if UI shows conflicts.

## Review cadence

| When | Action |
|------|--------|
| Weekly | Brevo count, GA4 channels, GSC performance, Ads search terms |
| Bi-weekly | Guide title/meta refresh from GSC queries |
| Monthly | Strategy phase gate — advance or hold |
