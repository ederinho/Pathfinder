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
let mapOpen=true,travelTimer=null;
function canTravel(id){return Object.hasOwn(locations,id)&&(id!=='road'||readStory().finished)}
function motion(){return !window.matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.body.classList.contains('fx-off')}
function cancelTravel(){if(travelTimer!==null)clearTimeout(travelTimer);travelTimer=null;root.classList.remove('world-leaving');root.removeAttribute('aria-busy');root.querySelectorAll('.map-pin').forEach(b=>{b.disabled=b.dataset.locked==='true'})}
function go(id,target){if(!canTravel(id)||travelTimer!==null)return;
 const enter=()=>{cancelTravel();current=id;mapOpen=false;try{localStorage.setItem('pathfinder-world-location-v1',id)}catch{}render(true);if(motion())root.querySelector('.world-scene')?.animate?.([{opacity:.15,transform:'scale(1.045)'},{opacity:1,transform:'scale(1)'}],{duration:380,easing:'cubic-bezier(.2,.65,.2,1)'})};
 if(!motion()||!mapOpen){enter();return}const map=root.querySelector('.world-map');if(map&&target){const r=map.getBoundingClientRect(),b=target.getBoundingClientRect();map.style.transformOrigin=`${b.left+b.width/2-r.left}px ${b.top+b.height/2-r.top}px`};root.setAttribute('aria-busy','true');root.querySelectorAll('.map-pin').forEach(b=>b.disabled=true);root.classList.add('world-leaving');travelTimer=setTimeout(enter,320);
}
function showMap(){cancelTravel();mapOpen=true;if(!canTravel(current))current='guild';render();window.scrollTo(0,0)}
const pins=[['guild',50,23],['hall',25,43],['market',75,43],['archive',23,63],['sanctuary',77,63],['chamber',50,80],['road',50,92]];
function renderMap(){root.replaceChildren();const top=el('div',undefined,'world-breadcrumb');top.append(el('span','ŚWIAT / MAPA'));if(window.Capacitor?.isNativePlatform?.())top.append(button('Połączenie AI',openServerSettings));root.append(top);
 const intro=el('section',undefined,'map-intro');intro.append(el('small','ATLAS WĘDROWCA','gold'),el('h2','Ostatnia Latarnia'),el('p','Wybierz miejsce, do którego chcesz się udać.'));root.append(intro);
 const map=el('section',undefined,'world-map');map.setAttribute('aria-label','Mapa dostępnych lokacji');
 for(const [id,x,y] of pins){const loc=locations[id],locked=!canTravel(id);const b=button('',()=>go(id,b),'map-pin');b.dataset.dest=id;b.dataset.locked=String(locked);b.style.left=x+'%';b.style.top=y+'%';b.disabled=locked;b.append(el('span',locked?'⊘':loc.symbol,'map-symbol'),el('span',loc.name,'map-label'));if(id===current&&!locked)b.append(el('small','Ostatnia wizyta','map-current'));if(locked)b.append(el('small','Po prologu','map-lock'));map.append(b)}root.append(map);
 root.append(el('p','Mapa odkrytej okolicy · podróże nie zużywają czasu ani waluty.','muted world-note'));
}
function activate(id,tab){
 if(tab){document.querySelector('nav [data-tab="'+tab+'"]').click();if(id==='quests')document.querySelector('[data-jview="quests"]').click();else if(id==='equipment')document.querySelector('[data-cview="equipment"]').click();else if(id==='campaigns'){const c=document.getElementById('campaigns');c.closest('details').open=true;c.scrollIntoView({block:'start'})}else if(id!=='history'&&id!=='profile')document.getElementById(id).click();return;}
 if(openScene(id,service=>{const entry=document.getElementById(service);if(entry&&!entry.disabled)entry.click();else alert('Konsultacja AI jest dostępna w aplikacji Android z uruchomionym backendem.')}))return;const target=document.getElementById(id);if(target&&!target.disabled)target.click();
}
function render(focus=false){
 if(mapOpen){renderMap();return}if(!canTravel(current))current='guild';
 const loc=locations[current];root.replaceChildren();
 const path=el('div',undefined,'world-breadcrumb');path.append(el('span','ŚWIAT / '+(current==='guild'?'GILDIA':loc.name.toUpperCase())));path.append(button('↶ Mapa świata',showMap));if(window.Capacitor?.isNativePlatform?.())path.append(button('Połączenie AI',openServerSettings));root.append(path);
 const scene=el('section',undefined,'world-scene world-'+current);scene.append(el('div',loc.symbol,'world-symbol'),el('small',loc.kind,'world-kicker'),el('h2',loc.name,'world-title'),el('p',loc.description));root.append(scene);
 if(current==='guild'){const story=readStory(),chapter=el('section',undefined,'world-story');chapter.append(el('small','KAMPANIA AUTORSKA · NIEZALEŻNA OD ŻYCIA','gold'),el('h3','Prolog — Ostatnia Latarnia'),el('p',story.finished?'Prolog ukończony · tajemnica Brzezin czeka.':'Dzień fabularny '+storyNodes[story.node].day+' z 66 · bez limitu realnego czasu.'));if(!story.finished)chapter.append(button(story.node==='arrival'&&story.line===0?'Rozpocznij prolog':'Wznów prolog',()=>openStory(()=>render()),'world-action'));root.append(chapter)}
 const actions=el('section',undefined,'world-actions');if(loc.actions.length){actions.append(el('h3','Co chcesz zrobić?'));for(const [name,id,tab] of loc.actions){const b=button(name,()=>activate(id,tab),'world-action');if(!tab&&!document.getElementById(id)&&!['kaelWorldEntry','oracleWorldEntry'].includes(id)){b.disabled=true;b.title='Dostępne w aplikacji Android';}actions.append(b);}root.append(actions);}
 root.append(button('↶ Wróć na mapę',showMap,'world-action map-return'));
 root.append(el('p','Podróż nie zużywa waluty ani czasu fabularnego. Usługi NPC rozliczane są na dotychczasowych zasadach.','muted world-note'));
 if(focus){const h=scene.querySelector('h2');h.tabIndex=-1;h.focus({preventScroll:true});window.scrollTo(0,0)}
}
render();
document.querySelector('nav [data-tab=world]').addEventListener('click',showMap);
document.querySelectorAll('nav button:not([data-tab=world])').forEach(b=>b.addEventListener('click',cancelTravel));
