"""Build the free Word/Excel blanks in public/templates that are not hand-made.

Run: python3 scripts/build-templates.py  (needs openpyxl and python-docx)

- rakhunok-na-oplatu.docx / .xlsx: the invoice blank retitled «Рахунок на оплату»
- vydatkova-nakladna.xlsx, akt-vykonanykh-robit.xlsx, akt-zvirky.xlsx: Excel versions
  of the Word blanks, with sums calculated by formulas.
"""

from pathlib import Path

import docx
import openpyxl
from openpyxl.styles import Alignment, Border, Font, Side

OUT = Path(__file__).resolve().parent.parent / "public" / "templates"
THIN = Side(style="thin", color="999999")
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
FOOT = "Шаблон: rakhuno.com — або заповніть онлайн і отримайте PDF: https://rakhuno.com/invoice"


def payment_invoice_docx() -> None:
    d = docx.Document(OUT / "blank-rakhunku-faktury.docx")
    for p in d.paragraphs:
        for run in p.runs:
            if "РАХУНОК-ФАКТУРА" in run.text:
                run.text = run.text.replace("РАХУНОК-ФАКТУРА", "РАХУНОК НА ОПЛАТУ")
    d.core_properties.title = "Рахунок на оплату — бланк ФОП"
    d.save(OUT / "rakhunok-na-oplatu.docx")


def payment_invoice_xlsx() -> None:
    wb = openpyxl.load_workbook(OUT / "blank-rakhunku-faktury.xlsx")
    ws = wb.active
    ws["A1"].value = ws["A1"].value.replace("РАХУНОК-ФАКТУРА", "РАХУНОК НА ОПЛАТУ")
    wb.properties.title = "Рахунок на оплату — бланк ФОП"
    wb.save(OUT / "rakhunok-na-oplatu.xlsx")


def setup(ws, widths):
    for col, w in widths.items():
        ws.column_dimensions[col].width = w
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth = 1
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.page_setup.fitToHeight = 0


def title(ws, cell_range, text, size=14):
    ws.merge_cells(cell_range)
    c = ws[cell_range.split(":")[0]]
    c.value = text
    c.font = Font(bold=True, size=size)
    c.alignment = Alignment(horizontal="center", wrap_text=True)


def line(ws, row, label, value="", last_col="F"):
    ws.merge_cells(f"A{row}:B{row}")
    ws.merge_cells(f"C{row}:{last_col}{row}")
    ws[f"A{row}"].value = label
    ws[f"C{row}"].value = value
    for col in "ABCDEF"[: "ABCDEF".index(last_col) + 1]:
        ws[f"{col}{row}"].border = BOX
        ws[f"{col}{row}"].font = Font(size=11)


def goods_table(ws, header_row, headers, rows):
    for i, h in enumerate(headers):
        c = ws.cell(row=header_row, column=i + 1, value=h)
        c.font = Font(bold=True)
        c.border = BOX
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    first = header_row + 1
    last = header_row + rows
    for r in range(first, last + 1):
        ws.cell(row=r, column=1, value=r - header_row)
        f = ws.cell(row=r, column=6, value=f'=IF(AND(D{r}<>"",E{r}<>""),D{r}*E{r},"")')
        f.number_format = "#,##0.00"
        ws.cell(row=r, column=5).number_format = "#,##0.00"
        for col in range(1, 7):
            ws.cell(row=r, column=col).border = BOX
            ws.cell(row=r, column=col).font = Font(size=11)
    ws.cell(row=last + 1, column=5, value="Разом:").font = Font(bold=True)
    total = ws.cell(row=last + 1, column=6, value=f"=SUM(F{first}:F{last})")
    total.font = Font(bold=True)
    total.number_format = "#,##0.00"
    return last + 1


def nakladna_xlsx() -> None:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Накладна"
    setup(ws, {"A": 5, "B": 44, "C": 8, "D": 8, "E": 15, "F": 15})
    title(ws, "A1:F1", "ВИДАТКОВА НАКЛАДНА № ____ від «___» __________ 20__ р.")
    ws["A3"].value = "Постачальник"
    ws["A3"].font = Font(bold=True)
    line(ws, 4, "ПІБ ФОП", "ФОП ")
    line(ws, 5, "РНОКПП (ІПН)")
    line(ws, 6, "IBAN", "UA")
    ws["A8"].value = "Покупець"
    ws["A8"].font = Font(bold=True)
    line(ws, 9, "Назва / ПІБ")
    line(ws, 10, "Код ЄДРПОУ / РНОКПП")
    line(ws, 11, "Договір / замовлення", "№ ____ від ________")
    line(ws, 12, "Підстава", "рахунок-фактура № ____ від ________")
    total_row = goods_table(
        ws, 14, ["№", "Товар", "Од.", "К-сть", "Ціна без ПДВ, грн", "Сума без ПДВ, грн"], 10
    )
    r = total_row + 1
    ws[f"A{r}"].value = "Без ПДВ. Сума прописом: ______________________________________________"
    ws[f"A{r + 2}"].value = "Відвантажив (Постачальник): ФОП ____________ / ____________ (підпис)"
    ws[f"A{r + 3}"].value = "Отримав (Покупець): ____________ / ____________ (підпис, ПІБ)"
    ws[f"A{r + 5}"].value = FOOT
    ws[f"A{r + 5}"].font = Font(size=8, color="777777")
    wb.properties.title = "Видаткова накладна — бланк ФОП"
    wb.save(OUT / "vydatkova-nakladna.xlsx")


def akt_xlsx() -> None:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Акт"
    setup(ws, {"A": 5, "B": 44, "C": 8, "D": 8, "E": 15, "F": 15})
    title(ws, "A1:F1", "АКТ № ____ приймання-передачі наданих послуг (виконаних робіт)")
    ws.merge_cells("A2:F2")
    ws["A2"].value = "м. ____________                                    «___» __________ 20__ р."
    ws["A2"].alignment = Alignment(horizontal="center")
    ws["A4"].value = "Виконавець"
    ws["A4"].font = Font(bold=True)
    line(ws, 5, "ПІБ ФОП", "ФОП ")
    line(ws, 6, "РНОКПП (ІПН)")
    line(ws, 7, "IBAN", "UA")
    ws["A9"].value = "Замовник"
    ws["A9"].font = Font(bold=True)
    line(ws, 10, "Назва / ПІБ")
    line(ws, 11, "Код ЄДРПОУ / РНОКПП")
    line(ws, 12, "Договір", "№ ____ від ________")
    total_row = goods_table(
        ws, 14, ["№", "Найменування послуги / роботи", "Од.", "К-сть", "Ціна, грн", "Сума, грн"], 8
    )
    r = total_row + 1
    ws[f"A{r}"].value = "Без ПДВ. Сума прописом: ______________________________________________"
    ws[f"A{r + 1}"].value = (
        "Послуги (роботи) надані в повному обсязі та в строк. Сторони претензій одна до одної не мають."
    )
    ws[f"A{r + 3}"].value = "Виконавець: ФОП ____________ / ____________ (підпис)"
    ws[f"A{r + 4}"].value = "Замовник: ____________ / ____________ (підпис, ПІБ)"
    ws[f"A{r + 6}"].value = FOOT
    ws[f"A{r + 6}"].font = Font(size=8, color="777777")
    wb.properties.title = "Акт виконаних робіт — бланк ФОП"
    wb.save(OUT / "akt-vykonanykh-robit.xlsx")


def akt_zvirky_xlsx() -> None:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Акт звірки"
    setup(ws, {"A": 13, "B": 46, "C": 15, "D": 15})
    title(ws, "A1:D1", "АКТ ЗВІРКИ ВЗАЄМНИХ РОЗРАХУНКІВ")
    ws.merge_cells("A2:D2")
    ws["A2"].value = "за період з «___» __________ 20__ р. по «___» __________ 20__ р."
    ws["A2"].alignment = Alignment(horizontal="center")
    ws.merge_cells("A3:D3")
    ws["A3"].value = "між ФОП ______________________ (РНОКПП ________) та ______________________ (ЄДРПОУ / РНОКПП ________)"
    ws["A3"].alignment = Alignment(horizontal="center", wrap_text=True)
    ws.row_dimensions[3].height = 30
    head = ["Дата", "Документ (рахунок, акт, накладна, оплата)", "Дебет, грн", "Кредит, грн"]
    for i, h in enumerate(head):
        c = ws.cell(row=5, column=i + 1, value=h)
        c.font = Font(bold=True)
        c.border = BOX
        c.alignment = Alignment(horizontal="center", wrap_text=True)
    ws.cell(row=6, column=2, value="Сальдо на початок періоду")
    first, last = 7, 18
    for r in range(6, last + 1):
        for col in range(1, 5):
            c = ws.cell(row=r, column=col)
            c.border = BOX
            if col >= 3:
                c.number_format = "#,##0.00"
        ws.cell(row=r, column=1).number_format = "DD.MM.YYYY"
    t = last + 1
    ws.cell(row=t, column=2, value="Обороти за період").font = Font(bold=True)
    ws.cell(row=t, column=3, value=f"=SUM(C{first}:C{last})").number_format = "#,##0.00"
    ws.cell(row=t, column=4, value=f"=SUM(D{first}:D{last})").number_format = "#,##0.00"
    ws.cell(row=t + 1, column=2, value="Сальдо на кінець періоду (дебет − кредит)").font = Font(bold=True)
    ws.cell(row=t + 1, column=3, value=f"=C6-D6+C{t}-D{t}").number_format = "#,##0.00"
    for r in (t, t + 1):
        for col in range(1, 5):
            ws.cell(row=r, column=col).border = BOX
    ws[f"A{t + 3}"].value = "Заборгованість на користь ______________________ становить ____________ грн."
    ws[f"A{t + 5}"].value = "Від ФОП: ____________ / ____________ (підпис)"
    ws[f"A{t + 6}"].value = "Від контрагента: ____________ / ____________ (підпис, ПІБ)"
    ws[f"A{t + 8}"].value = "Шаблон: rakhuno.com — пояснення та приклад: https://rakhuno.com/guides/akt-zvirky"
    ws[f"A{t + 8}"].font = Font(size=8, color="777777")
    wb.properties.title = "Акт звірки — бланк ФОП"
    wb.save(OUT / "akt-zvirky.xlsx")


if __name__ == "__main__":
    payment_invoice_docx()
    payment_invoice_xlsx()
    nakladna_xlsx()
    akt_xlsx()
    akt_zvirky_xlsx()
    print("templates written to", OUT)
