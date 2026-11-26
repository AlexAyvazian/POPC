import * as data from './research-data.js?v=master-sectors1';
import {createResearchEngine} from './research-engine-core.js?v=master-sectors1';
export const {localIntent,catalog,evaluate,loadResearchRecords,donorLookup}=createResearchEngine(data,"All eight committees");
