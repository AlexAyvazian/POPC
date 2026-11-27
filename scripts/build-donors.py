"""Build the site's only donor dataset from ClaudeFiles and missing receipt details."""
import base64,csv,gzip,hashlib,json,pathlib,re,collections
from decimal import Decimal
from openpyxl import load_workbook
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCE=ROOT/'ClaudeFiles'
TABLES=('organizations','indirect','small')
def norm(s):return re.sub(r'\s+',' ',str(s or '').strip()).upper()
def pack(rows):return [len(rows),base64.b64encode(gzip.compress(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode(),mtime=0)).decode()]
def unpack(block):
    rows=json.loads(gzip.decompress(base64.b64decode(block[1])))
    assert len(rows)==block[0]
    return rows
def cents(s):return int(Decimal(str(s or 0))*100)
def urls(s):return list(dict.fromkeys(re.findall(r'https?://[^\s;]+',str(s or ''))))
def parts(s):return [v.strip() for v in str(s or '').split(';') if v.strip()]
def read_sources():
    result={};taxonomy={};workbook={}
    wb=load_workbook(SOURCE/'donor-sectors-researched.xlsx',read_only=True,data_only=True)
    iterator=wb['All Donors'].iter_rows(values_only=True);headers=next(iterator)
    for values in iterator:
        row=dict(zip(headers,values))
        if not row.get('Donor / organization'):continue
        network='schumer' if 'schumer' in str(row['Politician']).lower() else 'jeffries'
        table=next((t for t in TABLES if t in str(row['Source file']).lower()),None)
        assert table,(network,row['Source file'])
        key=(network,table,norm(row['Donor / organization']))
        assert key not in workbook,key
        workbook[key]=row
        sector=str(row['Refined sector']);group=str(row['Sector group'])
        assert sector not in taxonomy or taxonomy[sector]==group
        taxonomy[sector]=group
    for network in ('jeffries','schumer'):
        result[network]=[]
        for table in TABLES:
            p=SOURCE/f'{network}-{table}-researched.csv'
            with p.open(encoding='utf-8-sig',newline='') as f:
                reader=csv.reader(f);headers=next(reader)
                for values in reader:
                    def get(key,last=False):
                        positions=[i for i,v in enumerate(headers) if v==key]
                        return values[positions[-1] if last else positions[0]] if positions else ''
                    name=get('Donor / organization');key=(network,table,norm(name));w=workbook.pop(key)
                    assert cents(get('Total donated (USD)'))==cents(w['Total donated (USD)']),key
                    base=get('Refined sector')
                    assert base==w['Refined sector'],key
                    first=w.get('Sector: first-hand view') or base
                    household=w.get('Sector: incl. household view') or first
                    basis=re.sub(r'\bname[- ]rule\s*\((?:strong|weak)\)', 'name rule',get('Sector basis'),flags=re.I)
                    classification={'refined':base,'sector':first,'firstHand':first,'household':household,'basis':basis,'researchedSector':get('Researched sector'),'researchBasis':get('Research sector basis'),'relationship':get('Relationship to sector'),'profile':get('Ideological / philanthropic profile'),'evidence':get('Research evidence',True)}
                    d={'id':network+'|'+table+'|'+norm(name),'network':network,'table':table,'type':'organization' if table=='organizations' else 'individual','name':name,'amount':cents(get('Total donated (USD)')),'count':int(get('Receipt count')),'classification':classification,'employers':parts(get('Employer(s)')),'reportedEmployers':parts(get('Reported employer(s)')),'occupations':parts(get('Reported occupation(s)')),'reportedNames':parts(get('Reported donor name(s)')),'committeeAmounts':{h[:-6]:cents(v) for h,v in zip(headers,values) if h.endswith(' (USD)') and h!='Total donated (USD)'},'businessCells':{'parent':get('Parent / related organization'),'scope':get('Research scope'),'evidence':get('Research evidence'),'sources':get('Research sources'),'identity':get('Business identity / research status')}}
                    if table=='indirect':assert d['amount']>=50000,key
                    if table=='small':assert d['amount']<50000,key
                    result[network].append(d)
    assert not workbook,('Workbook donors missing from CSVs',list(workbook)[:5])
    for donors in result.values():
        for d in donors:
            c=d['classification']
            for s in [c['firstHand'],c['household'],c['refined']]:assert s in taxonomy,('Sector absent from supplied taxonomy',s)
            c['group']=taxonomy[c['firstHand']]
    return result,taxonomy
def build():
    donors,taxonomy=read_sources()
    supplement=json.loads((SOURCE/'receipt-details.json').read_text())
    assert supplement['schema']==1
    source_paths=sorted(SOURCE.glob('*.csv'))+[SOURCE/'donor-sectors-researched.xlsx',SOURCE/'receipt-details.json']
    sources={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in source_paths}
    version=hashlib.sha256(json.dumps(sources,sort_keys=True).encode()).hexdigest()[:16]
    runtime={'schema':1,'version':version,'sources':sources,'networks':{}}
    configs={}
    summary={}
    for network,items in donors.items():
        source=supplement['networks'][network];config=source['config'];configs[network]=config
        index={(d['type'],norm(d['name'])):d for d in items}
        assert len(index)==len(items)
        reported_index={(d['type'],norm(n)):d for d in items for n in d['reportedNames']}
        business_index={}
        # These identity relationships are sourced from the supplied CSVs first.
        for d in items:
            cells=d.pop('businessCells')
            names=[d['name']] if d['type']=='organization' else d['employers']
            for name in names:
                if not name or re.fullmatch(r'(NOT EMPLOYED|RETIRED|SELF[- ]?EMPLOYED|SELF|NOT REPORTED|NONE|N/?A|UNKNOWN)',norm(name)):continue
                name=norm(name)
                def for_name(text):
                    lines=str(text or '').splitlines()
                    chosen=[line[len(name)+1:].strip() for line in lines if norm(line).startswith(name+':')]
                    return '; '.join(chosen) or (text if len(names)==1 else '')
                data={'name':name,'scope':for_name(cells['scope']),'parent':cells['parent'] if len(names)==1 else '', 'evidence':for_name(cells['evidence']),'sources':urls(cells['sources'])}
                if any(line.strip().endswith('Source-backed') and norm(line.split(' · ')[0])==name for line in cells['identity'].splitlines()):data['status']='Source-backed'
                old=business_index.setdefault(name,{'name':name,'sources':[]})
                for k,v in data.items():
                    if k=='sources':old[k]=list(dict.fromkeys(old[k]+v))
                    elif v and not old.get(k):old[k]=v
            d['committees']={c['key']:d['committeeAmounts'].get(c['name'],0) for c in config}
            del d['committeeAmounts']
        for extra in supplement.get('identityExtras',[]):
            if network not in extra.get('networks',['jeffries','schumer']):continue
            name=norm(extra['name']);old=business_index.setdefault(name,{'name':name,'sources':[]})
            for k,v in extra.items():
                if k in ['name','networks','aliases','recordTypes','reported']:continue
                if k=='sources':old[k]=list(dict.fromkeys(old.get(k,[])+v))
                elif v and not old.get(k):old[k]=v
        fields=source['receiptFields']
        out_committees={};seen=collections.Counter();amounts=collections.Counter();committee_totals=collections.defaultdict(collections.Counter)
        receipt_total=0
        for c in config:
            out_committees[c['key']]={}
            for kind in ['direct','memo','other']:
                rows=[]
                for values in unpack(source['committees'][c['key']][kind]):
                    r=dict(zip(fields,values))
                    d=index.get((r['type'],norm(r.get('donor')))) if r.get('donor') else None
                    if kind=='direct':
                        assert d,('Unmatched source receipt',network,c['key'],r.get('name'))
                        seen[d['id']]+=1;amounts[d['id']]+=r['amount'];committee_totals[d['id']][c['key']]+=r['amount']
                        r['donor']=d['id'];receipt_total+=1
                    else:
                        matched=reported_index.get((r['type'],norm(r.get('name'))))
                        r['donor']=matched['id'] if matched else None
                    # Supplement contains no old sector label or classification rule.
                    assert 'sector' not in r
                    rows.append([r.get(f) for f in fields])
                out_committees[c['key']][kind]=pack(rows)
        for d in items:
            assert (seen[d['id']],amounts[d['id']])==(d['count'],d['amount']),('Donor receipt reconciliation',d['id'])
            assert {k:v for k,v in committee_totals[d['id']].items() if v}=={k:v for k,v in d['committees'].items() if v},('Committee allocations',d['id'])
        total=sum(d['amount'] for d in items)
        assert total==sum(c['individual']+c['organization'] for c in config)
        runtime['networks'][network]={'donors':pack(items),'businesses':pack(list(business_index.values())),'receiptFields':fields,'committees':out_committees}
        summary[network]={'donors':len(items),'directReceipts':receipt_total,'totalCents':total,'tables':{t:sum(d['table']==t for d in items) for t in TABLES}}
    payload=json.dumps(runtime,ensure_ascii=False,separators=(',',':'))+'\n'
    assert len(payload.encode())<24*1024*1024,('Runtime data exceeds file limit',len(payload.encode()))
    (ROOT/'data/donors.json').write_text(payload)
    config_js="// Generated by scripts/build-donors.py from ClaudeFiles. Do not edit.\nexport const dataVersion="+json.dumps(version)+";\nexport const networkConfig=Object.freeze("+json.dumps(configs,ensure_ascii=False,separators=(',',':'))+");\nexport const sectorGroups=Object.freeze("+json.dumps(taxonomy,ensure_ascii=False,sort_keys=True,separators=(',',':'))+");\nexport const masterSectors=Object.freeze(Object.keys(sectorGroups));\nexport const masterSectorGroups=Object.freeze([...new Set(Object.values(sectorGroups))]);\n"
    (ROOT/'assets/js/donor-config.js').write_text(config_js)
    print(json.dumps({'version':version,'runtimeBytes':len(payload.encode()),'sectors':len(taxonomy),'groups':len(set(taxonomy.values())),'networks':summary}))
if __name__=='__main__':build()
