// Local economy v1. Contract rewards share the existing XP log and archive.
// No spending, no calls to AI, no authority for a public/online economy.
export function contractGold(xp){
 if(!Number.isInteger(xp)||xp<1||xp>1000)throw Error('economy xp');
 return Math.max(5,Math.min(30,xp));
}
export function normalizeEconomy(d){
 const fail=()=>{throw Error('economy')};
 if(d.economy===undefined)d.economy={version:1,campaignAwards:[],legacyCampaignIds:[...new Set((d.campaigns||[]).filter(c=>c.status==='completed'&&c.id.length<=300).map(c=>c.id))]};
 const e=d.economy,validId=x=>typeof x==='string'&&x.length<=300;
 if(!e||typeof e!=='object'||Array.isArray(e)||e.version!==1||!Array.isArray(e.campaignAwards)||e.campaignAwards.length>20000||!Array.isArray(e.legacyCampaignIds)||e.legacyCampaignIds.length>20000)fail();
 const ids=new Set();
 for(const id of e.legacyCampaignIds){if(!validId(id)||ids.has(id))fail();ids.add(id)}
 for(const a of e.campaignAwards){if(!a||!validId(a.id)||ids.has(a.id)||typeof a.name!=='string'||a.name.length>100||!Number.isFinite(a.time)||Math.abs(a.time)>8640000000000000)fail();ids.add(a.id)}
 const rewarded=new Set();
 for(const l of d.log){if(l.guildGold===undefined)continue;const gross=l.xp+(l.withheld??0);if(!validId(l.id)||rewarded.has(l.id)||!Number.isInteger(l.withheld??0)||(l.withheld??0)<0||l.guildGold!==contractGold(gross))fail();rewarded.add(l.id)}
 return e;
}
// Call only on an actual transition to completed. Historical campaigns earn nothing.
export function rewardCampaign(d,c,time=Date.now()){
 const e=d.economy;if(!e||typeof c.id!=='string'||c.id.length>300||c.status!=='completed'||e.legacyCampaignIds.includes(c.id)||e.campaignAwards.some(a=>a.id===c.id))return false;
 if(e.campaignAwards.length>=20000)return false;
 e.campaignAwards.push({id:c.id,name:c.name.slice(0,100),time});return true;
}
export function wallet(d){
 const contracts=d.log.filter(l=>l.guildGold!==undefined).sort((a,b)=>a.time-b.time);
 const campaigns=d.economy?.campaignAwards||[];
 return {gold:contracts.reduce((n,l)=>n+l.guildGold,0),seals:Math.floor(contracts.length/5),shards:Math.floor(contracts.length/20)+campaigns.length,contracts:contracts.length,
 transactions:[...contracts.map((l,i)=>({name:l.name,time:l.time,gold:l.guildGold,seals:(i+1)%5===0?1:0,shards:(i+1)%20===0?1:0})),...campaigns.map(a=>({name:'Kampania: '+a.name,time:a.time,gold:0,seals:0,shards:1}))].sort((a,b)=>b.time-a.time)};
}
