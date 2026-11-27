import {decorateService} from './awakening-art-921.js';
// PF_KAEL_CONTRACT_ENGINE_1
import {acceptKaelContracts,readKaelMemory,writeKaelMemory,kaelHistory,kaelProfileDraft,kaelVisitOffer,settleKaelVisit} from './app-921.js';
import {stats} from './core-921.js';
import {contractXP} from './kael-contracts.js';
(() => {
  const cap=window.Capacitor;
  if (!cap?.isNativePlatform?.() || cap.getPlatform()!=='android') return;
  const menu=document.querySelector('.journal-menu');
  if(!menu) return;
  const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
  const button=make('button','Kael · konsultacja');button.type='button';button.id='kaelWorldEntry';menu.append(button);
  const dialog=make('dialog');dialog.setAttribute('aria-label','Konsultacja z Kaelem');
  const section=make('section'), title=make('h3','Kael — Mistrz Gildii');
  const close=make('button','Zamknij');close.type='button';
  const note=make('p','TRYB TESTOWY USB. Używaj fikcyjnych informacji. W trybie OPENAI wiadomość trafia do zewnętrznego API i może generować koszt. Wybrane kontrakty zapiszesz lokalnie bez kolejnego zapytania. Bez terminu i bez kary.');
  const token=make('input');token.type='password';token.autocomplete='off';token.maxLength=64;token.spellcheck=false;token.placeholder='64 znaki';
  const remember=make('input');remember.type='checkbox';remember.style.width='auto';
  const forget=make('button','Usuń zapisany token');forget.type='button';
  const connection=make('p','Połączenie: niesprawdzone');connection.setAttribute('role','status');
  const verify=make('button','Sprawdź połączenie i koszty');verify.type='button';
  const vault=cap.Plugins?.PathfinderDevToken || cap.registerPlugin?.('PathfinderDevToken');
  const msg=make('textarea');msg.rows=4;msg.maxLength=2000;msg.value='';msg.placeholder='Co sprowadza cię do Gildii?';
  const mins=make('input');mins.type='number';mins.min='0';mins.max='240';mins.step='1';mins.value='30';
  function label(t,e){const l=make('label',t);l.append(e);return l}
  const price=make('p');price.setAttribute('role','status');
  function showPrice(){const o=kaelVisitOffer();price.textContent=(o.kind==='free'?'Dzisiejsza wizyta: bezpłatna':'Dodatkowa wizyta: 1 Pieczęć Gildii')+' · Pieczęcie: '+o.seals+(!o.allowed?' · brak dostępu do kolejnej wizyty':'')+' · MOCK również rozlicza wizyty lokalnie.';}
  const send=make('button','Poproś o kontrakty');send.type='button';send.className='primary';
  const status=make('p');status.setAttribute('role','status');const result=make('div');result.setAttribute('aria-live','polite');
  const memory=make('details'),memoryTitle=make('summary','Pamięć Wędrowca · lokalna');
  const profile=make('textarea'),goals=make('textarea'),preferences=make('textarea');
  for(const [e,max] of [[profile,600],[goals,600],[preferences,400]]){e.rows=3;e.maxLength=max;}
  const memorySave=make('button','Zapisz pamięć'), memoryClear=make('button','Usuń pamięć'), memoryDraft=make('button','Wczytaj szkic z profilu i celów');
  for(const e of [memorySave,memoryClear,memoryDraft])e.type='button';
  const memoryStatus=make('p');memoryStatus.setAttribute('role','status');
  const shareMemory=make('input'),shareHistory=make('input');for(const e of [shareMemory,shareHistory]){e.type='checkbox';e.style.width='auto';}
  const preview=make('pre');preview.style.whiteSpace='pre-wrap';preview.style.overflowWrap='anywhere';
  function memoryFields(){return {profile:profile.value,goals:goals.value,preferences:preferences.value}}
  function populate(v){profile.value=v.profile;goals.value=v.goals;preferences.value=v.preferences;}
  function context(){const c={};if(shareMemory.checked)c.memory=readKaelMemory();if(shareHistory.checked)c.history=kaelHistory();return c;}
  function refreshPreview(){preview.textContent=JSON.stringify(context(),null,2);}
  shareMemory.onchange=shareHistory.onchange=refreshPreview;
  memoryDraft.onclick=()=>{if(busy||saving||checking||vaultBusy)return;const d=kaelProfileDraft();profile.value=d.profile;goals.value=d.goals;memoryStatus.textContent='Szkic niewysłany. Sprawdź, popraw i zapisz.';};
  async function storeMemory(clear){if(busy||saving||checking||vaultBusy)return;if(clear&&!confirm('Usunąć aktualną pamięć Kaela? Starsze kopie nie zmienią się.'))return;saving=true;for(const e of [send,memorySave,memoryClear,memoryDraft,profile,goals,preferences])e.disabled=true;try{await writeKaelMemory(clear?{profile:'',goals:'',preferences:''}:memoryFields());populate(readKaelMemory());refreshPreview();memoryStatus.textContent='Zapis lokalny gotowy.';}catch{memoryStatus.textContent='Nie udało się zapisać pamięci.';}finally{saving=false;for(const e of [send,memorySave,memoryClear,memoryDraft,profile,goals,preferences])e.disabled=false;}}
  memorySave.onclick=()=>storeMemory(false);memoryClear.onclick=()=>storeMemory(true);
  memory.append(memoryTitle,make('p','Zapis w archiwum gry, także w szyfrowanej kopii. Pamięć lokalna nie jest osobno szyfrowana. Wpisuj tylko informacje, które chcesz zachować. Nie wpisuj danych osób trzecich, haseł ani informacji medycznych.'),label('Profil i doświadczenie',profile),label('Cele',goals),label('Preferencje i ograniczenia',preferences),memoryDraft,memorySave,memoryClear,memoryStatus);
  const sharing=make('section');sharing.append(label('Dołącz zapisaną pamięć do tej wizyty (Kael może zaproponować zmiany)',shareMemory),label('Dołącz maks. 4 aktywne i 4 ukończone zadania',shareHistory),make('p','Podgląd dodatkowych danych. W trybie OPENAI wiadomość i zaznaczone dane trafią do API. Dane nie są wysyłane przy samym zapisie.'),preview);
  const technical=make('details');technical.append(make('summary','Połączenie i autoryzacja (USB)'),label('Token testowy (nie klucz OpenAI)',token),label('Zapamiętaj po poprawnej autoryzacji',remember),forget,verify);section.append(decorateService(dialog,'hall','kael'),title,close,note,connection,technical,memory,sharing,label('Wiadomość',msg),label('Dostępne minuty',mins),price,send,status,result);dialog.append(section);document.body.append(dialog);
  let busy=false, saving=false, generation=0, opening=0, checking=false, vaultBusy=false;
  dialog.style.overflowY='auto';
  async function saveRemembered(t){
    if(!remember.checked||!vault?.saveToken)return '';
    try{await vault.saveToken({token:t});return ''}catch{return ' · nie udało się zapamiętać tokena'}
  }
  async function checkConnection(){
    if(checking||vaultBusy||busy||saving||!dialog.open)return;
    const o=opening,t=token.value.trim(),http=cap.Plugins?.CapacitorHttp;
    if(!http?.request){connection.textContent='Brak modułu HTTP';return}
    checking=true;verify.disabled=send.disabled=forget.disabled=token.disabled=remember.disabled=true;connection.textContent='Sprawdzanie połączenia…';
    try{
      const auth=/^[a-f0-9]{64}$/i.test(t);
      const r=await http.request({url:'http://127.0.0.1:8787'+(auth?'/v1/dev/status':'/health'),method:'GET',headers:auth?{Authorization:'Bearer '+t}:{},connectTimeout:3000,readTimeout:5000,disableRedirects:true,responseType:'json'});
      if(o!==opening)return;
      if(r.status===401){technical.open=true;connection.textContent='Serwer działa · nieprawidłowy token';return}
      const b=typeof r.data==='string'?JSON.parse(r.data):r.data;
      if(r.status!==200||b?.ok!==true||b.service!=='pathfinder'||!['mock','openai'].includes(b.mode))throw Error('status');
      connection.textContent='Połączono · '+b.mode.toUpperCase()+(auth?' · autoryzacja OK':' · podaj token');
      if(auth&&b.usage){const u=b.usage;connection.textContent+=' · próby: '+u.attempts+'/100 · szac. łącznie '+u.estimatedUsd.toFixed(6)+' USD · rozliczone: '+u.recordedResponses;}
      if(auth&&o===opening&&token.value.trim()===t){const warning=await saveRemembered(t);if(o===opening)connection.textContent+=warning;}
    }catch{if(o===opening)connection.textContent='Brak połączenia lub niezgodna wersja backendu. Sprawdź launcher i USB.'}
    finally{checking=false;verify.disabled=send.disabled=forget.disabled=token.disabled=remember.disabled=false}
  }
  button.onclick=async()=>{
    if(dialog.open||busy||saving||checking||vaultBusy)return;
    const o=++opening;populate(readKaelMemory());shareMemory.checked=shareHistory.checked=false;memoryStatus.textContent='';refreshPreview();showPrice();dialog.showModal();vaultBusy=true;send.disabled=verify.disabled=forget.disabled=token.disabled=remember.disabled=true;
    try{const r=await vault.readToken();if(o===opening&&dialog.open){token.value=r.token||'';remember.checked=!!r.token;technical.open=!r.token;}}
    catch{if(o===opening){technical.open=true;connection.textContent='Nie udało się odczytać tokena. Możesz wpisać go ręcznie.'}}
    finally{vaultBusy=false;send.disabled=verify.disabled=forget.disabled=token.disabled=remember.disabled=false;}
    if(o===opening&&dialog.open)await checkConnection();
  };
  verify.onclick=checkConnection;
  forget.onclick=async()=>{
    if(busy||saving||checking||vaultBusy)return;
    vaultBusy=true;forget.disabled=send.disabled=verify.disabled=token.disabled=remember.disabled=true;
    try{await vault.forgetToken();token.value='';remember.checked=false;connection.textContent='Zapisany token usunięty.';}
    catch{connection.textContent='Nie udało się usunąć zapisanego tokena.';}
    finally{vaultBusy=false;forget.disabled=send.disabled=verify.disabled=token.disabled=remember.disabled=false;}
  };
  close.onclick=()=>{if(!saving&&!busy&&!checking&&!vaultBusy)dialog.close()};
  dialog.oncancel=e=>{if(saving||busy||checking||vaultBusy)e.preventDefault()};
  dialog.onclose=()=>{generation++;opening++;msg.value='';token.value='';remember.checked=false;shareMemory.checked=shareHistory.checked=false;preview.textContent='{}';profile.value=goals.value=preferences.value='';result.replaceChildren();status.textContent='';connection.textContent='Połączenie: niesprawdzone';};
  send.onclick=async()=>{
    if(busy||saving||checking||vaultBusy)return;
    const t=token.value.trim(), m=msg.value.trim(), n=Number(mins.value);
    result.replaceChildren();
    if(!/^[a-f0-9]{64}$/i.test(t)||!m||m.length>2000||mins.value===''||!Number.isInteger(n)||n<0||n>240){if(!/^[a-f0-9]{64}$/i.test(t))technical.open=true;status.textContent='Sprawdź token, wiadomość i czas (0–240 min).';return;}
    const http=cap.Plugins?.CapacitorHttp;
    if(!http?.request){status.textContent='Brak natywnego modułu CapacitorHttp.';return;}
    const ctx=context();if(JSON.stringify(ctx)!==JSON.stringify(JSON.parse(preview.textContent))){refreshPreview();status.textContent='Kontekst się zmienił. Sprawdź podgląd i ponownie zatwierdź.';return;}
    const startedAt=Date.now(),offer=kaelVisitOffer(startedAt);showPrice();
    if(!offer.allowed){status.textContent='Brak Pieczęci. Kolejna darmowa wizyta jutro.';return;}
    if(offer.kind==='seal'&&!confirm('Wydać 1 Pieczęć Gildii za poprawną odpowiedź Kaela?'))return;
    const receipt=crypto.randomUUID();
    busy=true;send.disabled=verify.disabled=forget.disabled=token.disabled=remember.disabled=true;status.textContent='Łączenie z Kaelem…';const g=++generation, started=performance.now();
    try{
      const r=await http.request({url:'http://127.0.0.1:8787/v1/guild/consult',method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},data:{message:m,availableMinutes:n,context:ctx},connectTimeout:5000,readTimeout:60000,disableRedirects:true,responseType:'json'});
      if(g!==generation)return;
      if(r.status!==200){status.textContent='Serwer: HTTP '+Number(r.status)+(r.status===401?' — sprawdź token.':r.status===429?' — limit prób lub zapytanie w toku.':r.status===502?' — błąd dostawcy AI lub niepoprawna odpowiedź.':'');return;}
      const b=typeof r.data==='string'?JSON.parse(r.data):r.data;
      if(b?.schema!=='pathfinder-guild-response-v1'||!['mock','openai'].includes(b.mode)||b.npc!=='kael'||typeof b.dialogue!=='string'||!Array.isArray(b.contracts)||b.contracts.length>3||(!Number.isFinite(b.usage?.apiCost)||b.usage.apiCost<0||(b.mode==='mock'&&b.usage.apiCost!==0)||(b.mode==='openai'&&b.usage.currency!=='USD'))||!b.contracts.every(c=>c&&typeof c.title==='string'&&typeof c.action==='string'&&typeof c.completion==='string'&&Number.isInteger(c.minutes)&&c.minutes>0)||b.contracts.reduce((s,c)=>s+c.minutes,0)>n){status.textContent='Nieprawidłowa odpowiedź testowa.';return;}
      const elapsed=((performance.now()-started)/1000).toFixed(1);
      try{await settleKaelVisit(receipt,startedAt,offer.kind)}catch{status.textContent='Odpowiedź AI dotarła, ale rozliczenie lokalne nie powiodło się. Nie pokazano kontraktów. Sprawdź archiwum. Zapytanie mogło wygenerować koszt API.';return;}
      showPrice();
      const warning=await saveRemembered(t);
      if(g!==generation)return;
      const speech=make('article');speech.className='awakening-speech';speech.append(make('h4','Kael'),make('p',b.dialogue));result.append(speech);speech.scrollIntoView({block:'nearest'});
      // PF_MEMORY_V2: proposals are inert until explicitly approved, and never grant XP.
      if(ctx.memory&&Array.isArray(b.memoryUpdates)&&b.memoryUpdates.length<=3){
        const seen=new Set(), updates=b.memoryUpdates.filter(x=>{
          if(!x||!['profile','goals','preferences'].includes(x.field)||typeof x.value!=='string'||x.value.length>(x.field==='preferences'?400:600)||typeof x.evidence!=='string'||!x.evidence.trim()||x.evidence.length>300||!m.includes(x.evidence)||seen.has(x.field)||x.value===ctx.memory[x.field])return false;
          seen.add(x.field);return true;
        });
        if(updates.length){
          const panel=make('section'), feedback=make('p'), apply=make('button','Zapisz wybrane zmiany pamięci');apply.type='button';
          panel.append(make('h4','Kael proponuje nowe ustalenia'),make('p','Sprawdź całą nową treść. Nie zaznaczono nic automatycznie. Zapis jest lokalny i nie wymaga API. Zatwierdź pamięć przed przyjęciem kontraktów, jeśli chcesz ją zmienić.'));
          const fields={profile:'Profil',goals:'Cele',preferences:'Preferencje'}, rows=[];
          for(const x of updates){const selected=make('input');selected.type='checkbox';selected.style.width='auto';const edit=make('textarea');edit.rows=3;edit.maxLength=x.field==='preferences'?400:600;edit.value=x.value;
            panel.append(label(fields[x.field],selected),make('p','Poprzednio: '+(ctx.memory[x.field]||'(puste)')),make('p','Na podstawie: '+x.evidence),label('Nowa treść (możesz poprawić)',edit));rows.push({x,selected,edit});}
          const refresh=()=>{apply.disabled=saving||!rows.some(r=>r.selected.checked)};rows.forEach(r=>r.selected.onchange=refresh);refresh();
          panel.append(apply,feedback);result.append(panel);
          apply.onclick=async()=>{if(saving||busy||checking||vaultBusy||g!==generation)return;const chosen=rows.filter(r=>r.selected.checked);if(!chosen.length)return;
            const current=readKaelMemory();if(chosen.some(r=>current[r.x.field]!==ctx.memory[r.x.field])){feedback.textContent='Pamięć zmieniła się od wizyty. Zapisz zmiany ręcznie w edytorze pamięci.';return;}
            if(JSON.stringify(memoryFields())!==JSON.stringify(current)){feedback.textContent='Masz niezapisane zmiany w edytorze pamięci. Zapisz je lub zamknij wizytę.';return;}
            const next={...current};for(const r of chosen)next[r.x.field]=r.edit.value;
            saving=true;send.disabled=close.disabled=true;rows.forEach(r=>{r.selected.disabled=r.edit.disabled=true});refresh();
            try{await writeKaelMemory(next);populate(readKaelMemory());refreshPreview();feedback.textContent='Pamięć zaktualizowana lokalnie.';apply.remove();}
            catch{feedback.textContent='Zapis nieudany. Spróbuj ponownie bez zapytania AI.';rows.forEach(r=>{r.selected.disabled=r.edit.disabled=false});}
            finally{saving=false;send.disabled=close.disabled=false;refresh();}
          };
        }
      }
      const visit=crypto.randomUUID(), choices=[];
      for(const [index,c] of b.contracts.entries()){
        const card=make('section'), selected=make('input'), stat=make('select');selected.type='checkbox';selected.checked=true;selected.style.width='auto';
        stats.forEach((name,i)=>{const option=make('option',name);option.value=String(i);stat.append(option)});stat.value='3';
        card.append(make('h4',c.title),make('p',c.action),make('p',c.minutes+' min · '+c.completion),make('p','Nagroda po wykonaniu: '+contractXP(c.minutes)+' EXP'),label('Atrybut (wybierz)',stat),label('Przyjmij',selected));result.append(card);choices.push({c,index,selected,stat});
      }
      if(choices.length){
        const accept=make('button','Przyjmij wybrane kontrakty');accept.type='button';accept.className='primary';
        const summary=make('p');const refresh=()=>{const chosen=choices.filter(x=>x.selected.checked);summary.textContent='Wybrane: '+chosen.length+' · '+chosen.reduce((a,x)=>a+x.c.minutes,0)+' min';accept.disabled=saving||!chosen.length};
        choices.forEach(x=>x.selected.onchange=refresh);refresh();result.append(summary,accept);
        accept.onclick=async()=>{
          if(saving||busy||g!==generation)return;
          const chosen=choices.filter(x=>x.selected.checked).map(x=>({...x.c,index:x.index,stat:Number(x.stat.value)}));if(!chosen.length)return;
          saving=true;send.disabled=close.disabled=true;choices.forEach(x=>{x.selected.disabled=x.stat.disabled=true});refresh();
          status.textContent='Zapisywanie kontraktów w archiwum…';
          try{await acceptKaelContracts(visit,chosen,n);dialog.close()}
          catch{status.textContent='Nie udało się zapisać kontraktów. Sprawdź stan archiwum i spróbuj ponownie bez nowego zapytania.'}
          finally{saving=false;send.disabled=close.disabled=false;choices.forEach(x=>{x.selected.disabled=x.stat.disabled=false});refresh()}
        };
      }
      status.textContent=b.mode==='mock'?'OK — odpowiedź MOCK · koszt API: 0 zł':'OK — OPENAI · szac. '+b.usage.apiCost.toFixed(6)+' USD · pozostałe próby: '+b.usage.remainingAttempts;
      status.textContent+=' · '+elapsed+' s · '+(offer.kind==='free'?'wizyta darmowa':'wydano 1 Pieczęć')+warning;
    }catch{if(g===generation)status.textContent='Nie udało się połączyć. Sprawdź serwer, USB i adb reverse.';}
    finally{busy=false;send.disabled=verify.disabled=forget.disabled=token.disabled=remember.disabled=false;}
  };
})();
