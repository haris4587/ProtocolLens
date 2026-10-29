// Read-only: never signs, submits transactions, or changes deployment.json.
import {readFile,writeFile} from 'node:fs/promises';
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {inspectTransaction} from '../web/workflow.mjs';
import {sha256} from '../web/core.mjs';
import {auditRecord,fetchSources,auditHTML} from '../web/audit.mjs';
const args=process.argv.slice(2),allowed=['--live','--receipt','--registration','--study','--out','--help'];
function option(key){const i=args.indexOf(key);return i<0?undefined:args[i+1];}
try{
  if(args.includes('--help')){console.log('node scripts/audit-evidence.mjs --live [--out prefix]\nnode scripts/audit-evidence.mjs --receipt receipt.json [--registration snapshot.txt --study report.txt] [--out prefix]\nLive mode verifies the configured finalized review transaction and deployed source. Imported receipts are unanchored. Without local files, committed snapshots are fetched. Writes prefix.json and prefix.html; no transactions sent.');process.exit(0);}
  for(let i=0;i<args.length;i++){if(!allowed.includes(args[i]))throw Error('Unknown option: '+args[i]);if(args[i]!=='--live'){if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing option value');i++;}}
  const live=args.includes('--live'),receipt=option('--receipt');
  if(live===!!receipt)throw Error('Choose exactly one of --live or --receipt');
  if(!!option('--registration')!==!!option('--study'))throw Error('Supply both local source files');
  let record,provenance='UNANCHORED_IMPORT',anchor=null;
  if(live){
    const config=JSON.parse(await readFile(new URL('../deployment.json',import.meta.url),'utf8'));
    const client=createClient({chain:studionet});
    const code=await client.getContractCode(config.contract);
    const bytes=typeof code==='string'?new TextEncoder().encode(code):code;
    if(await sha256(bytes)!==config.source_sha256)throw Error('Deployed source checksum mismatch');
    const info=await inspectTransaction(client,{hash:config.workflow.review_transaction,address:config.contract,method:'review'});
    if(!info.finalized)throw Error('Review transaction not finalized');
    if(info.id!==config.workflow.review_id||info.record.id!==info.id)throw Error('Unexpected record ID');
    record=info.record;provenance='FINALIZED_RPC';anchor={chain_id:61999,contract:config.contract,transaction:info.hash,source_sha256:config.source_sha256};
  }else{const input=JSON.parse(await readFile(receipt,'utf8'));record=input.record||input.bundle?.record||input;}
  const sources=option('--registration')?{registration:await readFile(option('--registration')),study:await readFile(option('--study'))}:await fetchSources(record);
  const audit=await auditRecord(record,sources),output=option('--out')||'protocollens-audit';
  await writeFile(output+'.json',JSON.stringify({checked_at:new Date().toISOString(),provenance,anchor,audit},null,2)+'\n');
  await writeFile(output+'.html',auditHTML(audit,provenance));
  console.log('Evidence audit passed. '+provenance+'. '+audit.attempts.length+' attempt(s). Written '+output+'.json and '+output+'.html');
}catch(e){console.error('Evidence audit failed: '+e.message);process.exitCode=1;}

process.exit(process.exitCode||0);
