import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const origin='https://protocollens.itzanza2.chatgpt.site';
const config=JSON.parse(await readFile('deployment.json','utf8'));
for(const [path,needle] of [['/','Track consensus review'],['/app.js','LATEST_FINAL'],['/style.css','.hero']]){
 const res=await fetch(origin+path);assert.equal(res.status,200,path+' failed');
 assert((await res.text()).includes(needle),path+' missing expected content');
}
const res=await fetch(origin+'/deployment.json',{cache:'no-store'});assert.equal(res.status,200);
assert.equal((await res.json()).contract,config.contract,'Published address differs from verified contract');
const cors=await fetch(config.rpc,{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});
assert(cors.ok,'RPC preflight failed');
assert(['*',origin].includes(cors.headers.get('access-control-allow-origin')),'RPC CORS disallows public site');
const demo=await fetch(origin+'/demo-arguments.json');assert(demo.ok,'Published example arguments missing');
const args=await demo.json();
for(const i of [1,4]){
 const source=await fetch(args[i],{headers:{Origin:origin}});assert(source.ok,'Pinned example unavailable');
 assert(['*',origin].includes(source.headers.get('access-control-allow-origin')),'Document CORS disallows public example loading');
}
console.log('Public HTML, JS, CSS, deployed address and RPC CORS smoke checks passed.');
