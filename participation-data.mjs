import {createBoundedCache} from './request-policy.mjs';
const endpoint='https://hub.snapshot.org/graphql';
export function countParticipation(proposals,votes){
 const ids=new Set(proposals.map(p=>p.id)), participated=new Map();
 for(const vote of votes){if(!/^0x[a-f0-9]{40}$/i.test(vote.voter)||!ids.has(vote.proposal?.id))continue;const address=vote.voter.toLowerCase();if(!participated.has(address))participated.set(address,new Set());participated.get(address).add(vote.proposal.id);}
 return {proposals:proposals.map(p=>({id:p.id,created:p.created})),votedProposalIds:Object.fromEntries([...participated].map(([a,ids])=>[a,[...ids]])),total:ids.size,counts:Object.fromEntries([...participated].map(([a,ids])=>[a,ids.size]))};
}
export async function loadParticipation(fetcher=fetch){
 const signal=AbortSignal.timeout(25000);
 async function pages(field,selection){const rows=[];for(let skip=0;skip<20000;skip+=1000){const query=`query { ${field}(first:1000,skip:${skip},where:{${field==='proposals'?'space_in:["orbs-network.eth"]':'space:"orbs-network.eth"'}},orderBy:"created",orderDirection:asc){${selection}} }`;const r=await fetcher(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query}),signal});if(!r.ok)throw Error('Snapshot unavailable');const d=await r.json();if(d.errors||!Array.isArray(d.data?.[field]))throw Error('Invalid Snapshot participation');rows.push(...d.data[field]);if(d.data[field].length<1000)return rows;}throw Error('Snapshot history limit exceeded');}
 const [proposals,votes]=await Promise.all([pages('proposals','id created'),pages('votes','voter proposal { id }')]);
 if(proposals.some(p=>!Number.isFinite(p.created)))throw Error('Invalid proposal creation time');
 return {...countParticipation(proposals,votes),fetchedAt:new Date().toISOString()};
}
const cache=createBoundedCache({maxEntries:1});
export const getParticipation=(options={})=>cache.get('participation',()=>loadParticipation(),options);
