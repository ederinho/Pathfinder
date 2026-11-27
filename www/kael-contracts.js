// Local, deterministic mapping; no API, no game-state mutation.
export function contractXP(minutes){if(!Number.isInteger(minutes)||minutes<1||minutes>240)throw Error('minutes');return Math.min(30,Math.ceil(minutes/5)*5)}
export function makeKaelQuests(visit,chosen,availableMinutes,dayString){
 if(typeof visit!=='string'||! /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(visit)||!Array.isArray(chosen)||chosen.length<1||chosen.length>3||!Number.isInteger(availableMinutes)||availableMinutes<0||availableMinutes>240)throw Error('selection');
 const indexes=new Set(),good=(s,max)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;let total=0;
 const quests=chosen.map(c=>{if(!c||!Number.isInteger(c.index)||c.index<0||c.index>2||indexes.has(c.index)||!Number.isInteger(c.stat)||c.stat<0||c.stat>=12||!good(c.title,100)||!good(c.action,400)||!good(c.completion,300))throw Error('contract');indexes.add(c.index);const xp=contractXP(c.minutes);total+=c.minutes;return {id:'kael-'+visit+'-'+c.index,name:c.action.trim()+' · '+c.minutes+' min',story:c.title.trim(),stat:c.stat,type:'contract',deadline:null,xp,extra:[],steps:[{name:c.completion.trim(),done:false}],stepDay:dayString}});
 if(total>availableMinutes)throw Error('time');return quests;
}
export function appendKaelQuests(snapshot,quests){const existing=new Set([...snapshot.quests,...snapshot.log].map(q=>q.id));if(quests.some(q=>existing.has(q.id)))throw Error('duplicate');snapshot.quests.push(...quests);return snapshot}
