# Rakhuno — Brevo drip (hazır kurulum)

Sender: **Rakhuno** `<info@jettfy.com>` (veya `info@rakhuno.com` doğrulanınca)  
List: **Rakhuno Leads** (id `3`)  
Logo: `https://rakhuno.com/brand/mark.webp`  
Accent: `#c6f26d` on `#07110e`

## Brevo’da 10 dakikalık kurulum

1. **Campaigns → Templates** — aşağıdan 3 şablon oluştur (Mail 0 / 1 / 2).
2. **Automations → Create automation**
   - Trigger: **Contact added to list** → `Rakhuno Leads` (id 3)
   - Step A: **Send email** → Template Mail 0 (hemen)
   - Step B: **Wait** → 3 days
   - Step C: **Send email** → Template Mail 1
   - Step D: **Wait** → 4 days (toplam ~7. gün)
   - Step E: **Send email** → Template Mail 2
3. Automation’ı **Active** yap.
4. Test: `rakhuno.com/invoice` → kendi mailinle fatura çıkar → 2 dk içinde Mail 0 gelmeli.

Aylık + vergi penceresi mailleri (Mail 3–4) sonra eklenir; önce 0–1–2 yeter.

---

## Ortak header (her template’e yapıştır)

```html
<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f5;padding:24px 12px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5ebe8;">
    <div style="background:#07110e;padding:20px 24px;">
      <a href="https://rakhuno.com" style="text-decoration:none;color:#f7faf8;">
        <img src="https://rakhuno.com/brand/mark.webp" width="36" height="36" alt="Rakhuno" style="border-radius:8px;vertical-align:middle;margin-right:10px;" />
        <span style="font-size:20px;font-weight:700;letter-spacing:-0.02em;vertical-align:middle;">Rakhuno</span>
      </a>
    </div>
    <div style="padding:28px 24px;color:#07110e;font-size:16px;line-height:1.55;">
      <!-- BODY -->
    </div>
    <div style="padding:16px 24px 28px;color:#5a6b63;font-size:12px;line-height:1.45;">
      Це не податкова консультація. Уточнюйте строки в ДПС / у бухгалтера.
      <br /><a href="https://rakhuno.com" style="color:#3d5a40;">rakhuno.com</a>
    </div>
  </div>
</div>
```

CTA button style:

```html
<a href="https://rakhuno.com/invoice" style="display:inline-block;background:#c6f26d;color:#07110e;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;margin-top:8px;">
  Відкрити рахунок
</a>
```

---

## Mail 0 — immediate (list’e eklenince)

**Subject:** Ваш рахунок у Rakhuno + що далі

**Body (BODY yerine):**

```html
<p style="margin:0 0 14px;">Дякуємо. <strong>PDF завантажується у вашому браузері</strong> (папка «Завантаження») — у цьому листі вкладення немає.</p>
<p style="margin:0 0 14px;">Rakhuno також нагадує <strong>типові строки податків для ФОП</strong> — це не консультація, лише календар у inbox.</p>
<p style="margin:0 0 18px;">Кнопка нижче знову відкриває конструктор рахунку на сайті (не скачує PDF повторно).</p>
<a href="https://rakhuno.com/invoice" style="display:inline-block;background:#c6f26d;color:#07110e;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;">Відкрити конструктор рахунку</a>
```

---

## Mail 1 — Day 3

**Subject:** 3 речі, які ФОП часто забуває у рахунку

**Body:**

```html
<p style="margin:0 0 14px;">Швидкий чекліст перед наступним PDF:</p>
<ol style="margin:0 0 18px;padding-left:20px;">
  <li style="margin-bottom:8px;"><strong>IBAN без помилок</strong> — краще з виписки банку.</li>
  <li style="margin-bottom:8px;"><strong>Чіткий опис послуги</strong> — не просто «послуги».</li>
  <li style="margin-bottom:8px;"><strong>Строк оплати в примітці</strong> — наприклад, 5 банківських днів.</li>
</ol>
<a href="https://rakhuno.com/invoice" style="display:inline-block;background:#c6f26d;color:#07110e;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;">Відкрити рахунок</a>
<p style="margin:18px 0 0;"><a href="https://rakhuno.com/guides/rahunok-faktura" style="color:#3d5a40;">Гід: рахунок-фактура для ФОП →</a></p>
```

---

## Mail 2 — Day 7

**Subject:** Коли платити єдиний податок (коротко)

**Body:**

```html
<p style="margin:0 0 14px;">Головний біль не формула — <strong>дедлайн</strong>.</p>
<p style="margin:0 0 14px;">Поставте нагадування за 3 дні до типового вікна ЄП / ЄСВ і звірте дату з календарем ДПС або бухгалтером.</p>
<p style="margin:0 0 18px;">Rakhuno нагадує в inbox. Суми ми не рахуємо — лише стукаємо вчасно.</p>
<a href="https://rakhuno.com/guides/yedynyy-podatok" style="display:inline-block;background:#c6f26d;color:#07110e;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;">Читати: єдиний податок</a>
<p style="margin:18px 0 0;"><a href="https://rakhuno.com/invoice" style="color:#3d5a40;">Або одразу виставити рахунок →</a></p>
```

---

## Mail 3 — Monthly (1st) — sonra

**Subject:** Цей місяць: рахунки + податки

1. Виставте рахунки клієнтам  
2. Перевірте строки ЄП / ЄСВ  
3. Збережіть PDF у папку місяця  

CTA: https://rakhuno.com/invoice

---

## Mail 4 — Tax window (−3 days) — Pro / sonra

**Subject:** Через 3 дні — типове вікно сплати  

Автонагадування. Актуальну дату уточніть у ДПС.
