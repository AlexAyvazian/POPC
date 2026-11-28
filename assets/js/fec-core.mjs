export const normalize=s=>String(s??'').trim().replace(/\s+/g,' ').toUpperCase();
export const cents=v=>Number.isFinite(Number(v))?Math.round(Number(v)*100):0;
const flag=v=>v===true||v==='true'||v==='Y'||v==='X';
const val=v=>String(v??'');
export function nextPage(data,previous=null){
 if(!Array.isArray(data.results))throw Error('Missing FEC results');
 if(data.results.length<100)return null;
 const n=data.pagination?.last_indexes;
 if(!n||!Object.keys(n).length)throw Error('Full FEC page without keyset cursor');
 if(JSON.stringify(n)===JSON.stringify(previous))throw Error('Repeated FEC cursor');
 return n;
}
export function normalizeRow(r,dataset,committee){
 const base={committee,id:val(r.sub_id||r.transaction_id),transaction:val(r.transaction_id),image:val(r.image_number),line:val(r.line_number||r.line_number_label),form:val(r.filing_form),memo:flag(r.memoed_subtotal)||flag(r.memo_code),note:val(r.memo_text||r.memo_code_description),amendment:val(r.amendment_indicator),file:val(r.file_number)};
 if(dataset==='receipts')return {...base,name:val(r.contributor_name),amount:cents(r.contribution_receipt_amount),date:val(r.contribution_receipt_date),entity:val(r.entity_type),donorId:val(r.contributor_id),individual:r.is_individual===true||r.entity_type==='IND',employer:val(r.contributor_employer),occupation:val(r.contributor_occupation)};
 if(dataset==='disbursements')return {...base,name:val(r.recipient_name),amount:cents(r.disbursement_amount),date:val(r.disbursement_date),recipientId:val(r.recipient_committee_id),candidateId:val(r.candidate_id),candidate:val(r.candidate_name),purpose:val(r.disbursement_description)};
 return {...base,name:val(r.payee_name),amount:cents(r.expenditure_amount),date:val(r.expenditure_date||r.dissemination_date),candidateId:val(r.candidate_id),candidate:val(r.candidate_name||r.candidate?.name),party:val(r.candidate_party||r.candidate?.party),office:val(r.candidate_office||r.candidate?.office),state:val(r.candidate_office_state||r.candidate?.state),district:val(r.candidate_office_district||r.candidate?.district),election:val(r.election_type||r.election_type_full),position:val(r.support_oppose_indicator),purpose:val(r.expenditure_description),notice:dataset==='notices'};
}
export function receiptKind(r){
 const l=normalize(r.line).replace(/^F(?:3X|3P|3|5)[- ]/,'');
 if(/^11A/.test(l)||/^11B/.test(l)||/^11C/.test(l)||/^11D/.test(l)||/^5A/.test(l)||normalize(r.form)==='F5'||normalize(r.form)==='F5A')return 'contribution';
 if(/^12/.test(l))return 'transfer';
 if(/^17/.test(l))return 'other17';
 return 'other';
}
export function uniqueRows(rows){const seen=new Set();return rows.filter(r=>{if(!r.id)return true;const k=r.committee+'|'+r.id;if(seen.has(k))return false;seen.add(k);return true;});}
export function summarizeReceipts(rows,ids){
 const out={gross:0,external:0,internal:0,contributions:0,other17:0,transfers:0,other:0,memos:0,count:0};
 for(const r of uniqueRows(rows)){if(r.memo){out.memos++;continue;}out.gross+=r.amount;out.count++;const kind=receiptKind(r);out[kind==='contribution'?'contributions':kind==='transfer'?'transfers':kind]+=r.amount;if(ids.has(r.donorId)){out.internal+=r.amount;}else out.external+=r.amount;}
 return out;
}
export function candidateTotals(rows){const map=new Map();for(const r of uniqueRows(rows)){if(r.memo||r.notice||!['S','O'].includes(r.position))continue;const key=[r.candidateId||normalize(r.candidate)||'UNREPORTED',r.election,r.position].join('|');const g=map.get(key)||{candidate:r.candidate||r.candidateId||'Not reported',candidateId:r.candidateId,party:r.party,office:r.office,state:r.state,district:r.district,election:r.election,position:r.position,amount:0,count:0,committees:new Set()};g.amount+=r.amount;g.count++;g.committees.add(r.committee);map.set(key,g);}return [...map.values()].sort((a,b)=>b.amount-a.amount);}
