import * as data from './schumer-research-data.js?v=categories1';
import {createResearchEngine} from './research-engine-core.js?v=categories1';
export const {localIntent,catalog,evaluate,loadResearchRecords,donorLookup}=createResearchEngine(data,"All three committees");
