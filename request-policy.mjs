// Bounded in-memory controls; no external cache daemon or per-request disk writes.
export class BusyError extends Error { constructor(message='Too many requests',status=429){super(message);this.status=status;this.retryAfter=30;} }
export class TokenBuckets {
  constructor({capacity,refillPerSecond,maxKeys=2048,clock=Date.now}){Object.assign(this,{capacity,refillPerSecond,maxKeys,clock});this.items=new Map();}
  take(key,cost=1){const now=this.clock();let b=this.items.get(key);if(!b){if(this.items.size>=this.maxKeys){for(const [k,v] of this.items){if(now-v.time>300000)this.items.delete(k);}if(this.items.size>=this.maxKeys)return false;}b={tokens:this.capacity,time:now};this.items.set(key,b);}b.tokens=Math.min(this.capacity,b.tokens+(now-b.time)/1000*this.refillPerSecond);b.time=now;if(b.tokens<cost)return false;b.tokens-=cost;return true;}
}
export class WorkBudget {
  constructor({maxActive=8,capacity=30,refillPerSecond=0.5}={}){this.active=0;this.maxActive=maxActive;this.tokens=new TokenBuckets({capacity,refillPerSecond,maxKeys:1});}
  async run(fn){if(this.active>=this.maxActive||!this.tokens.take('all'))throw new BusyError('Upstream capacity reached',503);this.active++;try{return await fn();}finally{this.active--;}}
}
export const upstreamBudget=new WorkBudget();
export function createBoundedCache({ttl=600000,errorTtl=30000,maxEntries=256,clock=Date.now,budget=upstreamBudget}={}){
 const entries=new Map(),pending=new Map();
 return {entries,pending,async get(key,loader,{force=false,isPartial=()=>false}={}){
  const now=clock(),saved=entries.get(key);
  // A reload can refresh a successful entry at most once per minute; failures retain backoff.
  if(saved&&now<saved.expires&&(!force||saved.error||saved.partial||now-saved.created<60000)){entries.delete(key);entries.set(key,saved);if(saved.error)throw saved.error;return saved.value;}
  if(pending.has(key))return pending.get(key);
  const job=budget.run(async()=>{try{const value=await loader(),partial=isPartial(value);entries.delete(key);entries.set(key,{value,partial,created:clock(),expires:clock()+(partial?errorTtl:ttl)});return value;}catch(error){if(!(error instanceof BusyError)){entries.delete(key);entries.set(key,{error,created:clock(),expires:clock()+errorTtl});}throw error;}finally{while(entries.size>maxEntries)entries.delete(entries.keys().next().value);}});
  pending.set(key,job);try{return await job;}finally{pending.delete(key);}
 }};
}
