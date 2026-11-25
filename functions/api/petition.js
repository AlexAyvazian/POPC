import {extractPetitionCount, PETITION_URL} from '../lib/petition-count.js';

export async function onRequestGet() {
  try {
    const upstream = await fetch(PETITION_URL, {
      headers: {Accept: 'text/html'},
      signal: AbortSignal.timeout(12000),
      cf: {cacheTtl: 60, cacheEverything: true}
    });
    if (!upstream.ok) throw Error('Petition unavailable');
    const data = extractPetitionCount(await upstream.text());
    return Response.json({...data, checkedAt: new Date().toISOString()}, {
      headers: {'Cache-Control': 'public, max-age=60', 'X-Content-Type-Options': 'nosniff'}
    });
  } catch {
    return Response.json({error: 'Signature count temporarily unavailable'}, {
      status: 503, headers: {'Cache-Control': 'no-store'}
    });
  }
}
