// Original local vector illustrations. No user data enters SVG attributes.
const NS='http://www.w3.org/2000/svg';
const palette=['#827b79','#b6a485','#d7bd88','#f3d49a'];
const gearShapes=[
 // blade
 ['M70 13L77 31 46 83 37 74Z M34 70L51 87 46 93 29 77Z M32 81L39 88 25 105 18 98Z','M70 24L42 77 M21 99L28 106 M61 40L65 34'],
 // cloak
 ['M43 21Q60 7 77 21L86 42 105 105 72 96 60 110 45 97 15 105 34 42Z M43 21Q60 38 77 21L73 42 60 48 47 42Z','M36 49L27 93 M49 48L45 89 M71 49L76 93 M84 50L95 94 M58 52L60 101'],
 // book
 ['M21 24L56 33 61 38 66 33 101 24 101 94 66 103 61 109 56 103 21 94Z M28 31L54 40 61 46 68 40 94 31 94 88 68 96 61 102 54 96 28 88Z','M61 46V101 M36 49L50 53 M36 60L50 64 M36 71L50 75 M73 53L86 49 M73 64L86 60 M73 75L86 71 M48 18L61 8 74 18'],
 // wax seal
 ['M60 13L78 22 96 22 100 41 111 56 101 74 99 94 80 98 60 110 43 99 22 96 20 77 9 60 20 42 23 23 43 22Z M60 31L82 45 78 73 60 89 42 73 38 45Z','M60 40V77 M47 57L60 46 73 57 M51 65L60 73 69 65'],
 // boots
 ['M24 16L53 19 48 62 55 83 47 100 13 100 8 89 25 72Z M67 18L96 15 95 70 112 87 108 100 74 100 64 86 72 63Z','M25 31L50 34 M23 44L48 47 M21 57L47 60 M70 34L96 31 M72 47L95 44 M74 60L95 57 M14 92H46 M75 92H106'],
 // map
 ['M16 21L49 30 75 19 104 29 104 98 75 88 49 101 16 92Z','M49 30V101 M75 19V88 M27 77Q35 44 57 64T89 42 M86 37L95 46 M95 37L86 46 M24 34L37 39 M80 78L94 83'],
 // amulet
 ['M16 13Q60 86 104 13 M60 44L82 68 60 103 38 68Z M60 53L72 68 60 88 48 68Z','M60 53V88 M48 68H72 M16 13L22 13 M98 13H104'],
 // ring
 ['M34 53Q19 69 27 92Q38 113 60 109Q82 113 93 92Q101 69 86 53L76 65Q88 80 77 95Q61 105 44 95Q32 81 44 65Z M32 32L46 16H74L88 32 78 60 60 71 42 60Z','M46 16L52 32 60 56 68 32 74 16 M32 32H88 M42 60L60 56 78 60'],
 // lantern
 ['M46 22V13Q60 2 74 13V22 M38 24H82L94 40 86 96 76 105H44L34 96 26 40Z M39 44H81L76 89H44Z','M26 40H94 M34 96H86 M60 49Q73 65 60 82Q46 76 53 65L60 49Z M45 45L49 87 M75 45L71 87'],
 // alchemy
 ['M20 72H100L106 103H14Z M26 60H47V72H26Z M28 26H45V60H28Z M65 15H85V26L81 28V43L100 67Q103 76 94 77H56Q48 77 53 67L69 43V28L65 26Z','M56 62H95 M62 69H88 M29 44H44 M20 86H100 M32 86V102 M89 86V102'],
 // compass
 ['M48 16V9H72V16 M60 19A43 43 0 1 0 60 105A43 43 0 1 0 60 19Z M60 27A35 35 0 1 0 60 97A35 35 0 1 0 60 27Z M78 39L65 68 42 85 55 56Z','M60 30V39 M60 85V94 M28 62H37 M83 62H92 M78 39L60 62 42 85'],
 // talisman
 ['M60 12L72 40 103 43 80 65 87 99 60 82 33 99 40 65 17 43 48 40Z M60 38L70 56 60 74 50 56Z','M60 12V38 M17 43L50 56 M103 43L70 56 M33 99L60 74 M87 99L60 74']
];
const beastShapes=[
 ['M116 140L104 109 127 84 118 48 141 23 160 36 180 23 202 48 193 84 216 109 204 140Z','M131 49L150 69 138 75 M189 49L170 69 182 75 M145 98L160 111 175 98 M160 36V60 M127 84L107 103 M193 84L213 103'],
 ['M86 140Q105 113 119 89Q97 56 120 24Q160 0 200 24Q223 56 201 89Q215 113 234 140L193 123 174 139 160 121 146 139 127 123Z','M131 49Q143 39 151 55L141 69Z M189 49Q177 39 169 55L179 69Z M149 87Q160 78 171 87 M120 24L133 38 M200 24L187 38'],
 ['M70 140L100 91 110 45 88 12 139 38 160 13 181 38 232 12 210 45 220 91 250 140 199 119 160 139 121 119Z','M126 56L151 76 130 76 M194 56L169 76 190 76 M140 95L160 112 180 95 M100 91L132 101 M220 91L188 101'],
 ['M51 140L90 102 110 75 86 49 116 42 121 12 150 45 160 28 170 45 199 12 204 42 234 49 210 75 230 102 269 140 205 120 160 139 115 120Z','M121 59L150 72 127 79 M199 59L170 72 193 79 M142 99L151 116 160 99 169 116 178 99 M111 87L89 112 M209 87L231 112'],
 ['M83 140L101 102 121 90 113 67 126 37 160 16 194 37 207 67 199 90 219 102 237 140 194 127 160 140 126 127Z','M126 37L160 53 194 37 M134 64H151 M169 64H186 M148 88L160 99 172 88 M122 102L160 120 198 102 M160 53V83']
];
function node(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e}
function path(d,fill,stroke,width=1.5){return node('path',{d,fill,stroke,'stroke-width':width,'stroke-linejoin':'round','stroke-linecap':'round'})}
export function gearArt(i,tier=0){let c=palette[tier]||palette[0],svg=node('svg',{viewBox:'0 0 120 120',class:'gear-illustration','aria-hidden':'true'}),[shape,detail]=gearShapes[i]||gearShapes[0];svg.append(node('rect',{x:3,y:3,width:114,height:114,rx:8,fill:'#1a181c',stroke:c,'stroke-opacity':'.65'}),node('circle',{cx:60,cy:60,r:49,fill:'none',stroke:c,'stroke-opacity':'.35','stroke-dasharray':'1 5'}));svg.append(path(shape,tier?'#4b3b35':'#29262a',c,1.8),path(detail,'none',c,1.35));for(let j=0;j<tier;j++)svg.append(node('circle',{cx:60+(j-(tier-1)/2)*9,cy:113,r:2,fill:c}));return svg}
export function beastKind(b){let t=String(b.id||'')+' '+String(b.name||'');t=t.toLocaleLowerCase('pl');if(/dziekan|biurokr|administr/.test(t))return 0;if(/widmo|duch|utracon/.test(t))return 1;if(/chimer|repozytor/.test(t))return 2;if(/smok|bestia|wil[kc]/.test(t))return 3;return [...t].reduce((a,c)=>(a+c.codePointAt(0))%5,0)}
export function beastIllustration(b){let svg=node('svg',{viewBox:'0 0 320 160',class:'beast-art bestiary-illustration','aria-hidden':'true'}),c=b.status==='defeated'?'#908b80':'#d7bd88',[shape,detail]=beastShapes[beastKind(b)];svg.append(node('rect',{width:320,height:160,fill:'#19171d'}),node('circle',{cx:160,cy:71,r:58,fill:'#583039',stroke:'#94616b'}),node('circle',{cx:160,cy:71,r:68,fill:'none',stroke:c,'stroke-opacity':'.5','stroke-dasharray':'1 5'}),path('M0 142L26 119 48 129 75 98 96 133 117 140 0 160Z M320 142L294 119 272 129 245 98 224 133 203 140 320 160Z','#2b282e','#6d5b55'),path(shape,'#363039',c,1.8),path(detail,'none',c,1.6));for(let x=18;x<300;x+=17)svg.append(path(`M${x} 155l8 -7`,'none','#766057',.6));return svg}
export function upgradeMessages(before,after){if(!before||!after)return [];let messages=[];if(before.stage!==after.stage&&after.total>before.total)messages.push('NOWA RANGA · '+after.stage);if(before.className!==after.className&&after.className!=='Wędrowiec')messages.push('NOWA KLASA · '+after.className);after.gear.forEach((g,i)=>{if(g.tier>(before.gear[i]?.tier||0))messages.push('EKWIPUNEK · '+g.name+' · ranga '+g.tier)});return messages}
export function evolutionPrompt(a,level){let gear=a.gear.filter(g=>g.tier).map(g=>g.name+' (ranga '+g.tier+')');return 'Zaktualizuj załączony portret fikcyjnego bohatera Pathfinder, zachowując twarz, proporcje i rozpoznawalny styl dark fantasy manga seinen. Pełna sylwetka, pion 2:3, tusz, czerń, przygaszone złoto i burgund, bez tekstu. Poziom '+level+', ranga '+a.stage+', klasa '+a.className+'. '+(gear.length?'Pokaż w naturalny sposób wybrane elementy wyposażenia: '+gear.join(', ')+'.':'Proste podróżne ubranie i skromny ekwipunek.')+' Nie dodawaj osób ani zwierząt. Zachowaj spójność z poprzednim portretem.'}
