'use strict';
const fs=require('node:fs'),path=require('node:path');
const DIR='/data', FILE=path.join(DIR,'api-usage-v1.jsonl');
function remoteConfig(env=process.env){
 if(env.PATHFINDER_REMOTE!=='1')return null;
 if(env.RAILWAY_VOLUME_MOUNT_PATH!==DIR)throw Error('Mount Railway volume at /data');
 const mounts=fs.readFileSync('/proc/self/mountinfo','utf8').split('\n');
 if(!mounts.some(line=>line.split(' ')[4]===DIR))throw Error('Persistent volume not mounted');
 if(env.PATHFINDER_INIT_LEDGER==='1'){
  try{const fd=fs.openSync(FILE,'wx',0o600);try{fs.fsyncSync(fd)}finally{fs.closeSync(fd)}}catch(e){if(e.code!=='EEXIST')throw e}
 }
 const st=fs.lstatSync(FILE);if(!st.isFile()||st.isSymbolicLink())throw Error('Invalid ledger');
 fs.accessSync(FILE,fs.constants.R_OK|fs.constants.W_OK);
 const port=Number(env.PORT||8787);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid PORT');
 return {host:'0.0.0.0',port,file:FILE};
}
module.exports={remoteConfig};
