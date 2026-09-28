# Brevo — Rakhuno drip (otomatik)

> **Panelde Automation kurmana gerek yok.**  
> Invoice’tan lead gelince site kendisi:
> 1. Welcome’ı **hemen** gönderir (template id **1**)
> 2. Day 3’ü **+3 gün** zamanlar (template id **3**)
> 3. Day 7’yi **+7 gün** zamanlar (template id **2**)

Brevo → Automations’ta yarım kalan “Rakhuno Leads Onboarding” varsa **Activate etme** — Inactive bırak veya sil. Çift mail olmasın.

---

## Şablonlar (Active olmalı)

- **id 1** — Rakhuno Welcome  
- **id 3** — Day 3 tips  
- **id 2** — Day 7 vergi  

Liste: **Rakhuno Leads** (id **3**) — site contact’ı buraya ekler.

---

## Railway env

Railway → Rakhuno service → **Variables**:

- `BREVO_API_KEY` = Brevo API key  
- `BREVO_LIST_ID` = `3`  
- `BREVO_WELCOME_TEMPLATE_ID` = `1` (opsiyonel)  
- `BREVO_DAY3_TEMPLATE_ID` = `3` (opsiyonel)  
- `BREVO_DAY7_TEMPLATE_ID` = `2` (opsiyonel)

Kaydet → redeploy. Test: invoice’tan mail gönder → API cevabında  
`"welcome":"sent"` ve `"drip":{"day3":"scheduled","day7":"scheduled"}`  
(mevcut contact ise drip `skipped` — Welcome yine gider).

---

## Test

1. https://rakhuno.com/invoice  
2. **Yeni** bir email gir → PDF al  
3. Inbox → Welcome (birkaç dk)  
4. Brevo → **Transactional** → Scheduled / logs → Day 3 (+3g) ve Day 7 (+7g) görünmeli  
5. From: `info@rakhuno.com`

> Click-tracking `rakhuno.com/<uuid>` üretirse middleware `/invoice`’a yönlendirir.  
> Kalıcı: `lb.rakhuno.com` → Brevo CNAME (link branding).
