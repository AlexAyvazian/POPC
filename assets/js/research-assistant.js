import {mountResearchAssistant} from './research-assistant-core.js';
mountResearchAssistant({
  engineUrl: new URL('./research-engine.js', import.meta.url).href,
  sourceUrl: '/pages/combined-contributions.html',
  datasetLabel: "POPC’s FEC datasets"
});
