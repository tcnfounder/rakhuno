# Rakhuno — tax season plan (Dec 2026 – Mar 2027)

Written 2026-11-18. Data: Google Ads Keyword Planner (Ukraine, Nov 2025 – Oct 2026), GSC (90 days), DataForSEO SERP top 10 (2026-11-18), Brevo list 3.

## Why this matters

January and February are the peak months for FOP tax searches. Two deadlines drive them:

| Deadline (2027) | Who | What |
|---|---|---|
| **Wed 20 Jan** | everyone | ЄСВ for Q4 2026; groups 1–2 also ЄП + військовий збір for January |
| **Tue 9 Feb** | group 3 | declaration for Q4 2026 (40 days after the quarter) |
| **Fri 19 Feb** | group 3 | ЄП 5% + військовий збір 1% for Q4 2026 (50 days) |
| **Mon 1 Mar** | groups 1–2 | annual declaration for 2026 (60 days) |

Dates come from the rules in `src/lib/fop-tax.ts`; none falls on a weekend. Check them against the ДПС calendar before publishing.

## Demand (Ukraine, monthly searches)

| Query | Avg | Jan 2026 | Feb 2026 |
|---|---|---|---|
| фоп 3 група податки | 2 900 | **4 400** | 3 600 |
| фоп 2 група податки | 1 600 | 2 400 | 2 400 |
| податки фоп | 720 | **2 400** | 720 |
| військовий збір фоп 3 група | 1 000 | 1 900 | 1 600 |
| військовий збір фоп 2 група | 720 | 1 600 | 1 600 |
| декларація фоп 3 група | 720 | 1 600 | 1 300 |
| декларація фоп 2 група | 480 | 1 600 | **2 400** |
| річна декларація фоп 2 група | 260 | 1 000 | 1 300 |
| єсв фоп 2026 | 390 | 1 000 | 880 |
| книга обліку доходів фоп | 390 | 720 | 720 |
| декларація платника єдиного податку | 210 | 590 | 590 |
| декларація фоп 1 група | 70 | 260 | 320 |
| калькулятор податків фоп | 110 | 140 | 140 |

Leading signals for the new year: «мінімальна зарплата 2027» had **12 100** searches in Oct 2026; «ліміт фоп 2 група 2027» 390. Next January «єсв фоп 2027» and «податки фоп 2027» will replace the 2026 forms.

Top-of-page bids are low (3–24 TRY for most tax queries) compared with the invoice keywords we pay ~23 TRY per click for.

## Where we start

- Rakhuno's tax pages are invisible: `/guides/fop-3-grupa`, `/guides/podatky-fop` and `/guides/yedynyy-podatok` had **0 clicks** and 114 impressions in 90 days, average position 45–80. `/kalkulyator-podatkiv-fop` had no impressions at all.
- The SERPs are ДПС regional sites (tax.gov.ua), news (focus.ua, ukr.net, unian), accounting portals (buhplatforma, ligazakon, 7eminar, factor, taxer) and YouTube. Many top results carry 2020–2025 in the title; few are fresh.
- Brevo list 3 has **23 contacts; 13 have no `FOP_GROUP`**. Without a group, the cron sends only ЄСВ reminders, so those 13 will not hear about the 9 Feb declaration or the 1 Mar annual declaration.
- `src/lib/fop-tax.ts` is fixed to 2026 (`TAX_YEAR`, `MIN_WAGE = 8647`). From January the calculator and reminder amounts will be wrong for 2027 payments.
- The calculator's reminder signup (`tax_calc`) fires `generate_lead` but no Google Ads conversion, so a tax ad campaign would have nothing to optimise for.

**Realistic expectation:** a young domain will not reach the top 3 for «фоп 3 група податки» by February. Organic can win year-specific long tail («декларація фоп 3 група 4 квартал 2026», «єсв фоп 2027») if the pages are indexed by mid-December. Paid search covers the head terms during the peak.

## Workstreams

### A. Product and data — done by 15 Dec

1. **2027 rates.** Confirm the 2027 minimum wage and subsistence minimum from the signed Budget-2027 law (check ДПС / Rada, not news alone). Make `fop-tax.ts` year-aware: amounts for periods in 2026 keep 2026 rates, periods from 2027 use 2027 rates. Update calculator copy to 2027.
2. **Ask for the FOP group.** One December email to list 3: «Яка у вас група?» with three one-click links that set `FOP_GROUP` (new signed endpoint, same HMAC as unsubscribe). Also add the group picker to the guide forms and the post-PDF screen on `/invoice`.
3. **Season reminder sequence** on top of the daily cron: Q4 ЄСВ (17 Jan), group 3 declaration (6 Feb), group 3 payment (16 Feb), annual declaration groups 1–2 (26 Feb). Each email links to the matching guide and to `/invoice`.
4. **Ads conversion on `tax_calc` signups** (`trackAdsConversion`), as a separate conversion action so it does not mix with invoice leads.
5. **Brevo capacity.** Free plan: 300 emails/day, shared with directory.com.ua outreach. Move the outreach to its own sender before January; upgrade before ~250 contacts.

### B. Content — published by 10 Dec (4–8 weeks to index before the peak)

| # | Page | Main queries | Note |
|---|---|---|---|
| 1 | `/kalkulyator-podatkiv-fop` → «Податки ФОП 2027: 1, 2, 3 група — суми і строки» | фоп 3 група податки, фоп 2 група податки, податки фоп, єсв фоп 2027 | Pillar. Calculator on top, 2027 table, deadline calendar, reminder signup. |
| 2 | New: «Декларація ФОП 3 група за 4 квартал 2026» | декларація фоп 3 група, декларація платника єдиного податку | Deadline 9 Feb, payment 19 Feb, steps in Електронний кабінет, common mistakes, income from Rakhuno invoices. |
| 3 | New: «Річна декларація ФОП 1–2 група за 2026 рік» | декларація фоп 2 група, річна декларація фоп 2 група, декларація фоп 1 група | Deadline 1 Mar. |
| 4 | New: «Військовий збір ФОП 2027» | військовий збір фоп 3 група / 2 група | Groups 1–2 fixed 10% МЗП, group 3 1% of income; link to the pillar. |
| 5 | Rework `fop-3-grupa`, `yedynyy-podatok`, `podatky-fop` | — | Point them at pages 1–4 so they do not compete for the same queries; keep their own intent (choosing a group, payment habit, checklist). |

Every page: reminder signup with the group picker, link to the calculator, `dateModified`, FAQ schema, «не є податковою консультацією». After publishing: submit the URLs in GSC and IndexNow (`src/lib/indexnow.ts`).

Not now: «книга обліку доходів» (HIGH competition, product would need an income ledger) — revisit after the season.

### C. Paid — 5 Jan to 1 Mar

- New Search campaign «Rakhuno | Tax season | UA», separate from the invoice campaign. EXACT and PHRASE on the queries in the demand table, landing on pages 1–4.
- Conversion: tax reminder signup (step A4). Start at 100 TRY/day.
- Gates: 19 Jan — cost per signup over the first 14 days. Stop or cut after 1 Mar, the end of the demand.
- Avoid: broad match, Display, PMax (same rule as the invoice campaign).

### D. Email — December to March

- December: group question (A2) + «що змінюється для ФОП у 2027» to list 3.
- January–February: the season sequence (A3). Measure opens and clicks per email in Brevo (`rakhuno-tax-reminder` tag).

## Timeline

| By | What |
|---|---|
| 28 Nov | Outline and copy for pages 1–4; check deadlines with the ДПС calendar |
| 10 Dec | Pages 1–4 live, submitted to GSC; old guides linked |
| 15 Dec | 2027 rates in `fop-tax.ts` (once Budget-2027 is signed); group email sent; Ads conversion on `tax_calc` |
| 5 Jan | Tax-season campaign live |
| 17 Jan – 26 Feb | Season reminders go out |
| 19 Jan | First paid gate |
| 2 Mar | Season review: signups, CPL, which pages ranked; decide what stays |

## KPIs

- **Reminder signups** (`tax_reminder_signup`) per week, by page and channel. Target: 50 new contacts from tax pages and ads by 1 Mar (doubles list 3).
- **Share of list 3 with `FOP_GROUP`**: 10/23 today → 80%+ by 15 Jan.
- **Tax pages in GSC**: impressions and average position for the demand-table queries, weekly from 10 Dec.
- **Season email** opens and clicks.
- **Spillover**: invoices made by contacts who joined through tax pages (`second_invoice`, `returning_invoicer`).

## Open questions

- 2027 minimum wage and subsistence minimum: wait for the signed law, do not publish forecasts as fact.
- Any 2027 rule changes for FOP (rates, limits, ЄСВ, declarations): check before writing pages 1–4.
- Does the tax-season audience convert to invoicing users, or only to reminders? The spillover KPI answers this in March.
