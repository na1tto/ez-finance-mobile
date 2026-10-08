const test=require('node:test'), assert=require('node:assert/strict'), path=require('node:path');
const build=process.env.EZFINANCE_DOMAIN_BUILD;
const {FinanceController}=require(path.join(build,'lib/transactions/controller.js'));
const {TransactionRepository,createIntent}=require(path.join(build,'lib/transactions/repository.js'));
const {FinanceError}=require(path.join(build,'lib/transactions/errors.js'));
const {transactionCategories}=require(path.join(build,'constants/transactionCategories.js'));
const input={kind:'expense',description:'  fixture  ',amountCents:3590,categoryId:'expense-food',occurredOn:'2024-02-29'};
const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const result={transactions:[],totals:{incomeCents:0,expenseCents:0,balanceCents:0}};
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};
const sessionAuth={getSession:async()=>({data:{session:{user:{id:'A'},access_token:'fixture-token'}},error:null})};
function harness(){
  const repo={categories:async()=>transactionCategories,query:async()=>result,create:async intent=>({...intent.input,id:intent.id,userId:'A',createdAt:'now'}),update:async()=>{},delete:async()=>{}};
  let ids=0;const finance=new FinanceController(repo,()=>{ids++;return id});finance.bind('authenticated','A');
  return {finance,repo,get ids(){return ids}};
}
test('P07/P10: uncertain intent preserves fields and ID, prevents edits and double save, then reconciles',async()=>{
  const h=harness();await h.finance.load();h.finance.setDraft({description:'fixture',amountText:'35,90',categoryId:'expense-food'});
  const wait=deferred();let calls=0;h.repo.create=async()=>{calls++;await wait.promise;throw new FinanceError('uncertain')};
  const first=h.finance.saveDraft(),second=h.finance.saveDraft();assert.equal(first,second);wait.resolve();await first;
  assert.equal(calls,1);assert.equal(h.ids,1);assert.equal(h.finance.getSnapshot().draft.amountText,'35,90');
  assert.equal(h.finance.setDraft({amountText:'36,00'}),false);const stable=h.finance.getSnapshot().intent;
  h.repo.create=async()=>{throw new FinanceError('unauthorized')};await h.finance.saveDraft();
  assert.equal(h.finance.getSnapshot().intent,stable);assert.equal(h.finance.setDraft({amountText:'2'}),false);
  h.repo.create=async intent=>{assert.equal(intent,stable);return {...intent.input,id:intent.id,userId:'A',createdAt:'now'}};
  assert.equal((await h.finance.saveDraft()).confirmed,true);assert.equal(h.ids,1);assert.equal(h.finance.getSnapshot().draft.description,'');
});
test('P08/P11: late read/create/update/delete cannot repopulate B or logout; transient A draft survives',async()=>{
  for(const operation of ['read','create','update','delete']){
    const h=harness();await h.finance.load();h.finance.setDraft({description:'private A',amountText:'1',categoryId:'expense-food'});
    h.finance.bind('unavailable');assert.equal(h.finance.scope(),null);assert.equal(h.finance.getSnapshot().draft.description,'private A');
    h.finance.bind('authenticated','A');const wait=deferred();let pending;
    if(operation==='read'){h.repo.query=()=>wait.promise;pending=h.finance.load()}
    else if(operation==='create'){h.repo.create=()=>wait.promise;pending=h.finance.saveDraft()}
    else {h.repo[operation]=()=>wait.promise;pending=h.finance.mutate(repo=>repo[operation](id,input)).catch(()=>{})}
    h.finance.bind('authenticated','B');wait.resolve(operation==='read'?{...result,transactions:[{id,userId:'A'}]}:{...input,id,userId:'A'});await pending;
    assert.equal(h.finance.getSnapshot().owner,'B');assert.equal(h.finance.getSnapshot().result,null);assert.equal(h.finance.getSnapshot().draft.description,'');
    h.finance.bind('recovery');assert.equal(h.finance.scope(),null);assert.equal(h.finance.getSnapshot().owner,null);
  }
});
test('P09/P10: partial failure keeps last complete result; confirmed write and failed reload are separate',async()=>{
  const h=harness();const full={...result,transactions:[{...input,id,userId:'A'}]};h.repo.query=async()=>full;await h.finance.load();
  h.repo.query=async()=>{throw new FinanceError('unavailable')};assert.equal(await h.finance.load(),false);assert.equal(h.finance.getSnapshot().result,full);
  h.finance.setDraft({description:'fixture',amountText:'1',categoryId:'expense-food'});assert.equal((await h.finance.saveDraft()).confirmed,true);
  assert.match(h.finance.getSnapshot().writeMessage,/confirmada.*consulta falhou/);assert.equal(h.finance.getSnapshot().result,full);
  h.repo.query=async()=>full;await h.finance.load();assert.doesNotMatch(h.finance.getSnapshot().writeMessage,/consulta falhou/);
});
test('P05: failure on page two never returns page one as complete; only empty page terminates a capped query',async()=>{
  const row={id,user_id:'A',kind:'expense',description:'fixture',amount_cents:1,category_id:'expense-food',occurred_on:'2024-02-29',created_at:'now'};
  let calls=0, fail=true;
  const client={auth:sessionAuth,from(){const q={setHeader(){return q},select(){return q},eq(){return q},order(){return q},limit(){return q},or(){return q},abortSignal(){calls++;return Promise.resolve(calls===1?{data:[row],error:null,status:200}:fail?{data:null,error:{},status:503}:{data:[],error:null,status:200})}};return q}};
  const repo=new TransactionRepository(client,()=>({userId:'A',generation:0}),()=>{},200);
  await assert.rejects(repo.query(),e=>e.code==='unavailable');assert.equal(calls,2);
  fail=false;calls=0;const complete=await repo.query();assert.equal(complete.transactions.length,1);assert.equal(calls,2);
});
test('P01/P03/P11: validated scope required, UUID and DTO are internal, Auth errors revalidate not logout',async()=>{
  const intent=createIntent({...input,userId:'forged',createdAt:'forged'},()=>id);assert.equal(intent.input.description,'fixture');assert.equal(intent.input.userId,undefined);assert.ok(Object.isFrozen(intent.input));
  const repo=new TransactionRepository({},()=>null);assert.throws(()=>repo.get(id),e=>e.code==='unauthorized');
  let revalidations=0;const client={auth:sessionAuth,from(){const q={setHeader(){return q},select(){return q},eq(){return q},abortSignal:async()=>({data:null,error:{code:'PGRST301'},status:401})};return q}};
  const invalid=new TransactionRepository(client,()=>({userId:'A',generation:0}),()=>revalidations++);
  await assert.rejects(invalid.get(id),e=>e.code==='unauthorized');assert.equal(revalidations,1);
});

test('P08/P11: reload keeps mutation locked; logout clears operation memory before late completion',async()=>{
  const h=harness();await h.finance.load();let cleared=0;h.repo.clearOperationMemory=()=>cleared++;
  h.finance.setDraft({description:'fixture',amountText:'1',categoryId:'expense-food'});
  const wait=deferred();h.repo.query=()=>wait.promise;
  const save=h.finance.saveDraft();await new Promise(r=>setImmediate(r));
  assert.equal(h.finance.getSnapshot().operation,'saving');assert.equal(h.finance.setDraft({description:'overlap'}),false);
  await assert.rejects(h.finance.mutate(()=>Promise.resolve()),e=>e.code==='unauthorized');
  h.finance.bind('signedOut');assert.equal(cleared,1);wait.resolve(result);assert.equal((await save).confirmed,false);
  assert.equal(h.finance.getSnapshot().owner,null);assert.equal(h.finance.getSnapshot().result,null);
});

test('Q01: monthly navigation preserves civil boundaries and calendar limits',()=>{
 const {shiftCivilMonth,monthlyPeriod,formatCivilMonth,civilToday}=require(path.join(build,'domain/dates.js'));
 assert.equal(shiftCivilMonth('2024-12',1),'2025-01');assert.equal(shiftCivilMonth('2025-01',-1),'2024-12');
 assert.deepEqual(monthlyPeriod(shiftCivilMonth('2024-01',1)),{start:'2024-02-01',endExclusive:'2024-03-01'});
 assert.equal(shiftCivilMonth('0001-01',-1),null);assert.equal(shiftCivilMonth('9999-12',1),null);
 assert.equal(shiftCivilMonth('0001-12',1),'0002-01');assert.match(formatCivilMonth('2024-02'),/fevereiro.*2024/);
 assert.equal(civilToday(new Date('2026-11-01T01:00:00Z')).slice(0,7),'2026-10');
});
test('Q04/Q05: latest selection wins; failed new query retains complete result and confirmed context; retry uses current selection',async()=>{
 const h=harness();await h.finance.load({month:'2024-02',categoryId:'expense-food'});
 const confirmed=h.finance.getSnapshot().confirmedQuery,old=h.finance.getSnapshot().result;
 const first=deferred(),last=deferred();let calls=0;
 h.repo.query=()=>++calls===1?first.promise:last.promise;
 const a=h.finance.load({month:'2024-03',categoryId:'income-salary'}),b=h.finance.load({month:'2024-04'});
 assert.equal(h.finance.getSnapshot().status,'loading');assert.equal(h.finance.getSnapshot().confirmedQuery,confirmed);
 const latest={...result,transactions:[{id:'last'}]};last.resolve(latest);assert.equal(await b,true);
 first.resolve(old);assert.equal(await a,false);assert.equal(h.finance.getSnapshot().result,latest);
 h.repo.query=async()=>{throw new FinanceError('unavailable')};await h.finance.load({month:'2024-05',categoryId:'expense-food'});
 assert.equal(h.finance.getSnapshot().result,latest);assert.deepEqual(h.finance.getSnapshot().confirmedQuery,{month:'2024-04'});
 assert.deepEqual(h.finance.getSnapshot().query,{month:'2024-05',categoryId:'expense-food'});
 h.repo.query=async query=>{assert.deepEqual(query,{month:'2024-05',categoryId:'expense-food'});return result};await h.finance.load();
 assert.equal(h.finance.getSnapshot().result,result);assert.equal(h.finance.getSnapshot().confirmedQuery,h.finance.getSnapshot().query);
});
test('Q03/Q05: mutation reload retains selection; revalidation keeps it; identity/logout reset query and reject late reads',async()=>{
 const {civilToday}=require(path.join(build,'domain/dates.js'));const h=harness();const query={month:'2024-02',categoryId:'expense-food'};
 await h.finance.load(query);h.finance.bind('unavailable');h.finance.bind('authenticated','A');assert.deepEqual(h.finance.getSnapshot().query,query);
 let reads=0;h.repo.query=async filter=>{reads++;assert.deepEqual(filter,query);return result};await h.finance.mutate(()=>Promise.resolve({confirmed:true}));assert.equal(reads,1);
 const wait=deferred();h.repo.query=()=>wait.promise;const pending=h.finance.load();h.finance.bind('authenticated','B');
 assert.deepEqual(h.finance.getSnapshot().query,{month:civilToday().slice(0,7)});assert.equal(h.finance.getSnapshot().confirmedQuery,null);
 wait.resolve(result);assert.equal(await pending,false);assert.equal(h.finance.getSnapshot().result,null);
 h.finance.bind('signedOut');assert.deepEqual(h.finance.getSnapshot().query,{month:civilToday().slice(0,7)});
});

test('Q06: legacy Fast Refresh snapshot requires explicit reload, never relabels historical results',()=>{
 const {hasMonthlyQuery}=require(path.join(build,'lib/transactions/controller.js'));
 const h=harness(),snapshot=h.finance.getSnapshot();assert.equal(hasMonthlyQuery(snapshot),true);
 const {query,confirmedQuery,...legacy}=snapshot;legacy.result={...result,transactions:[{id:'historical'}]};
 assert.equal(hasMonthlyQuery(legacy),false);assert.equal(legacy.query,undefined);assert.equal(legacy.result.transactions[0].id,'historical');
});
