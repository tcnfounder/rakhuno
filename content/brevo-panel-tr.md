# Brevo — Rakhuno drip (otomatik)

> **Panelde Automation kurmana gerek yok. Ekstra env de yok.**  
> Invoice’tan **yeni** lead gelince site:
> 1. Welcome’ı **hemen** gönderir (template id **1**)
> 2. Day 3’ü **+3 gün** Brevo `scheduledAt` ile zamanlar (template id **3**)
> 3. Day 7’yi kuyruğa alır — Railway production’da saatlik in-process cron, Brevo free limit (+3g pencere) içinde gönderir (template id **2**)

Yarım kalan Brevo Automation varsa **Activate etme** — sil / Inactive.

---

## Railway env (zaten olanlar)

- `BREVO_API_KEY` ← bu varsa Day 7 cron da açılır  
- `BREVO_LIST_ID` = `3`  
- Template id’ler opsiyonel (default 1 / 3 / 2)

`CRON_SECRET` **gerekmez** (sadece elle `/api/cron/drip` tetiklemek istersen).

Test: invoice → yeni mail →  
`"welcome":"sent"`, `"drip":{"day3":"scheduled","day7":"queued"}`
