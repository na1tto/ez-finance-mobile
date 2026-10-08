// Manual browser integration harness for SPEC-005, local stack only.
// Admin credentials are confined to fixture setup, baseline reads and exact cleanup.
// The web app still uses only its public SDK and authenticated users under RLS.
// Commands: setup, proxy, mode <normal|read-fail|delay-read|before-METHOD|after-METHOD|reload-fail-METHOD>, verify, cleanup.
// Start a separate Expo instance on localhost:8082 with API http://127.0.0.1:54340.
// Do not publish private JSON, passwords, recovery URLs or server credentials.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {execFileSync}=require('node:child_process'),{parseEnv}=require('node:util'),{randomUUID}=require('node:crypto');
const {createClient}=require('@supabase/supabase-js');
// Reuse the same isolated transport/baseline/cleanup for the monthly proof.
const spec=['006','007'].includes(process.env.EZFINANCE_UI_SPEC)?process.env.EZFINANCE_UI_SPEC:'005';
const dir=path.resolve(__dirname,'../supabase/.temp'),file=path.join(dir,`spec${spec}-ui-private.json`),modeFile=path.join(dir,`spec${spec}-ui-mode.json`);
fs.mkdirSync(dir,{recursive:true});
const env=parseEnv(fs.readFileSync('.env.local','utf8')),url=env.EXPO_PUBLIC_SUPABASE_URL;
if(url!=='http://127.0.0.1:54321')throw Error('Somente stack local.');
function admin(){const status=JSON.parse(execFileSync('cmd.exe',['/d','/c','npx --offline --yes supabase@2.120.0 status -o json'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));return createClient(url,status.SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})}
async function humans(client){const listed=await client.auth.admin.listUsers({perPage:1000});if(listed.error)throw Error('Leitura de baseline falhou');return Promise.all(listed.data.users.filter(u=>['eduardo3245.ss@gmail.com','paop90646@gmail.com'].includes(u.email)).map(async u=>{const detail=await client.auth.admin.getUserById(u.id);if(detail.error)throw Error('Baseline indisponível');return {id:u.id,email:u.email,identities:detail.data.user.identities.map(i=>i.id).sort()};}));}
async function rows(client,users){
 const all=[];let cursor;for(;;){let q=client.from('transactions').select('*').in('user_id',users.map(u=>u.id)).order('id').limit(1000);if(cursor)q=q.gt('id',cursor);const r=await q;if(r.error)throw Error('Leitura financeira falhou');if(!r.data.length)return all;all.push(...r.data);cursor=r.data.at(-1).id;}
}
async function run(){const cmd=process.argv[2];
 if(cmd==='setup'){
  if(fs.existsSync(file))throw Error('Fixture existente: preservar.');
  const c=admin(),human=await humans(c),baseline=await rows(c,human);
  if(human.length!==2)throw Error('Baseline humana divergente; sem limpeza automática.');
  const state={human,baseline,users:[],ids:[]};fs.writeFileSync(file,JSON.stringify(state));
  for(const label of ['a','b']){const email=`spec${spec}-ui-${randomUUID()}-${label}@example.test`,password=`fixture-${randomUUID()}-!`;const made=await c.auth.admin.createUser({email,password,email_confirm:true});if(made.error)throw Error('Criação da fixture falhou');state.users.push({label,email,password,id:made.data.user.id});fs.writeFileSync(file,JSON.stringify(state));}
  fs.writeFileSync(modeFile,JSON.stringify({mode:'normal'}));console.log('Baseline: duas contas humanas preservadas; duas contas descartáveis preparadas.');return;
 }
 const state=JSON.parse(fs.readFileSync(file,'utf8'));
 if(cmd==='mode'){fs.writeFileSync(modeFile,JSON.stringify({mode:process.argv[3]}));console.log('Transporte controlado atualizado.');return;}

 if(cmd==='verify'||cmd==='cleanup'){
  const c=admin(),humanNow=await humans(c),humanRows=await rows(c,state.human);
  // SPEC-007 runs alongside human visual review: permit new human rows, never
  // modifications/removals of the baseline. Cleanup must preserve the entire live snapshot.
  const baselineSame=spec==='007'?state.baseline.every(b=>humanRows.some(r=>r.id===b.id&&JSON.stringify(r)===JSON.stringify(b))):JSON.stringify(humanRows)===JSON.stringify(state.baseline);
  if(JSON.stringify(humanNow.sort((a,b)=>a.id.localeCompare(b.id)))!==JSON.stringify([...state.human].sort((a,b)=>a.id.localeCompare(b.id)))||!baselineSame)throw Error('Baseline humana alterada; interromper limpeza.');
  const uiRows=await rows(c,state.users);if(uiRows.some(r=>!r.description.startsWith(`SPEC-${spec} UI `)))throw Error('Linha fora da fixture.');
  state.uiRows=uiRows;state.ids=uiRows.map(r=>({id:r.id,userId:r.user_id}));fs.writeFileSync(file,JSON.stringify(state));
  console.log(JSON.stringify({humanAccountsPreserved:true,humanRowsPreserved:true,concurrentHumanAdditions:humanRows.length-state.baseline.length,uiRows:uiRows.length,uiAmounts:uiRows.map(r=>r.amount_cents),descriptions:uiRows.map(r=>r.description),humanBaselineSame:true}));
  if(cmd==='cleanup'){
   for(const r of state.ids){const d=await c.from('transactions').delete().eq('id',r.id).eq('user_id',r.userId);if(d.error)throw Error('Limpeza de fixture falhou');}
   const mail=await fetch('http://127.0.0.1:54324/api/v1/messages?limit=1000').then(r=>r.json());
   const mailIds=mail.messages.filter(m=>m.To.some(to=>state.users.some(u=>u.email===to.Address))).map(m=>m.ID);
   if(mailIds.length){const removed=await fetch('http://127.0.0.1:54324/api/v1/messages',{method:'DELETE',headers:{'content-type':'application/json'},body:JSON.stringify({IDs:mailIds})});if(!removed.ok)throw Error('Limpeza de email da fixture falhou');}
   for(const u of state.users){const d=await c.auth.admin.deleteUser(u.id);if(d.error)throw Error('Limpeza da conta descartável falhou');}
   const remaining=await rows(c,state.human);if(JSON.stringify(remaining)!==JSON.stringify(humanRows))throw Error('Baseline após limpeza divergente');
   if((await rows(c,state.users)).length)throw Error('Fixture financeira ainda presente');
   for(const u of state.users){const check=await c.auth.admin.getUserById(u.id);if(check.data.user)throw Error('Conta descartável ainda presente');}
   const finalHumans=await humans(c);
   if(JSON.stringify(finalHumans.sort((a,b)=>a.id.localeCompare(b.id)))!==JSON.stringify([...state.human].sort((a,b)=>a.id.localeCompare(b.id))))throw Error('Identidades humanas após limpeza divergentes');
   for(const temporary of [file,modeFile,path.join(dir,`spec${spec}-ui-counts.json`)])if(fs.existsSync(temporary))fs.unlinkSync(temporary);
   console.log('Limpeza exata concluída; ambas as contas humanas e todos os outros lançamentos preservados.');
  }return;
 }
 if(cmd!=='proxy')throw Error('Comando inválido');
 const allow=new Set(state.users.map(u=>u.id)),refresh=new Set();let counts={POST:{calls:0,commits:0},PATCH:{calls:0,commits:0},DELETE:{calls:0,commits:0}}; const countFile=path.join(dir,`spec${spec}-ui-counts.json`); if(fs.existsSync(countFile))counts=JSON.parse(fs.readFileSync(countFile,'utf8')); const record=()=>fs.writeFileSync(countFile,JSON.stringify(counts)); record();
 http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  const cors={'access-control-allow-origin':'http://localhost:8082','access-control-allow-headers':'authorization,apikey,content-type,x-client-info,x-supabase-api-version,accept-profile,content-profile,prefer,range,range-unit,x-retry-count','access-control-allow-methods':'GET,POST,PATCH,DELETE,OPTIONS','access-control-expose-headers':'content-range'};
  if(origin&&origin!=='http://localhost:8082'){res.writeHead(403);return res.end();}
  if(req.method==='OPTIONS'){res.writeHead(204,cors);return res.end();}
  const target=new URL(req.url,url),body=await new Promise(resolve=>{const chunks=[];req.on('data',d=>chunks.push(d));req.on('end',()=>resolve(Buffer.concat(chunks)));});
  try{
   if(!/^\/(auth\/v1|rest\/v1)\//.test(target.pathname)||target.pathname.includes('/admin/'))throw Error();
   let sub;try{sub=JSON.parse(Buffer.from((req.headers.authorization??'').split('.')[1],'base64url')).sub;}catch{}
   if(target.pathname==='/auth/v1/token'){const data=JSON.parse(body.toString());if(target.searchParams.get('grant_type')==='password'){if(!state.users.some(u=>u.email===data.email))throw Error();}else if(!refresh.has(data.refresh_token))throw Error();}
   else if(!allow.has(sub))throw Error();
   const financial=target.pathname==='/rest/v1/transactions',mode=JSON.parse(fs.readFileSync(modeFile,'utf8')).mode;
   if(financial&&req.method==='GET'&&mode==='read-fail'){res.destroy();return;}
   if(financial&&['POST','PATCH','DELETE'].includes(req.method)){
    if(req.method!=='DELETE'){const data=JSON.parse(body.toString());if(!data.description?.startsWith(`SPEC-${spec} UI `))throw Error();}counts[req.method].calls++;record();
    if(mode==='before-'+req.method){fs.writeFileSync(modeFile,JSON.stringify({mode:'normal'}));res.writeHead(503,{...cors,'content-type':'application/json','content-length':'2'});res.write('{');const timer=setTimeout(()=>res.destroy(),30000);res.on('close',()=>clearTimeout(timer));return;}
   }
   const headers={...req.headers};delete headers.host;delete headers['content-length'];delete headers.connection;delete headers.origin;
   console.log(req.method,target.pathname,allow.has(sub));const response=await fetch(target,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:body});const data=Buffer.from(await response.arrayBuffer());console.log('HTTP',response.status);
   if(target.pathname==='/auth/v1/token'&&response.ok){const tokens=JSON.parse(data);refresh.add(tokens.refresh_token);}
   if(financial&&['POST','PATCH','DELETE'].includes(req.method)&&response.ok){counts[req.method].commits++;record();if(mode==='after-'+req.method){fs.writeFileSync(modeFile,JSON.stringify({mode:'normal'}));res.writeHead(response.status,{...cors,'content-type':'application/json','content-length':String(data.length)});res.write('[');const timer=setTimeout(()=>res.destroy(),30000);res.on('close',()=>clearTimeout(timer));return;}if(mode==='reload-fail-'+req.method)fs.writeFileSync(modeFile,JSON.stringify({mode:'read-fail'}));}
   if(financial&&req.method==='GET'&&target.searchParams.has('id')&&mode==='delay-read'){
    fs.writeFileSync(modeFile,JSON.stringify({mode:'normal'}));counts.delayedRead={captured:1,delivered:0};record();
    await new Promise(resolve=>setTimeout(resolve,12000));counts.delayedRead.delivered=1;record();
   }
   const out=Object.fromEntries(response.headers);delete out['content-encoding'];delete out['content-length'];delete out['transfer-encoding'];res.writeHead(response.status,{...out,...cors});res.end(data);
  }catch(error){console.log('Transport failure',error.name);res.writeHead(403,cors);res.end('{}');}
 }).listen(54340,'127.0.0.1',()=>console.log('Transporte da prova web ativo, restrito às duas fixtures.'));
}
run().catch(error=>{console.error(error instanceof TypeError ? error.message : "Falha em " + (error.code ?? "baseline"));console.error('Prova local interrompida; nenhuma credencial exibida.');process.exitCode=1;});
