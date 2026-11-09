// RegistrationTime and Snapshot created are both Unix seconds.
export function participationSince(data,address,registeredAt){
 if(!Number.isFinite(registeredAt)||registeredAt<=0||!Array.isArray(data?.proposals)||!data?.votedProposalIds)return null;
 const eligible=new Set(data.proposals.filter(p=>p.created>=registeredAt).map(p=>p.id));
 const voted=new Set(data.votedProposalIds[String(address).toLowerCase()]||[]);
 return {total:eligible.size,count:[...voted].filter(id=>eligible.has(id)).length};
}
