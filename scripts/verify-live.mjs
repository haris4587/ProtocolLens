import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
import {verifyBundle} from '../web/core.mjs';
const config=JSON.parse(await readFile('deployment.json','utf8'));
const c=createClient({chain:studionet});
const source=await readFile('contracts/protocol_lens.py','utf8');
const code=await c.getContractCode(config.contract);
const deployed=typeof code==='string'?code:Buffer.from(code).toString('utf8');
assert.equal(deployed,source,'Deployed source differs from the repository');
const raw=await c.readContract({address:config.contract,functionName:'get_review',args:['1'],transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
const record=JSON.parse(String(raw));await verifyBundle(record);
const receipts=[];
for(const hash of config.transactions){const tx=await c.getTransaction({hash});assert.equal(tx.statusName,'FINALIZED');assert.equal(tx.consensus_data.leader_receipt[0].execution_result,'SUCCESS');assert.equal(tx.execution_mode,'NORMAL');receipts.push({hash,status:tx.statusName,execution:tx.consensus_data.leader_receipt[0].execution_result,mode:tx.execution_mode,votes:tx.consensus_data.votes});}
await mkdir('docs/evidence',{recursive:true});
await writeFile('docs/evidence/live-review.json',JSON.stringify({schema:'protocollens.receipt.v1',chain_id:studionet.id,contract:config.contract,source_sha256:createHash('sha256').update(source).digest('hex'),read_state:'LATEST_FINAL',transactions:receipts,record},null,2)+'\n');
const latest=record.history.at(-1)?.report;
console.log('Verified deployed source, finalized successful transactions and receipt hash chain. Latest outcome:',latest?.outcome);
if(!process.argv.includes('--record')){
 assert.equal(latest?.outcome,'DEVIATIONS','Live demo has not established the expected deviation classification');
 assert.equal(latest.checks[0].category,'primary_outcome');
 assert.equal(latest.checks[0].finding,'UNEXPLAINED');
 console.log('Live primary outcome switch detected.');
}
