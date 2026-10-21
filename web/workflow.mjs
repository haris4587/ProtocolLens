import {abi} from 'genlayer-js';
import {TransactionHashVariant} from 'genlayer-js/types';
import {canonical,verifyBundle,validateAddress} from './core.mjs';

export const isTransactionHash=value=>/^0x[0-9a-fA-F]{64}$/.test(value);
export function decodeCall(tx){
  const raw=tx?.data?.calldata?.raw;
  if(!raw)throw Error('Transaction calldata is unavailable.');
  const decoded=abi.calldata.decode(Uint8Array.from(raw));
  const call=decoded instanceof Map?Object.fromEntries(decoded):decoded;
  if(!call||!Array.isArray(call.args))throw Error('Transaction arguments are unavailable.');
  call.args=call.args.map(v=>{
    if(typeof v!=='bigint')return v;
    if(v>BigInt(Number.MAX_SAFE_INTEGER)||v<BigInt(Number.MIN_SAFE_INTEGER))throw Error('Transaction integer is out of range.');
    return Number(v);
  });
  return call;
}
export function transactionState(tx,address,method){
  if(!validateAddress(address))throw Error('Invalid contract address.');
  if((tx?.to_address||tx?.recipient||'').toLowerCase()!==address.toLowerCase())throw Error('Transaction belongs to a different contract.');
  const call=decodeCall(tx);
  if(call.method!==method)throw Error('Expected '+method+'; this transaction calls '+call.method+'.');
  if(tx.execution_mode!=='NORMAL')throw Error('Use Normal (Full Consensus), with simulation disabled.');
  const state=tx.statusName||'PENDING';
  if(['CANCELED','CANCELLED','UNDETERMINED'].includes(state))throw Error('Transaction '+state+'. Inspect Studio before submitting another call.');
  const finalized=state==='FINALIZED';
  const receipt=tx.consensus_data?.leader_receipt?.[0];
  if(finalized&&receipt?.execution_result!=='SUCCESS')throw Error('Finalized transaction failed: '+(receipt?.genvm_result?.stdout||receipt?.result?.payload||receipt?.execution_result||'missing execution receipt'));
  let id;
  if(finalized){
    id=method==='review'?String(call.args?.[0]):String(abi.calldata.decode(Uint8Array.from(receipt.result.payload.raw)));
    if(!/^[1-9][0-9]*$/.test(id))throw Error('Transaction did not return a valid review ID.');
  }
  return {hash:tx.hash,state,finalized,id,method,args:call.args,sender:tx.from_address||tx.sender};
}
export async function inspectTransaction(client,{hash,address,method}){
  if(!isTransactionHash(hash))throw Error('Paste a 0x transaction hash with 64 hexadecimal characters.');
  if(await client.getChainId()!==61999)throw Error('Wrong RPC network: Studionet chain 61999 is required.');
  const tx=await client.getTransaction({hash});
  if(!tx)throw Error('Transaction not found on Studionet. Check the hash and retry.');
  const summary=transactionState(tx,address,method);
  if(!summary.finalized)return summary;
  const record=JSON.parse(String(await client.readContract({address,functionName:'get_review',args:[summary.id],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})));
  await verifyBundle(record);
  if(record.creator.toLowerCase()!==summary.sender.toLowerCase())throw Error('Transaction signer does not match the record creator.');
  if(method==='commit_study'){
    const actual=[record.title,record.registration.url,record.registration.sha256,record.registration.bytes,record.study.url,record.study.sha256,record.study.bytes];
    if(canonical(actual)!==canonical(summary.args))throw Error('Finalized record differs from transaction arguments.');
  }else if(!record.history.length)throw Error('Finalized review history is not available yet. Retry the read.');
  return {...summary,record};
}
