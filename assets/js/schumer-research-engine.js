import {networkData} from './donor-data.js?v=claude1';
import {createResearchEngine} from './research-engine-core.js?v=claude1';
export const {localIntent,catalog,evaluate,loadResearchRecords,donorLookup}=createResearchEngine(networkData('schumer'),'All three committees');
