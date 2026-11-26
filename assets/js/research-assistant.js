import {mountResearchAssistant} from './research-assistant-core.js?v=master-sectors1';
mountResearchAssistant({
  engineUrl: new URL('./research-engine.js?v=master-sectors1', import.meta.url).href,
  sourceUrl: '/pages/combined-contributions.html',
  datasetLabel: "POPC’s FEC datasets"
});
