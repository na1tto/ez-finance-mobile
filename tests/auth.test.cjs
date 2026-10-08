const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const build = process.env.EZFINANCE_DOMAIN_BUILD;
const { browserStorage, protectedStorage, trackedStorage, clearVerifiers, sessionKey, StorageUnavailableError } = require(path.join(build,'lib/auth/storage.js'));
const { parseCallback, parsePending, authMessage } = require(path.join(build,'lib/auth/contracts.js'));
const { AuthController } = require(path.join(build,'lib/auth/controller.js'));
const { authDestination } = require(path.join(build,'lib/auth/navigation.js'));
const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const pending = {id,kind:'google',createdAt:Date.now()};
const base = 'http://localhost:8081/auth/callback';
const memory = () => {const map=new Map(); return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>{map.set(k,v)},removeItem:k=>{map.delete(k)}};};

test('A06: callback origin, path, attempt and code are correlated; URL errors are redacted', () => {
  assert.equal(parseCallback(`${base}?attempt=${id}&code=private-code`,base,pending).code,'private-code');
  for (const url of [`https://evil.test/auth/callback?attempt=${id}&code=x`,`${base}?attempt=wrong&code=x`,`${base}?attempt=${id}`,`${base}?attempt=${id}&code=x&code=y`,`${base}?attempt=${id}&code=x#access_token=secret`,`${base}?attempt=${id}&error=private-error`]) {
    assert.throws(()=>parseCallback(url,base,pending), e=>!e.message.includes('private-error')&&!e.message.includes('secret'));
  }
  assert.equal(parsePending(JSON.stringify({...pending,createdAt:0})),null);
  assert.equal(parsePending('broken'),null);
  assert.ok(!authMessage(new Error('private-token')).includes('private-token'));
});
test('A09/A15: browser storage fails explicitly; namespaces and verifier cleanup stay isolated', async () => {
  const baseStore=memory();const s=trackedStorage(baseStore);const key=sessionKey('http://127.0.0.1:54321');
  assert.notEqual(key,sessionKey('https://example.supabase.co'));
  await s.setItem(key,'session');await s.setItem(key+'-code-verifier','private-verifier');
  await s.setItem(key+'-flow-abc-code-verifier','other-verifier');await baseStore.setItem('unrelated','keep');
  await clearVerifiers(s,key);
  assert.equal(await s.getItem(key+'-code-verifier'),null);assert.equal(await s.getItem(key+'-flow-abc-code-verifier'),null);
  assert.equal(await s.getItem(key),'session');assert.equal(await s.getItem('unrelated'),'keep');
  const blocked=browserStorage(()=>{throw new Error('private-storage-value')});
  for (const operation of [()=>blocked.getItem('x'),()=>blocked.setItem('x','secret'),()=>blocked.removeItem('x')]) await assert.rejects(operation(),StorageUnavailableError);
});
test('A16: protected store round-trips large sessions and does not commit partial writes', async () => {
  const store=memory();let n=0;const s=protectedStorage(store,()=>`v${++n}`);
  const large='😀é-token'.repeat(1600);await s.setItem('session',large);assert.ok(await s.getItem('session')===large);
  assert.ok([...store.map.values()].every(v=>Buffer.byteLength(v)<2048));
  const original=store.setItem;store.setItem=(k,v)=>{if(k.endsWith('.2'))throw new Error();return original(k,v)};
  await assert.rejects(s.setItem('session','x'.repeat(3000)),StorageUnavailableError);
  assert.ok(await s.getItem('session')===large);
  store.setItem=original;await s.removeItem('session');assert.equal(store.map.size,0);
});
function harness() {
  const storage=trackedStorage(memory());let listener=()=>{};let exchanges=0;let resolveSignIn;
  const session={access_token:'private-token',user:{id:'user-a',email_confirmed_at:'now'}};
  const sdk={auth:{
    onAuthStateChange(fn){listener=fn;return {data:{subscription:{unsubscribe(){}}}}},
    async getSession(){return {data:{session:null},error:null}},
    async getUser(){return {data:{user:session.user},error:null}},
    async signInWithPassword(){return new Promise(resolve=>{resolveSignIn=()=>resolve({data:{session},error:null})})},
    async exchangeCodeForSession(){exchanges++;listener('SIGNED_IN',session);return {data:{session,user:session.user},error:null}},
    async signOut(){listener('SIGNED_OUT',null);return {error:null}},
    async resetPasswordForEmail(){return {error:null}},
    async updateUser(){return {error:null}},
  }};
  const key=sessionKey('https://example.supabase.co');
  const auth=new AuthController({client:sdk,storage,key,redirect:p=>`http://localhost:8081/auth/${p}`,randomId:()=>id,serialize:(_k,fn)=>fn(),openOAuth:async()=>true});
  return {auth,storage,key,session,sdk,emit:(...args)=>listener(...args),get exchanges(){return exchanges},resolve:()=>resolveSignIn()};
}
test('Auth feedback distinguishes failure, information and clearing without parsing copy', async () => {
  const h=harness(); await h.auth.start();
  h.sdk.auth.signInWithPassword=async()=>({data:{session:null},error:{status:400,code:'invalid_credentials'}});
  await h.auth.signIn('fixture@example.test','fictional-password');
  assert.equal(h.auth.getSnapshot().messageKind,'error');
  assert.ok(h.auth.getSnapshot().message);
  await h.auth.cancelAttempt();
  assert.equal(h.auth.getSnapshot().messageKind,'info');
  await h.auth.logout();
  assert.equal(h.auth.getSnapshot().message,'');
  assert.equal(h.auth.getSnapshot().messageKind,'info'); h.auth.stop();
});
test('A07/A11: late login response cannot restore identity after logout', async () => {
  const h=harness();await h.auth.start();const login=h.auth.signIn('test@example.test','private-password');
  await new Promise(resolve=>setImmediate(resolve));await h.auth.logout();h.resolve();await login;
  assert.equal(h.auth.getSnapshot().status,'signedOut');assert.equal(h.auth.getSnapshot().session,null);h.auth.stop();
});
test('A05/A06/A07: duplicate callback exchanges once, obsolete callback leaves active attempt intact', async () => {
  const h=harness();await h.auth.start();await h.storage.setItem(h.key+'.attempt',JSON.stringify(pending));
  const bad=`${base}?attempt=obsolete&code=x`;await h.auth.handleCallback(bad);
  assert.ok(await h.storage.getItem(h.key+'.attempt'));
  const raw=`${base}?attempt=${id}&code=secret-code`;await Promise.all([h.auth.handleCallback(raw),h.auth.handleCallback(raw)]);
  assert.equal(h.exchanges,1);assert.equal(h.auth.getSnapshot().status,'authenticated');assert.equal(await h.storage.getItem(h.key+'.attempt'),null);h.auth.stop();
});
test('A08: recovery requires the Auth recovery event, remains restricted and clears on completion', async () => {
  const h=harness();await h.auth.start();await h.storage.setItem(h.key+'.attempt',JSON.stringify({...pending,kind:'recovery'}));
  h.sdk.auth.exchangeCodeForSession=async()=>{h.emit('PASSWORD_RECOVERY',h.session);return {data:{session:h.session,user:h.session.user},error:null}};
  await h.auth.handleCallback(`http://localhost:8081/auth/reset-password?attempt=${id}&code=secret-code`);
  assert.equal(h.auth.getSnapshot().status,'recovery');
  h.sdk.auth.updateUser=async()=>({error:{code:'weak_password'}});
  assert.equal(await h.auth.changePassword('new-private-password'),false);
  assert.equal(h.auth.getSnapshot().status,'recovery');
  h.sdk.auth.updateUser=async()=>({error:null});
  assert.equal(await h.auth.changePassword('new-private-password'),true);
  assert.equal(h.auth.getSnapshot().status,'signedOut');assert.equal(await h.storage.getItem(h.key+'.recovery'),null);
  const login=h.auth.signIn('test@example.test','new-private-password');
  await new Promise(resolve=>setImmediate(resolve));h.resolve();await login;
  assert.equal(h.auth.getSnapshot().status,'authenticated');
  assert.equal(authDestination(h.auth.getSnapshot().status,'/auth/reset-password'),'/');h.auth.stop();
});

test('A02/A08: validated login leaves recovery/public Auth routes; recovery cannot enter the dashboard', () => {
  for(const route of ['/auth/sign-in','/auth/sign-up','/auth/email-link','/auth/callback','/auth/reset-password']) {
    assert.equal(authDestination('authenticated',route),'/');
    assert.equal(authDestination('signedOut',route),null);
    assert.equal(authDestination('unavailable',route),null);
    assert.equal(authDestination('restoring',route),null);
  }
  assert.equal(authDestination('authenticated','/auth/account'),null);
  assert.equal(authDestination('authenticated','/expenses/new'),null);
  assert.equal(authDestination('recovery','/'),'/auth/reset-password');
  assert.equal(authDestination('recovery','/auth/sign-in'),'/auth/reset-password');
  assert.equal(authDestination('recovery','/auth/reset-password'),null);
});

test('A09: refresh on a scrubbed callback restores a valid session, not a second code exchange', async () => {
  const h=harness();h.sdk.auth.getSession=async()=>({data:{session:h.session},error:null});
  await h.auth.start(base);assert.equal(h.auth.getSnapshot().status,'authenticated');assert.equal(h.exchanges,0);h.auth.stop();
});

test('A06/A08: a callback claiming recovery without the Auth recovery event is rejected', async () => {
  const h=harness();await h.auth.start();await h.storage.setItem(h.key+'.attempt',JSON.stringify({...pending,kind:'recovery'}));
  await h.auth.handleCallback(`http://localhost:8081/auth/reset-password?attempt=${id}&code=code`);
  assert.equal(h.auth.getSnapshot().status,'signedOut');assert.equal(h.auth.getSnapshot().session,null);h.auth.stop();
});

test('A02/A10: temporary service failure blocks access, explicit retry validates with the service', async () => {
  const h=harness();h.sdk.auth.getSession=async()=>({data:{session:h.session},error:null});
  h.sdk.auth.getUser=async()=>({data:{user:null},error:{status:503}});
  await h.auth.start();assert.equal(h.auth.getSnapshot().status,'unavailable');assert.equal(h.auth.getSnapshot().session,null);
  h.sdk.auth.getUser=async()=>({data:{user:h.session.user},error:null});await h.auth.retry();assert.equal(h.auth.getSnapshot().status,'authenticated');h.auth.stop();
});

test('A12/A13: callback cannot switch an existing account or accept an unconfirmed identity', async () => {
  for (const user of [{id:'different-user',email_confirmed_at:'now'},{id:'user-a',email_confirmed_at:null}]) {
    const h=harness();await h.auth.start();
    await h.storage.setItem(h.key+'.attempt',JSON.stringify({...pending,userId:'user-a'}));
    h.sdk.auth.exchangeCodeForSession=async()=>({data:{session:{...h.session,user},user},error:null});
    await h.auth.handleCallback(`${base}?attempt=${id}&code=code`);
    assert.equal(h.auth.getSnapshot().status,'signedOut');assert.equal(h.auth.getSnapshot().session,null);h.auth.stop();
  }
});

test('A07/A09/A11: external login restores after logout and waits for callback purpose to commit', async () => {
  const h=harness();await h.auth.start();h.auth.invalidateLocal();
  h.sdk.auth.getSession=async()=>({data:{session:h.session},error:null});
  await h.storage.setItem(h.key+'.attempt',JSON.stringify({...pending,kind:'recovery'}));
  await h.auth.synchronizeSession();
  assert.equal(h.auth.getSnapshot().status,'restoring');assert.equal(h.auth.getSnapshot().session,null);
  await h.storage.setItem(h.key+'.recovery',h.session.user.id);
  await h.storage.removeItem(h.key+'.attempt');await h.auth.synchronizeSession();
  assert.equal(h.auth.getSnapshot().status,'recovery');
  h.auth.invalidateLocal();await h.storage.removeItem(h.key+'.recovery');await h.auth.synchronizeSession();
  assert.equal(h.auth.getSnapshot().status,'authenticated');h.auth.stop();
});

test('A07/A08: SDK broadcast cannot admit a session before callback purpose commits', async () => {
  const h=harness();await h.auth.start();
  await h.storage.setItem(h.key+'.attempt',JSON.stringify({...pending,kind:'recovery'}));
  h.emit('SIGNED_IN',h.session);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(h.auth.getSnapshot().status,'restoring');
  assert.equal(h.auth.getSnapshot().session,null);
  assert.equal(h.auth.getSnapshot().pending,true);
  await h.storage.setItem(h.key+'.recovery',h.session.user.id);
  await h.storage.removeItem(h.key+'.attempt');
  h.sdk.auth.getSession=async()=>({data:{session:h.session},error:null});
  await h.auth.synchronizeSession();
  assert.equal(h.auth.getSnapshot().status,'recovery');h.auth.stop();
});
