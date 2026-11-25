import fs from 'node:fs/promises';
import {buildDirectory, loadDirectoryRecords} from './business-directory-data.js';

globalThis.fetch = async path => new Response(await fs.readFile(new URL(path, import.meta.url)));

const rows = await loadDirectoryRecords();
const groups = buildDirectory(rows);
const unreviewed = groups
  .filter(g => !g.personal && !g.research)
  .sort((a,b) => (b.amount-a.amount) || (b.count-a.count) || a.name.localeCompare(b.name))
  .map(g => ({
    name: g.name,
    reportedNames: [...g.names].sort(),
    sector: g.sector,
    directAmountCents: g.amount,
    directCount: g.count,
    memoCount: g.memoCount,
    individualAmountCents: g.individual,
    organizationAmountCents: g.organization,
    committees: [...g.committees].sort()
  }));

await fs.writeFile('unreviewed-business-identities.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  count: unreviewed.length,
  unreviewed
}, null, 2));
console.log(JSON.stringify({unreviewedExported:unreviewed.length}));
