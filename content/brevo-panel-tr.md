# Brevo panel — sadece Day 3 + Day 7 (Türkçe, tıkla-tıkla)

> **Mail 0 (hoş geldin)** artık siteden otomatik gidiyor. Panele dokunmana gerek yok.  
> Aşağıdakiler sadece **3. gün** ve **7. gün** mailleri için.

Şablonlar hesabında hazır:
- **id 1** — Rakhuno Welcome (otomatik)
- **id 3** — Day 3 tips
- **id 2** — Day 7 vergi

Liste: **Rakhuno Leads** (id **3**) — 16 kişi var.

---

## Adım adım (Automation)

1. [app.brevo.com](https://app.brevo.com) aç → sol menü **Automations**
2. **Create an automation** (veya Create workflow)
3. Mümkünse hazır şablon: **“Welcome / Contact added to a list”**  
   Yoksa: **Custom automation** → boş akış
4. **Trigger (tetikleyici):**
   - Tip: **A contact is added to a list**
   - List: **Rakhuno Leads**
5. İlk adım: **Wait** → **3 days**
6. Sonraki: **Send an email**
   - Template: **Rakhuno Day 3 — рахунок tips**
7. Sonra yine **Wait** → **4 days**
8. Sonra **Send an email**
   - Template: **Rakhuno Day 7 — єдиний податок**
9. Sağ üstten **Active / Activate**

Bitince: invoice sayfasından kendi mailinle fatura çıkar →  
- birkaç dakika içinde Welcome gelmeli  
- 3 gün sonra Day 3 (automation)

---

## Railway env (zaten olmalı)

- `BREVO_API_KEY` = API key  
- `BREVO_LIST_ID` = `3`  
- `BREVO_WELCOME_TEMPLATE_ID` = `1` (opsiyonel; default 1)

---

## Test

1. https://rakhuno.com/invoice  
2. Email’ine fatura oluştur  
3. Inbox / Spam → **«Ваш рахунок у Rakhuno + що далі»**
