import fs from 'node:fs/promises';
import {buildDirectory, isResearchEligibleGroup, loadDirectoryRecords} from './business-directory-data.js';

globalThis.fetch = async path => new Response(await fs.readFile(new URL(path, import.meta.url)));

const rows = await loadDirectoryRecords();
const groups = buildDirectory(rows);
const researchEligible = groups.filter(isResearchEligibleGroup);
const excludedEmployerOnly = groups.filter(g => !g.personal && !g.research && !isResearchEligibleGroup(g));
const unreviewed = researchEligible
  .filter(g => !g.research)
  .sort((a,b) => ((b.individual+b.organization)-(a.individual+a.organization)) || (b.count-a.count) || a.name.localeCompare(b.name))
  .map(g => ({
    name: g.name,
    reportedNames: [...g.names].sort(),
    sector: [...g.sectors].sort(),
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
  researchEligibleCount: researchEligible.length,
  preservedExcludedEmployerOnlyCount: excludedEmployerOnly.length,
  unreviewed
}, null, 2));
console.log(JSON.stringify({unreviewedExported:unreviewed.length,researchEligible:researchEligible.length,preservedExcludedEmployerOnly:excludedEmployerOnly.length}));
