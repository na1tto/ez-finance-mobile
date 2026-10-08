// Generates a TEMPORARY read-only browser check served by Expo's public directory.
// It uses the installed SDK and transpiles the actual config/client modules.
// Remove with --clean before exporting a distributable application.
const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');
const ts = require('typescript');
const { readPublicSupabaseConfig } = require('../src/config/supabase.ts');

const workspace = path.resolve(__dirname, '..');
const target = path.resolve(workspace, 'public', '__spec002-check');
const marker = 'SPEC-002 temporary browser check';
const files = ['.owner', 'index.html', 'config.js', 'client.js', 'sdk.js'];
if (!target.startsWith(path.resolve(workspace, 'public') + path.sep)) throw new Error('Unexpected check path.');

if (process.argv.includes('--clean')) {
  if (!fs.existsSync(target)) process.exit(0);
  if (fs.lstatSync(target).isSymbolicLink() || fs.readFileSync(path.join(target,'.owner'),'utf8') !== marker
    || fs.readdirSync(target).some(file => !files.includes(file))) throw new Error('Cleanup refused: check directory contains unexpected files.');
  for (const file of files) if (fs.existsSync(path.join(target,file))) fs.unlinkSync(path.join(target,file));
  fs.rmdirSync(target);
  console.log('Temporary browser check removed.');
  process.exit(0);
}
if (fs.existsSync(target)) throw new Error('Check directory already exists; use --clean before generating again.');
const envFile = path.join(workspace,'.env.local');
const local = fs.existsSync(envFile) ? parseEnv(fs.readFileSync(envFile,'utf8')) : {};
const config = readPublicSupabaseConfig({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? local.EXPO_PUBLIC_SUPABASE_URL,
  publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? local.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
const transpile = (file) => ts.transpileModule(fs.readFileSync(path.join(workspace,file),'utf8'), {
  compilerOptions: {target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ES2020},
}).outputText;
const client = transpile('src/lib/supabase/client.ts')
  .replace('import { createClient } from "@supabase/supabase-js";', 'const { createClient } = globalThis.supabase;')
  .replace('"../../config/supabase"', '"./config.js"');
if (client.includes('@supabase/supabase-js') || client.includes('../../config/')) throw new Error('Unexpected client import shape.');
const scriptConfig = JSON.stringify(config).replace(/</g,'\\u003c');
const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8">
<title>SPEC-002 — Verificação local</title>
<h1>SPEC-002 — Verificação local</h1>
<p>Diagnóstico temporário. Apenas leitura, sem login ou gravação.</p>
<pre id="report">Executando verificação...</pre>
<script src="./sdk.js"></script><script type="module">
import { createSupabaseClientProvider } from './client.js';
const config = ${scriptConfig};
const getClient = createSupabaseClientProvider(() => config);
const client = getClient();
const report = {origin: location.origin, clientReused: client === getClient(),
  pkce: client.auth.flowType === 'pkce', persistentSession: client.auth.persistSession,
  automaticUrlSession: client.auth.detectSessionInUrl};
try {
  const settings = await fetch(config.url + '/auth/v1/settings', {headers:{apikey:config.publishableKey}});
  report.apiHttp = settings.status;
  const settingsBody = await settings.json();
  report.googleEnabled = settingsBody.external?.google === true;
  const { data: sessionData } = await client.auth.getSession();
  report.sessionAbsent = sessionData.session === null;
  for (const table of ['transactions','categories']) {
    const result = await client.from(table).select('id').limit(1);
    report[table] = {http:result.status, code:result.error?.code, dataIsNull:result.data === null,
      denied: [401,403].includes(result.status) && result.error?.code === '42501'};
  }
  // Controlled missing service, independent of the real Supabase permissions response.
  const unavailable = new URL(config.url); unavailable.port = '59999';
  try { await fetch(unavailable, {signal:AbortSignal.timeout(2000)}); report.unavailable = 'unexpected-response'; }
  catch { report.unavailable = 'network-unavailable'; }
  report.result = report.apiHttp === 200 && report.sessionAbsent && report.pkce && report.clientReused
    && !report.persistentSession && !report.automaticUrlSession && report.transactions.denied
    && report.categories.denied && report.unavailable === 'network-unavailable' ? 'PASS' : 'FAIL';
} catch { report.result = 'FAIL'; report.failure = 'network-or-api-unavailable'; }
document.getElementById('report').textContent = JSON.stringify(report,null,2);
</script></html>`;
fs.mkdirSync(target,{recursive:true});
fs.writeFileSync(path.join(target,'.owner'),marker);
fs.writeFileSync(path.join(target,'config.js'),transpile('src/config/supabase.ts'));
fs.writeFileSync(path.join(target,'client.js'),client);
fs.copyFileSync(require.resolve('@supabase/supabase-js/dist/umd/supabase.js'),path.join(target,'sdk.js'));
fs.writeFileSync(path.join(target,'index.html'),html);
console.log('Temporary check ready at http://localhost:8081/__spec002-check/index.html');
