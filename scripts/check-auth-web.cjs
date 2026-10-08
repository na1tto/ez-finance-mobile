// Temporary diagnostics for real browser storage/Auth/API, never product UI or an export.
const fs=require('node:fs'); const path=require('node:path'); const ts=require('typescript'); const {parseEnv}=require('node:util');
const root=path.resolve(__dirname,'..'); const target=path.join(root,'public','__spec003-check');
const marker='SPEC-003 temporary real browser check';const files=['.owner','index.html','sdk.js','storage.js','client.js','config.js'];
if(process.argv.includes('--clean')){
  if(!fs.existsSync(target))process.exit(0);
  if(fs.lstatSync(target).isSymbolicLink()||fs.readFileSync(path.join(target,'.owner'),'utf8')!==marker||fs.readdirSync(target).some(f=>!files.includes(f)))throw new Error('Limpeza recusada.');
  for(const file of files)if(fs.existsSync(path.join(target,file)))fs.unlinkSync(path.join(target,file));
  fs.rmdirSync(target);console.log('Diagnóstico SPEC-003 removido.');process.exit(0);
}
if(fs.existsSync(target))throw new Error('Diagnóstico já existe.');
const env=parseEnv(fs.readFileSync(path.join(root,'.env.local'),'utf8'));
const {readPublicSupabaseConfig}=require('../src/config/supabase.ts');
const config=readPublicSupabaseConfig({url:env.EXPO_PUBLIC_SUPABASE_URL,publishableKey:env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY});
if(config.url!=='http://127.0.0.1:54321')throw new Error('Somente stack local.');
// Baselines are optional private evidence, never fabricated from the current user.
// Without them identity/owner equivalence cannot be approved by this diagnostic.
const readEvidence=(name,fallback)=>{const file=path.join(root,'supabase/.temp',name);return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):fallback;};
const proof=readEvidence('spec003-human-proof.json',{users:{}});
const fixture=readEvidence('spec003-browser-fixture.json',{id:null,email:null});
const compile=file=>ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ES2020}}).outputText;
const clientSource=compile('src/lib/supabase/client.ts').replace(/import \{ createClient \} from ["']@supabase\/supabase-js["'];/,'const {createClient}=globalThis.supabase;')
  .replace(/["']\.\.\/\.\.\/config\/supabase["']/g,'"./config.js"').replace(/["']\.\.\/auth\/storage["']/g,'"./storage.js"');
if(clientSource.includes('@supabase/supabase-js')||clientSource.includes('../../config/'))throw new Error('Import inesperado.');
const safe=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const html=`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>SPEC-003 — Prova web</title>
<h1>SPEC-003 — Prova web</h1><p>Diagnóstico temporário local. Não exibe tokens, senhas, códigos ou IDs. Não faz CRUD do produto.</p>
<button id="check">Conferir sessão e proprietário</button><button id="refresh">Renovar sessão real</button>
<button id="observe">Observar storage sem renovar</button>
<p>As ações abaixo só funcionam com a conta fictícia automática, nunca com as contas Google humanas.</p>
<label>Senha existente da fixture <input id="fixture-password" type="password" autocomplete="off"></label>
<button id="short">Entrar com fixture no Auth de prazo curto</button>
<button id="revoke">Revogar sessão da fixture</button><button id="invalid">Preparar restauração revogada da fixture</button>
<pre id="report">Pronto.</pre><script src="./sdk.js"></script><script type="module">
import {createSupabaseClientProvider} from './client.js';import {browserStorage,trackedStorage,sessionKey} from './storage.js';
const config=${safe(config)},expected=${safe(proof.users)},fixtureId=${safe(fixture.id)},fixtureEmail=${safe(fixture.email)};
const storage=trackedStorage(browserStorage(()=>window.localStorage));const key=sessionKey(config.url);
let client;function activeClient(){if(!client){client=createSupabaseClientProvider(()=>config,storage)();client.auth.stopAutoRefresh();}return client;}
const events=[];let revoked;let phase='request';
function show(value){events.push(value);document.getElementById('report').textContent=JSON.stringify(events,null,2);}
async function checked(){
 activeClient();
 const result=await client.auth.getSession();if(result.error)throw result.error;
 const session=result.data.session;if(!session){show({session:false,storedSession:!!await storage.getItem(key)});return null;}
 const user=await client.auth.getUser(session.access_token);if(user.error)throw user.error;
 const baseline=expected[user.data.user.email];
 const report={session:true,verified:!!user.data.user.email_confirmed_at,persistent:!!await storage.getItem(key),sameAuthId:baseline?baseline.id===user.data.user.id:null,automaticFixture:user.data.user.id===fixtureId};
 if(baseline?.fixtureId){
   const own=await client.from('transactions').select('user_id,amount_cents').eq('id',baseline.fixtureId);
   if(own.error)throw own.error;
   report.sameFinancialOwner=own.data.length===1&&own.data[0].user_id===baseline.id;report.ownTotal=own.data.reduce((sum,r)=>sum+r.amount_cents,0);
   for(const other of Object.values(expected).filter(u=>u.id!==baseline.id)){
     const denied=await client.from('transactions').select('id').eq('id',other.fixtureId);if(denied.error)throw denied.error;
     report.otherOwnerHidden=denied.data.length===0;
   }
 }
 show(report);return session;
}
async function run(task){phase='request';for(const b of document.querySelectorAll('button'))b.disabled=true;try{await task();}catch(e){show({failed:true,phase,code:['refresh_token_not_found','refresh_token_already_used','session_not_found','bad_jwt'].includes(e.code)?e.code:'request-failed'});}finally{for(const b of document.querySelectorAll('button'))b.disabled=false;}}
document.getElementById('check').onclick=()=>run(checked);
document.getElementById('observe').onclick=()=>run(async()=>{
 const raw=await storage.getItem(key);if(!raw){show({stored:false});return;}
 const s=JSON.parse(raw);const jwt=JSON.parse(atob(s.access_token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
 const seed=JSON.parse(await storage.getItem(key+'.test.short')??'null');
 show({stored:true,fixture:s.user.id===fixtureId,tokenExpiresAt:jwt.exp,tokenIssuedAt:jwt.iat,expired:jwt.exp<=Date.now()/1000,shortToken:jwt.exp-jwt.iat<=120,changedSinceSeed:seed?jwt.exp!==seed.exp:null});
});
document.getElementById('short').onclick=()=>run(async()=>{
 if(!fixtureId||!fixtureEmail){show({refused:'fixture-required'});return;}
 const existing=await checked();if(existing&&existing.user.id!==fixtureId){show({refused:'human-account'});return;}
 const input=document.getElementById('fixture-password');const password=input.value;input.value='';
 phase='short-login';
 const r=await fetch('http://127.0.0.1:54331/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publishableKey},body:JSON.stringify({email:fixtureEmail,password})});
 if(!r.ok)throw new Error();const issued=await r.json();phase='short-identity';if(issued.user?.id!==fixtureId)throw new Error();
 phase='short-lifetime';
 const jwt=JSON.parse(atob(issued.access_token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(jwt.exp-jwt.iat>120)throw new Error();
 phase='short-session';const result=await client.auth.setSession({access_token:issued.access_token,refresh_token:issued.refresh_token});if(result.error)throw result.error;
 phase='short-storage';
 await storage.setItem(key+'.test.short',JSON.stringify({fixtureId,exp:jwt.exp,iat:jwt.iat}));
 show({fixtureSessionIssuedByAuth:true,actualTokenLifetime:jwt.exp-jwt.iat,validatedByOriginalAuth:result.data.user?.id===fixtureId});
});
document.getElementById('refresh').onclick=()=>run(async()=>{const before=await checked();if(!before)return;const r=await client.auth.refreshSession();if(r.error)throw r.error;show({refreshed:!!r.data.session,sameUser:r.data.session?.user.id===before.user.id,refreshRotated:r.data.session?.refresh_token!==before.refresh_token});await checked();});
document.getElementById('revoke').onclick=()=>run(async()=>{const s=await checked();if(s?.user.id!==fixtureId){show({refused:'human-account'});return;}revoked=s;const r=await client.auth.signOut({scope:'local'});if(r.error)throw r.error;show({fixtureRevoked:true,sessionRemoved:!await storage.getItem(key)});});
document.getElementById('invalid').onclick=()=>run(async()=>{if(revoked?.user.id!==fixtureId){show({refused:'fixture-required'});return;}client.auth.stopAutoRefresh();await storage.setItem(key,JSON.stringify({...revoked,expires_at:Math.floor(Date.now()/1000)-1}));show({revokedFixtureStored:true,testUsesExpiredMetadata:true,next:'Reabra o aplicativo para validar rejeição e limpeza.'});});
</script></html>`;
fs.mkdirSync(target,{recursive:true});fs.writeFileSync(path.join(target,'.owner'),marker);
fs.writeFileSync(path.join(target,'config.js'),compile('src/config/supabase.ts'));
fs.writeFileSync(path.join(target,'storage.js'),compile('src/lib/auth/storage.ts'));fs.writeFileSync(path.join(target,'client.js'),clientSource);
fs.copyFileSync(require.resolve('@supabase/supabase-js/dist/umd/supabase.js'),path.join(target,'sdk.js'));fs.writeFileSync(path.join(target,'index.html'),html);
console.log('Diagnóstico pronto em /__spec003-check/index.html; sem senha/tokens/chave administrativa no conteúdo.');
