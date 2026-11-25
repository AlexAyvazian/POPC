export const PETITION_URL = 'https://www.change.org/p/put-voters-over-corporate-donors';
export function extractPetitionCount(html) {
  const script = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m => /\bid=["']change-page-state["']/.test(m[1]));
  if (!script) throw Error('Petition state unavailable');
  const state = JSON.parse(script[2]);
  if (String(state.petition?.id) !== '491635572' || state.route?.params?.slug !== 'put-voters-over-corporate-donors') throw Error('Unexpected petition');
  const {displayed, goal} = state.petition.signatureCount || {};
  if (!Number.isSafeInteger(displayed) || displayed < 0 || !Number.isSafeInteger(goal) || goal <= 0) throw Error('Invalid signature count');
  return {count: displayed, goal, source: PETITION_URL};
}
