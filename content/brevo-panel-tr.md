# Brevo — Rakhuno drip (otomatik)

> **Panelde Automation kurmana gerek yok.**  
> Invoice’tan **yeni** lead gelince site:
> 1. Welcome’ı **hemen** gönderir (template id **1**)
> 2. Day 3’ü **+3 gün** Brevo `scheduledAt` ile zamanlar (template id **3**)
> 3. Day 7’yi kuyruğa alır (`DRIP_DAY7=pending`) — free planda transactional schedule **max 3 gün**; Railway process saatlik cron ile +4. günden itibaren Day 7’yi zamanlar/gönderir (template id **2**)

Brevo → Automations’ta yarım kalan workflow varsa **Activate etme** — sil veya Inactive bırak.

---

## Şablonlar (Active)

- **id 1** — Rakhuno Welcome  
- **id 3** — Day 3 tips  
- **id 2** — Day 7 vergi  

Liste: **Rakhuno Leads** (id **3**)

---

## Railway env

- `BREVO_API_KEY`  
- `BREVO_LIST_ID` = `3`  
- `BREVO_WELCOME_TEMPLATE_ID` = `1` (opsiyonel)  
- `BREVO_DAY3_TEMPLATE_ID` = `3` (opsiyonel)  
- `BREVO_DAY7_TEMPLATE_ID` = `2` (opsiyonel)  
- `CRON_SECRET` = uzun rastgele string → koyunca **Railway’deki app kendi içinde** saatlik Day 7 cron’u başlatır (GitHub Actions yok)

Manuel tetik (opsiyonel):

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://rakhuno.com/api/cron/drip
```

Test: invoice → yeni mail →  
`"welcome":"sent"`, `"drip":{"day3":"scheduled","day7":"queued"}`

---

## Test

1. https://rakhuno.com/invoice — **yeni** email  
2. Welcome inbox’ta  
3. Brevo Transactional → Day 3 scheduled  
4. Contact attributes: `DRIP_DAY7=pending`, `DRIP_DAY7_DUE` ≈ +7g  
5. Deploy sonrası Railway log: `[drip-cron] started` → saatlik `[drip-cron] {...}`
