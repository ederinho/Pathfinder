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
function go(id){if(!Object.hasOwn(locations,id))return;current=id;try{localStorage.setItem('pathfinder-world-location-v1',id)}catch{}render(true)}
function activate(id,tab){
 if(tab){document.querySelector('nav [data-tab="'+tab+'"]').click();if(id==='quests')document.querySelector('[data-jview="quests"]').click();else if(id==='equipment')document.querySelector('[data-cview="equipment"]').click();else if(id==='campaigns'){const c=document.getElementById('campaigns');c.closest('details').open=true;c.scrollIntoView({block:'start'})}else if(id!=='history'&&id!=='profile')document.getElementById(id).click();return;}
 if(openScene(id,service=>{const entry=document.getElementById(service);if(entry&&!entry.disabled)entry.click();else alert('Konsultacja AI jest dostępna w aplikacji Android z uruchomionym backendem.')}))return;const target=document.getElementById(id);if(target&&!target.disabled)target.click();
}
function render(focus=false){
 const loc=locations[current];root.replaceChildren();
 const path=el('div',undefined,'world-breadcrumb');path.append(el('span','ŚWIAT / '+(current==='guild'?'GILDIA':loc.name.toUpperCase())));if(current!=='guild')path.append(button('↶ Gildia',()=>go('guild')));root.append(path);
 const scene=el('section',undefined,'world-scene world-'+current);scene.append(el('div',loc.symbol,'world-symbol'),el('small',loc.kind,'world-kicker'),el('h2',loc.name,'world-title'),el('p',loc.description));root.append(scene);
 if(current==='guild'){const story=readStory(),chapter=el('section',undefined,'world-story');chapter.append(el('small','KAMPANIA AUTORSKA · NIEZALEŻNA OD ŻYCIA','gold'),el('h3','Prolog — Ostatnia Latarnia'),el('p',story.finished?'Prolog ukończony · tajemnica Brzezin czeka.':'Dzień fabularny '+storyNodes[story.node].day+' z 66 · bez limitu realnego czasu.'));if(!story.finished)chapter.append(button(story.node==='arrival'&&story.line===0?'Rozpocznij prolog':'Wznów prolog',()=>openStory(()=>render()),'world-action'));root.append(chapter)}
 const actions=el('section',undefined,'world-actions');if(loc.actions.length){actions.append(el('h3','Co chcesz zrobić?'));for(const [name,id,tab] of loc.actions){const b=button(name,()=>activate(id,tab),'world-action');if(!tab&&!document.getElementById(id)&&!['kaelWorldEntry','oracleWorldEntry'].includes(id)){b.disabled=true;b.title='Dostępne w aplikacji Android';}actions.append(b);}root.append(actions);}
 const routes=el('section',undefined,'world-routes');routes.append(el('h3',current==='guild'?'Dokąd się udasz?':'Dalsza droga'));for(const id of loc.routes){if(id==='road'&&!readStory().finished)continue;const dest=locations[id];const b=button('',()=>go(id),'world-route');b.append(el('span',dest.symbol,'world-route-symbol'),el('span',dest.name),el('span','›','world-arrow'));routes.append(b)}root.append(routes);
 root.append(el('p','Podróż nie zużywa waluty ani czasu fabularnego. Usługi NPC rozliczane są na dotychczasowych zasadach.','muted world-note'));
 if(focus){const h=scene.querySelector('h2');h.tabIndex=-1;h.focus({preventScroll:true});window.scrollTo(0,0)}
}
render();
document.querySelector('nav [data-tab=world]').addEventListener('click',()=>{if(current==='road'&&!readStory().finished)current='guild';render()});
