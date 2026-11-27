// Local, authored scene introductions. No new quest, encounter or AI accounting.
const first=Object.freeze([
 'Próg Sali Gildii jest nierówny. Kamień pod drzwiami wytarły buty setek wędrowców; głęboki ślad biegnie przez jego środek, jak ścieżka, której nie zaznaczono na żadnej mapie. Kiedy zamykasz drzwi, odgłos wiatru z zewnątrz przygasa.',
 'Wewnątrz światło sączy się przez wysokie, zamglone okno. W powietrzu unosi się zapach popiołu i wilgotnego drewna. Na ławie leży zwinięty płaszcz, obok para rękawic suszy się przy dogasającym ogniu. Ktoś naprawił pęknięcie w stole żelazną klamrą, zamiast wyrzucić cały mebel.',
 'Pod ścianą stoją stare regały. Niektóre księgi utraciły okładki; na ich grzbietach wiszą sznurki, by luźne kartki nie rozsypały się przy otwieraniu. Obok mapy ktoś zostawił mały worek z monetami i notatkę o potrzebnych zapasach.',
 'Na tablicy wisi kilka pergaminów. Nie ma na nich wystawnych obietnic ani długich tytułów. Są terminy, krótkie opisy pracy, pieczęcie i nazwiska ludzi, którzy potrzebują pomocy. W miejscu jednego z odpiętych zleceń pozostał tylko wbity w drewno gwóźdź.',
 'Dalej, w cieniu okna, ktoś przekłada dokumenty. Na brzegu stołu stoi kubek, obok niego kałamarz i pióro z nierówno przyciętym końcem. Mężczyzna przesuwa palcem po linii na mapie, potem składa pergamin i odkłada go na bok.',
 'Słysząc kroki, odkłada pióro. Przez chwilę spogląda ku drzwiom, jakby sprawdzał, czy ktoś jeszcze za tobą nie idzie. Dopiero potem zwraca wzrok w twoją stronę. To Kael, mistrz Gildii Wędrowców.'
]);
const returnVisit=Object.freeze([
 'Drzwi Sali Gildii ustępują pod naciskiem dłoni. Wewnątrz znajomy zapach drewna i popiołu miesza się z chłodem kamiennych ścian. Na stole wciąż leżą mapy i pergaminy, choć ich układ zmienił się od ostatniej wizyty.',
 'Kael unosi wzrok znad pracy, odkłada pióro i wskazuje wolne miejsce po drugiej stronie stołu.'
]);
export function kaelEntrance(returning=false){return [...(returning?returnVisit:first)]}

// Visual pages only: no new story nodes, rewards, or persisted cursor fields.
export function dialoguePages(text,limit=125){
 const pages=[];let rest=String(text).trim();
 while(rest.length>limit){
  const prefix=rest.slice(0,limit+1);let cut=0;
  for(const m of prefix.matchAll(/[.!?…](?=\s|$)|\n\n/g)){const end=m.index+m[0].length;if(end>=limit*.45&&end<=limit)cut=end;}
  if(!cut){for(let i=limit;i>0;i--){if(/\s/.test(rest[i])){cut=i;break}}}
  if(!cut)cut=limit;
  // Do not split a surrogate pair on an unusually long unbroken word.
  if(/[\uD800-\uDBFF]/.test(rest[cut-1])&&/[\uDC00-\uDFFF]/.test(rest[cut]))cut--;
  pages.push(rest.slice(0,cut).trim());rest=rest.slice(cut).trimStart();
 }
 if(rest||!pages.length)pages.push(rest);return pages;
}
export function dialogueIcon(label){
 const t=label.toLowerCase();
 if(/zakończ|pożegnaj/.test(t))return 'exit';
 if(/wróć|powrót/.test(t))return 'back';
 if(/rozdział|kronik|fragment/.test(t))return 'book';
 if(/znajomo|porozmaw|zrozum/.test(t))return 'talk';
 if(/jak działa|pytan/.test(t))return 'help';
 if(/kontrakt|zlece/.test(t))return 'scroll';
 if(/zaplano|zadani|krok|czas/.test(t))return 'compass';
 if(/konsultac|ruszyć/.test(t))return 'feather';
 return 'arrow';
}
export const KAEL_REVEAL_MS=36;
