import test from 'node:test';
import assert from 'node:assert/strict';
import { createPosModelCache } from './pos-models.js';
const sources = () => ({
 ethereum: {data: {guardianDetails: [{address:'a',name:'A',effectiveStake:10}], history:[{time:100,value:10},{time:200,value:20},{time:300,value:30}]}},
 polygon: {data: {guardianDetails: [{address:'a',name:'A',effectiveStake:5}], history:[{time:150,value:5},{time:250,value:7}]}}
});
test('unchanged sources reuse models; refreshed sources invalidate both caches', () => {
 const cache=createPosModelCache(), data=sources();
 const guardians=cache.guardians(data), chart=cache.series(data,'total',60,310);
 assert.equal(cache.guardians(data),guardians);
 assert.equal(cache.series(data,'total',60,311),chart);
 const next=sources(); next.ethereum.data.guardianDetails[0].effectiveStake=100;
 assert.notEqual(cache.guardians(next),guardians);
 assert.equal(cache.guardians(next)[0].total,105);
 assert.notEqual(cache.series(next,'total',60,310),chart);
});
test('combined history uses overlapping coverage and preceding step values', () => {
 assert.deepEqual(createPosModelCache().series(sources(),'total',60,310),[
 {time:150,value:15},{time:200,value:25},{time:250,value:27}]);
});
test('missing network remains unavailable rather than fabricated combined stake', () => {
 const data=sources(); delete data.polygon;
 const cache=createPosModelCache();
 assert.equal(cache.guardians(data)[0].total,null);
 assert.equal(cache.series(data,'total',60,310),null);
});
