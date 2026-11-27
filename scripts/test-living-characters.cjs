'use strict';
// Lightweight scene logic checks. DOM stubs are not a substitute for a device test.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'pf24-'));
(async()=>{try{
 fs.writeFileSync(path.join(tmp,'package.json'),' {"type":"module"} ');
 for(const f of ['living-characters-921.js','awakening-art-921.js','dialogue-pilot-921.js'])fs.copyFileSync(path.join(root,'www',f),path.join(tmp,f));
 const m=await import(pathToFileURL(path.join(tmp,'living-characters-921.js')).href);
 const chapter=m.chapterDraft('Runy','x'.repeat(800),'Moja prośba',800);assert.match(chapter,/Moja prośba/);assert.match(chapter,/fikcja, nie nowe fakty/);assert.ok(chapter.length<=800);assert.ok(chapter.endsWith('x'.repeat(400)));assert.equal(m.chapterDraft('Runy','tekst','x'.repeat(780),800),null);assert.equal(m.chapterDraft('','', '',800),null);
 class El{constructor(tag){this.tagName=tag;this.children=[];this.value='';this.maxLength=800;this.classList={add(){},contains(){return false}};this.dataset={};this.isConnected=true;this.disabled=false;}append(...v){this.children.push(...v)}setAttribute(k,v){this[k]=v}focus(){this.focused=true}}
 global.document={createElement:t=>new El(t),body:new El('body')};global.window={matchMedia:()=>({matches:true})};global.confirm=()=>true;
 const input=new El('textarea');let edits=0,reads=0;const quick=m.quickReplies('kael',input,()=>edits++);assert.equal(quick.children.length,3);assert.equal(input.value,'');quick.children[0].onclick();assert.equal(input.value,m.personas.kael.choices[0]);assert.equal(edits,1);input.disabled=true;quick.children[1].onclick();assert.equal(edits,1);input.disabled=false;
 const b=m.chapterButton(input,()=>{reads++;return {title:'Runy',prose:'Tekst zatwierdzony'}},()=>edits++);assert.equal(input.value,m.personas.kael.choices[0]);b.onclick();assert.match(input.value,/Tekst zatwierdzony/);assert.equal(edits,2);assert.equal(reads,2);assert.ok(m.chapterButton(input,()=>null).disabled);
 const line=new El('p'),skip=new El('button');m.reveal(line,'Witaj, Wędrowcze.',skip);assert.equal(line.textContent,'Witaj, Wędrowcze.');assert.equal(skip.hidden,true);global.window.matchMedia=()=>({matches:false});m.reveal(line,'Próba animacji.',skip);assert.equal(skip.hidden,false);skip.onclick();assert.equal(line.textContent,'Próba animacji.');assert.equal(skip.hidden,true);
 for(const npc of ['kael','oracle']){const dialog=new El('dialog'),art=m.setupScene(dialog,npc);assert.equal(dialog.dataset.theme,m.personas[npc].theme);assert.ok(art.children[0].src.includes(npc+'.webp'));}
 console.log('OK - scene assets, quick replies only edit draft, optional chapter preview and length, typewriter skip and reduced motion');
 const fsText=f=>fs.readFileSync(path.join(root,'www',f),'utf8');const k=fsText('kael-mock.js'),o=fsText('oracle-ui.js');assert.match(k,/settleKaelVisit\(receipt,startedAt,offer.kind\)/);assert.match(k,/acceptKaelContracts\(visit,chosen,n\)/);assert.match(k,/shareMemory.checked=shareHistory.checked=false/);assert.match(o,/memory:share\?readOracle\(\).memory:null/);assert.match(o,/saveOracleTurn\(pending.payload\)/);assert.match(o,/X-Pathfinder-Session/);assert.match(k,/\bcomposer\.hidden\)return/);console.log('OK - existing transaction and opt-in wiring retained (static checks)');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}})().catch(e=>{console.error(e);process.exitCode=1});
