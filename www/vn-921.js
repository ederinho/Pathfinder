import {replacePortrait} from './visual-assets-v01.js';
import {sceneArtwork} from './awakening-art-921.js';
import {readStory,readBeyond,recordEncounter} from './app-921.js';
import {scenes} from './vn-scenes-921.js';
import {initialCursor,advance,choose} from './vn-state-921.js';
import {kaelEntrance,dialoguePages,dialogueIcon,KAEL_REVEAL_MS} from './dialogue-pilot-921.js';
const key='pathfinder-vn-position-v1';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const btn=(text,fn,cls)=>{const b=el('button',text,cls);b.type='button';b.onclick=fn;return b};
let active=null,cursor=null,timer=null,full='',shown=0,units=[],launch=null,ending=false,entrance=[],entranceIndex=null,pageIndex=0;
const d=el('dialog',undefined,'pf-vn');d.id='pfVisualNovel';d.setAttribute('aria-label','Rozmowa fabularna');document.body.append(d);
function read(id){try{return JSON.parse(localStorage.getItem(key)||'{}')[id]}catch{return null}}
function save(clear=false){if(!active)return;try{let data=JSON.parse(localStorage.getItem(key)||'{}');if(!data||typeof data!=='object'||Array.isArray(data))data={};if(clear)delete data[active];else data[active]=cursor;localStorage.setItem(key,JSON.stringify(data))}catch{}}
function stop(){if(timer!==null)clearInterval(timer);timer=null}
function exit(clear=false){if(ending)return;stop();d.onclick=null;save(clear);if(d.open)d.close();active=null;cursor=null;launch=null;entrance=[];entranceIndex=null;pageIndex=0;d.replaceChildren()}
d.addEventListener('cancel',e=>{e.preventDefault();exit()});
function render(){
 stop();const s=scenes[active],n=s.nodes[cursor.node],pilot=active==='kaelWorldEntry',introducing=pilot&&entranceIndex!==null;save();d.classList.toggle('pf-dialog-pilot',pilot);d.dataset.theme=s.theme;const previousStage=d.querySelector('.vn-stage');
 const top=el('header',undefined,'vn-top'),leave=btn('Wróć do świata',()=>exit(),'vn-exit');if(pilot){leave.textContent='Wyjdź';leave.setAttribute('aria-label','Opuść rozmowę i wróć do świata')}top.append(el('span',s.location,'vn-location'),leave);
 const portrait=introducing?null:s.portrait,sceneKey=s.theme+':'+portrait;const stage=previousStage?.dataset.sceneKey===sceneKey?previousStage:sceneArtwork(s.theme,portrait);
 if(stage!==previousStage && pilot && portrait==='kael')replacePortrait(stage,'kael');
 stage.dataset.sceneKey=sceneKey;
 const panel=el('section',undefined,'vn-panel');panel.classList.toggle('pilot-narrator',introducing);const title=el('h2',introducing?'Narrator':s.name,'vn-speaker');const line=el('p','','vn-line');line.setAttribute('aria-label',n.lines[cursor.line]);const actions=el('div',undefined,'vn-choices');actions.setAttribute('aria-label','Odpowiedzi');
 const count=readStory().encounters[s.npc]||0,known=count>0;full=known&&cursor.node===s.start&&cursor.line===0&&s.returning?s.returning:n.lines[cursor.line];if(active==='kaelWorldEntry'&&cursor.node===s.start&&cursor.line===0&&readBeyond().chapter.finished)full='Witaj z powrotem. Wieści z Brzezin dotarły do Gildii. Dobrze, że mieszkańcy mogą znów liczyć dni.';if(introducing)full=entrance[entranceIndex];const pages=pilot?dialoguePages(full):[full];pageIndex=Math.min(pageIndex,pages.length-1);full=pages[pageIndex];line.setAttribute('aria-label',full);units=Array.from(full);shown=0;
 let revealed=false,choicesAt=Infinity;const morePages=pageIndex+1<pages.length;const following=morePages||introducing?true:advance(s,cursor);
 const hint=btn('Dotknij, aby pominąć tekst',tap,'vn-tap-hint');
 function tap(){if(ending||!cursor)return;if(!revealed){reveal();return}if(following){if(morePages){pageIndex++}else{pageIndex=0;if(introducing){entranceIndex=entranceIndex+1<entrance.length?entranceIndex+1:null}else{cursor=following}}render()}}
 d.onclick=e=>{if(e.target.closest('button,a,input,textarea,select,label,[role=button]'))return;tap()};
 function reveal(){if(revealed)return;revealed=true;stop();shown=units.length;line.textContent=full;actions.replaceChildren();if(following){hint.textContent=pilot&&morePages?'Dalej · '+(pageIndex+1)+'/'+pages.length+' ›':'Dalej ›'}else{hint.textContent='Wybierz odpowiedź';hint.disabled=true;choicesAt=performance.now()+450;n.choices.forEach((v,i)=>{if(v.requires&&count<v.requires)return;const b=btn(v.label,async()=>{if(ending||!cursor||performance.now()<choicesAt)return;const r=choose(s,cursor,i);if(!r)return;if(r.cursor){cursor=r.cursor;pageIndex=0;render()}else if(r.end||r.service){const cb=launch;const npc=s.npc;ending=true;d.querySelectorAll('button').forEach(x=>x.disabled=true);try{if(npc)await recordEncounter(npc)}catch{}finally{ending=false}exit(true);if(r.service)cb?.(r.service)}},'vn-choice');if(pilot){b.dataset.pilotIcon=v.end?'exit':dialogueIcon(v.label);if(v.end)b.classList.add('pilot-end');}actions.append(b)})}}
 panel.append(title,line,actions,hint);if(introducing)panel.append(btn('Pomiń wprowadzenie',()=>{entranceIndex=null;pageIndex=0;render()},'pilot-skip-intro'));d.replaceChildren(top,stage,panel);d.scrollTop=0;
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||(document.body.classList.contains('fx-off')||document.body.classList.contains('living-battery')))reveal();else timer=setInterval(()=>{shown=Math.min(units.length,shown+(pilot?1:2));line.textContent=units.slice(0,shown).join('');if(shown>=units.length)reveal()},pilot?KAEL_REVEAL_MS:22);
}
export function openScene(id,service){if(!Object.hasOwn(scenes,id)||d.open)return false;active=id;launch=service;cursor=initialCursor(scenes[id],read(id));entrance=[];entranceIndex=null;pageIndex=0;if(id==='kaelWorldEntry'&&cursor.node===scenes[id].start&&cursor.line===0){entrance=kaelEntrance((readStory().encounters[scenes[id].npc]||0)>0);entranceIndex=0}render();d.showModal();return true}
