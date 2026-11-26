import fs from 'node:fs/promises';
import {buildDirectory, isResearchEligibleGroup, researchPriorityReasons, loadDirectoryRecords} from '../assets/js/business-directory-data.js';

globalThis.fetch = async path => new Response(await fs.readFile(new URL('../' + String(path).replace(/^\//, ''), import.meta.url)));

const rows = await loadDirectoryRecords();
const groups = buildDirectory(rows);
const nonPersonal = groups.filter(g => !g.personal);
const unreviewed = nonPersonal
  .filter(g => !g.research)
  .sort((a,b) => ((b.individual+b.organization)-(a.individual+a.organization)) || (b.count-a.count) || a.name.localeCompare(b.name))
  .map(g => ({
    name: g.name,
    reportedNames: [...g.names].sort(),
    sector: [...g.sectors].sort(),
    priorityResearchCandidate: isResearchEligibleGroup(g),
    priorityReasons: researchPriorityReasons(g),
    distinctIndividualDonors: g.individualDonors.size,
    directAmountCents: g.individual + g.organization,
    directCount: g.count,
    memoCount: g.memoCount,
    individualAmountCents: g.individual,
    organizationAmountCents: g.organization,
    committees: [...g.committees].sort(),
    samples: g.records.slice(0,8).map(r => ({
      type: r.type,
      donorOrOrganization: r.name,
      employer: r.employer || '',
      occupation: r.occupation || '',
      committee: r.committee,
      memo: !!r.memo,
      amountCents: r.memo ? 0 : r.amount
    }))
  }));

await fs.writeFile('unreviewed-business-identities.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  count: unreviewed.length,
  priorityCount: unreviewed.filter(g => g.priorityResearchCandidate).length,
  unreviewed
}, null, 2));
const singleDonorExecutiveCandidates = unreviewed
  .filter(g => g.distinctIndividualDonors === 1 && g.priorityReasons.some(r => r.startsWith('Executive donor:')))
  .sort((a,b) => b.directAmountCents-a.directAmountCents || a.name.localeCompare(b.name))
  .slice(0,50)
  .map(g => ({
    name:g.name,
    amountCents:g.directAmountCents,
    occupations:[...new Set(g.samples.filter(s=>s.type==='individual').map(s=>s.occupation).filter(Boolean))],
    donorNames:[...new Set(g.samples.filter(s=>s.type==='individual').map(s=>s.donorOrOrganization).filter(Boolean))],
    priorityReasons:g.priorityReasons
  }));
console.log(JSON.stringify({
  unreviewedExported: unreviewed.length,
  priorityUnreviewed: unreviewed.filter(g => g.priorityResearchCandidate).length,
  singleDonorExecutivePriority: unreviewed.filter(g => g.distinctIndividualDonors === 1 && g.priorityReasons.some(r => r.startsWith('Executive donor:'))).length,
  topSingleDonorExecutiveCandidates: singleDonorExecutiveCandidates
}));
