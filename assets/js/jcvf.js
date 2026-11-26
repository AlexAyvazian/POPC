import {renderCommittee} from './committee-tables.js';
renderCommittee({
  "paths": [
    "/data/jeffries/jcvf-individuals.json",
    "/data/jeffries/jcvf-organizations.json",
    "/data/jeffries/jcvf-employers.json"
  ],
  "counts": [
    12,
    12,
    9
  ],
  "totals": [
    500000,
    11850000
  ],
  "memoLabel": "ActBlue intermediary entries",
  "errorLabel": "Clark Victory Fund data loading failed:"
});
