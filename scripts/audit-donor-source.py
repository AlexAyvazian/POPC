import csv,json,pathlib,collections,hashlib
from decimal import Decimal
from openpyxl import load_workbook
root=pathlib.Path('.')
legacy=json.load(open('/tmp/popc-legacy.json'))
claude_text='\n'.join(p.read_text(encoding='utf-8-sig') for p in (root/'ClaudeFiles').glob('*.csv'))
report={'sources':{},'networks':{},'unique_information':{}}
for network,obj in legacy['networks'].items():
    donor_index={}
    counts={}
    for table in ['organizations','indirect','small']:
        p=root/'ClaudeFiles'/f'{network}-{table}-researched.csv'
        with p.open(encoding='utf-8-sig',newline='') as f:
            reader=csv.reader(f); headers=next(reader); rows=list(reader)
        report['sources'][p.name]={'rows':len(rows),'headers':headers,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
        def value(row,key):return row[headers.index(key)]
        for row in rows:
            k=(table,value(row,'Donor / organization').strip().upper())
            assert k not in donor_index,k
            donor_index[k]=(row,headers)
        counts[table]=len(rows)
    assert len(donor_index)==len(obj['donors']),(network,'donor count')
    checked=0
    for d in obj['donors']:
        key=(d['table'],d['name'].strip().upper())
        assert key in donor_index,('missing donor',network,key)
        row,headers=donor_index[key]
        get=lambda key:row[headers.index(key)]
        assert int(Decimal(get('Total donated (USD)'))*100)==d['amount'],('amount',network,key)
        assert int(get('Receipt count'))==d['count'],('receipts',network,key)
        for c in obj['config']:
            h=c['name']+' (USD)'
            assert int(Decimal(get(h) or '0')*100)==d['committees'].get(c['key'],0),('committee',network,key,h)
        checked+=1
    records=obj['records']
    report['networks'][network]={'donor_rows_matched':checked,'tables':counts,'direct_receipts':sum(not r.get('memo') and r['category']!='other' for r in records),'memo_receipts':sum(bool(r.get('memo')) for r in records),'other_receipts':sum(r['category']=='other' for r in records),'direct_total_cents':sum(r['amount'] for r in records if not r.get('memo') and r['category']!='other'),'receipt_fields_not_in_Claude':sorted({k for r in records for k,v in r.items() if v and k in ['image','filing','transaction','line','receiptType','contributorId','backReference','conduit','subId','receiptDescription','note','form','entity']})}
wb=load_workbook(root/'ClaudeFiles/donor-sectors-researched.xlsx',read_only=True,data_only=True)
report['workbook_sheets']={s.title:{'rows':s.max_row,'columns':s.max_column} for s in wb}
sheet=wb['All Donors'];iterator=sheet.iter_rows(values_only=True);headers=next(iterator);report['workbook_headers']=headers
report['workbook_donor_rows']=sum(1 for row in iterator if row[2])
assert report['workbook_donor_rows']==sum(x['donor_rows_matched'] for x in report['networks'].values())
missing=collections.Counter()
for entry in legacy['identities']:
    for key in ['name','parent','scope','evidence']:
        if entry.get(key) and entry[key] not in claude_text:missing[key]+=1
    missing['source_links']+=sum(s not in claude_text for s in entry.get('sources',[]))
report['unique_information']['identity_fields_absent_from_Claude']=dict(missing)
raw={}
for p in sorted((root/'documents/spreadsheets').glob('*')):
    if p.suffix.lower()=='.csv':
        with p.open(encoding='utf-8-sig',newline='') as f:
            reader=csv.reader(f);header=next(reader,[]);count=0;populated=set();sample=[]
            for row in reader:
                count+=1
                for i,v in enumerate(row):
                    if v.strip() and i<len(header):populated.add(header[i])
            raw[p.name]={'rows':count,'headers':header,'populated_fields':sorted(populated)}
    elif p.suffix.lower()=='.xlsx':
        b=load_workbook(p,read_only=True,data_only=True)
        raw[p.name]={'sheets':{s.title:{'rows':s.max_row,'columns':s.max_column,'first_rows':[[str(v)[:100] for v in row] for row in s.iter_rows(max_row=3,values_only=True)]} for s in b}}
report['unique_information']['raw_exports']=raw
(root/'documents/notes/DONOR-SOURCE-AUDIT.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(report,ensure_ascii=False))
