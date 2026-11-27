'use strict';
// Pathfinder v0.11: local mock transport only. No external API or user storage.
const http = require('node:http');
const { randomBytes, timingSafeEqual } = require('node:crypto');
const assert = require('node:assert/strict');
const {makeProvider,selfTest:aiSelfTest,usageSummary,validateContext}=require('./openai-provider.cjs');
const oracle=require('./oracle-protocol.cjs');
const HOST = '127.0.0.1';
const {remoteConfig}=require('./remote-config.cjs');
const MAX_BYTES = 16384;
function response(res, status, body) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
  res.end(JSON.stringify(body));
}
function authenticated(req, token) {
  const a = Buffer.from(req.headers.authorization || '');
  const b = Buffer.from('Bearer ' + token);
  return a.length === b.length && timingSafeEqual(a,b);
}
async function readJson(req, max=MAX_BYTES) {
  let size=0, chunks=[];
  for await (const chunk of req) {
    size += chunk.length;
    if (size>max) { const err = new Error('payload_too_large'); err.status=413; throw err; }
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { const err = new Error('invalid_json'); err.status=400; throw err; }
}
function fixture(minutes,input={}) {
  const contracts=[];
  if(minutes>=1) contracts.push({id:'mock-1',title:'Pierwszy krok',action:'Zapisz jeden konkretny cel na dzisiaj.',minutes:Math.min(5,minutes),completion:'Jeden cel zapisany.'});
  if(minutes>=10) contracts.push({id:'mock-2',title:'Ślad na szlaku',action:'Wykonaj mały krok w stronę zapisanego celu.',minutes:Math.min(20,minutes-5),completion:'Zapisano wykonany krok.'});
  return {schema:'pathfinder-guild-response-v1',mode:'mock',npc:'kael',dialogue:'— Zanim ruszysz dalej, wybierz cel i wykonaj pierwszy krok.',contracts,memoryUpdates:input.context?.memory&&input.message==='TEST PAMIĘCI: moim nowym celem jest nauka gry na gitarze.'&&input.context.memory.goals!=='Nauka gry na gitarze.'?[{field:'goals',value:'Nauka gry na gitarze.',evidence:input.message}]:[],usage:{inputTokens:0,outputTokens:0,apiCost:0}};
}
function makeServer(token, provider=null, usageReader=usageSummary) {
  const server=http.createServer({requestTimeout:15000,headersTimeout:10000},async(req,res)=>{
    // Reject browser cross-origin requests. Native integration is a later step.
    if(req.headers.origin) return response(res,403,{error:'origin_not_allowed'});
    if(req.url==='/health' && req.method==='GET') return response(res,200,{ok:true,service:'pathfinder',mode:provider?'openai':'mock'});
    if(req.url==='/v1/dev/status'&&req.method==='GET'){
      if(!authenticated(req,token))return response(res,401,{error:'unauthorized'});
      try{return response(res,200,{ok:true,service:'pathfinder',mode:provider?'openai':'mock',usage:usageReader()})}
      catch{return response(res,503,{error:'ledger_unavailable'})}
    }
    const isOracle=req.url==='/v1/oracle/consult', max=isOracle?32768:MAX_BYTES;
    if(!isOracle&&req.url!=='/v1/guild/consult') return response(res,404,{error:'not_found'});
    if(req.method!=='POST') return response(res,405,{error:'method_not_allowed'});
    if(!authenticated(req,token)) return response(res,401,{error:'unauthorized'});
    if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||'')) return response(res,415,{error:'json_required'});
    if(Number(req.headers['content-length'])>max) return response(res,413,{error:'payload_too_large'});
    try {
      const input=await readJson(req,max);
      if(isOracle){const v=oracle.validateOracle(input);return response(res,200,provider?await provider({...v,npc:'oracle'}):oracle.fixture(v));}
      if(!input || typeof input!=='object' || Array.isArray(input) || typeof input.message!=='string' || !input.message.trim() || input.message.length>2000 || !Number.isInteger(input.availableMinutes) || input.availableMinutes<0 || input.availableMinutes>240) return response(res,400,{error:'invalid_input'});
      input.context=validateContext(input.context);
      return response(res,200,provider?await provider(input):fixture(input.availableMinutes,input));
    } catch(err) { if(!res.destroyed && !res.headersSent) response(res,err.status||500,{error:err.status?err.message:'internal_error'}); }
  });
  return server;
}
async function selfTest() {
  const token=randomBytes(32).toString('hex');
  const server=makeServer(token,null,()=>({attempts:1,recordedResponses:1,estimatedUsd:0.001}));
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,HOST,resolve)});
  const base=`http://${HOST}:${server.address().port}`;
  const call=(input,auth=token,extra={})=>fetch(base+'/v1/guild/consult',{method:'POST',headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+auth}:{}),...extra},body:JSON.stringify(input)});
  try {
    let r=await fetch(base+'/health'); assert.equal(r.status,200); assert.equal((await r.json()).mode,'mock'); console.log('OK - HEALTH');
    r=await fetch(base+'/v1/dev/status');assert.equal(r.status,401);await r.text();
    r=await fetch(base+'/v1/dev/status',{headers:{Authorization:'Bearer '+token}});assert.equal(r.status,200);assert.equal((await r.json()).usage.attempts,1);console.log('OK - AUTHENTICATED READ-ONLY STATUS');
    r=await call({message:'Test',availableMinutes:30},null);assert.equal(r.status,401);await r.text();console.log('OK - AUTH REQUIRED');
    r=await call({message:'Test',availableMinutes:30},'incorrect');assert.equal(r.status,401);await r.text();
    r=await call({message:'Test',availableMinutes:30},token,{Origin:'https://example.com'});assert.equal(r.status,403);await r.text();console.log('OK - ORIGIN BLOCKED');
    r=await call({message:'',availableMinutes:30});assert.equal(r.status,400);await r.text();
    r=await call({message:'Test',availableMinutes:241});assert.equal(r.status,400);await r.text();
    r=await fetch(base+'/v1/guild/consult',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:'{'});assert.equal(r.status,400);await r.text();console.log('OK - INPUT VALIDATION');
    r=await call({message:'Test',availableMinutes:30,context:{memory:{profile:'x'.repeat(601),goals:'',preferences:''}}});assert.equal(r.status,400);await r.text();
    r=await call({message:'Test',availableMinutes:30,context:{diary:'private'}});assert.equal(r.status,400);await r.text();
    r=await call({message:'Test',availableMinutes:30,context:{memory:{profile:'Test',goals:'Test',preferences:''},history:{active:['A'],completed:['B']}}});assert.equal(r.status,200);await r.text();console.log('OK - MEMORY INPUT VALIDATION');
    const testMsg='TEST PAMIĘCI: moim nowym celem jest nauka gry na gitarze.';
    r=await call({message:testMsg,availableMinutes:0});assert.deepEqual((await r.json()).memoryUpdates,[]);
    r=await call({message:testMsg,availableMinutes:0,context:{memory:{profile:'',goals:'Stary cel',preferences:''}}});assert.equal((await r.json()).memoryUpdates[0].field,'goals');console.log('OK - MOCK MEMORY PROPOSALS');
    for(const n of [0,1,5,9,10,15,30,60,240]) {
      r=await call({message:'Synthetic test only',availableMinutes:n});assert.equal(r.status,200);const b=await r.json();assert.equal(b.mode,'mock');assert.equal(b.usage.apiCost,0);assert.ok(b.contracts.length<=3);assert.ok(b.contracts.reduce((s,c)=>s+c.minutes,0)<=n);
    }
    console.log('OK - MOCK CONTRACTS AND TIME LIMIT');
    console.log('OK - BACKEND TESTS PASSED');
  } finally {await new Promise(resolve=>server.close(resolve));}
}
if(process.argv.includes('--ai-self-test')) aiSelfTest().catch(e=>{console.error('FAIL -',e.message);process.exitCode=1});
else if(process.argv.includes('--self-test')) selfTest().catch(e=>{console.error('FAIL -',e.message);process.exitCode=1});
else {
  const token=process.env.PATHFINDER_DEV_TOKEN;
  if(!token || !/^[a-f0-9]{64}$/i.test(token)) {console.error('STOP - Set PATHFINDER_DEV_TOKEN to a random 64-character hex token. Or use --self-test.');process.exitCode=1;}
  else {let remote;try{remote=remoteConfig()}catch(e){console.error('STOP - remote configuration / persistent ledger unavailable');process.exit(1)}const mode=process.env.PATHFINDER_AI_MODE||'mock';if(!['mock','openai'].includes(mode)){console.error('STOP - invalid mode');process.exit(1)}let provider=null;if(mode==='openai'){try{provider=makeProvider({key:process.env.OPENAI_API_KEY,...(remote?{file:remote.file}:{})})}catch{console.error('STOP - OPENAI_API_KEY missing');process.exit(1)}}if(remote){try{usageSummary(remote.file)}catch{console.error('STOP - invalid ledger');process.exit(1)}}const server=makeServer(token,provider,remote?()=>usageSummary(remote.file):usageSummary);server.maxConnections=64;server.on('error',e=>{console.error('STOP -',e.code||'server_error');process.exitCode=1});server.listen(remote?remote.port:8787,remote?remote.host:HOST,()=>console.log('Pathfinder '+mode.toUpperCase()+(remote?' remote (HTTPS via Railway)':' local only')));}
}
