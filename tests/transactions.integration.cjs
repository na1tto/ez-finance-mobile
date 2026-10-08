// Opt-in local SDK/Auth/API tests. Faults affect only this client's disposable fixtures.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {parseEnv}=require('node:util'),{execFileSync}=require('node:child_process'),{randomUUID}=require('node:crypto');
const {createClient}=require('@supabase/supabase-js');
const build=process.env.EZFINANCE_DOMAIN_BUILD;
const {TransactionRepository,createIntent}=require(path.join(build,'lib/transactions/repository.js'));
const {FinanceController}=require(path.join(build,'lib/transactions/controller.js'));
const env=parseEnv(fs.readFileSync('.env.local','utf8')),url=env.EXPO_PUBLIC_SUPABASE_URL,key=env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(url!=='http://127.0.0.1:54321')throw new Error('Somente stack local explícita.');
const input={kind:'expense',description:'SPEC-004 integration',amountCents:3590,categoryId:'expense-food',occurredOn:'2024-02-29'};
const publicClient=fetcher=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:fetcher?{fetch:fetcher}:undefined});

test('P01–P12 reais: CRUD, RLS, volume, rede e resposta perdida após commit', {timeout:120000},async()=>{
 const status=JSON.parse(execFileSync('cmd.exe',['/d','/c','npx --offline --yes supabase@2.120.0 status -o json'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));
 const admin=createClient(url,status.SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const users=[],ids=new Set(),clients=[];const suffix=randomUUID(),password='fixture-'+randomUUID()+'-!';
 let fault=null,committed=0,insertCalls=0,patchCalls=0,deleteCalls=0,pageCalls=0;
 const controlledFetch=async(request,options)=>{
   const target=new URL(typeof request==='string'?request:request.url??String(request));const method=(options?.method??'GET').toUpperCase();
   const financial=target.pathname==='/rest/v1/transactions';
   if(financial&&method==='POST')insertCalls++;
   if(financial&&method==='PATCH')patchCalls++;
   if(financial&&method==='DELETE')deleteCalls++;
   if(financial&&method==='GET'&&fault==='page-network'&&++pageCalls>=2){return fetch('http://127.0.0.1:59999'+target.pathname+target.search,options);}
   if(financial&&method==='POST'&&fault==='before'){fault=null;return fetch('http://127.0.0.1:59999'+target.pathname,options);}
   const response=await fetch(request,options);
   if(financial&&method===fault){
     fault=null;assert.ok(response.ok,'Serviço confirmou HTTP após commit real');await response.arrayBuffer();committed++;
     throw new TypeError('Resposta descartada somente após commit real da fixture');
   }
   return response;
 };
 try{
  for(const label of ['a','b']){
    const email=`spec004-${suffix}-${label}@example.test`;
    const created=await admin.auth.admin.createUser({email,password,email_confirm:true});assert.equal(created.error,null);users.push(created.data.user.id);
  }
  const a=publicClient(controlledFetch),b=publicClient();clients.push(a,b);
  const loginA=await a.auth.signInWithPassword({email:`spec004-${suffix}-a@example.test`,password});assert.equal(loginA.error,null);
  const loginB=await b.auth.signInWithPassword({email:`spec004-${suffix}-b@example.test`,password});assert.equal(loginB.error,null);
  let scopeA={userId:users[0],generation:0};const scopeB={userId:users[1],generation:0};
  const repoA=new TransactionRepository(a,()=>scopeA,()=>{},200,5000),repoB=new TransactionRepository(b,()=>scopeB);
  assert.equal((await repoA.categories()).length,10);
  const expenseIntent=createIntent(input,randomUUID);ids.add(expenseIntent.id);
  const expense=await repoA.create(expenseIntent);assert.equal(expense.userId,users[0]);assert.equal(expense.amountCents,3590);
  const salaryIntent=createIntent({...input,kind:'income',categoryId:'income-salary',amountCents:10000},randomUUID);ids.add(salaryIntent.id);
  const salary=await repoA.create(salaryIntent);assert.equal((await repoA.get(salary.id)).amountCents,10000);
  const totals=await repoA.query({month:'2024-02'});assert.deepEqual(totals.totals,{incomeCents:10000,expenseCents:3590,balanceCents:6410});
  assert.equal((await repoA.query({month:'2024-02',categoryId:'expense-food'})).totals.balanceCents,-3590);
  const outside=createIntent({...input,occurredOn:'2024-03-01',amountCents:1},randomUUID);ids.add(outside.id);await repoA.create(outside);
  assert.equal((await repoA.query({month:'2024-02'})).transactions.length,2);
  const changed=await repoA.update(expense.id,{...input,description:'SPEC-004 edited',amountCents:3600});
  assert.equal(changed.id,expense.id);assert.equal(changed.userId,expense.userId);assert.equal(changed.createdAt,expense.createdAt);
  assert.equal((await a.from('transactions').select('amount_cents').eq('id',expense.id)).data[0].amount_cents,3600);
  assert.equal((await repoA.delete(outside.id)).confirmed,true);assert.equal(await repoA.get(outside.id),null);
  await assert.rejects(repoA.delete(randomUUID()),e=>e.code==='not-found');
  assert.equal(await repoB.get(expense.id),null);assert.equal(await repoA.get(randomUUID()),null);
  await assert.rejects(repoB.update(expense.id,input),e=>e.code==='not-found');await assert.rejects(repoB.delete(expense.id),e=>e.code==='not-found');
  const dto={kind:'expense',description:'SPEC-004 unauthorized',amount_cents:1,category_id:'expense-food',occurred_on:'2024-02-29'};
  assert.equal((await b.from('transactions').insert({...dto,user_id:users[0]})).error.code,'42501');
  assert.deepEqual((await b.from('transactions').update({description:'forbidden'}).eq('id',expense.id).select('id')).data,[]);
  assert.deepEqual((await b.from('transactions').delete().eq('id',expense.id).select('id')).data,[]);
  for(const fields of [{id:randomUUID()},{user_id:users[1]},{created_at:'2000-01-01T00:00:00Z'}]) assert.equal((await a.from('transactions').update(fields).eq('id',expense.id)).error.code,'42501');
  const anonymous=publicClient();clients.push(anonymous);assert.equal((await anonymous.from('transactions').select('id')).error.code,'42501');
  for(const fields of [{amount_cents:0},{amount_cents:100000000},{amount_cents:1.1},{category_id:'income-salary'},{description:' \t '},{occurred_on:'9999-12-31'},{occurred_on:'2024-02-30'}]){
    const rejected=await a.from('transactions').insert({...dto,...fields});assert.ok(rejected.error,'Banco rejeita regra inválida');
  }
  // Real API cap stays 1000. Populate >1000 with this identity's JWT, not admin inserts.
  const volume=[];for(let i=0;i<1007;i++){const id=randomUUID();ids.add(id);volume.push({id,...dto,description:'SPEC-004 volume',amount_cents:1,occurred_on:'2023-01-15'});}
  for(let i=0;i<volume.length;i+=250){const inserted=await a.from('transactions').insert(volume.slice(i,i+250));assert.equal(inserted.error,null);}
  const capped=await a.from('transactions').select('id').eq('description','SPEC-004 volume');assert.equal(capped.data.length,1000);
  const complete=await repoA.query({month:'2023-01'});assert.equal(complete.transactions.length,1007);assert.equal(new Set(complete.transactions.map(t=>t.id)).size,1007);assert.equal(complete.totals.expenseCents,1007);
  pageCalls=0;fault='page-network';await assert.rejects(repoA.query({month:'2023-01'}),e=>e.code==='unavailable');assert.ok(pageCalls>=2);fault=null;
  const lost=createIntent({...input,description:'SPEC-004 lost response'},randomUUID);ids.add(lost.id);fault='POST';const insertsBefore=insertCalls;
  await assert.rejects(repoA.create(lost),e=>e.code==='uncertain');assert.equal(committed,1);
  const stored=await b.from('transactions').select('id').eq('id',lost.id);assert.equal(stored.data.length,0);
  assert.equal((await a.from('transactions').select('id',{count:'exact'}).eq('id',lost.id)).count,1);
  const reconciled=await repoA.create(lost);assert.equal(reconciled.id,lost.id);assert.equal(insertCalls,insertsBefore+1);
  await assert.rejects(repoA.create({id:lost.id,input:{...lost.input,amountCents:999}}),e=>e.code==='conflict');assert.equal((await repoA.get(lost.id)).amountCents,3590);
  await assert.rejects(repoB.create({id:lost.id,input:lost.input}),e=>e.code==='conflict');assert.equal(await repoB.get(lost.id),null);
  const before=createIntent({...input,description:'SPEC-004 before commit'},randomUUID);ids.add(before.id);fault='before';
  await assert.rejects(repoA.create(before),e=>e.code==='uncertain');assert.equal(await repoA.get(before.id),null);assert.equal((await repoA.create(before)).id,before.id);
  const twice=createIntent({...input,description:'SPEC-004 concurrent'},randomUUID);ids.add(twice.id);
  const pair=await Promise.all([repoA.create(twice),repoA.create(twice)]);assert.equal(pair[0].id,pair[1].id);assert.equal((await a.from('transactions').select('id',{count:'exact'}).eq('id',twice.id)).count,1);
  fault='PATCH';const patchesBefore=patchCalls;const edited={...input,description:'SPEC-004 update lost',amountCents:4567};
  await assert.rejects(repoA.update(lost.id,edited),e=>e.code==='uncertain');assert.equal((await repoA.get(lost.id)).amountCents,4567);
  await assert.rejects(repoA.update(lost.id,{...edited,amountCents:12}),e=>e.code==='conflict');assert.equal((await repoA.update(lost.id,edited)).id,lost.id);assert.equal(patchCalls,patchesBefore+1);
  fault='DELETE';const deletesBefore=deleteCalls;await assert.rejects(repoA.delete(lost.id),e=>e.code==='uncertain');
  assert.equal(await repoA.get(lost.id),null);assert.equal((await repoA.delete(lost.id)).reconciled,true);assert.equal(deleteCalls,deletesBefore+1);
  const refresh=await a.auth.refreshSession();assert.equal(refresh.error,null);assert.equal((await repoA.get(expense.id)).userId,users[0]);
  // Switch the real SDK session between the repository's snapshot and
  // fetchWithAuth's asynchronous token read. The committed owner must remain A.
  const raced=createIntent({...input,description:'SPEC-004 identity race'},randomUUID);ids.add(raced.id);
  const originalSession=a.auth.getSession.bind(a.auth);let sessionReads=0;
  a.auth.getSession=async()=>{
    if(++sessionReads===4){
      const switched=await a.auth.setSession({access_token:loginB.data.session.access_token,refresh_token:loginB.data.session.refresh_token});assert.equal(switched.error,null);
      scopeA={userId:users[1],generation:1};
    }
    return originalSession();
  };
  try{await assert.rejects(repoA.create(raced),e=>e.code==='stale');assert.equal(sessionReads,4)}finally{a.auth.getSession=originalSession;}
  const raceStored=await admin.from('transactions').select('user_id').eq('id',raced.id);assert.equal(raceStored.data[0].user_id,users[0]);assert.equal(await repoB.get(raced.id),null);
  const restored=await a.auth.signInWithPassword({email:`spec004-${suffix}-a@example.test`,password});assert.equal(restored.error,null);scopeA={userId:users[0],generation:2};
  let revalidations=0;
  let invalidApiCalls=0;
  const invalid=publicClient((request,options)=>{if(new URL(request).pathname.startsWith('/rest/v1/')){invalidApiCalls++;return fetch(request,{...options,headers:{...options.headers,Authorization:'Bearer invalid'}})}return fetch(request,options)});clients.push(invalid);
  const seeded=await invalid.auth.setSession({access_token:restored.data.session.access_token,refresh_token:restored.data.session.refresh_token});assert.equal(seeded.error,null);
  const invalidRepo=new TransactionRepository(invalid,()=>scopeA,()=>revalidations++);
  await assert.rejects(invalidRepo.get(expense.id),e=>e.code==='unauthorized');assert.equal(revalidations,1);assert.equal(invalidApiCalls,1);
  scopeA=null;assert.throws(()=>repoA.get(expense.id),e=>e.code==='unauthorized'); // recovery/disconnected validated state, still-real SDK JWT
  console.log('P01–P12: Auth/API reais, 1007 linhas completas; perdas após commits POST/PATCH/DELETE reconciliadas, sem duplicação.');
 }finally{
  clients.forEach(c=>c.auth.stopAutoRefresh());
  const known=[...ids];for(let i=0;i<known.length;i+=200){const deleted=await admin.from('transactions').delete().in('id',known.slice(i,i+200)).in('user_id',users);assert.equal(deleted.error,null)}
  for(const id of users){const deleted=await admin.auth.admin.deleteUser(id);assert.equal(deleted.error,null)}
 }
});
