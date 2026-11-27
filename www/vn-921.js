import {sceneArtwork} from './awakening-art-921.js';
import {readStory,recordEncounter} from './app-921.js';
import {scenes} from './vn-scenes-921.js';
import {initialCursor,advance,choose} from './vn-state-921.js';
const key='pathfinder-vn-position-v1';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const btn=(text,fn,cls)=>{const b=el('button',text,cls);b.type='button';b.onclick=fn;return b};
let active=null,cursor=null,timer=null,full='',shown=0,units=[],launch=null,ending=false;
const d=el('dialog',undefined,'pf-vn');d.id='pfVisualNovel';d.setAttribute('aria-label','Rozmowa fabularna');document.body.append(d);
function read(id){try{return JSON.parse(localStorage.getItem(key)||'{}')[id]}catch{return null}}
function save(clear=false){if(!active)return;try{let data=JSON.parse(localStorage.getItem(key)||'{}');if(!data||typeof data!=='object'||Array.isArray(data))data={};if(clear)delete data[active];else data[active]=cursor;localStorage.setItem(key,JSON.stringify(data))}catch{}}
function stop(){if(timer!==null)clearInterval(timer);timer=null}
function exit(clear=false){if(ending)return;stop();save(clear);if(d.open)d.close();active=null;cursor=null;launch=null;d.replaceChildren()}
d.addEventListener('cancel',e=>{e.preventDefault();exit()});
function render(){
 stop();const s=scenes[active],n=s.nodes[cursor.node];save();d.dataset.theme=s.theme;d.replaceChildren();
 const top=el('header',undefined,'vn-top');top.append(el('span',s.location,'vn-location'),btn('Wróć do świata',()=>exit(),'vn-exit'));
 const stage=sceneArtwork(s.theme,s.portrait);
 const panel=el('section',undefined,'vn-panel');const title=el('h2',s.name,'vn-speaker');const line=el('p','','vn-line');line.setAttribute('aria-label',n.lines[cursor.line]);const actions=el('div',undefined,'vn-choices');
 const known=readStory().encounters[s.npc]>0;full=known&&cursor.node===s.start&&cursor.line===0&&s.returning?s.returning:n.lines[cursor.line];line.setAttribute('aria-label',full);units=Array.from(full);shown=0;const next=btn('Pokaż cały tekst',()=>{if(shown<units.length){reveal();return}const c=advance(s,cursor);if(c){cursor=c;render()}},'vn-next');
 function reveal(){stop();shown=units.length;line.textContent=full;actions.replaceChildren();if(advance(s,cursor)){next.textContent='Dalej ›';actions.append(next)}else{n.choices.forEach((v,i)=>{const b=btn(v.label,async()=>{if(ending||!cursor)return;const r=choose(s,cursor,i);if(!r)return;if(r.cursor){cursor=r.cursor;render()}else if(r.end||r.service){const cb=launch;const npc=s.npc;ending=true;d.querySelectorAll('button').forEach(x=>x.disabled=true);try{if(npc)await recordEncounter(npc)}catch{}finally{ending=false}exit(true);if(r.service)cb?.(r.service)}},'vn-choice');actions.append(b)})}}
 panel.append(title,line,actions);d.append(top,stage,panel);actions.append(next);
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)reveal();else timer=setInterval(()=>{shown=Math.min(units.length,shown+2);line.textContent=units.slice(0,shown).join('');if(shown>=units.length)reveal()},22);
}
export function openScene(id,service){if(!Object.hasOwn(scenes,id)||d.open)return false;active=id;launch=service;cursor=initialCursor(scenes[id],read(id));render();d.showModal();return true}
