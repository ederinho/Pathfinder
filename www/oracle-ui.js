import {visualIcon} from './visual-assets-v01.js';
import {activeOrigin,scopedVault} from './server-921.js';
import {setupScene,heading as sceneHeading,speech,quickReplies,chapterButton,fold,personas} from './living-characters-921.js';
import {readOracle,oracleOffer,startOracle,finishOracle,eraseOracle,saveOracleTurn,saveOracleMemory,acceptOracleCampaign,latestApprovedChapter} from './app-921.js';
import {validTurn,ORACLE_MAX} from './oracle-921.js';
const cap=window.Capacitor;
if(cap?.isNativePlatform?.()&&cap.getPlatform()==='android'){
 const menu=document.querySelector('.journal-menu');
 if(menu){
 const el=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
 const btn=(text,fn)=>{const e=el('button',text);e.type='button';e.onclick=fn;return e};
 const label=(text,e)=>{const l=el('label',text);l.append(e);return l};
 const open=btn('Wyrocznia · konsultacja',show);open.id='oracleWorldEntry';open.prepend(visualIcon('resources-consultation-token',null,'visual-control-icon'));menu.append(open);
 const d=el('dialog');d.id='oracleDialog';d.setAttribute('aria-label','Wyrocznia');const section=el('section');d.append(setupScene(d,'oracle'),section);document.body.append(d);
 let metrics='',busy=false,token='',share=false,draft='',status='',pending=null,lastShown='',authOpen=false,historyOpen=false,memOpen=false,shareOpen=false;
 let origin=activeOrigin(),vault=scopedVault(cap,origin);
 function lock(v){busy=v;for(const e of section.querySelectorAll('button,input,textarea'))e.disabled=v;}
 async function show(){if(busy||d.open)return;origin=activeOrigin();vault=scopedVault(cap,origin);token='';share=false;draft='';status='';lastShown='';authOpen=false;historyOpen=false;memOpen=false;shareOpen=false;metrics='';draw();d.showModal();lock(true);try{token=(await vault.readToken()).token||'';authOpen=!token}catch{authOpen=true}finally{lock(false);draw()}}
 d.oncancel=e=>{if(busy)e.preventDefault()};d.onclose=()=>{token='';draft='';share=false;section.replaceChildren();};
 async function change(fn,success){if(busy)return;lock(true);try{await fn();status=success}catch{status='Nie udało się zapisać. Sprawdź archiwum i spróbuj ponownie.'}finally{busy=false;draw()}}
 function draw(){
  const pos=section.scrollTop,o=readOracle(),s=o.session,offer=oracleOffer();
  const close=btn('Wróć do świata',()=>{if(!busy)d.close()});
  section.replaceChildren(sceneHeading('oracle',close));
  const price=el('p',s&&!s.closed?'Konsultacja · '+s.turns.length+'/'+ORACLE_MAX+' wymian'+(s.turns.length===0?' · '+(offer.kind==='free'?'bezpłatna':'1 Odłamek'):''):'Nowa konsultacja: '+(offer.kind==='free'?'bezpłatna w tym tygodniu':'1 Odłamek')+' · Odłamki: '+offer.shards);price.className='lc-price';
  section.append(price);
  if(!s||!s.turns.length)section.append(speech('oracle',personas.oracle.greeting));
  const mem=fold('Prywatna pamięć Wyroczni'),m=el('textarea');m.maxLength=600;m.rows=3;m.value=o.memory;const check=el('input');check.type='checkbox';check.checked=share;check.onchange=()=>{share=check.checked;};mem.append(label('Zapis lokalny (niezależny od Kaela)',m),btn('Zapisz pamięć',()=>change(()=>saveOracleMemory(m.value),'Pamięć zapisana.')),btn('Usuń pamięć',()=>{if(confirm('Usunąć pamięć Wyroczni? Stare kopie pozostają bez zmian.'))change(()=>saveOracleMemory(''),'Pamięć usunięta.')}));mem.open=memOpen;mem.ontoggle=()=>{if(mem.isConnected)memOpen=mem.open};
  const sharing=fold('Kontekst i zgoda na udostępnienie',label('Dołącz zapisaną pamięć Wyroczni do kolejnej wiadomości',check),el('p','W trybie OPENAI wiadomość, dotychczasowy dialog tej sesji i zaznaczona pamięć trafią do dostawcy AI. Nie wpisuj sekretów ani danych innych osób.'));sharing.open=shareOpen;sharing.ontoggle=()=>{if(sharing.isConnected)shareOpen=sharing.open};
  const auth=el('input');auth.type='password';auth.maxLength=64;auth.autocomplete='off';auth.value=token;auth.oninput=()=>{token=auth.value.trim()};const technical=fold('Połączenie i autoryzacja',el('p','Serwer: '+origin),label('Token testowy (z Keystore, jeśli zapisany u Kaela)',auth),el('p',metrics),el('p','Limit: 3 konsultacje na tydzień od poniedziałku. MOCK także rozlicza wizyty.'));technical.open=authOpen;technical.ontoggle=()=>{if(technical.isConnected)authOpen=technical.open};
  let newReply=false;
  if(s){const old=fold('Wcześniejsze wypowiedzi ('+Math.max(0,s.turns.length-1)+')');old.open=historyOpen;old.ontoggle=()=>{if(old.isConnected)historyOpen=old.open};
   for(const [i,t] of s.turns.entries()){
    const row=el('article');row.className='lc-turn-card';const you=el('p',t.message);you.className='lc-notice';row.append(el('small','Wędrowiec'),you);
    const isLatest=i===s.turns.length-1,key=s.id+':'+i;const animate=isLatest&&key!==lastShown&&!!lastShown; if(isLatest){newReply=animate;lastShown=key;}
    row.append(speech('oracle',t.dialogue,animate));
    if(t.campaign){const card=fold('Propozycja kampanii: '+t.campaign.name,el('p',t.campaign.description));for(const step of t.campaign.steps)card.append(el('p','• '+step));const b=btn(s.campaignSaved?'Kampania już przyjęta':'Przyjmij kampanię',()=>{if(confirm('Dodać kampanię do Bestiariusz → Kampanie?'))change(()=>acceptOracleCampaign(s.id,i),'Kampania zapisana. Bez natychmiastowej nagrody.')});b.disabled=s.campaignSaved;card.append(b);row.append(card)}
    if(t.memory){const edit=el('textarea');edit.rows=3;edit.maxLength=600;edit.value=t.memory;row.append(fold('Proponowana pamięć (opcjonalnie)',label('Sprawdź i popraw przed zapisaniem',edit),btn('Zatwierdź pamięć',()=>{if(confirm('Zastąpić aktualną pamięć Wyroczni tą treścią?'))change(()=>saveOracleMemory(edit.value),'Pamięć zatwierdzona.')})));}
    if(isLatest){if(i>0)section.append(old);section.append(row)}else old.append(row);
   }
   if(!s.closed){const input=el('textarea');input.rows=3;input.maxLength=800;input.value=draft;input.placeholder='Powiedz, co jest dla ciebie ważne…';input.oninput=()=>{draft=input.value};const onEdit=v=>{draft=v};const notice=el('p','Wysłanie wiadomości korzysta z AI. Wcześniejsze wypowiedzi tej sesji są wysyłane razem z nią.');notice.className='lc-notice';const more=fold('Podpowiedzi odpowiedzi',quickReplies('oracle',input,onEdit));more.open=s.turns.length===0;section.append(more,label('Twoja odpowiedź',input),chapterButton(input,latestApprovedChapter,onEdit),notice,sharing,btn('Porozmawiaj',()=>send(s)),btn('Zakończ konsultację',()=>{if(confirm('Zakończyć tę konsultację? Nie będzie można dopisać kolejnej odpowiedzi.'))change(()=>finishOracle(s.id),'Konsultacja zakończona.')}));}
  }
  if(!s||s.closed){const b=btn('Rozpocznij nową konsultację',()=>{if(s&&!confirm('Nowa konsultacja zastąpi poprzedni dialog. Kontynuować?'))return;draft='';pending=null;change(()=>startOracle(crypto.randomUUID(),Date.now()),'Możesz rozpocząć rozmowę.')});b.disabled=!offer.allowed;section.append(b)}
  if(pending){section.append(btn('Ponów zapis odpowiedzi bez API',retry));for(const b of section.querySelectorAll('button'))if(['Porozmawiaj','Zakończ konsultację','Rozpocznij nową konsultację'].includes(b.textContent))b.disabled=true;}
  const out=el('p',status);out.className='lc-notice';out.setAttribute('role','status');section.append(out,mem,technical);
  if(s){const deleteButton=btn('Usuń rozmowę',()=>{if(confirm('Usunąć lokalny dialog? Rozliczenie wizyty i starsze kopie pozostaną.')){pending=null;change(()=>eraseOracle(s.id),'Rozmowa usunięta.')}});section.append(fold('Zarządzanie rozmową',deleteButton));}
  section.scrollTop=newReply?0:pos;
 }
 async function retry(){if(!pending||busy)return;lock(true);try{await saveOracleTurn(pending.payload);status=pending.status;pending=null;draft=''}catch{status='Zapis nadal nieudany. Nie wysłano nowego zapytania.'}finally{busy=false;draw()}}
 async function send(s){if(busy||pending)return;const msg=draft.trim(),t=token;if(!/^[a-f0-9]{64}$/i.test(t)||!msg||msg.length>800){if(!/^[a-f0-9]{64}$/i.test(t))authOpen=true;status='Sprawdź token i wiadomość (maks. 800 znaków).';draw();return;}const startedAt=Date.now(),offer=oracleOffer(startedAt);if(!s.turns.length&&(!offer.allowed||(offer.kind==='shard'&&!confirm('Wydać 1 Odłamek po pierwszej poprawnej odpowiedzi?')))){status='Nie rozpoczęto płatnej konsultacji.';draw();return;}
  const ctx={message:msg,history:s.turns.map(x=>({message:x.message,dialogue:x.dialogue})),memory:share?readOracle().memory:null};
  lock(true);status='Łączenie…';section.querySelector('[role=status]').textContent=status;const start=performance.now();try{
   const r=await cap.Plugins.CapacitorHttp.request({url:origin+'/v1/oracle/consult',method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t,'X-Pathfinder-Session':s.id},data:ctx,connectTimeout:5000,readTimeout:60000,disableRedirects:true,responseType:'json'});
   if(r.status!==200){if(r.status===401)authOpen=true;status=r.status===429?'Limit konsultacji lub budżetu. Jeśli sesja pochodzi z poprzedniego tygodnia, zakończ ją i rozpocznij nową.':'Błąd HTTP '+r.status+' · brak nowej opłaty w grze; możliwy koszt API.';return;}
   const b=typeof r.data==='string'?JSON.parse(r.data):r.data,turn={message:msg,dialogue:b?.dialogue,campaign:b?.campaign,memory:share?b?.memory:''};
   if(b?.schema!=='pathfinder-oracle-response-v1'||b.npc!=='oracle'||!['mock','openai'].includes(b.mode)||!validTurn(turn)||!Number.isFinite(b.usage?.apiCost)||b.usage.apiCost<0||(b.mode==='mock'&&b.usage.apiCost!==0)){status='Niepoprawna odpowiedź; nie pobrano waluty.';return;}
   metrics=b.mode.toUpperCase()+' · '+((performance.now()-start)/1000).toFixed(1)+' s · szac. '+b.usage.apiCost.toFixed(6)+' USD';if(!lastShown)lastShown='new';pending={payload:{sessionId:s.id,index:s.turns.length,turn,startedAt,kind:offer.kind},status:'Odpowiedź zapisana.'};
   try{await saveOracleTurn(pending.payload);status=pending.status;pending=null;draft=''}catch{status='Odpowiedź dotarła, ale zapis nie powiódł się. Ponów sam zapis, nie zapytanie API.';}
  }catch{status='Błąd połączenia. Sprawdź serwer, internet lub USB. Możliwy koszt API.'}finally{busy=false;draw()}
 }
 }
}
