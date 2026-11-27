import {masterSectorForRecord} from './master-sectors.js?v=categories1';
// Amounts are integer cents. Consolidate the full page scope before filtering.
const normalize = value => String(value ?? '').trim().replace(/\s+/g, ' ').toUpperCase();
export function groupDonors(records, identifyName = null) {
  const groups = new Map();
  for (const [index, r] of records.entries()) {
    if (r.memo || !['individual', 'organization'].includes(r.type)) continue;
    if (!Number.isSafeInteger(r.amount)) throw Error('Invalid contribution amount');
    const identity=identifyName?.(r);
    const verified=identity?.research?.status==='Source-backed';
    const displayName=r.type==='organization' && verified ? identity.name : r.name;
    const name = normalize(displayName);
    const key = JSON.stringify([r.type, name || `unreported-${index}`]);
    if (!groups.has(key)) groups.set(key, {key, name:displayName || 'Not reported', reportedNames:new Set(), reportedEmployers:new Set(), businessResearch:new Map(), type:r.type, amount:0, employers:new Set(), occupations:new Set(), sectors:new Set(), committees:new Map(), records:[]});
    const g=groups.get(key);
    g.amount+=r.amount;
    g.reportedNames.add(r.name || 'Not reported');
    if(r.employer)g.reportedEmployers.add(normalize(r.employer));
    if(identity && !identity.personal){
      g.businessResearch.set(identity.reported,{...identity,name:verified?identity.name:identity.reported});
    }
    if(r.employer)g.employers.add(verified ? identity.name : normalize(r.employer));
    if(r.occupation)g.occupations.add(normalize(r.occupation));
    g.sectors.add(masterSectorForRecord(r));
    g.committees.set(r.committee,(g.committees.get(r.committee)||0)+r.amount);
    g.records.push(r);
  }
  const sorted=[...groups.values()].sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name));
  return {
    organizations:sorted.filter(g=>g.type==='organization'),
    indirect:sorted.filter(g=>g.type==='individual'&&g.amount>=50000),
    small:sorted.filter(g=>g.type==='individual'&&g.amount<50000)
  };
}
