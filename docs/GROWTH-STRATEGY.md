# Rakhuno — growth & product strategy

Last updated: 2026-10-16. Baseline: **3 verified Brevo leads**, GA4 property live since 2026-09-27, Search campaign **Rakhuno Search UA — Invoice** (~100 TRY/day).

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

## Google Ads change log (2026-10-16)

Applied on campaign `24303377012` after the 16 Oct review:

- Paused exact keywords `зробити рахунок онлайн` and `створити рахунок на оплату` (CPC 89–169 TRY, 606 TRY for 1 conversion).
- Paused remaining BROAD keywords (`рахунок фактура`, `рахунок на оплату`, `рахунок онлайн`, `рахунок фактура онлайн`, `зробити рахунок онлайн`, `створити рахунок на оплату`).
- Set `target_content_network` to false. Search and partner search were already off.
- Did not add new negatives: `зразок`, `бланк`, and `приклад` are already BROAD negatives, so the top-20 sample queries are already excluded. `рахунок фактура онлайн` stays (1 conversion, unstable rank).
- Budget stays 100 TRY/day.

Code (ships with the next production deploy):

- `generate_lead` and the Ads conversion fire only after Brevo returns 201 for a new contact and the PDF succeeds. Order id is a hash of the email.
- Existing contacts (Brevo 204) no longer get another welcome or drip.
- Guide titles and early `/invoice` CTAs updated on the zrazok and blank pages.

### 2026-10-21 — SEO sprint 5

Data: GSC 664 impressions / 12 clicks since 2026-09-27 (last 7 days: 406 / 6). URL Inspection: `/guides/rahunok-faktura` is **Crawled – currently not indexed**; the same queries split across 4–6 guides.

- Hub `/guides/rahunok-faktura` retargeted to the definition intent («рахунок фактура це» 720/mo, «що таке рахунок фактура» 320/mo): definition first, comparison table with act and invoices. Every guide now links to it via `ArticleLayout`.
- `zrazok-rahunku-faktury`: new title and description. It ranks #1 for «зразок рахунку фактури» and «приклад рахунку на оплату» but had 0 clicks.
- `blank-rakhunku-faktury`: free Word/Excel blanks (`/public/templates`) for «бланк … word/excel скачати» queries (~#10). GA4 event `template_download`.
- New `/guides/akt-vykonanykh-robit` («акт виконаних робіт» 1.6k/mo, «… зразок» 720/mo) with a Word blank.
- Twitter cards follow each page's OG title.

Next: request indexing for the hub and the act page in GSC. Re-check CTR for zrazok and blank in 14 days.

### 2026-10-22 — SEO sprint 6

SE Ranking audit (16 pages, score 97%, 0 errors) found the following:
- `/invoice` had **no H1 in the server-rendered HTML**. The client renders a loading state until mount. This matters for Ads QS: «рахунок фактура» QS is 4.
- 6 titles were over 65 characters and 4 descriptions over 158.

Changes:
- `/invoice` now has an H1 in the server-rendered loading state.
- Titles are ≤65 characters and descriptions ≤155.
- Fixed `amountInWordsUk`: «гривня» is feminine, so it is now «одна/дві гривні». It used to print «Один гривня» / «Два гривні» in every invoice PDF. It also supports billions now.
- New tool `/suma-propysom` for «сума прописом» (12.1k/mo, KD 31 in SE Ranking UA).
- Akt page targets «акт наданих послуг» too (590/mo, KD 6).

Sprint 7 (same day) shipped `/guides/akt-zvirky`, `/guides/invoys-proforma` and `/guides/vydatkova-nakladna`. Each has a Word blank in `public/templates`, and they are linked from the hub, the akt page and the guides index. The guide H1 now uses `break-words`, because a long single word overflowed at 390px.

## Review cadence

| When | Action |
|------|--------|
| Weekly | Brevo count, GA4 channels, GSC performance, Ads search terms |
| Bi-weekly | Guide title/meta refresh from GSC queries |
| Monthly | Strategy phase gate — advance or hold |
