import test from 'node:test';import assert from 'node:assert/strict';import{countParticipation,loadParticipation}from'./participation-data.mjs';
const address='0x'+'a'.repeat(40);
test('participation counts distinct proposals per normalized voter and excludes deleted proposals',()=>{const d=countParticipation([{id:'one'},{id:'two'},{id:'three'}],[{voter:address,proposal:{id:'one'}},{voter:address.toUpperCase().replace('0X','0x'),proposal:{id:'one'}},{voter:address,proposal:{id:'two'}},{voter:address,proposal:{id:'deleted'}}]);assert.equal(d.total,3);assert.deepEqual(d.counts,{[address]:2});});
test('pagination reads beyond first page and propagates upstream errors',async()=>{let requests=0;const d=await loadParticipation(async(url,o)=>{requests++;const q=JSON.parse(o.body).query;return {ok:true,json:async()=>({data:q.includes('proposals(')?{proposals:[{id:'one',created:100}]}:{votes:q.includes('skip:0,')?Array.from({length:1000},()=>({voter:address,proposal:{id:'one'}})):[]}})};});assert.equal(requests,3);assert.equal(d.counts[address],1);await assert.rejects(()=>loadParticipation(async()=>({ok:true,json:async()=>({errors:[{message:'offline'}]})})));});

import {participationSince} from './participation-model.mjs';
test('registration cutoff filters numerator and denominator together including boundary',()=>{
 const data=countParticipation(Array.from({length:9},(_,i)=>({id:String(i),created:100+i})),[0,4,5,6,7].map(i=>({voter:address,proposal:{id:String(i)}})));
 assert.deepEqual(participationSince(data,address,104),{count:4,total:5});
 assert.deepEqual(participationSince(data,address.toUpperCase(),104),{count:4,total:5});
 assert.deepEqual(participationSince(data,address,200),{count:0,total:0});
 assert.equal(participationSince(data,address,null),null);
});
