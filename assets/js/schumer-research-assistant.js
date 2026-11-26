import {mountResearchAssistant} from './research-assistant-core.js?v=master-sectors1';
mountResearchAssistant({
  engineUrl: new URL('./schumer-research-engine.js', import.meta.url).href,
  sourceUrl: '/pages/schumer-combined-contributions.html',
  datasetLabel: "POPC’s Schumer-related FEC datasets"
});
