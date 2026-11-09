export const GUARDIAN_PALETTE = ['#7A89E9','#DC8AE0','#63DDB5','#49AAFF','#FFADAE','#A17AE9','#2CEDFC','#3346F2','#C6DC82','#AB83B5','#36C9CA','#E998BD','#B99DEE','#35B8A6','#6298DD','#E8AF7D','#B56BBC','#A6C98B','#7DA6BC','#CC789E','#92D6C8','#DDC477'];
export const DEFAULT_GUARDIAN_COLOR = '#89849A';
export const colorForRank = rank => Number.isInteger(rank) && rank > 0 && rank <= 22 ? GUARDIAN_PALETTE[rank - 1] : DEFAULT_GUARDIAN_COLOR;
export function committeeColorMap(snapshots = []) {
  const latest = snapshots.filter(s => Number.isFinite(s.block_time)).sort((a,b) => a.block_time-b.block_time).at(-1);
  const rows = (latest?.data || []).filter(g => /^0x[a-f0-9]{40}$/i.test(g.address) && Number.isFinite(g.effective_stake) && g.effective_stake >= 0).map(g => ({...g,address:g.address.toLowerCase()})).sort((a,b)=>b.effective_stake-a.effective_stake || a.address.localeCompare(b.address));
  let rank=0;
  return new Map(rows.map((g,i)=>{if(i===0 || g.effective_stake!==rows[i-1].effective_stake)rank=i+1;return [g.address,{rank,color:colorForRank(rank)}];}));
}
export const guardianColor = (map,address) => map.get(String(address).toLowerCase())?.color || DEFAULT_GUARDIAN_COLOR;
export const guardianInitials = name => String(name || '').trim().split(/\s+/).filter(Boolean).map(word=>Array.from(word)[0]).join('').slice(0,2).toUpperCase() || 'OR';
