import {chronKey} from './core-921.js';
// Calendar-day windows, not rolling 24-hour windows. Never mutate the save.
export function chronicleRange(items,range,selected,now=new Date()){
 const start=new Date(now);start.setHours(0,0,0,0);start.setDate(start.getDate()-(range-1));
 return items.filter(x=>Number.isFinite(x.time)&&(selected?chronKey(x.time)===selected:x.time>=+start&&x.time<=+now));
}
const passages=[
 'W kuźni wytrwałości kolejna próba została dopełniona. Każdy taki wysiłek jest ogniwem w hartowaniu siły.',
 'Szlak przyjął kolejny krok wędrowca. Wytrwałość rodzi się z drogi, nie z samych obietnic.',
 'W księgach Akademii przybył kolejny rozdział. Wiedza pozostaje światłem na nieznanych szlakach.',
 'Strażnik przysięgi odnotował wykonane zadanie. Z małych postanowień buduje się wielkie dzieła.',
 'Na placu prób gildii zamknięto kolejne wyzwanie. Kunszt rozwija się poprzez praktykę, nie przez samą sławę.',
 'Archiwista gildii dopisał kolejny znak do rejestru. Uporządkowane sprawy otwierają drogę dalszym wyprawom.',
 'Przy ognisku gildii zapisano kolejny rozdział więzi. Żaden szlak nie musi być samotny.',
 'W księdze posłańców zapisano dokonanie. Słowo i porozumienie są narzędziami równie ważnymi jak ostrze.',
 'W schronieniu wędrowca odnotowano krok ku trosce o siebie. Na szlaku jest miejsce również na odpoczynek.',
 'W księdze alchemików przybyła kolejna praktyka. Kunszt rodzi się z cierpliwości i doświadczenia.',
 'Na mapie przemian pojawił się kolejny znak. Wędrowiec nie musi zawsze podążać tą samą drogą.',
 'Kronikarz odnotował uśmiech losu. Nie wszystkie dary szlaku można zaplanować.'
];
export function entryNarrative(l){
 if(l.id.startsWith('origins-award:')||l.id.startsWith('report:origins-test-reward-'))return 'Do księgi wpisano dziedzictwo sprzed rozpoczęcia podróży. Jest to nagroda za pochodzenie, a nie nowe wydarzenie.';
 if(l.id.startsWith('ritual:'))return 'Rytuał został dopełniony. W codziennym rytmie wędrowiec znalazł kolejny kamień pod fundament swojej drogi.';
 if(l.id.startsWith('report:'))return 'Kronikarz zapisał to dokonanie na podstawie przyjętej opowieści. Pełny rozdział znajduje się w księdze opowieści.';
 return passages[l.stat]||'W księdze gildii odnotowano wykonane zadanie. Kolejny rozdział wędrówki został zapisany.';
}
export function renderChronicle(root,data,ui,h){
 const {el,action,stats,allocation,chronMetrics,day,redraw,questTitle}=h;
 const now=new Date(), todayKey=chronKey(now),log=data.log||[],reports=data.reports||[],events=data.consequences||[],byDay=new Map();
 for(const l of log){const k=chronKey(l.time);if(!byDay.has(k))byDay.set(k,[]);byDay.get(k).push(l)}
 const today=byDay.get(todayKey)||[],sum=ls=>ls.reduce((n,l)=>n+l.xp,0),m=chronMetrics(log.filter(l=>l.time<=+now),now);
 const fmt=d=>d.toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'}), date=t=>fmt(new Date(t));
 root.replaceChildren();
 const hero=el('section',undefined,'chron-hero'),flame=el('span','✦','chron-flame');flame.setAttribute('aria-hidden','true');
 hero.append(el('small','AKTUALNA SERIA','chron-kicker'),flame,el('strong',String(m.streak),'chron-streak'),el('span',m.streak===1?'dzień aktywności':'dni aktywności','chron-streak-label'),el('p','Dziś: +'+sum(today)+' EXP','chron-today'),el('small','Rekord: '+m.best+' · Dni aktywności: '+m.days,'muted'));root.append(hero);
 function fold(key,title,build){const d=el('details',undefined,'chron-fold');d.append(el('summary',title));d.open=ui.open.has(key);let body=el('div',undefined,'chron-fold-body');d.append(body);let built=false;const fill=()=>{if(!built){build(body);built=true}};if(d.open)fill();d.ontoggle=()=>{if(d.open){ui.open.add(key);fill()}else ui.open.delete(key)};return d}
 const ls=chronicleRange(log,ui.range,null,now);
 const panel=el('section',undefined,'chron-growth');panel.append(el('h3','Rozwój bohatera'));
 const controls=el('div',undefined,'chron-ranges');
 for(const [n,label] of [[1,'Dziś'],[3,'3 dni'],[7,'Tydzień'],[30,'Miesiąc']]){const selected=ui.range===n,b=action(label,()=>{ui.range=n;redraw()},selected?'primary':'');b.setAttribute('aria-pressed',String(selected));controls.append(b)}
 const start=new Date(now);start.setDate(start.getDate()-(ui.range-1));
 panel.append(controls,el('p',ui.range===1?fmt(now):fmt(start)+' – '+fmt(now),'chron-period'),el('p','+'+sum(ls)+' EXP · '+ls.length+' aktywności','gold'));
 const values=stats.map((s,i)=>[s,ls.reduce((a,l)=>a+allocation(l,i),0)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]),max=Math.max(1,...values.map(x=>x[1]));
 for(const [name,x] of values){let line=el('div',undefined,'chron-line'),row=el('div',undefined,'chron-value'),track=el('div',undefined,'chron-track'),fill=el('div');row.append(el('span',name),el('strong',x+' EXP'));fill.style.width=(100*x/max)+'%';track.append(fill);line.append(row,track);panel.append(line)}if(!values.length)panel.append(el('p','Ten rozdział czeka na pierwsze dokonanie.','muted'));
 root.append(panel);
 const historyFilter=items=>items.filter(x=>Number.isFinite(x.time)&&x.time<=+now&&(!ui.selected||chronKey(x.time)===ui.selected));
 const hs=historyFilter(log),rs=historyFilter(reports),es=historyFilter(events);
 root.append(fold('calendar','Kalendarz wędrówki',body=>{
 const head=el('div',undefined,'chron-cal-head'),shift=n=>{const d=new Date(ui.year,ui.month+n,1);ui.year=d.getFullYear();ui.month=d.getMonth();redraw()};
 head.append(action('‹',()=>shift(-1)),el('strong',new Date(ui.year,ui.month,1).toLocaleDateString('pl-PL',{month:'long',year:'numeric'})),action('›',()=>shift(1)));head.firstChild.setAttribute('aria-label','Poprzedni miesiąc');head.lastChild.setAttribute('aria-label','Następny miesiąc');body.append(head);
 const grid=el('div',undefined,'chron-calendar new-calendar'),marked=new Set([...reports,...events].map(x=>chronKey(x.time)));
 for(const n of ['Pn','Wt','Śr','Cz','Pt','So','Nd'])grid.append(el('small',n));let offset=(new Date(ui.year,ui.month,1).getDay()+6)%7;for(let i=0;i<offset;i++)grid.append(el('span'));
 for(let i=1;i<=new Date(ui.year,ui.month+1,0).getDate();i++){const k=chronKey(new Date(ui.year,ui.month,i)),items=byDay.get(k)||[],xp=sum(items),b=action(String(i),()=>{ui.selected=k;ui.limit=20;redraw()},'chron-day');b.classList.toggle('active-day',items.length>0||marked.has(k));b.classList.toggle('today-day',k===todayKey);b.classList.toggle('selected-day',k===ui.selected);b.append(el('small',items.length?String(xp):marked.has(k)?'✦':'·'));b.setAttribute('aria-label',k+' · '+xp+' EXP'+(marked.has(k)?' · wpis w kronice':''));b.setAttribute('aria-pressed',String(k===ui.selected));grid.append(b)}body.append(grid,action('Bieżący miesiąc',()=>{ui.year=now.getFullYear();ui.month=now.getMonth();ui.selected=null;ui.limit=20;redraw()}),el('small','Złoty ślad oznacza wpis. Wybierz dzień, aby przefiltrować opowieści i dokonania.','muted'));
 }));
 if(ui.selected){const row=el('div',undefined,'chron-filter');row.append(el('span','Archiwum: '+ui.selected),action('Wszystkie dni',()=>{ui.selected=null;ui.limit=20;redraw()}));root.append(row)}else root.append(el('small','Archiwum · wszystkie dni','muted'));
 root.append(fold('stories','Opowieści Kronikarza · '+rs.length,body=>{
 if(!rs.length)body.append(el('p','Brak opowieści w tym okresie.','muted'));
 for(const [i,r] of [...rs].sort((a,b)=>b.time-a.time).entries()){
 const storyKey='story:'+r.id, title='Rozdział '+String(rs.length-i).padStart(2,'0')+' · '+date(r.time);
 body.append(fold(storyKey,title,content=>{const a=el('article',undefined,'chron-story');a.append(el('small','ZAPIS KRONIKARZA','chron-kicker'),el('h3','Opowieść wędrowca'),el('div',undefined,'chron-ornament'));for(const para of r.story.split(/\n\s*\n/).filter(x=>x.trim()))a.append(el('p',para,'chron-prose'));const earned=log.filter(l=>l.id.startsWith('report:'+r.id+':'));if(earned.length)a.append(el('p','Rozliczenie raportu: +'+sum(earned)+' EXP','chron-reward'));content.append(a)}));
 }
 }));
 root.append(fold('deeds','Księga dokonań · '+(hs.length+es.length),body=>{
 const items=[...hs.map(l=>({l,time:l.time})),...es.map(e=>({e,time:e.time}))].sort((a,b)=>b.time-a.time);
 if(!items.length)body.append(el('p','Brak zapisanych dokonań.','muted'));
 let visible=0;const list=el('div',undefined,'chron-deeds');const more=action('Pokaż więcej',()=>{ui.limit+=20;appendMore()});const appendMore=()=>{for(;visible<Math.min(ui.limit,items.length);visible++){const {l,e,time}=items[visible],a=el('article',undefined,'chron-deed');a.append(el('small',date(time),'chron-kicker'));if(l){a.append(el('h3',questTitle(l)),el('p',entryNarrative(l),'chron-prose'));if(questTitle(l)!==l.name)a.append(el('small','Dokonanie: '+l.name,'muted'));a.append(el('p',[l.stat,...(l.extra||[])].map(i=>stats[i]+' +'+allocation(l,i)).join(' · '),'chron-attributes'),el('strong','+'+l.xp+' EXP'+(l.withheld?' · potrącono '+l.withheld+' EXP':''),'chron-reward'))}else a.append(el('h3',e.name),el('p',e.cancelled?'Przysięga została rozwiązana. Kronikarz zamknął ten kontrakt bez kary.':'Noc zamknęła niedopełnioną przysięgę. Nowy dzień przynosi kolejną szansę.','chron-prose'),el('small',e.cancelled?'Anulowano bez kary':'Dług gildii: '+e.penalty+' EXP','muted'));list.append(a)}more.hidden=visible>=items.length};body.append(list,more);appendMore();
 }));
 root.append(el('p','Opisy dokonań są lokalną stylizacją fabularną. Pełne opowieści pochodzą z zaimportowanych raportów.','chron-footnote'));
}
