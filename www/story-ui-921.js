import {readStory,advanceStory} from './app-921.js';
import {storyNodes} from './story-921.js';
import {sceneArtwork} from './awakening-art-921.js';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const btn=(text,fn)=>{const b=el('button',text,'vn-choice');b.type='button';b.onclick=fn;return b};
const d=el('dialog',undefined,'pf-vn pf-story');d.setAttribute('aria-label','Kampania autorska');document.body.append(d);
let busy=false,refresh=null,timer=null;
function stop(){if(timer!==null)clearInterval(timer);timer=null}
function exit(){if(busy)return;stop();d.onclick=null;d.close();d.replaceChildren();refresh?.();refresh=null}
d.addEventListener('cancel',e=>{e.preventDefault();exit()});
function draw(){stop();const s=readStory(),n=storyNodes[s.node];d.dataset.theme=n.theme;d.replaceChildren();const top=el('header',undefined,'vn-top');top.append(el('span','PROLOG · DZIEŃ '+n.day+' / 66','vn-location'),btn('Wróć do świata',exit));const stage=sceneArtwork(n.theme,n.portrait);const panel=el('section',undefined,'vn-panel');const full=s.finished?'Prolog zakończony. Dalszy rozdział nie jest jeszcze dostępny.':n.lines[s.line],line=el('p','','vn-line');line.setAttribute('aria-label',full);panel.append(el('small',n.location,'gold'),el('h2',n.speaker==='Narrator'?'Opowieść':n.speaker,'vn-speaker'),line);const actions=el('div',undefined,'vn-choices'),status=el('p','','muted');status.setAttribute('role','status');const hint=btn('Dotknij, aby pominąć tekst',tap);hint.className='vn-tap-hint';panel.append(actions,hint,status);d.append(top,stage,panel);
 const following=!s.finished&&s.line<n.lines.length-1;let revealed=false,choicesAt=Infinity,shown=0;const units=Array.from(full);
 async function next(i){if(busy)return;busy=true;d.querySelectorAll('button').forEach(b=>b.disabled=true);try{await advanceStory(s,i);draw()}catch{status.textContent='Nie zapisano postępu. Spróbuj ponownie.';d.querySelectorAll('button').forEach(b=>b.disabled=false);hint.disabled=!following}finally{busy=false}}
 function tap(){if(busy)return;if(!revealed){reveal();return}if(following)next(null)}
 d.onclick=e=>{if(e.target.closest('button,a,input,textarea,select,label,[role=button]'))return;tap()};
 function reveal(){if(revealed)return;revealed=true;stop();line.textContent=full;if(following){hint.textContent='Dalej ›';return}hint.textContent=s.finished?'Koniec prologu':'Wybierz odpowiedź';hint.disabled=true;choicesAt=performance.now()+450;if(s.finished)actions.append(btn('Wróć do Gildii',()=>{if(performance.now()>=choicesAt)exit()}));else for(const [i,c] of n.choices.entries())actions.append(btn(c.label,()=>{if(performance.now()>=choicesAt)next(i)}))}
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('fx-off'))reveal();else timer=setInterval(()=>{shown=Math.min(units.length,shown+2);line.textContent=units.slice(0,shown).join('');if(shown>=units.length)reveal()},22);
}
export function openStory(onClose){if(d.open)return;refresh=onClose;draw();d.showModal()}
