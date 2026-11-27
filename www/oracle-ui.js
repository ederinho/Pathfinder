import {activeOrigin,scopedVault} from './server-921.js';
import {decorateService} from './awakening-art-921.js';
import {readOracle,oracleOffer,startOracle,finishOracle,eraseOracle,saveOracleTurn,saveOracleMemory,acceptOracleCampaign} from './app-921.js';
import {validTurn,ORACLE_MAX} from './oracle-921.js';
const cap=window.Capacitor;
if(cap?.isNativePlatform?.()&&cap.getPlatform()==='android'){
 const menu=document.querySelector('.journal-menu');
 if(menu){
 const el=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
 const btn=(text,fn)=>{const e=el('button',text);e.type='button';e.onclick=fn;return e};
 const label=(text,e)=>{const l=el('label',text);l.append(e);return l};
 const open=btn('Wyrocznia · konsultacja',show);open.id='oracleWorldEntry';menu.append(open);
 const d=el('dialog');d.id='oracleDialog';d.setAttribute('aria-label','Wyrocznia');const section=el('section');d.append(section);document.body.append(d);
 let busy=false,token='',share=false,draft='',status='',pending=null;
 let origin=activeOrigin(),vault=scopedVault(cap,origin);
 function lock(v){busy=v;for(const e of section.querySelectorAll('button,input,textarea'))e.disabled=v;}
 async function show(){if(busy||d.open)return;origin=activeOrigin();vault=scopedVault(cap,origin);token='';share=false;draft='';status='';draw();d.showModal();lock(true);try{token=(await vault.readToken()).token||''}catch{}finally{lock(false);draw()}}
 d.oncancel=e=>{if(busy)e.preventDefault()};d.onclose=()=>{token='';draft='';share=false;section.replaceChildren();};
 async function change(fn,success){if(busy)return;lock(true);try{await fn();status=success}catch{status='Nie udało się zapisać. Sprawdź archiwum i spróbuj ponownie.'}finally{busy=false;draw()}}
 function draw(){
  const o=readOracle(),s=o.session,offer=oracleOffer();section.replaceChildren(decorateService(d,'sanctuary','oracle'),el('h3','Wyrocznia'),el('p','— Nie widzę twojej przyszłości. Mogę jednak pomóc ci dostrzec drogi, których jeszcze nie rozważyłeś.'));
  const close=btn('Zamknij · zachowaj rozmowę',()=>{if(!busy)d.close()});section.append(close,el('p','Serwer: '+origin+' · Tryb OPENAI wysyła wiadomość oraz dotychczasowy dialog tej sesji do zewnętrznego API. MOCK również rozlicza wizyty. Nie wpisuj sekretów ani danych innych osób.'));
  section.append(el('p','Odłamki: '+offer.shards+' · Nowa konsultacja: '+(offer.kind==='free'?'darmowa w tym tygodniu':'1 Odłamek')+' · Tydzień od poniedziałku.'));
  const mem=el('details'),m=el('textarea');m.maxLength=600;m.rows=3;m.value=o.memory;const check=el('input');check.type='checkbox';check.checked=share;check.style.width='auto';check.onchange=()=>{share=check.checked;};mem.append(el('summary','Prywatna pamięć Wyroczni'),label('Zapis lokalny (niezależny od Kaela)',m),btn('Zapisz pamięć',()=>change(()=>saveOracleMemory(m.value),'Pamięć zapisana.')),btn('Usuń pamięć',()=>{if(confirm('Usunąć pamięć Wyroczni? Stare kopie pozostają bez zmian.'))change(()=>saveOracleMemory(''),'Pamięć usunięta.')}));section.append(mem,label('Dołącz zapisaną pamięć Wyroczni do kolejnej wiadomości',check));
  const auth=el('input');auth.type='password';auth.maxLength=64;auth.autocomplete='off';auth.value=token;auth.oninput=()=>{token=auth.value.trim()};const technical=el('details');technical.open=!token;technical.append(el('summary','Autoryzacja'),label('Token testowy (z Keystore, jeśli zapisany u Kaela)',auth));section.append(technical);
  if(s){section.append(el('h4','Konsultacja · '+s.turns.length+'/'+ORACLE_MAX+(s.closed?' · zakończona':'')));for(const [i,t] of s.turns.entries()){
   const row=el('article');row.className='awakening-speech';row.append(el('small','Wędrowiec'),el('p',t.message),el('small','Wyrocznia'),el('p',t.dialogue));
   if(t.campaign){row.append(el('h4','Propozycja: '+t.campaign.name),el('p',t.campaign.description));for(const step of t.campaign.steps)row.append(el('p','• '+step));const b=btn(s.campaignSaved?'Kampania już przyjęta':'Przyjmij kampanię',()=>{if(confirm('Dodać kampanię do Bestiariusz → Kampanie?'))change(()=>acceptOracleCampaign(s.id,i),'Kampania zapisana. Bez natychmiastowej nagrody.')});b.disabled=s.campaignSaved;row.append(b)}
   if(t.memory){const edit=el('textarea');edit.rows=3;edit.maxLength=600;edit.value=t.memory;row.append(label('Proponowana pamięć (sprawdź i popraw przed zapisaniem)',edit),btn('Zatwierdź pamięć',()=>{if(confirm('Zastąpić aktualną pamięć Wyroczni tą treścią?'))change(()=>saveOracleMemory(edit.value),'Pamięć zatwierdzona.')}));}
   section.append(row);
  }
  if(!s.closed){const input=el('textarea');input.rows=4;input.maxLength=800;input.value=draft;input.oninput=()=>{draft=input.value};section.append(label('Twoja odpowiedź',input),btn('Porozmawiaj',()=>send(s)),btn('Zakończ konsultację',()=>{if(confirm('Zakończyć tę konsultację? Nie będzie można dopisać kolejnej odpowiedzi.'))change(()=>finishOracle(s.id),'Konsultacja zakończona.')}));}
  section.append(btn('Usuń rozmowę',()=>{if(confirm('Usunąć lokalny dialog? Rozliczenie wizyty i starsze kopie pozostaną.')){pending=null;change(()=>eraseOracle(s.id),'Rozmowa usunięta.')}}));}
  if(!s||s.closed){const b=btn('Rozpocznij nową konsultację',()=>{if(s&&!confirm('Nowa konsultacja zastąpi poprzedni dialog. Kontynuować?'))return;draft='';pending=null;change(()=>startOracle(crypto.randomUUID(),Date.now()),'Możesz rozpocząć rozmowę.')});b.disabled=!offer.allowed;section.append(b)}
  if(pending){section.append(btn('Ponów zapis odpowiedzi bez API',retry));for(const b of section.querySelectorAll('button'))if(b.textContent==='Porozmawiaj'||b.textContent==='Zakończ konsultację'||b.textContent==='Rozpocznij nową konsultację')b.disabled=true;}
  const out=el('p',status);out.setAttribute('role','status');section.append(out);
 }
 async function retry(){if(!pending||busy)return;lock(true);try{await saveOracleTurn(pending.payload);status=pending.status;pending=null;draft=''}catch{status='Zapis nadal nieudany. Nie wysłano nowego zapytania.'}finally{busy=false;draw()}}
 async function send(s){if(busy||pending)return;const msg=draft.trim(),t=token;if(!/^[a-f0-9]{64}$/i.test(t)||!msg||msg.length>800){status='Sprawdź token i wiadomość (maks. 800 znaków).';draw();return;}const startedAt=Date.now(),offer=oracleOffer(startedAt);if(!s.turns.length&&(!offer.allowed||(offer.kind==='shard'&&!confirm('Wydać 1 Odłamek po pierwszej poprawnej odpowiedzi?')))){status='Nie rozpoczęto płatnej konsultacji.';draw();return;}
  const ctx={message:msg,history:s.turns.map(x=>({message:x.message,dialogue:x.dialogue})),memory:share?readOracle().memory:null};
  lock(true);status='Łączenie…';section.querySelector('[role=status]').textContent=status;const start=performance.now();try{
   const r=await cap.Plugins.CapacitorHttp.request({url:origin+'/v1/oracle/consult',method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},data:ctx,connectTimeout:5000,readTimeout:60000,disableRedirects:true,responseType:'json'});
   if(r.status!==200){status='Błąd HTTP '+r.status+' · brak nowej opłaty w grze; możliwy koszt API.';return;}
   const b=typeof r.data==='string'?JSON.parse(r.data):r.data,turn={message:msg,dialogue:b?.dialogue,campaign:b?.campaign,memory:share?b?.memory:''};
   if(b?.schema!=='pathfinder-oracle-response-v1'||b.npc!=='oracle'||!['mock','openai'].includes(b.mode)||!validTurn(turn)||!Number.isFinite(b.usage?.apiCost)||b.usage.apiCost<0||(b.mode==='mock'&&b.usage.apiCost!==0)){status='Niepoprawna odpowiedź; nie pobrano waluty.';return;}
   pending={payload:{sessionId:s.id,index:s.turns.length,turn,startedAt,kind:offer.kind},status:'OK · '+b.mode.toUpperCase()+' · '+((performance.now()-start)/1000).toFixed(1)+' s · szac. '+b.usage.apiCost.toFixed(6)+' USD'};
   try{await saveOracleTurn(pending.payload);status=pending.status;pending=null;draft=''}catch{status='Odpowiedź dotarła, ale zapis nie powiódł się. Ponów sam zapis, nie zapytanie API.';}
  }catch{status='Błąd połączenia. Sprawdź serwer, internet lub USB. Możliwy koszt API.'}finally{busy=false;draw()}
 }
 }
}
