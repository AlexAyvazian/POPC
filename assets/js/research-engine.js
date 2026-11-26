import * as data from './research-data.js';
import {createResearchEngine} from './research-engine-core.js';
export const {localIntent,catalog,evaluate,loadResearchRecords,donorLookup}=createResearchEngine(data,"All eight committees");
