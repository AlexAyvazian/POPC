import * as data from './schumer-research-data.js';
import {createResearchEngine} from './research-engine-core.js';
export const {localIntent,catalog,evaluate,loadResearchRecords,donorLookup}=createResearchEngine(data,"All three committees");
