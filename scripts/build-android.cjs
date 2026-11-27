'use strict';
// Pathfinder Android build helper. Run from the repository root via npm.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const root = process.cwd();
const refresh = process.argv.includes('--refresh-integrity');
function fail(message) { throw new Error(message); }
function checkIntegrity(dir, update = false) {
  const base = path.resolve(root, dir), index = path.join(base, 'index.html');
  const original = fs.readFileSync(index, 'utf8');
  let count = 0;
  const result = original.replace(/<(?:script|link)\b[^>]*>/gi, tag => {
    const integrity = tag.match(/\bintegrity\s*=\s*(["'])(.*?)\1/i);
    if (!integrity) return tag;
    const source = tag.match(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/i);
    if (!source) fail('Integrity without src/href in ' + dir);
    const relative = source[2].split(/[?#]/)[0];
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(relative)) fail('External integrity URL: ' + relative);
    const file = path.resolve(base, relative.replace(/^\/+/, ''));
    if (!file.startsWith(base + path.sep)) fail('Asset outside web directory: ' + relative);
    const bytes = fs.readFileSync(file);
    const hashes = integrity[2].trim().split(/\s+/).map(token => {
      const m = token.match(/^(sha256|sha384|sha512)-[A-Za-z0-9+/=]+$/);
      if (!m) fail('Unsupported integrity token: ' + token);
      const expected = m[1] + '-' + crypto.createHash(m[1]).update(bytes).digest('base64');
      if (!update && token !== expected) fail(dir + ': HASH MISMATCH ' + relative + '. Review the source change before refreshing integrity.');
      return expected;
    });
    count++;
    console.log(dir + ': ' + relative + ' ' + (update ? 'REFRESHED' : 'OK'));
    return update ? tag.replace(integrity[0], 'integrity=' + integrity[1] + hashes.join(' ') + integrity[1]) : tag;
  });
  if (!count) fail('No SRI entries found in ' + index);
  if (update && result !== original) fs.writeFileSync(index, result, 'utf8');
}
function run(command, cwd, env) {
  console.log('\n> ' + command);
  const result = cp.spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/c', command], {cwd, env, stdio:'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) fail('Command failed: ' + command + ' (exit ' + result.status + ')');
}
function javaEnvironment() {
  const local = path.join(root, 'android', '.gradle', 'config.properties');
  let configured;
  if (fs.existsSync(local)) {
    const m = fs.readFileSync(local, 'utf8').match(/^java\.home\s*=\s*(.+)$/m);
    if (m) configured = m[1].trim().replace(/\\([\\:= ])/g, '$1');
  }
  const candidates = [configured, process.env.JAVA_HOME].filter(Boolean);
  for (const home of candidates) {
    const exe = path.join(home, 'bin', 'java.exe');
    if (!fs.existsSync(exe)) continue;
    const check = cp.spawnSync(exe, ['-version'], {encoding:'utf8'});
    if (check.status === 0 && /version\s+"21(?:[.\-"+])/.test((check.stderr || '') + (check.stdout || ''))) {
      const env = {...process.env, JAVA_HOME:home};
      const key = Object.keys(env).find(k => k.toLowerCase() === 'path') || 'PATH';
      env[key] = path.join(home,'bin') + path.delimiter + (env[key] || '');
      console.log('JDK 21: ' + home);
      return env;
    }
  }
  fail('JDK 21 not found. Set JAVA_HOME to your JDK 21 directory, or configure Gradle JDK in Android Studio.');
}
try {
  if (process.argv.includes('--check-only')) {
    checkIntegrity('www', refresh);
    checkIntegrity('www');
  } else {
    if (process.platform !== 'win32') fail('This build helper is configured for Windows.');
    const env = javaEnvironment();
    checkIntegrity('www', refresh);
    checkIntegrity('www');
    run('npx --no-install cap sync android', root, env);
    const dest = 'android/app/src/main/assets/public';
    checkIntegrity(dest);
    if (!fs.readFileSync(path.join(root,'www/index.html')).equals(fs.readFileSync(path.join(root,dest,'index.html')))) fail('Synced index.html differs from www.');
    run('gradlew.bat assembleDebug', path.join(root,'android'), env);
    const apk = path.join(root,'android','app','build','outputs','apk','debug','app-debug.apk');
    if (!fs.existsSync(apk)) fail('APK not found at expected path: ' + apk);
    console.log('\nOK - APK READY\n' + apk);
  }
} catch (error) {
  console.error('\nSTOP: ' + error.message);
  process.exitCode = 1;
}
