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

## Domain / sender durumu

| Domain | Durum | Not |
|--------|--------|-----|
| `rakhuno.com` | authenticated + verified | Cloudflare DNS hazır |
| `jettfy.com` | Brevo’da eklendi, DNS bekliyor | Cloudflare zone hazır (pending NS) |
| Sender `info@rakhuno.com` | active (id **2**) | Şablonlarda bunu kullan |
| Sender `info@jettfy.com` | active (id **1**) | jettfy auth bitene kadar yedek |

### jettfy.com’u bitirmek (tek adım — nameserver)

Cloudflare’da zone + Brevo kayıtları hazır. Registrar **Atak Domain**. NS’leri şunlara çek:

1. [atakdomain.com](https://www.atakdomain.com) → Hesabım → **Domainlerim** → `jettfy.com` → **Yönet** → **DNS Yönetimi**
2. Nameserver’ları kaydet:
   - `dave.ns.cloudflare.com`
   - `paislee.ns.cloudflare.com`
3. Yayılınca (genelde dakikalar–birkaç saat) Brevo’da **Authenticate** `jettfy.com`  
   veya haber ver; ben API ile authenticate ederim.

**Plan B (NS değiştirmeden):** Güzelhosting Zone Editor’a şunları ekle:

| Tip | Host | Değer |
|-----|------|-------|
| CNAME | `brevo1._domainkey` | `b1.jettfy-com.dkim.brevo.com` |
| CNAME | `brevo2._domainkey` | `b2.jettfy-com.dkim.brevo.com` |
| TXT | `@` | `brevo-code:d78afb7184a50cb597e1c52d4fa0ca23` |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` |
| TXT | `@` (SPF yoksa yeni) | `v=spf1 include:_spf.google.com include:spf.brevo.com ~all` |

---

## Test

1. https://rakhuno.com/invoice  
2. Email’ine fatura oluştur  
3. Inbox / Spam → **«Ваш рахунок у Rakhuno + що далі»**  
4. From satırında `via brevosend.com` olmamalı (`info@rakhuno.com` ile)
