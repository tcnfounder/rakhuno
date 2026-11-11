# Rakhuno — growth & product strategy

Last updated: 2026-11-11. Baseline: **15 Brevo leads** in list #3 (11 from 4–22 Oct, 4 on 11 Nov), revenue 0.

## Positioning

Rakhuno is the **FOP's document and tax assistant**, not "a simple invoice". The answer to bank apps that add invoicing (Monobank, Privat) and to paid suites (Checkbox, Vchasno, Dubidoc):

- no sign-up for the core PDF;
- the full chain: рахунок → акт → видаткова накладна, with the basis line filled in;
- NBU payment QR on every invoice, scannable by any Ukrainian bank app;
- 2026 tax calculator and email reminders 3 days before each deadline.

## North star

**New Brevo contacts per week**, by `LEAD_CHANNEL`, with cost per lead per paid channel. Secondary: share of users who make a **second invoice** within 30 days (`second_invoice`).

## State on 2026-11-11

| | Today | Note |
|---|---|---|
| Leads | 4 | 3× `invoice_pdf`, 1× `nakladna_pdf` (organic, guide form) |
| Google Ads (Rakhuno) | 58 impr / 5 clicks / 65.6 TRY / 1 conv | Brevo confirms ≥1 `google_ads` lead; 2 earlier leads predate attribution but match click times |
| Meta Ads | 705 impr / 21 clicks / 201.4 TRY / 0 leads | 12 link clicks → 6 landing page views; learning phase |
| Organic | 1 lead | GSC ~200–260 impressions/day |

Fixed on 10–11 Nov: Brevo env vars on Vercel (leads were lost 23 Oct – 11 Nov), regional consent, mobile cookie bar, lead attribution (`LEAD_CHANNEL`, UTM, landing, referrer on each Brevo contact), daily cron for drip and tax reminders.

One day of data is not a trend. Every decision below waits for its date and its number.

## Phase 1 — Prove channel economics (to 2026-11-25)

Target: ~2 leads/day and a CPL per channel from `LEAD_CHANNEL`.

| Date | Gate | If yes | If no |
|---|---|---|---|
| 2026-11-14 | Meta has ≥1 lead (`LEAD_CHANNEL=meta_ads`) | Keep 150 TRY/day to 18 Nov | Pause Meta, move budget to Google |
| 2026-11-16/17 | First automatic tax reminders sent | Check opens/clicks in Brevo | Fix cron before the next deadline |
| 2026-11-18 | Google CPL ≤ ~100 TRY over 7 days | Google 100 → 200 TRY/day | Hold budget, prune search terms |
| 2026-11-25 | Organic `generate_lead` ≥ 3/week | Add online fill to more guides | Rework guide CTAs |

Product work in this phase:

- Online fill (`DocQuickFill`) or a direct `/invoice` prefill on `blank-rakhunku-faktury` and `zrazok-rahunku-faktury`, the two highest-traffic invoice guides. The nakladna form already produced the first organic lead.
- Scan the NBU QR with at least two real bank apps (Mono, Privat).
- Mobile wizard step tracking on `/invoice` to find the drop-off step.

## Phase 2 — Scale what works (December)

- Budget to the channel with the lower CPL; Google up to 200–300 TRY/day if CPL holds.
- **Invoice link** (`rakhuno.com/r/…`): the client opens the invoice in the browser and pays by QR. Every sent invoice shows Rakhuno to a new FOP or business.
- One new tool or guide per month, only where DataForSEO/GSC shows a gap.
- Watch `second_invoice`: if users come back, the product holds.

## Phase 3 — Tax season and first revenue (January – February)

- Peak demand: group 3 Q4 declaration and tax by **9 Feb**, groups 1–2 annual declaration by **1 Mar**. Calculator, reminders and declaration guides ready by early January.
- Revenue test once leads reach **≥50/month**:
  1. **Bank partner referrals** (FOP account opening). Matches the audience, costs the user nothing. Try this first.
  2. **Pro tier** ~99–149 грн/month: invoice links, cloud history, several FOPs per accountant.
- Core PDF stays free.

## Risks

- Bank apps ship invoicing inside the app. Answer: the full document chain, QR for every bank, reminders, no account needed.
- Lead quality: some contacts may be one-off. Measure `second_invoice` before pricing.
- Brevo free plan: 300 emails/day. Reminder days with a growing list will hit it; upgrade before ~250 contacts.

## What we explicitly avoid

- Broad match, PMax, Display (they burn budget on template seekers).
- Raising any budget before its gate date and number.
- Turkish/RU landing pages — UA only.

## Change log

### 2026-11-11 — Lead pipeline and attribution

- Brevo `BREVO_API_KEY`, `BREVO_LIST_ID`, template ids and `CRON_SECRET` set on Vercel; `/api/health` reports `leads: true`.
- Vercel cron `0 7 * * *` → `/api/cron/drip`: day-7 drip and tax reminders.
- Each lead stores `LEAD_CHANNEL`, `UTM_*`, `LANDING_PAGE`, `REFERRER` in Brevo.
- Google Ads: geo targeting set to PRESENCE; campaign re-enabled at 100 TRY/day.
- Meta: campaign `Rakhuno | Leads | UA | Web` re-enabled at 150 TRY/day, LEAD optimization, ads A and B active.

### 2026-10-07 — Google Ads

Applied via API on campaign `24303377012`:

- Removed negatives blocking tool intent: `pdf`, `як створити рахунок фактуру`, `як зробити`, `як виставити`, related FOP phrases.
- Added **EXACT** winners: `рахунок фактура`, `рахунок фактура онлайн`, `рахунок онлайн`, `виставити рахунок`, `рахунок на оплату`, `сформувати рахунок онлайн`, `створити рахунок фактуру`, `створити рахунок на оплату`.
- **Paused** previous PHRASE keywords (same themes) to reduce bleed.

Manual follow-up in Google UI:

- Confirm `generate_lead` / Ads conversion action match.
- Optional: remove duplicate negatives if UI shows conflicts.

### 2026-10-16 — Google Ads

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

### 2026-11-08 — Online fill on template guides

Data (GA4, last 30 days): 8 `generate_lead`, all from Paid Search via `/invoice`; organic landings (guides) gave 0. Organic visitors download the Word blank (12 `template_download`) and leave. GSC: 200–260 impressions/day in November, up from 4–13 in late September.

- `DocQuickFill` on `/guides/vydatkova-nakladna`, `/guides/akt-vykonanykh-robit`, `/guides/akt-zvirky`: fill the document on the page, PDF behind the same email gate as `/invoice`. Brevo `SOURCE` = `nakladna_pdf` / `akt_pdf` / `akt-zvirky_pdf`; GA4 `generate_lead` with the same `method`. Funnel events: `doc_fill_start`, `doc_pdf_unlock`, `doc_pdf_redownload`, `doc_to_invoice`.
- Seller name and РНОКПП are shared with `/invoice` through the saved profile.
- Word blanks stay, below the form.
- CTR: new titles and descriptions for `/suma-propysom` (470 impressions, avg #8.4, 1 click; mostly «число прописом» long tail) and `/guides/zrazok-rahunku-faktury` («зразок рахунку на оплату» #4.4 with 0 clicks).

Check in 14 days: organic `generate_lead` > 0, `doc_fill_start` → `doc_pdf_unlock` rate, CTR of the two pages.

## Review cadence

| When | Action |
|------|--------|
| Daily (first two weeks) | Brevo new contacts by `LEAD_CHANNEL`, spend per channel |
| Weekly | GA4 channels, GSC performance, Ads search terms, CPL per channel |
| Bi-weekly | Guide title/meta refresh from GSC queries |
| Monthly | Phase gate: advance or hold |
