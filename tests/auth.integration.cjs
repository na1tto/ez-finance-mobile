// Explicit opt-in: local Auth/API/email integration. Fixtures only; never product CRUD.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {parseEnv}=require('node:util');const {execFileSync}=require('node:child_process');
const {randomUUID}=require('node:crypto');
const {createClient}=require('@supabase/supabase-js');
const build=process.env.EZFINANCE_DOMAIN_BUILD;
const {createSupabaseClientProvider}=require(path.join(build,'lib/supabase/client.js'));
const {AuthController}=require(path.join(build,'lib/auth/controller.js'));
const {trackedStorage,sessionKey}=require(path.join(build,'lib/auth/storage.js'));
const environment=parseEnv(fs.readFileSync('.env.local','utf8'));
const url=environment.EXPO_PUBLIC_SUPABASE_URL, publicKey=environment.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Refuse any hosted target. Administrative credential only in this Node test's memory, for scoped cleanup.
if(url!=='http://127.0.0.1:54321') throw new Error('Integração requer explicitamente a stack local 127.0.0.1:54321.');
const checks=(condition,label)=>assert.ok(!!condition,label);
const makeMemory=()=>{const map=new Map();return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>{map.set(k,v)},removeItem:k=>{map.delete(k)}};};
const sdk=(storage)=>createSupabaseClientProvider(()=>({url,publishableKey:publicKey}),storage)();
const controller=(client,storage)=>new AuthController({client,storage,key:sessionKey(url),redirect:p=>`http://localhost:8081/auth/${p}`,randomId:randomUUID,serialize:(_k,fn)=>fn(),openOAuth:async()=>false});
const delay=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
const consumedMessages=new Set();
async function emailCallback(email) {
  for(let i=0;i<20;i++){
    const response=await fetch('http://127.0.0.1:54324/api/v1/messages').then(r=>r.json());
    const list=response.messages.filter(m=>m.To.some(to=>to.Address===email)&&!consumedMessages.has(m.ID)).sort((a,b)=>new Date(b.Created)-new Date(a.Created));
    if(list.length){
      const latest=list[0];const message=await fetch(`http://127.0.0.1:54324/api/v1/message/${latest.ID}`).then(r=>r.json());
      list.forEach(m=>consumedMessages.add(m.ID));
      const text=[message.Text,message.HTML].filter(Boolean).join('\n');
      const link=text.match(/https?:\/\/[^\s"<>]*\/auth\/v1\/verify\?[^\s"<>]*/)?.[0]?.replaceAll('&amp;','&');
      checks(link,'Email contém link de verificação local');
      const parsed=new URL(link);checks(parsed.origin===url,'Link pertence à stack local');
      const response=await fetch(link,{redirect:'manual'});
      const location=response.headers.get('location');checks(response.status===303||response.status===302,'Auth redireciona email verificado');
      checks(location?.startsWith('http://localhost:8081/auth/'),'Destino correto sem publicar código');
      return {location,link};
    }
    await delay(250);
  }
  throw new Error('Email de teste não recebido no capturador local.');
}

test('Auth/API reais: confirmação, reenvio, senha, recuperação, renovação, logout e isolamento', {timeout:90000}, async()=>{
  const status=JSON.parse(execFileSync('cmd.exe',['/d','/c','npx --offline --yes supabase@2.120.0 status -o json'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));
  const admin=createClient(url,status.SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const fixtures=[];const clients=[];const controllers=[];const financialIds=[];
  const suffix=randomUUID().replaceAll('-','');const emailA=`spec003-${suffix}-a@example.test`,emailB=`spec003-${suffix}-b@example.test`;
  const password=`test-${randomUUID()}-!`, newPassword=`renew-${randomUUID()}-!`;
  const storeA=trackedStorage(makeMemory());const clientA=sdk(storeA);clients.push(clientA);
  const authA=controller(clientA,storeA);controllers.push(authA);await authA.start();
  try{
    const settings=await fetch(url+'/auth/v1/settings',{headers:{apikey:publicKey}}).then(r=>r.json());checks(settings.external.google,'Google habilitado');
    await authA.emailLink('signup',emailA,password);
    const created=await admin.auth.admin.listUsers({page:1,perPage:1000});
    const userA=created.data.users.find(u=>u.email===emailA);checks(userA,'Fixture A criada');fixtures.push(userA.id);
    checks(authA.getSnapshot().status==='signedOut','Cadastro não confirmado não autentica');
    const invalid=await clientA.auth.signInWithPassword({email:emailA,password});checks(invalid.error?.code==='email_not_confirmed','Email não confirmado rejeitado');
    await authA.cancelAttempt();await delay(1100);await authA.emailLink('confirmation',emailA);
    const confirmation=await emailCallback(emailA);await authA.handleCallback(confirmation.location);
    checks(authA.getSnapshot().status==='authenticated','Confirmação real cria sessão verificada');
    checks(authA.getSnapshot().session.user.id===userA.id,'Confirmação preserva dono');
    await authA.logout();checks(authA.getSnapshot().session===null,'Logout limpa estado');
    await authA.signIn(emailA,'incorrect-password');checks(authA.getSnapshot().status==='signedOut','Senha incorreta rejeitada');
    await authA.signIn(emailA,password);checks(authA.getSnapshot().status==='authenticated','Senha correta autentica');
    // New SDK/runtime reads the exact same persistent storage; no token assertions print values.
    authA.stop();clientA.auth.stopAutoRefresh();
    const restoredClient=sdk(storeA);clients.push(restoredClient);const restored=controller(restoredClient,storeA);controllers.push(restored);await restored.start();
    checks(restored.getSnapshot().status==='authenticated','Sessão restaurada em outro runtime');
    const beforeRefresh=restored.getSnapshot().session.access_token;
    const refresh=await restoredClient.auth.refreshSession();checks(!refresh.error&&refresh.data.session,'Refresh real aceito');
    checks(refresh.data.session.user.id===userA.id,'Refresh mantém identidade');
    // Access tokens may be equal if refreshed in same second; success/identity is the proof.
    checks(!!beforeRefresh,'Sessão anterior presente');await delay(50);
    await restored.emailLink('recovery',emailA);const recovery=await emailCallback(emailA);await restored.handleCallback(recovery.location);
    checks(restored.getSnapshot().status==='recovery','Recuperação fica restrita');
    await restored.changePassword(newPassword);checks(restored.getSnapshot().status==='signedOut','Mudança de senha exige nova entrada');
    await restored.signIn(emailA,password);checks(restored.getSnapshot().status==='signedOut','Senha anterior rejeitada');
    await restored.signIn(emailA,newPassword);checks(restored.getSnapshot().status==='authenticated','Senha nova aceita');
    const reused=await fetch(recovery.link,{redirect:'manual'});const reusedLocation=reused.headers.get('location');
    checks(!reusedLocation || new URL(reusedLocation).searchParams.has('error') || reused.status>=400,'Link recuperacao reutilizado rejeitado');
    // Fixture B uses real signup/confirmation, not administrative token issuance.
    const storeB=trackedStorage(makeMemory()),clientB=sdk(storeB),authB=controller(clientB,storeB);clients.push(clientB);controllers.push(authB);await authB.start();
    await authB.emailLink('signup',emailB,password);
    const bList=await admin.auth.admin.listUsers({page:1,perPage:1000});const userB=bList.data.users.find(u=>u.email===emailB);checks(userB,'Fixture B criada');fixtures.push(userB.id);
    const bConfirmation=await emailCallback(emailB);await authB.handleCallback(bConfirmation.location);checks(authB.getSnapshot().status==='authenticated','B confirmado pelo serviço');
    const fields={kind:'expense',description:'SPEC-003 fixture only',amount_cents:100,category_id:'expense-food',occurred_on:'2026-10-07'};
    const inserted=await clientB.from('transactions').insert(fields).select('id').single();checks(!inserted.error&&inserted.data?.id,'B cria sua fixture');financialIds.push(inserted.data.id);
    const aRead=await restoredClient.from('transactions').select('id,amount_cents').eq('id',inserted.data.id);checks(!aRead.error&&aRead.data.length===0,'A não lê B; total da consulta é zero');
    const aUpdate=await restoredClient.from('transactions').update({description:'forbidden'}).eq('id',inserted.data.id).select('id');checks(!aUpdate.error&&aUpdate.data.length===0,'A não altera B');
    const aDelete=await restoredClient.from('transactions').delete().eq('id',inserted.data.id).select('id');checks(!aDelete.error&&aDelete.data.length===0,'A não exclui B');
    const aImpersonation=await restoredClient.from('transactions').insert({...fields,user_id:userB.id});checks(aImpersonation.error?.code==='42501','A não insere em nome de B');
    const bRead=await clientB.from('transactions').select('description').eq('id',inserted.data.id);checks(bRead.data?.[0]?.description===fields.description,'Fixture B preservada');
    const noSession=sdk(trackedStorage(makeMemory()));clients.push(noSession);const denied=await noSession.from('transactions').select('id');checks(denied.error?.code==='42501','Sem sessão negação financeira');
    // Claiming an existing verified email through signup must not issue a session,
    // change that account's password/ID or authorize its financial owner.
    const claimant=sdk(trackedStorage(makeMemory()));clients.push(claimant);
    const collision=await claimant.auth.signUp({email:emailB.toUpperCase(),password:`claim-${randomUUID()}-!`});
    checks(!collision.data.session,'Coincidência de email não emite sessão');
    const original=await admin.auth.admin.getUserById(userB.id);
    checks(original.data.user?.email===emailB&&!!original.data.user.email_confirmed_at,'Identidade original preservada');
    const originalLogin=await clientB.auth.signInWithPassword({email:emailB,password});
    checks(!originalLogin.error&&originalLogin.data.user?.id===userB.id,'Senha e ID originais preservados após coincidência');
    const claimantRead=await claimant.from('transactions').select('id');checks(claimantRead.error?.code==='42501','Email coincidente sem identidade não recebe histórico');
    // Real closed TCP endpoint: no mocked SDK response and no interruption of Auth.
    const offlineStore=trackedStorage(makeMemory());
    const offlineUrl='http://127.0.0.1:59999';
    await offlineStore.setItem(sessionKey(offlineUrl),JSON.stringify(restored.getSnapshot().session));
    const offlineClient=createSupabaseClientProvider(()=>({url:offlineUrl,publishableKey:publicKey}),offlineStore)();clients.push(offlineClient);
    const offlineAuth=new AuthController({client:offlineClient,storage:offlineStore,key:sessionKey(offlineUrl),redirect:p=>`http://localhost:8081/auth/${p}`,randomId:randomUUID,serialize:(_k,fn)=>fn(),openOAuth:async()=>false});controllers.push(offlineAuth);
    await offlineAuth.start();checks(offlineAuth.getSnapshot().status==='unavailable'&&offlineAuth.getSnapshot().session===null,'Falha real de conexão bloqueia conteúdo como indisponível');
    checks(!!await offlineStore.getItem(sessionKey(offlineUrl)),'Falha transitória preserva material para tentar novamente');
    // Real PKCE server rejection with a wrong verifier and local callback replay guard.
    await authB.logout();await authB.emailLink('recovery',emailB);const wrong=await emailCallback(emailB);
    await storeB.setItem(sessionKey(url)+'-code-verifier',JSON.stringify('wrong-verifier/recovery'));
    await authB.handleCallback(wrong.location);checks(authB.getSnapshot().status!=='authenticated'&&authB.getSnapshot().status!=='recovery','Verifier incorreto não cria sessão');
    const revokedSession=restored.getSnapshot().session;
    await restored.logout();checks(await storeA.getItem(sessionKey(url))===null,'Sessão persistente removida ao sair');
    const expiredStore=trackedStorage(makeMemory());
    // Only fixture metadata is made stale, never the host clock/Auth protection.
    await expiredStore.setItem(sessionKey(url),JSON.stringify({...revokedSession,expires_at:Math.floor(Date.now()/1000)-1}));
    const expiredClient=sdk(expiredStore),expiredAuth=controller(expiredClient,expiredStore);clients.push(expiredClient);controllers.push(expiredAuth);await expiredAuth.start();
    checks(expiredAuth.getSnapshot().status==='signedOut','Refresh revogado durante restauração exige novo login');
    checks(await expiredStore.getItem(sessionKey(url))===null,'Material não recuperável removido');
  } finally {
    controllers.forEach(c=>c.stop());clients.forEach(c=>c.auth.stopAutoRefresh());
    for(const fixtureId of financialIds){const r=await admin.from('transactions').delete().eq('id',fixtureId);checks(!r.error,'Limpeza financeira da fixture');}
    for(const userId of fixtures){const r=await admin.auth.admin.deleteUser(userId);checks(!r.error,'Limpeza da conta fictícia');}
    const mail=await fetch('http://127.0.0.1:54324/api/v1/messages?limit=1000').then(r=>r.json());
    const ids=[...new Set(mail.messages.filter(m=>m.To.some(to=>[emailA,emailB].includes(to.Address))).map(m=>m.ID))];
    // Empty IDs mean delete-all in Mailpit: never issue that request.
    if(ids.length){const r=await fetch('http://127.0.0.1:54324/api/v1/messages',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({IDs:ids})});checks(r.ok,'Limpeza somente dos emails desta execução');}
  }
});
