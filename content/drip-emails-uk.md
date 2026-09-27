# Rakhuno — email drip (Brevo)

Sender name: **Rakhuno** (`info@jettfy.com`)
List: **Rakhuno Leads** (id `3`)
Logo: `https://rakhuno.com/brand/mark.webp`

In Brevo template header, use HTML:

```html
<a href="https://rakhuno.com" style="text-decoration:none;color:#07110e;">
  <img src="https://rakhuno.com/brand/mark.webp" width="36" height="36" alt="Rakhuno" style="border-radius:8px;vertical-align:middle;margin-right:10px;" />
  <span style="font-family:Arial,sans-serif;font-size:20px;font-weight:700;letter-spacing:-0.02em;">Rakhuno</span>
</a>
```

Accent color: `#c6f26d` on dark `#07110e`. Keep the **R** mark (lime on ink) — not a generic B/box icon.

## Mail 0 — immediate
Subject: Ваш рахунок у Rakhuno + що далі
Body:
Дякуємо. PDF уже у вас.
Rakhuno також нагадає типові строки податків для ФОП — це не консультація, лише календар.
Про: автоматичні нагадування за 3 дні до строку (скоро).

## Mail 1 — Day 3
Subject: 3 речі, які ФОП часто забуває у рахунку
- IBAN без помилок
- чіткий опис послуги
- строк оплати в примітці
CTA: https://rakhuno.com/invoice

## Mail 2 — Day 7
Subject: Коли платити єдиний податок (коротко)
Нагадування: перевірте свій календар ДПС / бухгалтера.
Rakhuno Pro надішле лист за 3 дні до типового вікна.

## Mail 3 — Monthly (1st)
Subject: Цей місяць: рахунки + податки
1) Виставте рахунки клієнтам
2) Перевірте строки ЄП / ЄСВ
3) Збережіть PDF у папку місяця
CTA: https://rakhuno.com/invoice

## Mail 4 — Tax window (-3 days)
Subject: Через 3 дні — типове вікно сплати
Це автоматичне нагадування Rakhuno. Уточніть актуальну дату у ДПС.
