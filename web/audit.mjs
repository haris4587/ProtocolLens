import {canonical,sha256,validURL,verifyBundle} from './core.mjs';
const categories=['primary_outcome','planned_analyses','population','sample_size'];
const findings=['MATCH','EXPLAINED','UNEXPLAINED','UNCLEAR'];
const encode=s=>new TextEncoder().encode(s);
export function locateQuote(text,quote){
  if(!quote)return {status:'NOT_SUPPLIED',occurrences:[]};
  const occurrences=[];
  for(let start=text.indexOf(quote);start!==-1;start=text.indexOf(quote,start+1)){
    const end=start+quote.length;
    occurrences.push({start_byte:encode(text.slice(0,start)).length,end_byte_exclusive:encode(text.slice(0,end)).length,start_line:text.slice(0,start).split('\n').length,end_line:text.slice(0,end-1).split('\n').length});
  }
  return {status:occurrences.length?'FOUND':'MISSING',occurrences};
}
async function authenticate(manifest,input){
  if(!manifest||!validURL(manifest.url)||!Number.isInteger(manifest.bytes)||manifest.bytes<30||manifest.bytes>50000||!(/^[a-f0-9]{64}$/).test(manifest.sha256))throw Error('Invalid source manifest');
  const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
  if(bytes.byteLength!==manifest.bytes||await sha256(bytes)!==manifest.sha256)throw Error('Source bytes differ from committed manifest: '+manifest.url);
  return new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
}
export async function auditRecord(record,sources){
  await verifyBundle(record);
  if(record.policy!=='protocollens-1'||!Array.isArray(record.history)||record.history.length>3)throw Error('Unsupported policy or history');
  const texts={};
  for(const key of ['registration','study'])texts[key]=await authenticate(record[key],sources[key]);
  const attempts=record.history.map((entry,index)=>{
    if(entry.attempt!==index+1)throw Error('Non-sequential attempt');
    const report=entry.report;
    if(!Array.isArray(report?.checks))throw Error('Invalid report checks');
    if(report.checks.length===0){
      if(report.outcome!=='INCONCLUSIVE'||!['EVIDENCE_UNAVAILABLE_OR_MISMATCH','MODEL_OUTPUT_INVALID'].includes(report.reason))throw Error('Invalid empty report');
      return {attempt:entry.attempt,decision_hash:entry.decision_hash,outcome:report.outcome,reason:report.reason,checks:[]};
    }
    if(report.reason!=='SEMANTIC_REVIEW'||report.checks.length!==4)throw Error('Invalid semantic report');
    const checks=report.checks.map((c,i)=>{
      if(c.category!==categories[i]||!findings.includes(c.finding)||typeof c.explanation!=='string'||c.explanation.trim().length<10||c.explanation.length>1200)throw Error('Invalid category, finding or explanation');
      const quotes={};
      for(const key of ['registration','study']){
        const quote=c[key+'_quote'];
        if(typeof quote!=='string'||quote.length>1400)throw Error('Invalid excerpt');
        if(!quote&&((key==='registration'&&c.finding!=='UNCLEAR')||(key==='study'&&['MATCH','EXPLAINED'].includes(c.finding))))throw Error('Required excerpt missing');
        quotes[key]={quote,...locateQuote(texts[key],quote)};
        if(quotes[key].status==='MISSING')throw Error('Excerpt absent from authenticated '+key+' source');
      }
      return {category:c.category,finding:c.finding,explanation:c.explanation,quotes};
    });
    const fs=checks.map(c=>c.finding),expected=fs.includes('UNCLEAR')?'INCONCLUSIVE':fs.includes('UNEXPLAINED')?'DEVIATIONS':fs.includes('EXPLAINED')?'EXPLAINED_CHANGES':'ALIGNED';
    if(report.outcome!==expected)throw Error('Outcome contradicts deterministic aggregation');
    return {attempt:entry.attempt,decision_hash:entry.decision_hash,outcome:expected,reason:report.reason,checks};
  });
  const payload={schema:'protocollens.evidence-audit.v1',record_id:record.id,commitment:record.commitment,source_manifests:{registration:record.registration,study:record.study},checks_passed:['commitment','history_hashes','attempt_sequence','source_bytes','utf8','excerpt_membership','outcome_aggregation'],attempts};
  return {...payload,audit_sha256:await sha256(encode(canonical(payload)))};
}
export async function fetchSources(record,fetcher=fetch){
  const entries=await Promise.all(['registration','study'].map(async key=>{
    if(!validURL(record[key]?.url))throw Error('Invalid pinned source URL');
    const response=await fetcher(record[key].url,{redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw Error('Source unavailable: '+response.status);
    // Read at most the contract limit, including when Content-Length is absent.
    const reader=response.body.getReader(),parts=[];let length=0;
    try{for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>50000)throw Error('Source exceeds 50,000 bytes');parts.push(value);}}finally{await reader.cancel();}
    const bytes=new Uint8Array(length);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
    return [key,bytes];
  }));return Object.fromEntries(entries);
}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function auditHTML(audit,provenance='UNANCHORED_IMPORT'){
  return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>ProtocolLens evidence audit</title><style>body{font:16px system-ui;max-width:1000px;margin:40px auto;padding:20px;color:#15253c}section{border:1px solid #aab8cc;padding:20px;margin:20px 0}pre,code{overflow-wrap:anywhere;white-space:pre-wrap}blockquote{border-left:3px solid #2458dd;padding-left:15px}small{color:#425570}@media print{section{break-inside:avoid}}</style><h1>ProtocolLens evidence audit</h1><p>Record '+escape(audit.record_id)+' · '+escape(provenance)+'</p><p>Checks passed: '+escape(audit.checks_passed.join(', '))+'. This verifies integrity and excerpt locations; it does not independently certify scientific validity, model reasoning or official source authenticity. An imported receipt needs a live RPC check to establish on-chain provenance.</p><p>Commitment: <code>'+escape(audit.commitment)+'</code><br>Audit SHA-256: <code>'+escape(audit.audit_sha256)+'</code></p>'+Object.entries(audit.source_manifests).map(([k,d])=>'<p>'+escape(k)+': <a href="'+escape(d.url)+'">Pinned source</a> · '+d.bytes+' bytes · <code>'+escape(d.sha256)+'</code></p>').join('')+audit.attempts.map(a=>'<h2>Attempt '+a.attempt+' · '+escape(a.outcome)+'</h2><p>'+escape(a.reason)+'</p>'+a.checks.map(c=>'<section><h3>'+escape(c.category)+' / '+escape(c.finding)+'</h3><p>'+escape(c.explanation)+'</p>'+Object.entries(c.quotes).map(([k,q])=>'<h4>'+escape(k)+'</h4><blockquote>'+escape(q.quote||'No excerpt supplied. This is not proof of an omission.')+'</blockquote><small>'+escape(q.status)+' '+q.occurrences.map(p=>'lines '+p.start_line+'–'+p.end_line+', UTF-8 bytes ['+p.start_byte+', '+p.end_byte_exclusive+')').join('; ')+'</small>').join('')+'</section>').join('')).join('')+'</html>';
}
