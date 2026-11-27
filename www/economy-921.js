// Local economy v2. Rewards and spending share the existing archive.
// Not an authority for a public/online economy.
export function contractGold(xp){
 if(!Number.isInteger(xp)||xp<1||xp>1000)throw Error('economy xp');
 return Math.max(5,Math.min(30,xp));
}
export function normalizeEconomy(d){
 const fail=()=>{throw Error('economy')};
 if(d.economy===undefined)d.economy={version:1,campaignAwards:[],legacyCampaignIds:[...new Set((d.campaigns||[]).filter(c=>c.status==='completed'&&c.id.length<=300).map(c=>c.id))]};
 const e=d.economy;
 if(e?.version===1){e.version=2;e.purchases=[];e.visits=[];e.equipped=null}
 const validId=x=>typeof x==='string'&&x.length<=300;
 if(!e||typeof e!=='object'||Array.isArray(e)||e.version!==2||!Array.isArray(e.campaignAwards)||e.campaignAwards.length>20000||!Array.isArray(e.legacyCampaignIds)||e.legacyCampaignIds.length>20000)fail();
 const ids=new Set();
 for(const id of e.legacyCampaignIds){if(!validId(id)||ids.has(id))fail();ids.add(id)}
 for(const a of e.campaignAwards){if(!a||!validId(a.id)||ids.has(a.id)||typeof a.name!=='string'||a.name.length>100||!Number.isFinite(a.time)||Math.abs(a.time)>8640000000000000)fail();ids.add(a.id)}
 const rewarded=new Set();
 for(const l of d.log){if(l.guildGold===undefined)continue;const gross=l.xp+(l.withheld??0);if(!validId(l.id)||rewarded.has(l.id)||!Number.isInteger(l.withheld??0)||(l.withheld??0)<0||l.guildGold!==contractGold(gross))fail();rewarded.add(l.id)}
 validateSpending(d);
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
 const campaigns=d.economy?.campaignAwards||[], purchases=d.economy?.purchases||[], visits=d.economy?.visits||[];
 return {gold:contracts.reduce((n,l)=>n+l.guildGold,0)-purchases.reduce((n,p)=>n+item(p.id).price,0),seals:Math.floor(contracts.length/5)-visits.filter(v=>v.kind==='seal').length,shards:Math.floor(contracts.length/20)+campaigns.length-(d.oracle?.receipts||[]).filter(r=>r.kind==='shard').length,contracts:contracts.length,
 transactions:[...contracts.map((l,i)=>({name:l.name,time:l.time,gold:l.guildGold,seals:(i+1)%5===0?1:0,shards:(i+1)%20===0?1:0})),...campaigns.map(a=>({name:'Kampania: '+a.name,time:a.time,gold:0,seals:0,shards:1})),...purchases.map(p=>({name:'Zakup: '+item(p.id).name,time:p.time,gold:-item(p.id).price,seals:0,shards:0})),...(d.oracle?.receipts||[]).map(r=>({name:'Wyrocznia ('+(r.kind==='free'?'darmowa':'Odłamek')+')',time:r.time,gold:0,seals:0,shards:r.kind==='shard'?-1:0})),...visits.map(v=>({name:'Wizyta u Kaela ('+(v.kind==='free'?'darmowa':'Pieczęć')+')',time:v.time,gold:0,seals:v.kind==='seal'?-1:0,shards:0}))].sort((a,b)=>b.time-a.time)};
}

// v0.13.1 — local cosmetic purchases and successful consultations.
export const shop=Object.freeze([
 Object.freeze({id:'traveller-cloak',name:'Płaszcz Wędrowca',price:100,rarity:'Prosty',symbol:'◈',description:'Wytarty płaszcz podróżny, znak pierwszych kroków na szlaku.'}),
 Object.freeze({id:'guild-cloak',name:'Płaszcz Strażnika Gildii',price:300,rarity:'Rzadki',symbol:'✦',description:'Ciemna tkanina i złote obszycie, barwy zaufanych wędrowców.'}),
 Object.freeze({id:'room-lantern',name:'Mosiężna latarnia',price:60,rarity:'Dekoracja',symbol:'✦',category:'room',description:'Ciepłe światło w kwaterze.'}),
 Object.freeze({id:'room-map',name:'Mapa na ścianę',price:90,rarity:'Dekoracja',symbol:'▤',category:'room',description:'Pamiątka przebytych szlaków.'}),
 Object.freeze({id:'lantern-cloak',name:'Płaszcz Ostatniej Latarni',price:750,rarity:'Unikatowy',symbol:'◇',description:'Szata o haftach przypominających światło pośród mroku.'})
]);
const item=id=>shop.find(x=>x.id===id);
const timestamp=t=>Number.isFinite(t)&&Math.abs(t)<=8640000000000000;
const dateKey=t=>{const d=new Date(t);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const visitId=id=>typeof id==='string'&&/^[a-f0-9-]{36}$/i.test(id);
function validateSpending(d){
 const e=d.economy,fail=()=>{throw Error('economy spending')};
 if(!Array.isArray(e.purchases)||e.purchases.length>shop.length||!Array.isArray(e.visits)||e.visits.length>20000)fail();
 const owned=new Set(),ids=new Set(),days=new Set();
 for(const p of e.purchases){if(!p||!item(p.id)||owned.has(p.id)||!timestamp(p.time))fail();owned.add(p.id)}
 if(e.equipped!==null&&(!owned.has(e.equipped)||item(e.equipped)?.category==='room'))fail();
 for(const v of e.visits){if(!v||!visitId(v.id)||ids.has(v.id)||!timestamp(v.time)||typeof v.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v.day)||!['free','seal'].includes(v.kind))fail();ids.add(v.id);if(v.kind==='free'){if(days.has(v.day))fail();days.add(v.day)}else if(!days.has(v.day))fail()}
 const b=wallet(d);if(b.gold<0||b.seals<0||b.shards<0)fail();
}
export function purchase(d,id,time=Date.now()){
 const p=item(id),e=d.economy;if(!p||e.purchases.some(x=>x.id===id)||wallet(d).gold<p.price)return false;
 e.purchases.push({id,time});return true;
}
export function equip(d,id){if(id!==null&&(item(id)?.category==='room'||!d.economy.purchases.some(p=>p.id===id)))return false;d.economy.equipped=id;return true}
export function visitOffer(d,time=Date.now()){
 const date=dateKey(time),free=!d.economy.visits.some(v=>v.day===date&&v.kind==='free');
 return {day:date,kind:free?'free':'seal',allowed:d.economy.visits.length<20000&&d.economy.visits.filter(v=>v.day===date).length<3&&(free||wallet(d).seals>0)};
}
export function recordVisit(d,id,time,kind){
 const e=d.economy;if(!visitId(id)||!timestamp(time))return false;
 const old=e.visits.find(v=>v.id===id);if(old)return old.time===time&&old.kind===kind;
 const offer=visitOffer(d,time);if(!offer.allowed||offer.kind!==kind)return false;
 e.visits.push({id,time,day:offer.day,kind});return true;
}
export function canUndo(d,entry){const next={...d,log:d.log.filter(l=>l!==entry)},b=wallet(next);return b.gold>=0&&b.seals>=0&&b.shards>=0}
