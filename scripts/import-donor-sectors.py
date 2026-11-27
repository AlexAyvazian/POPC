"""Import the supplied classification workbook and six donor CSVs without changing receipt data."""
import csv
import hashlib
import json
import sys
from collections import Counter
from decimal import Decimal
from pathlib import Path
from openpyxl import load_workbook

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
workbooks = list(source.glob('*donor-sectors-researched.xlsx'))
assert len(workbooks) == 1, 'Expected the supplied classification workbook'
book = load_workbook(workbooks[0], read_only=True, data_only=True)
values = iter(book['All Donors'].values)
headers = next(values)
rows = [dict(zip(headers, row)) for row in values]
assert len(rows) == 24638
pairs = sorted({(r['Refined sector'], r['Sector group']) for r in rows})
assert len(pairs) == 63
assert len({p[1] for p in pairs}) == 17
sector_groups = dict(pairs)
assert len(sector_groups) == 63
normalized = lambda s: ' '.join(str(s or '').strip().upper().split())
cents = lambda v: int(Decimal(str(v)) * 100)
by_source = {}
for r in rows:
    by_source.setdefault(r['Source file'], []).append(r)
output = root / 'data/sectors'
output.mkdir(exist_ok=True)
source_files = []
for p in sorted(source.glob('*researched*')):
    source_files.append({'filename':p.name[3:] if p.name[:2].isdigit() else p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
for network in ['jeffries','schumer']:
    imported = []
    totals = {}
    for key in ['organizations','indirect','small']:
        basename = network+'-'+key
        matches = list(source.glob('*'+basename+'-researched.csv'))
        assert len(matches) == 1, basename
        with matches[0].open(encoding='utf-8-sig',newline='') as f:
            reader = csv.reader(f); columns = next(reader); csv_rows = list(reader)
        # The uploaded CSV has two 'Research evidence' columns. Index explicitly so neither is overwritten.
        indexes = {name:columns.index(name) for name in columns if name!='Research evidence'}
        records = {normalized(r['Donor / organization']):r for r in by_source[basename]}
        with (root/'data/downloads'/f'{basename}.csv').open(encoding='utf-8-sig',newline='') as f:
            original = list(csv.DictReader(f))
        baseline = {normalized(r['Donor / organization']):r for r in original}
        assert len(records)==len(csv_rows)==len(original), basename
        seen = set()
        for raw in csv_rows:
            name = normalized(raw[indexes['Donor / organization']]); assert name not in seen;seen.add(name)
            r = records[name]; old = baseline[name]
            assert cents(raw[indexes['Total donated (USD)']])==cents(r['Total donated (USD)'])==cents(old['Total donated (USD)']), name
            assert raw[indexes['Refined sector']]==r['Refined sector'], name
            assert raw[indexes['Sector group']]==r['Sector group'], name
            assert raw[indexes['Receipt count']]==old['Receipt count'], name
            for column in columns:
                if column.endswith('(USD)') and column!='Total donated (USD)':
                    assert cents(raw[indexes[column]])==cents(old[column]), (name,column)
            research = {}
            for field, target in [('Researched sector','sector'),('Research sector basis','basis'),('Relationship to sector','relationship'),('Ideological / philanthropic profile','profile'),('Research evidence','evidence')]:
                if r.get(field):research[target]=r[field]
            # These are the workbook's supplied sector views; no confidence or review fields are published.
            for field,target in [('Sector: first-hand view','firstHand'),('Sector: incl. household view','household')]:
                value=r.get(field) or r['Refined sector'];assert value in sector_groups
                if value!=r['Refined sector']:research[target]=value
            item=['organization' if key=='organizations' else 'individual',r['Donor / organization'],r['Refined sector'],(r.get('Sector basis') or '').replace('name-rule(strong)','name rule').replace('name-rule(weak)','name rule'),[s.strip() for s in str(r.get('Employer(s)') or '').split(';') if s.strip()]]
            if research:item.append(research)
            imported.append(item)
        assert seen==set(records)==set(baseline)
        totals[key]={'donors':len(csv_rows),'totalCents':sum(cents(r['Total donated (USD)'])for r in records.values()),'receipts':sum(int(r['Receipt count'])for r in original)}
    imported.sort(key=lambda r:(r[0],normalized(r[1])))
    payload={'schema':1,'network':network,'columns':['type','name','sector','basis','employers','research'],'rows':imported,'totals':totals}
    (output/(network+'.json')).write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':'))+'\n')
    print(json.dumps({'network':network,'rows':len(imported),'totals':totals}))
(output/'taxonomy.js').write_text('export const sectorGroups=Object.freeze('+json.dumps(sector_groups,ensure_ascii=False,indent=2)+');\nexport const masterSectors=Object.freeze(Object.keys(sectorGroups));\nexport const masterSectorGroups=Object.freeze([...new Set(Object.values(sectorGroups))]);\n')
(output/'source-manifest.json').write_text(json.dumps({'source':'User-supplied Claude classification files','rows':len(rows),'sectors':63,'groups':17,'files':source_files},ensure_ascii=False,indent=2)+'\n')
