import {readStory,advanceStory} from './app-921.js';
import {storyNodes} from './story-921.js';
import {sceneArtwork} from './awakening-art-921.js';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const btn=(text,fn)=>{const b=el('button',text,'vn-choice');b.type='button';b.onclick=fn;return b};
const d=el('dialog',undefined,'pf-vn pf-story');d.setAttribute('aria-label','Kampania autorska');document.body.append(d);
let busy=false,refresh=null;
function exit(){if(busy)return;d.close();d.replaceChildren();refresh?.();refresh=null}
d.addEventListener('cancel',e=>{e.preventDefault();exit()});
function draw(){const s=readStory(),n=storyNodes[s.node];d.dataset.theme=n.theme;d.replaceChildren();const top=el('header',undefined,'vn-top');top.append(el('span','PROLOG · DZIEŃ '+n.day+' / 66','vn-location'),btn('Wróć do świata',exit));const stage=sceneArtwork(n.theme,n.portrait);const panel=el('section',undefined,'vn-panel');panel.append(el('small',n.location,'gold'),el('h2',n.speaker==='Narrator'?'Opowieść':n.speaker,'vn-speaker'),el('p',s.finished?'Prolog zakończony. Dalszy rozdział nie jest jeszcze dostępny.':n.lines[s.line],'vn-line'));const actions=el('div',undefined,'vn-choices'),status=el('p','','muted');status.setAttribute('role','status');panel.append(actions,status);d.append(top,stage,panel);
 async function next(i){if(busy)return;busy=true;d.querySelectorAll('button').forEach(b=>b.disabled=true);try{await advanceStory(s,i);draw()}catch{status.textContent='Nie zapisano postępu. Spróbuj ponownie.';d.querySelectorAll('button').forEach(b=>b.disabled=false)}finally{busy=false}}
 if(s.finished)actions.append(btn('Wróć do Gildii',exit));else if(s.line<n.lines.length-1)actions.append(btn('Dalej ›',()=>next(null)));else for(const [i,c] of n.choices.entries())actions.append(btn(c.label,()=>next(i)));
}
export function openStory(onClose){if(d.open)return;refresh=onClose;draw();d.showModal()}
