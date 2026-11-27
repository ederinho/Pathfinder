// Local mock transport. No storage, no remote provider.
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
  const note=make('p','TRYB TESTOWY USB. Użyj fikcyjnych informacji. Brak płatnego AI, brak zapisu kontraktów.');
  const token=make('input');token.type='password';token.autocomplete='off';token.maxLength=64;token.spellcheck=false;token.placeholder='64 znaki';
  const msg=make('textarea');msg.rows=4;msg.maxLength=2000;msg.value='Test: chcę zaplanować dzień.';
  const mins=make('input');mins.type='number';mins.min='0';mins.max='240';mins.step='1';mins.value='30';
  function label(t,e){const l=make('label',t);l.append(e);return l}
  const send=make('button','Poproś o kontrakty');send.type='button';send.className='primary';
  const status=make('p');status.setAttribute('role','status');const result=make('div');result.setAttribute('aria-live','polite');
  section.append(title,close,note,label('Tymczasowy token testowy',token),label('Wiadomość',msg),label('Dostępne minuty',mins),send,status,result);dialog.append(section);document.body.append(dialog);
  let busy=false, generation=0;
  button.onclick=()=>{if(!dialog.open)dialog.showModal()};close.onclick=()=>dialog.close();
  dialog.onclose=()=>{generation++;token.value='';result.replaceChildren();status.textContent='';};
  send.onclick=async()=>{
    if(busy)return;
    const t=token.value.trim(), m=msg.value.trim(), n=Number(mins.value);
    result.replaceChildren();
    if(!/^[a-f0-9]{64}$/i.test(t)||!m||m.length>2000||mins.value===''||!Number.isInteger(n)||n<0||n>240){status.textContent='Sprawdź token, wiadomość i czas (0–240 min).';return;}
    const http=cap.Plugins?.CapacitorHttp;
    if(!http?.request){status.textContent='Brak natywnego modułu CapacitorHttp.';return;}
    busy=true;send.disabled=true;status.textContent='Łączenie z Kaelem…';const g=++generation;
    try{
      const r=await http.request({url:'http://127.0.0.1:8787/v1/guild/consult',method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},data:{message:m,availableMinutes:n},connectTimeout:5000,readTimeout:10000,disableRedirects:true,responseType:'json'});
      if(g!==generation)return;
      if(r.status!==200){status.textContent='Serwer: HTTP '+Number(r.status)+(r.status===401?' — sprawdź token.':'');return;}
      const b=typeof r.data==='string'?JSON.parse(r.data):r.data;
      if(b?.schema!=='pathfinder-guild-response-v1'||b.mode!=='mock'||b.npc!=='kael'||typeof b.dialogue!=='string'||!Array.isArray(b.contracts)||b.contracts.length>3||b.usage?.apiCost!==0||!b.contracts.every(c=>c&&typeof c.title==='string'&&typeof c.action==='string'&&typeof c.completion==='string'&&Number.isInteger(c.minutes)&&c.minutes>0)||b.contracts.reduce((s,c)=>s+c.minutes,0)>n){status.textContent='Nieprawidłowa odpowiedź testowa.';return;}
      result.append(make('p',b.dialogue));
      for(const c of b.contracts){const card=make('section');card.append(make('h4',c.title),make('p',c.action),make('p',c.minutes+' min · '+c.completion));result.append(card);}
      status.textContent='OK — odpowiedź MOCK · koszt API: 0 zł';
    }catch{if(g===generation)status.textContent='Nie udało się połączyć. Sprawdź serwer, USB i adb reverse.';}
    finally{busy=false;send.disabled=false;}
  };
})();
