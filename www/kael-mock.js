// PF_KAEL_CONTRACT_ENGINE_1
import {acceptKaelContracts} from './app-921.js';
import {stats} from './core-921.js';
import {contractXP} from './kael-contracts.js';
(() => {
  const cap=window.Capacitor;
  if (!cap?.isNativePlatform?.() || cap.getPlatform()!=='android') return;
  const menu=document.querySelector('.journal-menu');
  if(!menu) return;
  const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
  const button=make('button','Kael · test AI');button.type='button';menu.append(button);
  const dialog=make('dialog');dialog.setAttribute('aria-label','Test spotkania z Kaelem');
  const section=make('section'), title=make('h3','Kael — Mistrz Gildii');
  const close=make('button','Zamknij');close.type='button';
  const note=make('p','TRYB TESTOWY USB. Używaj fikcyjnych informacji. W trybie OPENAI wiadomość trafia do zewnętrznego API i może generować koszt. Wybrane kontrakty zapiszesz lokalnie bez kolejnego zapytania. Bez terminu i bez kary.');
  const token=make('input');token.type='password';token.autocomplete='off';token.maxLength=64;token.spellcheck=false;token.placeholder='64 znaki';
  const msg=make('textarea');msg.rows=4;msg.maxLength=2000;msg.value='Test: chcę zaplanować dzień.';
  const mins=make('input');mins.type='number';mins.min='0';mins.max='240';mins.step='1';mins.value='30';
  function label(t,e){const l=make('label',t);l.append(e);return l}
  const send=make('button','Poproś o kontrakty');send.type='button';send.className='primary';
  const status=make('p');status.setAttribute('role','status');const result=make('div');result.setAttribute('aria-live','polite');
  section.append(title,close,note,label('Tymczasowy token testowy',token),label('Wiadomość',msg),label('Dostępne minuty',mins),send,status,result);dialog.append(section);document.body.append(dialog);
  let busy=false, saving=false, generation=0;
  dialog.style.maxHeight='85dvh';dialog.style.overflowY='auto';
  button.onclick=()=>{if(!dialog.open)dialog.showModal()};close.onclick=()=>{if(!saving)dialog.close()};
  dialog.oncancel=e=>{if(saving)e.preventDefault()};
  dialog.onclose=()=>{generation++;token.value='';result.replaceChildren();status.textContent='';};
  send.onclick=async()=>{
    if(busy||saving)return;
    const t=token.value.trim(), m=msg.value.trim(), n=Number(mins.value);
    result.replaceChildren();
    if(!/^[a-f0-9]{64}$/i.test(t)||!m||m.length>2000||mins.value===''||!Number.isInteger(n)||n<0||n>240){status.textContent='Sprawdź token, wiadomość i czas (0–240 min).';return;}
    const http=cap.Plugins?.CapacitorHttp;
    if(!http?.request){status.textContent='Brak natywnego modułu CapacitorHttp.';return;}
    busy=true;send.disabled=true;status.textContent='Łączenie z Kaelem…';const g=++generation;
    try{
      const r=await http.request({url:'http://127.0.0.1:8787/v1/guild/consult',method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},data:{message:m,availableMinutes:n},connectTimeout:5000,readTimeout:60000,disableRedirects:true,responseType:'json'});
      if(g!==generation)return;
      if(r.status!==200){status.textContent='Serwer: HTTP '+Number(r.status)+(r.status===401?' — sprawdź token.':r.status===429?' — limit prób lub zapytanie w toku.':r.status===502?' — błąd dostawcy AI lub niepoprawna odpowiedź.':'');return;}
      const b=typeof r.data==='string'?JSON.parse(r.data):r.data;
      if(b?.schema!=='pathfinder-guild-response-v1'||!['mock','openai'].includes(b.mode)||b.npc!=='kael'||typeof b.dialogue!=='string'||!Array.isArray(b.contracts)||b.contracts.length>3||(!Number.isFinite(b.usage?.apiCost)||b.usage.apiCost<0||(b.mode==='mock'&&b.usage.apiCost!==0)||(b.mode==='openai'&&b.usage.currency!=='USD'))||!b.contracts.every(c=>c&&typeof c.title==='string'&&typeof c.action==='string'&&typeof c.completion==='string'&&Number.isInteger(c.minutes)&&c.minutes>0)||b.contracts.reduce((s,c)=>s+c.minutes,0)>n){status.textContent='Nieprawidłowa odpowiedź testowa.';return;}
      result.append(make('p',b.dialogue));
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
    }catch{if(g===generation)status.textContent='Nie udało się połączyć. Sprawdź serwer, USB i adb reverse.';}
    finally{busy=false;send.disabled=false;}
  };
})();
