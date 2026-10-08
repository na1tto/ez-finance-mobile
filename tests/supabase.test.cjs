const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { readPublicSupabaseConfig, SupabaseConfigurationError } = require(path.join(process.env.EZFINANCE_DOMAIN_BUILD,'config/supabase.js'));
const { createSupabaseClientProvider } = require(path.join(process.env.EZFINANCE_DOMAIN_BUILD,'lib/supabase/client.js'));
const environment = {url:'http://127.0.0.1:54321',publishableKey:'sb_publishable_spec002_test_only'};
const jwt = (role) => `${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({role})).toString('base64url')}.test`;

test('E02: absent/malformed config is rejected with redacted diagnostics', () => {
  for (const config of [{}, {...environment,url:undefined}, {...environment,url:''},
    {...environment,url:'not-a-url'}, {...environment,url:'ftp://example.com'},
    {...environment,url:'https://user:private-password@example.com'},
    {...environment,url:'https://example.com?key=private-key'},
    {...environment,url:'https://example.com#private-key'},
    {...environment,publishableKey:undefined}, {...environment,publishableKey:''},
    {...environment,publishableKey:'your-publishable-or-legacy-anon-key'}]) {
    assert.throws(() => readPublicSupabaseConfig(config), error => {
      assert.ok(error instanceof SupabaseConfigurationError);
      assert.doesNotMatch(error.message,/private-password|private-key|test_only/);
      return true;
    });
  }
});
test('E03/E04: public keys accepted, administrative JWT/secret rejected', () => {
  assert.equal(readPublicSupabaseConfig(environment).publishableKey,environment.publishableKey);
  assert.equal(readPublicSupabaseConfig({...environment,publishableKey:jwt('anon')}).publishableKey,jwt('anon'));
  for (const key of ['sb_secret_do_not_log',jwt('service_role'),jwt('authenticated'),'postgres-password','bad.bad.bad']) {
    assert.throws(() => readPublicSupabaseConfig({...environment,publishableKey:key}), error => {
      assert.ok(!error.message.includes(key));
      return true;
    });
  }
});
test('E03: configuration stays on the requested endpoint without fallback', () => {
  assert.equal(readPublicSupabaseConfig({...environment,url:' https://example.supabase.co/ '}).url,'https://example.supabase.co');
  assert.equal(readPublicSupabaseConfig({...environment,url:'http://10.0.2.2:54321'}).url,'http://10.0.2.2:54321');
  assert.throws(() => readPublicSupabaseConfig({...environment,url:' '}));
});
test('E05: SDK construction is lazy, reused and PKCE/nonpersistent without network', async () => {
  let reads = 0;
  const getClient = createSupabaseClientProvider(() => { reads++; return environment; });
  assert.equal(reads,0);
  const client = getClient();
  assert.equal(getClient(),client);
  assert.equal(reads,1);
  assert.equal(client.auth.flowType,'pkce');
  assert.equal(client.auth.persistSession,false);
  assert.equal(client.auth.autoRefreshToken,false);
  assert.equal(client.auth.detectSessionInUrl,false);
  const result = await client.auth.getSession();
  assert.equal(result.error,null);
  assert.equal(result.data.session,null);
});
test('E02/E05: invalid configuration never caches a client or falls back', () => {
  let valid = false;
  const getClient = createSupabaseClientProvider(() => valid ? environment : {});
  assert.throws(() => getClient(),SupabaseConfigurationError);
  valid = true;
  assert.equal(getClient(),getClient());
});

test('E05/A09: reviewed persistent adapter enables SDK refresh and keeps explicit callback exchange', async () => {
  const values=new Map();
  const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  const client=createSupabaseClientProvider(()=>environment,storage)();
  assert.equal(client.auth.flowType,'pkce');assert.equal(client.auth.persistSession,true);
  assert.equal(client.auth.autoRefreshToken,true);assert.equal(client.auth.detectSessionInUrl,false);
  await client.auth.getSession();client.auth.stopAutoRefresh();
});

test('E02/E04: Expo preflight rejects missing/administrative config before bundling', () => {
  const { spawnSync } = require('node:child_process');
  const workspace = path.resolve(__dirname,'..');
  for (const changes of [
    {EXPO_PUBLIC_SUPABASE_URL:''},
    {EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_secret_never_print_this'},
    {EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:jwt('service_role')},
  ]) {
    const result = spawnSync(process.execPath,['scripts/expo.cjs','export'],{
      cwd:workspace,encoding:'utf8',env:{...process.env,EXPO_NO_DOTENV:'1',
        EXPO_PUBLIC_SUPABASE_URL:environment.url,EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:environment.publishableKey,...changes},
    });
    assert.equal(result.status,1);
    assert.match(result.stderr,/EXPO_PUBLIC_SUPABASE/);
    assert.doesNotMatch(result.stdout+result.stderr,/never_print_this/);
    assert.ok(!(result.stdout+result.stderr).includes(jwt('service_role')));
  }
});
