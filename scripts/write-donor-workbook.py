"""Build and verify the two downloadable Excel workbooks from the site's shared donor groups."""
import csv
import json
import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

from openpyxl import Workbook, load_workbook
from openpyxl.cell import WriteOnlyCell
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

CURRENCY = '"$"#,##0.00;("$"#,##0.00)'
HEADER_FONT = Font(name="SF Pro Text", size=11, bold=True, color="FF443421")
BODY_FONT = Font(name="SF Pro Text", size=11, color="FF24211D")
HEADER_FILL = PatternFill("solid", fgColor="FFF3EAD9")
ALIGN = Alignment(vertical="top")
HEADER_ALIGN = Alignment(vertical="center", wrap_text=True)
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

def cents(value):
    return int((Decimal(str(value or 0)) * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))

def add_sheet(workbook, spec):
    sheet = workbook.create_sheet(spec["name"])
    sheet.sheet_view.showGridLines = False
    sheet.freeze_panes = "B2"
    sheet.auto_filter.ref = f"A1:{get_column_letter(len(spec['headers']))}{len(spec['rows']) + 1}"
    sheet.sheet_properties.pageSetUpPr.fitToPage = True
    for col, width in enumerate(spec["widths"], 1):
        sheet.column_dimensions[get_column_letter(col)].width = width
    sheet.row_dimensions[1].height = 34
    money = set(spec["moneyColumns"])
    for index, values in enumerate([spec["headers"], *spec["rows"]]):
        if len(values) != len(spec["headers"]):
            raise ValueError(f"Invalid export row width: {spec['name']}")
        cells = []
        for col, value in enumerate(values):
            if isinstance(value, str) and len(value) > 32767:
                raise ValueError(f"Excel cell would be truncated: {spec['name']} row {index + 1}")
            cell = WriteOnlyCell(sheet, value=value)
            if isinstance(value, str):
                cell.data_type = "s"
            cell.font = HEADER_FONT if index == 0 else BODY_FONT
            cell.alignment = HEADER_ALIGN if index == 0 else ALIGN
            if index == 0:
                cell.fill = HEADER_FILL
            elif col in money:
                cell.number_format = CURRENCY
            cells.append(cell)
        sheet.append(cells)
    return sheet

def validate(path, payload, specs):
    with ZipFile(path) as archive:
        assert archive.testzip() is None
        for index in range(1, len(specs) + 1):
            root = ET.fromstring(archive.read(f"xl/worksheets/sheet{index}.xml"))
            assert root.find("s:sheetViews/s:sheetView/s:pane", NS).attrib["topLeftCell"] == "B2"
            assert root.find("s:autoFilter", NS) is not None
    book = load_workbook(path, read_only=True, data_only=False)
    assert book.sheetnames == [spec["name"] for spec in specs]
    for spec in specs:
        source = book[spec["name"]].iter_rows(values_only=True)
        assert list(next(source)) == spec["headers"]
        count = 0
        for actual, expected in zip(source, spec["rows"], strict=True):
            count += 1
            assert len(actual) == len(expected), spec["name"]
            for a, e in zip(actual, expected, strict=True):
                if isinstance(e, (int, float)):
                    assert Decimal(str(a)) == Decimal(str(e)), (spec["name"], count, a, e)
                else:
                    assert (a or "") == e, (spec["name"], count)
        assert count == len(spec["rows"]), spec["name"]
    book.close()
    for spec in payload.get("sectorSummaries", []):
        for column in [3, 4, 5]:
            assert sum(cents(r[column]) for r in spec["rows"]) == payload["totalCents"]
    assert not any("confidence" in h.lower() or "review flag" in h.lower() for spec in specs for h in spec["headers"])
    # The CSV files contain the complete donor tables, not the website's 50-row pagination.
    for table in payload["sheets"]:
        csv_path = path.parent / f"{payload['network']}-{table['key']}.csv"
        with csv_path.open(encoding="utf-8-sig", newline="") as handle:
            rows = csv.reader(handle)
            assert next(rows) == table["headers"]
            count = total = receipts = 0
            for row in rows:
                count += 1
                total += cents(row[1])
                receipts += int(row[12])
            assert (count, total, receipts) == (table["donors"], table["totalCents"], table["receiptCount"]), csv_path
    assert sum(s["totalCents"] for s in payload["sheets"]) == payload["totalCents"]
    assert len(payload["receipts"]["rows"]) == payload["receiptCount"]
    assert sum(cents(r[4]) for r in payload["receipts"]["rows"]) == payload["totalCents"]

def main():
    payload = json.loads(Path(sys.argv[1]).read_text())
    output = Path(sys.argv[2])
    summary_rows = [[s["name"], s["donors"], s["receiptCount"], s["totalCents"] / 100] for s in payload["sheets"]]
    summary_rows.append(["All three donor tables", sum(s["donors"] for s in payload["sheets"]), payload["receiptCount"], payload["totalCents"] / 100])
    summary_rows.extend([
        ["Period", "2025–2026", "", ""],
        ["Sector system", "ClaudeFiles: 63 sectors in 17 groups; donor career view", "", ""],
        ["Scope", payload["label"], "", ""],
        ["Source", "https://popc-8rk.pages.dev/pages/" + ("schumer-" if payload["network"] == "schumer" else "") + "combined-contributions.html", "", ""],
        ["Commit", payload["sourceCommit"], "", ""],
        ["Organization names", "Donor and employer names come from ClaudeFiles; original receipt details supply the transaction history.", "", ""],
        ["Individual names", "Exact reported names are consolidated before applying the $500 cutoff.", "", ""],
        ["Receipt details", "The Receipts sheet contains every direct record underlying the three donor tables. Memo amounts are excluded.", "", ""],
    ])
    summary = {"name": "Summary", "headers": ["Table / information", "Donors / value", "Receipts", "Total donated (USD)"], "rows": summary_rows, "moneyColumns": [3], "widths": [38, 100, 18, 25]}
    specs = [summary, *payload["sheets"], *payload.get("sectorSummaries", []), payload["receipts"]]
    workbook = Workbook(write_only=True)
    workbook.properties.title = payload["label"] + " — Combined Donor Tables"
    workbook.properties.creator = "People Over Power Coalition"
    workbook.properties.description = "Complete donor tables, researched employers and master sectors, per-committee amounts, and underlying direct receipts."
    for spec in specs:
        add_sheet(workbook, spec)
    workbook.save(output)
    validate(output, payload, specs)
    print(json.dumps({"network": payload["network"], "verifiedWorkbook": output.name, "worksheets": [s["name"] for s in specs], "donors": sum(s["donors"] for s in payload["sheets"]), "receipts": payload["receiptCount"], "totalCents": payload["totalCents"]}))

if __name__ == "__main__":
    main()
