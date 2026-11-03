import test from 'node:test';
import assert from 'node:assert/strict';
import {Interface} from 'ethers';
import {currentAccount,validateAddress} from './account-data.mjs';
const wallet='0x1111111111111111111111111111111111111111';
test('addresses are normalized and malformed input rejected',()=>{assert.equal(validateAddress(wallet),wallet);assert.throws(()=>validateAddress('x'));});
test('reward revert preserves stake and resolves delegation; every call uses the same block',async()=>{
 const original=global.fetch,seen=[];const abi=new Interface(['function getContract(string) view returns(address)','function getStakeBalanceOf(address) view returns(uint256)','function getUnstakeStatus(address) view returns(uint256,uint256)','function balanceOf(address) view returns(uint256)','function getDelegation(address) view returns(address)']);
 global.fetch=async(url,options)=>{const req=JSON.parse(options.body);if(req.method==='eth_blockNumber')return {ok:true,json:async()=>({result:'0x123'})};seen.push(req.params[1]);let tx;try{tx=abi.parseTransaction({data:req.params[0].data});}catch{}if(!tx)return {ok:true,json:async()=>({error:{message:'revert'}})};const values={getContract:[wallet],getStakeBalanceOf:[1000000000000000000n],getUnstakeStatus:[0n,0n],balanceOf:[0n],getDelegation:[wallet]};return {ok:true,json:async()=>({result:abi.encodeFunctionResult(tx.name,values[tx.name])})};};
 try{const d=await currentAccount('ethereum',wallet);assert.equal(d.staked,'1.0');assert.equal(d.balance,'0.0');assert.equal(d.currentRewards,null);assert.equal(d.totalRewards,null);assert.equal(d.guardian,wallet);assert.equal(d.partial,true);assert(seen.every(b=>b==='0x123'));}finally{global.fetch=original;}
});
