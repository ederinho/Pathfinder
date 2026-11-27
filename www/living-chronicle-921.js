import {chronKey,stats} from './core-921.js';
import {storyNodes} from './story-921.js';
import {chapterNodes,weekKey} from './beyond-921.js';
export const DRAFT_LIMIT=6000;
export function validDate(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s}
const num=s=>Date.parse(s+'T00:00:00Z')/86400000;
export function shiftDate(s,n){return new Date((num(s)+n)*86400000).toISOString().slice(0,10)}
export function validWeek(s){return validDate(s)&&new Date(s+'T00:00:00Z').getUTCDay()===1}
const short=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
export function questRecord(q,fallbackTitle=''){
 const source=q.id.startsWith('kael-')?'Kael':q.id.startsWith('beyond:')?'Tablica tygodniowa':q.type==='contract'?'Kontrakt':'Własne zlecenie';
 const title=short(source==='Tablica tygodniowa'?q.name:q.story||fallbackTitle,200)||short(q.name,200);
 return {questTitle:title,questSource:source};
}
// Historical titles are only recovered from an exact surviving quest or a known template.
export function deedRecord(l,quests=[],templateTitle=()=>null){
 if(l.questTitle)return {questTitle:l.questTitle,questSource:l.questSource||''};
 const q=quests.find(q=>q.id===l.id&&q.name===l.name);
 if(q)return questRecord(q,templateTitle(l.name));
 const title=templateTitle(l.name);
 return {questTitle:title||l.name,questSource:l.id.startsWith('kael-')?'Kael':l.id.startsWith('ritual:')?'Rytuał':l.id.startsWith('report:')?'Raport Kronikarza':''};
}
export function normalizeDeed(l,quests=[]){if(l.questTitle!==undefined&&(typeof l.questTitle!=='string'||!l.questTitle.trim()||l.questTitle.length>200))throw Error('questTitle');if(l.questSource!==undefined&&!['Kael','Tablica tygodniowa','Kontrakt','Własne zlecenie'].includes(l.questSource))throw Error('questSource');if(l.questTitle===undefined){const q=quests instanceof Map?quests.get(l.id):quests.find(q=>q.id===l.id);if(q&&q.name===l.name&&typeof q.story==='string'&&q.story.trim())Object.assign(l,questRecord(q))}return l}
// Traverse only the already reached canonical path. No raw dialogue, unreached choices, flags, NPC memories or private diaries leave the device.
function reached(nodes,start,state){const locations=new Set(),people=new Set(),choices=[];if(!state)return {locations,people,choices,day:0};let id=start,seen=new Set(),day=0;while(id&&!seen.has(id)){seen.add(id);const n=nodes[id];if(!n)break;const here=id===state.node;const count=here&&!state.finished?Math.min(n.lines.length,state.line):n.lines.length;if(count>0){day=n.day;locations.add(n.location);for(const p of n.speakers.slice(0,count))if(p!=='Narrator')people.add(p)}if(here){if(state.finished){const chosen=n.choices.find(c=>c.flag&&state.flags.includes(c.flag));if(chosen)choices.push(chosen.label)}break;}const c=n.choices.find(c=>c.flag&&state.flags.includes(c.flag))||(n.choices.length&&n.choices.every(c=>c.to===n.choices[0].to)?n.choices[0]:null);if(!c)break;if(c.flag&&state.flags.includes(c.flag))choices.push(c.label);if(c.end)break;id=c.to}return {locations,people,choices,day}}
export function worldContext(d){const a=reached(storyNodes,'arrival',d.storyWorld),b=d.storyWorld?.finished?reached(chapterNodes,'bridge',d.beyond?.chapter):null;const join=(x,y)=>[...new Set([...x,...(y||[])])].join(', ');return 'Poznany świat: '+(a.day?'dzień fabularny '+(b?.day||a.day)+'. Lokacje: '+join(a.locations,b?.locations)+'. Rozmówcy: '+(join(a.people,b?.people)||'brak')+'. Dokonane wybory: '+([...a.choices,...(b?.choices||[])].join('; ')||'brak')+'.':'brak zapisanego postępu kampanii.')+' To stan w chwili tworzenia, nie datowanie dokonań. Nie zmieniaj wydarzeń kanonicznych.'}
export function narrativeSpan(d,week){if(!validWeek(week)||!validDate(d.book?.started))return null;const start=d.book.started,anchor=shiftDate(start,-(new Date(start+'T00:00:00Z').getUTCDay()+6)%7),i=(num(week)-num(anchor))/7;if(i<0||i>9)return null;return {number:i+1,first:i*7+1,last:Math.min(66,i*7+7)}}
export function periodLabel(d,week){const span=narrativeSpan(d,week);return week+' – '+shiftDate(week,6)+(span?' · Tydzień opowieści '+span.number+' (dni narracyjne '+span.first+'–'+span.last+')':'')}
export function buildDraft(d,{week=weekKey(),includeWorld=true,includePrevious=false,templateTitle=()=>null,now=Date.now()}={}){
 if(!validWeek(week)||week>chronKey(now))throw Error('week');
 const end=shiftDate(week,6),span=narrativeSpan(d,week),lines=[`Okres rzeczywisty: ${week} – ${end} (dokonania do chwili tworzenia).`,span?`Osobista opowieść: tydzień ${span.number}, dni narracyjne ${span.first}–${span.last}. To nie dni kampanii autorskiej ani daty ukończenia.`:'Osobista opowieść: niezależny rozdział tygodniowy.'];
 if(includeWorld)lines.push(worldContext(d));
 if(includePrevious){const prev=(d.book?.chapters||[]).filter(c=>(c.sourceWeek||c.week)<week).sort((a,b)=>(b.sourceWeek||b.week).localeCompare(a.sourceWeek||a.week))[0];if(prev)lines.push('Poprzedni zatwierdzony rozdział (fragment; fikcja, nie nowe dokonania): '+short(prev.title,100)+'\n'+short(prev.prose,1800));}
 lines.push('Zapisane ukończone dokonania (wyłącznie te z wybranego tygodnia):');
 const entries=(d.log||[]).filter(l=>Number.isFinite(l.time)&&l.time<=now&&chronKey(l.time)>=week&&chronKey(l.time)<=end&&!l.id.startsWith('origins-award:')&&!l.id.startsWith('report:origins-test-reward-')).sort((a,b)=>a.time-b.time);
 let included=0;for(const l of entries){const m=deedRecord(l,d.quests||[],templateTitle);const line='• '+chronKey(l.time)+' | '+(m.questTitle!==l.name?'„'+short(m.questTitle,200)+'” | ':'')+short(l.name,240)+(m.questSource?' | '+m.questSource:'')+' | '+l.xp+' EXP'+(stats[l.stat]?' · '+stats[l.stat]:'');if(lines.join('\n').length+line.length+100>DRAFT_LIMIT)break;lines.push(line);included++}
 if(!included)lines.push('Brak zapisanych dokonań w tym okresie. Nie oznacza to braku aktywności.');if(included<entries.length)lines.push('Pominięto '+(entries.length-included)+' wpisów z powodu limitu tekstu.');
 return {message:lines.join('\n'),included,total:entries.length};
}
