// Shared consultation scene primitives. No transport, persistence or rewards.
import {sceneArtwork} from './awakening-art-921.js';
import {dialoguePages,dialogueIcon,KAEL_REVEAL_MS} from './dialogue-pilot-921.js';
export const personas={
 kael:{name:'Kael',location:'Ostatnia Latarnia · Sala Gildii',theme:'hall',greeting:'Zanim ruszysz w drogę, wybierz jeden krok, któremu naprawdę możesz podołać.',choices:['Pomóż mi wybrać najważniejsze zadanie.','Chcę ruszyć z miejsca, choć trudno mi zacząć.','Mam trochę czasu. Znajdźmy sensowny kontrakt.']},
 oracle:{name:'Wyrocznia',location:'Ostatnia Latarnia · Sanktuarium',theme:'sanctuary',greeting:'Nie widzę twojej przyszłości. Mogę jednak pomóc ci dostrzec drogi, których jeszcze nie rozważyłeś.',choices:['Chcę lepiej zrozumieć, czego potrzebuję.','Pomóż mi rozważyć dwie możliwe drogi.','Chcę zastanowić się nad swoim długofalowym celem.']}
};
export function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
export function button(text,fn,cls){const b=node('button',text,cls);b.type='button';b.onclick=fn;return b}
export function setupScene(d,npc){const p=personas[npc];d.classList.add('lc-scene');if(npc==='kael')d.classList.add('pf-dialog-pilot');d.dataset.theme=p.theme;const stage=sceneArtwork(p.theme,npc);stage.classList.add('lc-stage');return stage}
export function heading(npc,close){const p=personas[npc],h=node('header',undefined,'lc-heading'),text=node('div');text.append(node('small',p.location),node('h3',p.name));if(npc==='kael'){close.classList.add('pilot-exit');close.textContent='Wyjdź';close.setAttribute('aria-label','Opuść rozmowę i wróć do świata')}h.append(text,close);return h}
const timers=new WeakMap();
export function reveal(line,text,skip,slow=false){stopReveal(line);line.textContent=text;line.setAttribute('aria-label',text);skip.hidden=true;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('fx-off')||document.body.classList.contains('living-battery'))return;
 const chars=Array.from(text);let n=0;line.textContent='';skip.hidden=false;function finish(){stopReveal(line);line.textContent=text;skip.hidden=true}skip.onclick=finish;const id=setInterval(()=>{if(!line.isConnected){stopReveal(line);return}n=Math.min(n+(slow?1:5),chars.length);line.textContent=chars.slice(0,n).join('');if(n===chars.length)finish()},slow?KAEL_REVEAL_MS:20);timers.set(line,id);
}
export function stopReveal(line){const id=timers.get(line);if(id!==undefined)clearInterval(id);timers.delete(line)}
export function speech(npc,text,animate=false){
 const a=node('article',undefined,'lc-speech'),line=node('p',text,'lc-line'),skip=button('Pokaż całą wypowiedź',()=>{},'lc-skip');skip.hidden=true;a.append(node('small',personas[npc].name,'lc-speaker'),line,skip);
 if(npc!=='kael'){if(animate)queueMicrotask(()=>{if(line.isConnected)reveal(line,text,skip)});return a;}
 const pages=dialoguePages(text,160);let page=0;const nav=node('div',undefined,'pilot-page-nav'),prev=button('‹ Wstecz',()=>show(page-1),'pilot-page-button'),next=button('Dalej ›',()=>show(page+1),'pilot-page-button'),counter=node('span','');nav.append(prev,counter,next);if(pages.length>1)a.append(nav);
 function show(index,animated=true){if(index<0||index>=pages.length)return;stopReveal(line);page=index;prev.disabled=page===0;next.disabled=page===pages.length-1;counter.textContent=(page+1)+' / '+pages.length;line.textContent=pages[page];line.setAttribute('aria-label',pages[page]);skip.hidden=true;if(animated)reveal(line,pages[page],skip,true);}
 show(0,false);if(animate)queueMicrotask(()=>{if(line.isConnected)show(0,true)});return a;
}
export function quickReplies(npc,input,onEdit=()=>{}){const box=node('div',undefined,'lc-choices');for(const choice of personas[npc].choices){const b=button(choice,()=>{if(input.disabled)return;if(input.value.trim()&&input.value!==choice&&!confirm('Zastąpić obecną odpowiedź?'))return;input.value=choice;onEdit(choice);input.focus()},'lc-choice');if(npc==='kael')b.dataset.pilotIcon=dialogueIcon(choice);box.append(b)}return box}
// An approved personal chapter is only copied into the editable message on request.
// The whole quoted excerpt remains visible before send. No implicit context sharing.
export function chapterDraft(title,prose,existing,max){if(typeof title!=='string'||typeof prose!=='string'||!prose.trim())return null;const prefix=(existing.trim()?existing.trim()+'\n\n':'')+'Fragment zatwierdzonej osobistej opowieści (fikcja, nie nowe fakty): '+title+' — ';const room=max-prefix.length;if(room<40)return null;return prefix+prose.slice(0,Math.min(room,400));}
export function chapterButton(input,chapter,onEdit=()=>{}){const b=button('Przywołaj fragment ostatniego rozdziału',()=>{const c=chapter();if(!c)return;const next=chapterDraft(c.title,c.prose,input.value,input.maxLength);if(!next){alert('Brak miejsca na fragment. Skróć swoją wiadomość.');return}input.value=next;onEdit(next);input.focus()},'lc-choice');b.dataset.pilotIcon='book';b.disabled=!chapter();return b}
export function fold(title,...children){const d=node('details',undefined,'lc-fold');d.append(node('summary',title),...children);return d}
