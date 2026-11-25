
const stats=['Siła','Wytrzymałość','Wiedza','Dyscyplina','Sport','Organizacja','Relacje','Komunikacja','Zdrowie psychiczne','Gotowanie','Adaptacja','Szczęście'];
const types={main:'Zadania główne',side:'Zadania poboczne',daily:'Zadania codzienne',contract:'Kontrakty'};
function day(t=Date.now()){return new Date(t).toLocaleDateString('pl-PL')}
function allocation(l,i){let a=[l.stat,...l.extra],k=a.indexOf(i);return k<0?0:Math.floor(l.xp/a.length)+(k<l.xp%a.length?1:0)}
function chronKey(t){let d=new Date(t);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function chronMetrics(log,now=new Date()){let days=new Set(log.map(l=>chronKey(l.time))),d=new Date(now);if(!days.has(chronKey(d)))d.setDate(d.getDate()-1);let streak=0;while(days.has(chronKey(d))){streak++;d.setDate(d.getDate()-1)}let best=0,run=0,prev=null;for(let k of [...days].sort()){let t=new Date(k+'T12:00:00');t.setDate(t.getDate()-1);run=chronKey(t)===prev?run+1:1;best=Math.max(best,run);prev=k}return {days:days.size,streak,best}}
const ascClasses=[['Żelazny strażnik',0,1],['Strażnik wiedzy',2,3],['Mistrz alchemii',9,2],['Mistrz gildii',5,7],['Leśny zwiadowca',4,1],['Opiekun ogniska',6,8],['Wędrowiec losu',10,11]];
const ascGear=['Ostrze strażnika','Płaszcz wytrwałości','Księga run','Pieczęć dyscypliny','Buty zwiadowcy','Mapa gildii','Amulet więzi','Sygnet posłańca','Latarnia równowagi','Zestaw alchemika','Kompas przemian','Talizman losu'];
function ascState(values,total){let ranked=ascClasses.map(([name,a,b])=>({name,score:Math.min(values[a],values[b]),sum:values[a]+values[b],a,b})).sort((a,b)=>b.score-a.score||b.sum-a.sum);let best=ranked[0];return {className:best.score>=100?best.name:'Wędrowiec',best,stage:total>=2400?'Legenda':total>=900?'Weteran':total>=400?'Adept':'Nowicjusz',gear:values.map((xp,i)=>({name:ascGear[i],xp,stat:stats[i],tier:xp>=1000?3:xp>=500?2:xp>=100?1:0})),titles:[[100,'Pierwsze kroki'],[400,'Poszukiwacz przygód'],[900,'Weteran szlaku'],[2400,'Legenda gildii']].map(([xp,name])=>({xp,name,unlocked:total>=xp}))}}
function canonical(s){return s.trim().toLocaleLowerCase('pl').replace(/\s+/g,' ')}

export { stats, types, day, allocation, chronKey, chronMetrics, ascClasses, ascState, canonical };
