import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const origin='https://protocollens.itzanza2.chatgpt.site';
const config=JSON.parse(await readFile('deployment.json','utf8'));
for(const [path,needle] of [['/','ProtocolLens'],['/app.js','LATEST_FINAL'],['/style.css','.hero']]){
 const res=await fetch(origin+path);assert.equal(res.status,200,path+' failed');
 assert((await res.text()).includes(needle),path+' missing expected content');
}
const res=await fetch(origin+'/deployment.json',{cache:'no-store'});assert.equal(res.status,200);
assert.equal((await res.json()).contract,config.contract,'Published address differs from verified contract');
const cors=await fetch(config.rpc,{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});
assert(cors.ok,'RPC preflight failed');
assert(['*',origin].includes(cors.headers.get('access-control-allow-origin')),'RPC CORS disallows public site');
console.log('Public HTML, JS, CSS, deployed address and RPC CORS smoke checks passed.');
