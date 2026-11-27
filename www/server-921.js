// Private Android transport settings. No API keys or bearer tokens in localStorage.
export const LOCAL='http://127.0.0.1:8787';
const KEY='pathfinder-server-origin-v1';
export function normalizeOrigin(raw){
 const s=String(raw).trim();if(s===LOCAL)return LOCAL;
 if(!/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.up\.railway\.app\/?$/i.test(s))throw Error('invalid_origin');
 return new URL(s).origin;
}
export function activeOrigin(){try{return normalizeOrigin(localStorage.getItem(KEY)||LOCAL)}catch{return LOCAL}}
export function scopedVault(cap,origin){
 const plugin=cap.Plugins?.PathfinderDevToken||cap.registerPlugin?.('PathfinderDevToken');
 const scope=normalizeOrigin(origin);
 return {readToken:()=>plugin.readToken({scope}),saveToken:({token})=>plugin.saveToken({scope,token}),forgetToken:()=>plugin.forgetToken({scope})};
}
export function openServerSettings(){
 if(document.querySelector('dialog[open]'))return;
 const el=(tag,t)=>{const e=document.createElement(tag);if(t!==undefined)e.textContent=t;return e};
 const d=el('dialog'),s=el('section'),input=el('input'),status=el('p');
 d.setAttribute('aria-label','Połączenie AI');input.type='url';input.value=activeOrigin()===LOCAL?'':activeOrigin();input.placeholder='https://twoj-serwer.up.railway.app';input.autocomplete='off';input.spellcheck=false;
 const button=(t,fn)=>{const b=el('button',t);b.type='button';b.onclick=fn;return b};
 function save(origin){try{localStorage.setItem(KEY,origin);status.textContent='Zapisano: '+origin+' · sprawdź autoryzację u Kaela.'}catch{status.textContent='Nie udało się zapisać ustawień.'}}
 s.append(el('h3','Połączenie AI'),el('p','Aktywny serwer: '+activeOrigin()),el('p','Wybierz wyłącznie własny serwer Railway. Wiadomości i wybrana pamięć zostaną wysłane do tego serwera, a w trybie OpenAI również do dostawcy AI. Token z USB nie jest wysyłany do chmury.'),input,button('Zapisz HTTPS',()=>{try{const origin=normalizeOrigin(input.value);if(origin===LOCAL)throw Error();if(confirm('Czy to Twój własny serwer? '+origin))save(origin)}catch{status.textContent='Podaj adres HTTPS w domenie up.railway.app, bez ścieżki.'}}),button('Używaj lokalnego USB',()=>save(LOCAL)),status,button('Zamknij',()=>d.close()));
 d.append(s);document.body.append(d);d.onclose=()=>d.remove();d.showModal();
}
