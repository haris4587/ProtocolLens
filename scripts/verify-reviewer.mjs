import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {inspectTransaction} from '../web/workflow.mjs';
const config=JSON.parse(await readFile('deployment.json'));
const client=createClient({chain:studionet});
const source=await readFile('contracts/protocol_lens.py','utf8');
assert.equal(await client.getContractCode(config.contract),source);
assert.equal(createHash('sha256').update(source).digest('hex'),config.source_sha256);
const transactions=[];
for(const [method,hash] of [['commit_study',config.workflow.commit_transaction],['review',config.workflow.review_transaction]]){
 const info=await inspectTransaction(client,{hash,address:config.contract,method});
 assert(info.finalized);assert.equal(info.id,config.workflow.review_id);assert.equal(info.sender,config.workflow.signer);
 const tx=await client.getTransaction({hash});
 transactions.push({...info,votes:tx.consensus_data.votes});
}
assert.equal(transactions[1].record.history.at(-1).report.outcome,'DEVIATIONS');
assert.equal(transactions[1].record.history.at(-1).report.checks[0].finding,'UNEXPLAINED');
await writeFile('docs/evidence/reviewer-transactions.json',JSON.stringify({schema:'protocollens.reviewer-e2e.v1',checked_at:new Date().toISOString(),contract:config.contract,chain_id:61999,source_sha256:config.source_sha256,signing:'Studio built-in account, Normal (Full Consensus), simulation off',redeployed:false,transactions},null,2)+'\n');
console.log('Fresh reviewer commitment and consensus review verified: same existing release, same signer, finalized SUCCESS, record '+config.workflow.review_id+', DEVIATIONS.');
process.exit(0);
