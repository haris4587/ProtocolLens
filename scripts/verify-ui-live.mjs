// Executes the actual built frontend handlers against real Studionet RPC using
// a DOM implementation. This is not a visual or browser-compatibility test.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseHTML} from 'linkedom';
const publicMode=process.argv.includes('--public');
const origin='https://protocollens.itzanza2.chatgpt.site';
const originalFetch=globalThis.fetch;
const artifacts={};
async function resource(path){
 if(publicMode){const response=await originalFetch(origin+path);assert(response.ok,path+' unavailable');return await response.text();}
 return await readFile('dist'+path,'utf8');
}
const html=await resource('/index.html').catch(async e=>{if(publicMode)return await resource('/');throw e;});
const app=await resource('/app.js');
artifacts.html_sha256=createHash('sha256').update(html).digest('hex');
artifacts.app_sha256=createHash('sha256').update(app).digest('hex');
if(publicMode){
 assert.equal(html,await readFile('dist/index.html','utf8'),'Published HTML differs from the built source');
 assert.equal(app,await readFile('dist/app.js','utf8'),'Published JavaScript differs from the built source');
 assert.deepEqual(JSON.parse(await resource('/deployment.json')),JSON.parse(await readFile('deployment.json','utf8')),'Published deployment configuration differs from the source');
}
const {document}=parseHTML(html);
globalThis.document=document;
globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
Object.defineProperty(globalThis,'navigator',{value:{clipboard:{writeText:async text=>{artifacts.copied=text;}}},configurable:true});
globalThis.fetch=async(input,options)=>{
 if(typeof input==='string'&&input.startsWith('/'))return new Response(await resource(input),{status:200});
 return originalFetch(input,options);
};
await import('data:text/javascript;base64,'+Buffer.from(app).toString('base64'));
const $=s=>document.querySelector(s);
assert.match($('#status').textContent,/Verified finalized state/);
assert.match($('#connection-status').textContent,/Verified Studionet chain 61999/);
await $('#prepare-tab').onclick();
assert.equal($('#prepare-panel').hidden,false);
await $('#demo').onclick();
assert.match($('#demo-status').textContent,/Both remote snapshots verified/);
assert.equal($('#argument-fields').querySelectorAll('input').length,7);
const prepared=JSON.parse($('#arguments').textContent);
assert.equal(prepared[3],628);assert.equal(prepared[6],735);
await $('#argument-fields button').onclick();
assert.equal(artifacts.copied,prepared[0]);
await $('#replay').onclick();
assert.match($('#commit-state').textContent,/FINALIZED/);
assert.match($('#review-state').textContent,/FINALIZED/);
const config=JSON.parse(await resource('/deployment.json'));
assert.match($('#review-instruction').textContent,new RegExp('review_id = '+config.workflow.review_id));
assert.match($('#review-result').textContent,/DEVIATIONS/);
assert.match($('#review-result').textContent,/PRIMARY OUTCOME \/ UNEXPLAINED/);
let download;
const createURL=URL.createObjectURL;
URL.createObjectURL=blob=>{download=blob;return createURL(blob);};
await $('#review-result button').onclick();
assert(download,'receipt export was not created');
const bundle=JSON.parse(await download.text());
assert.equal(bundle.contract,config.contract);assert.equal(bundle.record.id,config.workflow.review_id);
assert.equal(bundle.read_state,'LATEST_FINAL');assert.equal(bundle.transaction.hash,config.workflow.review_transaction);
const auditButton=Array.from($('#review-result').querySelectorAll('button')).find(b=>b.textContent==='Audit source evidence');
assert(auditButton,'Evidence audit button missing');
await auditButton.onclick();
assert.match($('#review-result').textContent,/Source bytes, history, excerpts and outcome rules verified/);
assert.match($('#review-result').textContent,/primary_outcome \/ UNEXPLAINED — registration: lines/);
const auditDownload=Array.from($('#review-result').querySelectorAll('button')).find(b=>b.textContent==='Download audit JSON');
assert(auditDownload,'Audit download missing');await auditDownload.onclick();
const auditBundle=JSON.parse(await download.text());
assert.equal(auditBundle.audit.record_id,config.workflow.review_id);
assert.equal(auditBundle.audit.attempts[0].checks[0].quotes.registration.status,'FOUND');
const evidence={schema:'protocollens.ui-workflow.v1',checked_at:new Date().toISOString(),origin:publicMode?origin:'local build',verification_type:'DOM handlers + live RPC; no visual/browser QA',artifacts,chain_id:61999,contract:config.contract,workflow:config.workflow,observed:{network:$('#connection-status').textContent,example:$('#demo-status').textContent,commitment:$('#commit-state').textContent,review:$('#review-state').textContent,instruction:$('#review-instruction').textContent,export:$('#status').textContent},bundle};
delete evidence.artifacts.copied;
if(publicMode)await writeFile('docs/evidence/reviewer-ui-live.json',JSON.stringify(evidence,null,2)+'\n');
console.log('Verified actual '+(publicMode?'published':'built')+' frontend: example → copy fields → finalized commitment → review → findings → verified JSON export.');
process.exit(0);
