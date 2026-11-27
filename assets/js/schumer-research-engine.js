import * as data from './schumer-research-data.js?v=refined1';
import {createResearchEngine} from './research-engine-core.js?v=refined1';
export const {localIntent,catalog,evaluate,loadResearchRecords,donorLookup}=createResearchEngine(data,"All three committees");
