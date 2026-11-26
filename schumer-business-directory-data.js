import {businessIdentities} from './business-identities.js?v=48';
import {schumerIdentities} from './schumer-identities.js?v=1';
import {normalize, config, occupationGroup, loadResearchRecords} from './schumer-research-data.js?v=1';

export {loadDirectoryRecords} from './schumer-research-data.js?v=1';

const personal = /^(?:NOT EMPLOYED|RETIRED|SELF[ -]?EMPLOYED|SELF|N\/?A|NONE|NULL|NOT REPORTED|INFORMATION REQUESTED(?: PER BEST EFFORTS)?|UNEMPLOYED|HOMEMAKER|HOME MAKER|STUDENT|UNKNOWN|NOT AVAILABLE|REQUESTED|NOT PROVIDED|NOT DISCLOSED|DECLINED|REFUSED)$/;

// Extract only explicit organization names from common PAC titles. Preserve the
// full reported title and extraction method on every group for inspection.
// Do not remove legal suffixes, infer parent companies, or expand acronyms.
function reportedIdentity(record) {
  const reported = normalize(record.type === 'individual' ? record.employer : record.name) || 'NOT REPORTED';
  if (record.type === 'individual' && personal.test(reported)) {
    return {name: reported, reported, method: 'Personal / unreported employer', personal: true};
  }
  if (record.type === 'individual') return {name: reported, reported, method: 'Reported employer', personal: false};
  const title = reported.replace(/\s+\([^()]*\bPAC\)$/, '');
  const match = title.match(/^(.+?)\s+(?:(?:EMPLOYEE|EMPLOYEES)\s+)?(?:POLITICAL ACTION COMMITTEE|SEPARATE SEGREGATED FUND|PAC)$/);
  if (match && match[1].length > 2) {
    return {name: match[1].replace(/^EMPLOYEES OF\s+/, ''), reported, method: 'Name extracted from PAC title', personal: false};
  }
  return {name: reported, reported, method: 'Reported organization / PAC', personal: false};
}

const identityIndex = new Map();
for (const entry of [...businessIdentities, ...schumerIdentities]) {
  const recordTypes = entry.recordTypes?.length ? entry.recordTypes : ['*'];
  for (const alias of [...entry.aliases, ...(entry.name && !entry.aliasOnly ? [entry.name] : [])]) {
    const aliasKey = normalize(alias);
    for (const recordType of recordTypes) {
      const key = recordType+'|'+aliasKey;
      if (identityIndex.has(key) && identityIndex.get(key) !== entry) throw Error('Duplicate researched alias: '+key);
      identityIndex.set(key, entry);
    }
  }
}

function researchedIdentity(recordType, key) {
  return identityIndex.get(recordType+'|'+key) || identityIndex.get('*|'+key);
}

export function identifyName(record) {
  const identity = reportedIdentity(record);
  const research = !identity.personal && (researchedIdentity(record.type, identity.reported) || researchedIdentity(record.type, identity.name));
  if (!research) return {...identity, research: null};
  return {...identity, name: research.name ? normalize(research.name) : identity.name,
    method: research.name ? 'Source-backed: '+research.scope : identity.method, research};
}

export function buildDirectory(records) {
  const groups = new Map();
  for (const record of records) {
    const identity = identifyName(record);
    const key = JSON.stringify([identity.personal, identity.name]);
    let group = groups.get(key);
    if (!group) {
      group = {key, name: identity.name, personal: identity.personal, names: new Set(), methods: new Set(), sectors: new Set(), committees: new Set(), individualDonors: new Set(), individual: 0, organization: 0, individualCount: 0, organizationCount: 0, individualMemoCount: 0, organizationMemoCount: 0, count: 0, memoCount: 0, records: [], research: identity.research};
      groups.set(key, group);
    }
    group.names.add(identity.reported);
    group.methods.add(identity.method);
    group.sectors.add(record.sector);
    group.committees.add(record.committee);
    if (record.type === 'individual') group.individualDonors.add(normalize(record.name || 'NOT REPORTED'));
    if (record.memo) {group.memoCount++;group[record.type+'MemoCount']++;}
    else {group[record.type] += record.amount;group[record.type+'Count']++;group.count++;}
    group.records.push(record);
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const executivePriorityGroups = new Set([
  'Chief executive officers',
  'Chairs / board members / trustees',
  'Other C-suite officers',
  'Vice presidents',
  'Presidents',
  'Founders / business owners',
  'Partners / principals',
  'Other executives / managing directors'
]);

export function researchPriorityReasons(group) {
  const reasons = [];
  if (group.personal) return reasons;
  if (group.research) reasons.push('Already researched');
  if (group.organizationCount > 0 || group.organizationMemoCount > 0) reasons.push('PAC / organization receipt');
  if (group.individualDonors.size >= 2) reasons.push('2+ distinct individual donors');
  const executiveRoles = [...new Set(group.records
    .filter(r => r.type === 'individual')
    .map(r => occupationGroup(r.occupation))
    .filter(role => executivePriorityGroups.has(role)))].sort();
  for (const role of executiveRoles) reasons.push('Executive donor: '+role);
  return reasons;
}

export function isResearchEligibleGroup(group) {
  return researchPriorityReasons(group).length > 0;
}

export function selectDirectory(groups, {query = '', sector = '', view = 'promoted', research = ''} = {}) {
  const q = normalize(query);
  const matchesView = g => {
    if (view === 'all') return true;
    if (view === 'personal') return g.personal;
    if (g.personal) return false;
    if (view === 'organizations') return g.organizationCount > 0 || g.organizationMemoCount > 0;
    if (view === 'employers') return g.individualCount > 0 || g.individualMemoCount > 0;
    if (view === 'names') return true;
    // Default combined research view: actual PAC/organization receipt identities
    // plus names that have been researched. A typed search can still surface any
    // preserved employer-only name without promoting all one-off employers.
    return isResearchEligibleGroup(g) || Boolean(q);
  };
  return groups.filter(g => matchesView(g)
    && (!research || (g.research?.status || 'Not reviewed') === research)
    && (!sector || g.sectors.has(sector))
    && (!q || [g.name, ...g.names, g.research?.parent || ''].some(n => normalize(n).includes(q))));
}

export function directoryCSV(groups) {
  const quote = value => {
    let s = String(value ?? '');
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const rows = [['Business / organization name', 'Reported names', 'Name basis', 'Research status', 'Identity scope', 'Parent company', 'Research note', 'Sources', 'Reviewed', 'Sectors', 'Committee keys', 'PAC / organization receipts USD', 'Individual receipts USD', 'Direct receipt records', 'Memo records (amounts excluded)']];
  for (const g of groups) rows.push([g.name, [...g.names].join('; '), [...g.methods].join('; '), g.research?.status || 'Not reviewed', g.research?.scope || '', g.research?.parent || '', g.research?.evidence || '', g.research?.sources.join('; ') || '', g.research?.reviewed || '', [...g.sectors].join('; '), [...g.committees].join('; '), (g.organization / 100).toFixed(2), (g.individual / 100).toFixed(2), g.count, g.memoCount]);
  return rows.map(r => r.map(quote).join(',')).join('\r\n');
}
