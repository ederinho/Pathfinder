// Local Oracle state; consultation receipts remain after deleting conversations.
export const ORACLE_MAX=8;
const text=(s,n,empty=false)=>typeof s==='string'&&s.length<=n&&(empty||!!s.trim());
const id=s=>typeof s==='string'&&/^[a-f0-9-]{36}$/i.test(s);
const time=t=>Number.isFinite(t)&&Math.abs(t)<=8640000000000000;
export function weekKey(t){const d=new Date(t);const u=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));u.setUTCDate(u.getUTCDate()-(u.getUTCDay()+6)%7);return u.toISOString().slice(0,10)}
export function validCampaign(c){return c===null||!!c&&text(c.name,100)&&text(c.description,1000)&&Array.isArray(c.steps)&&c.steps.length>=1&&c.steps.length<=5&&c.steps.every(s=>text(s,150))}
export function validTurn(t){return !!t&&text(t.message,800)&&text(t.dialogue,800)&&validCampaign(t.campaign)&&text(t.memory,600,true)}
export function normalizeOracle(d){
 if(d.oracle===undefined)d.oracle={version:1,memory:'',receipts:[],session:null};
 const o=d.oracle,fail=()=>{throw Error('oracle archive')};
 if(!o||o.version!==1||!text(o.memory,600,true)||!Array.isArray(o.receipts)||o.receipts.length>20000)fail();
 const ids=new Set(),weeks=new Set();for(const r of o.receipts){if(!r||!id(r.id)||ids.has(r.id)||!time(r.time)||!/^\d{4}-\d{2}-\d{2}$/.test(r.week)||!['free','shard'].includes(r.kind))fail();ids.add(r.id);if(r.kind==='free'){if(weeks.has(r.week))fail();weeks.add(r.week)}else if(!weeks.has(r.week))fail()}
 const s=o.session;if(s!==null){if(!s||!id(s.id)||!time(s.started)||typeof s.closed!=='boolean'||!Array.isArray(s.turns)||s.turns.length>ORACLE_MAX||!s.turns.every(validTurn)||typeof s.campaignSaved!=='boolean'||(s.turns.length>0)!==ids.has(s.id))fail();}
 return o;
}
export function offerOracle(d,shards,t=Date.now()){const week=weekKey(t),free=!d.oracle.receipts.some(r=>r.week===week&&r.kind==='free');return {week,kind:free?'free':'shard',allowed:d.oracle.receipts.length<20000&&(free||shards>0)}}
export function newOracle(d,sessionId,t){if(!id(sessionId)||!time(t)||d.oracle.session&&!d.oracle.session.closed)return false;d.oracle.session={id:sessionId,started:t,closed:false,turns:[],campaignSaved:false};return true}
export function appendOracle(d,{sessionId,index,turn,startedAt,kind},shards){const o=d.oracle,s=o.session;if(!s||s.id!==sessionId||s.closed||s.turns.length!==index||index>=ORACLE_MAX||!validTurn(turn))return false;
 if(index===0){const offer=offerOracle(d,shards,startedAt);if(!offer.allowed||offer.kind!==kind||o.receipts.some(r=>r.id===sessionId))return false;o.receipts.push({id:sessionId,time:startedAt,week:offer.week,kind})}
 s.turns.push(turn);if(s.turns.length===ORACLE_MAX)s.closed=true;return true;}
export function addOracleCampaign(d,sessionId,index,t=Date.now()){const s=d.oracle.session,c=s?.turns[index]?.campaign;if(!s||s.id!==sessionId||s.campaignSaved||!c||!validCampaign(c))return false;d.campaigns??=[];const cid='oracle-'+sessionId;if(d.campaigns.some(x=>x.id===cid)||d.economy?.campaignAwards.some(x=>x.id===cid)||d.economy?.legacyCampaignIds.includes(cid))return false;d.campaigns.push({id:cid,name:c.name,description:c.description,status:'active',steps:c.steps.map(name=>({name,done:false})),history:[{time:t,note:'Kampania zaakceptowana po konsultacji z Wyrocznią.',status:'active'}]});s.campaignSaved=true;return true;}
