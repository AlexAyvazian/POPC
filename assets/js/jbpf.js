import {renderCommittee} from './committee-tables.js?v=refined1';
renderCommittee({
  "paths": [
    "/data/jeffries/jbpf-individuals.json",
    "/data/jeffries/jbpf-organizations.json",
    "/data/jeffries/jbpf-employers.json"
  ],
  "counts": [
    78,
    60,
    47
  ],
  "totals": [
    26100000,
    437599149
  ],
  "memoLabel": "intermediary memo entries",
  "errorLabel": "Battleground Protection Fund data loading failed:"
});
