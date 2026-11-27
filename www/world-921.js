import {openServerSettings} from './server-921.js';
// Living World 0.15.0: offline navigation, existing service screens.
import './app-921.js';
import './kael-mock.js';
import './oracle-ui.js';
import {readStory} from './app-921.js';
import {openStory} from './story-ui-921.js';
import {storyNodes} from './story-921.js';
import {openScene} from './vn-921.js';
const locations=Object.freeze({
 guild:{name:'Ostatnia Latarnia',kind:'GILDIA WĘDROWCÓW',symbol:'⚜',description:'Tu Wędrowcy odnajdują zlecenia, zapasy i ludzi gotowych wysłuchać ich opowieści.',routes:['hall','market','sanctuary','archive','chamber','road'],actions:[]},
 hall:{name:'Sala Gildii',kind:'KONTRAKTY I ROZMOWY',symbol:'⚔',description:'Tablica zleceń czeka na tych, którzy chcą obrać kolejny krok. Kael pomaga wyznaczyć zadania na dziś.',routes:['guild'],actions:[['Porozmawiaj z Kaelem','kaelWorldEntry'],['Tablica zleceń','toggleOffers','journal'],['Moje zlecenia','quests','journal']]},
 market:{name:'Kram Rovana',kind:'HANDEL I WYPOSAŻENIE',symbol:'◈',description:'Przyjrzyj się towarom kupca albo sprawdź stan swoich zasobów.',routes:['guild'],actions:[['Odwiedź Rovana','merchantWorldEntry'],['Ekwipunek','equipment','character']]},
 sanctuary:{name:'Sanktuarium Wyroczni',kind:'REFLEKSJA I KAMPANIE',symbol:'◇',description:'Miejsce spokojnej rozmowy o możliwych drogach. Nie każda decyzja wymaga natychmiastowej odpowiedzi.',routes:['guild'],actions:[['Porozmawiaj z Wyrocznią','oracleWorldEntry'],['Osobiste kampanie','campaigns','bestiary']]},
 chamber:{name:'Kwatera Wędrowca',kind:'ODPOCZYNEK',symbol:'☾',description:'Własne miejsce w Ostatniej Latarni. Tutaj nic nie wymaga pośpiechu.',routes:['guild'],actions:[['Postać Wędrowca','profile','character']]},
 road:{name:'Szlak do Brzezin',kind:'TAJEMNICA SZLAKU',symbol:'◇',description:'W oddali droga znika wśród drzew. Dalsza wyprawa będzie częścią kolejnego rozdziału.',routes:['guild'],actions:[]},
 archive:{name:'Archiwum Gildii',kind:'HISTORIA WĘDROWCA',symbol:'▤',description:'Kroniki i opowieści pozwalają spojrzeć wstecz na przebytą drogę.',routes:['guild'],actions:[['Otwórz kronikę','history','history'],['Odwiedź Kronikarza','chroniclerOpen','journal']]}
});
const root=document.getElementById('world');
const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node};
const button=(text,fn,cls)=>{const b=el('button',text,cls);b.type='button';b.addEventListener('click',fn);return b};
let current='guild';
try{const stored=localStorage.getItem('pathfinder-world-location-v1');if(Object.hasOwn(locations,stored)&&(stored!=='road'||readStory().finished))current=stored}catch{}
let mapOpen='region',travelTimer=null;
function canTravel(id){return Object.hasOwn(locations,id)&&(id!=='road'||readStory().finished)}
function motion(){return !window.matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.body.classList.contains('fx-off')&&!document.body.classList.contains('living-battery')}
function cancelTravel(){if(travelTimer!==null)clearTimeout(travelTimer);travelTimer=null;root.classList.remove('world-leaving');root.removeAttribute('aria-busy');root.querySelectorAll('.map-pin').forEach(b=>{b.disabled=b.dataset.locked==='true'})}
function transition(target,enter){if(travelTimer!==null)return;const finish=()=>{cancelTravel();enter();if(motion())root.querySelector('.world-map,.world-scene')?.animate?.([{opacity:.3,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:440,easing:'cubic-bezier(.2,.65,.2,1)'})};if(!motion()||!mapOpen){finish();return}const map=root.querySelector('.world-map');if(map&&target){const r=map.getBoundingClientRect(),b=target.getBoundingClientRect();map.style.transformOrigin=`${b.left+b.width/2-r.left}px ${b.top+b.height/2-r.top}px`};root.setAttribute('aria-busy','true');root.querySelectorAll('.map-pin').forEach(b=>b.disabled=true);root.classList.add('world-leaving');travelTimer=setTimeout(finish,350)}
function remember(id){current=id;try{localStorage.setItem('pathfinder-world-location-v1',id)}catch{}}
function go(id,target){if(!canTravel(id)||travelTimer!==null)return;transition(target,()=>{remember(id);mapOpen=id==='guild'?'town':false;render(true);window.scrollTo(0,0)})}
function showMap(level='region'){cancelTravel();mapOpen=level==='town'?'town':'region';if(!canTravel(current))current='guild';render();window.scrollTo(0,0)}
const regionPins=[['guild',72,34],['road',69,76]];
const townPins=[['hall',28,43],['sanctuary',80,29],['market',80,53],['archive',25,65],['chamber',71,69]];
const iconPaths={guild:'M12 2v20M7 7h10M9 22h6M12 2l-5 5h10zM5 12h14l-2 7H7z',hall:'M4 4l15 15m1-15L5 19M3 15l6 6m6-18l6 6M3 3l4 1-3 3zM21 3l-4 1 3 3z',market:'M12 3v18M4 7h16M5 7l-3 8h6zM19 7l-3 8h6zM7 21h10',sanctuary:'M12 2l8 6H4zM6 10v10m6-10v10m6-10v10M3 22h18',archive:'M12 6Q6 2 3 5v15q5-3 9 0q4-3 9 0V5q-5-3-9 1zm0 0v14',chamber:'M17 3a9 9 0 1 0 4 15 9 9 0 0 1-4-15z',road:'M12 3l7 9-7 9-7-9zM12 8v5m0 3v1',lock:'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4'};
function mapIcon(id){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),p=document.createElementNS(ns,'path');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');p.setAttribute('d',iconPaths[id]);p.setAttribute('fill','none');p.setAttribute('stroke','currentColor');p.setAttribute('stroke-width','1.5');p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round');svg.append(p);return svg}
function renderMap(){root.replaceChildren();const town=mapOpen==='town';const top=el('div',undefined,'atlas-toolbar');if(town)top.append(button('‹ Mapa świata',()=>showMap(),'atlas-back'));else top.append(el('span','ATLAS WĘDROWCA','atlas-eyebrow'));root.append(top);
 const title=el('h2',town?'Ostatnia Latarnia':'Mapa świata','atlas-title');root.append(title);
 const map=el('section',undefined,'world-map atlas-map '+(town?'atlas-town':'atlas-region'));map.setAttribute('aria-label',town?'Mapa Ostatniej Latarni':'Mapa regionu');const art=el('img',undefined,'atlas-art');art.src='./overhaul-art/'+(town?'settlement':'region')+'.webp';art.alt='';art.draggable=false;map.append(art);const effects=el('div',undefined,'atlas-atmosphere');effects.setAttribute('aria-hidden','true');effects.append(el('i',undefined,'atlas-mist'),el('i',undefined,'atlas-beacon'));map.append(effects);
 for(const [id,x,y] of town?townPins:regionPins){const loc=locations[id],locked=!canTravel(id);const b=button('',()=>go(id,b),'map-pin');b.dataset.dest=id;b.dataset.locked=String(locked);b.style.setProperty('--pin-x',String((x-50)/100));b.style.setProperty('--pin-y',String((y-50)/100));b.style.left=x+'%';b.style.top=y+'%';b.disabled=locked;b.setAttribute('aria-label',loc.name+(locked?' — po prologu':''));const mark=el('span',undefined,'map-symbol');mark.append(mapIcon(locked?'lock':id));b.append(mark,el('span',loc.name,'map-label'));if(locked)b.append(el('small','Po prologu','map-lock'));map.append(b)}
 root.append(map);if(town){const story=readStory();if(!story.finished){const chapter=el('div',undefined,'atlas-chapter');chapter.append(el('div','Prolog · dzień '+storyNodes[story.node].day+' / 66','atlas-chapter-title'));chapter.append(button(story.node==='arrival'&&story.line===0?'Rozpocznij prolog':'Wznów prolog',()=>openStory(()=>render()),'atlas-chapter-action'));root.append(chapter)}}
}
function activate(id,tab){
 if(tab){document.querySelector('nav [data-tab="'+tab+'"]').click();if(id==='quests')document.querySelector('[data-jview="quests"]').click();else if(id==='equipment')document.querySelector('[data-cview="equipment"]').click();else if(id==='campaigns'){const c=document.getElementById('campaigns');c.closest('details').open=true;c.scrollIntoView({block:'start'})}else if(id!=='history'&&id!=='profile')document.getElementById(id).click();return;}
 if(openScene(id,service=>{const entry=document.getElementById(service);if(entry&&!entry.disabled)entry.click();else alert('Konsultacja AI jest dostępna w aplikacji Android z uruchomionym backendem.')}))return;const target=document.getElementById(id);if(target&&!target.disabled)target.click();
}
function render(focus=false){
 if(mapOpen){renderMap();return}if(!canTravel(current))current='guild';
 const loc=locations[current];root.replaceChildren();
 const path=el('div',undefined,'world-breadcrumb');path.append(el('span','ŚWIAT / '+(current==='guild'?'GILDIA':loc.name.toUpperCase())));path.append(button(current==='road'?'‹ Mapa świata':'‹ Ostatnia Latarnia',()=>showMap(current==='road'?'region':'town')));root.append(path);
 const scene=el('section',undefined,'world-scene world-'+current);scene.append(el('div',loc.symbol,'world-symbol'),el('small',loc.kind,'world-kicker'),el('h2',loc.name,'world-title'),el('p',loc.description));root.append(scene);
 if(current==='guild'){const story=readStory(),chapter=el('section',undefined,'world-story');chapter.append(el('small','KAMPANIA AUTORSKA · NIEZALEŻNA OD ŻYCIA','gold'),el('h3','Prolog — Ostatnia Latarnia'),el('p',story.finished?'Prolog ukończony · tajemnica Brzezin czeka.':'Dzień fabularny '+storyNodes[story.node].day+' z 66 · bez limitu realnego czasu.'));if(!story.finished)chapter.append(button(story.node==='arrival'&&story.line===0?'Rozpocznij prolog':'Wznów prolog',()=>openStory(()=>render()),'world-action'));root.append(chapter)}
 const actions=el('section',undefined,'world-actions');if(loc.actions.length){actions.append(el('h3','Co chcesz zrobić?'));for(const [name,id,tab] of loc.actions){const b=button(name,()=>activate(id,tab),'world-action');if(!tab&&!document.getElementById(id)&&!['kaelWorldEntry','oracleWorldEntry'].includes(id)){b.disabled=true;b.title='Dostępne w aplikacji Android';}actions.append(b);}root.append(actions);}
 root.append(button('‹ Wróć na mapę',()=>showMap(current==='road'?'region':'town'),'world-action map-return'));
 root.append(el('p','Podróż nie zużywa waluty ani czasu fabularnego. Usługi NPC rozliczane są na dotychczasowych zasadach.','muted world-note'));
 if(focus){const h=scene.querySelector('h2');h.tabIndex=-1;h.focus({preventScroll:true});window.scrollTo(0,0)}
}
const settings=document.getElementById('settingsDialog');const aiSettings=document.getElementById('cinematicAISettings');if(window.Capacitor?.isNativePlatform?.()){aiSettings.hidden=false;aiSettings.onclick=()=>{settings.close();openServerSettings()}}
render();
document.querySelector('nav [data-tab=world]').addEventListener('click',()=>showMap());
document.querySelectorAll('nav button:not([data-tab=world])').forEach(b=>b.addEventListener('click',cancelTravel));
