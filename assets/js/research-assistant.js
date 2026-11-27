import {mountResearchAssistant} from './research-assistant-core.js?v=claude1';
mountResearchAssistant({
  engineUrl: new URL('./research-engine.js?v=claude1', import.meta.url).href,
  sourceUrl: '/pages/combined-contributions.html',
  datasetLabel: "POPC’s FEC datasets"
});
