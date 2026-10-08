const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {TransactionFormController,draftChanged,formErrors}=require(path.join(process.env.EZFINANCE_DOMAIN_BUILD,'lib/transactions/form.js'));
const {FinanceError}=require(path.join(process.env.EZFINANCE_DOMAIN_BUILD,'lib/transactions/errors.js'));
const row={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',userId:'A',createdAt:'2026-10-08T12:00:00Z',kind:'expense',description:'baseline',amountCents:3590,categoryId:'expense-food',occurredOn:'2024-02-29'};
const wait=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};
function setup(){const reader={get:async()=>row};let ids=0,calls=[];const h={reader,calls,writer:async op=>{calls.push(op);return op.kind==='delete'?{id:op.id,confirmed:true,reconciled:false}:{...row,...(op.kind==='create'?op.intent.input:op.input)}}};h.form=new TransactionFormController(reader,op=>h.writer(op),()=>{ids++;return row.id});h.form.bind('authenticated','A');Object.defineProperty(h,'ids',{get:()=>ids});return h;}
test('F02/F03/F07: every editable field and invalid text is dirty; exact monetary equivalent reverts',async()=>{
 const h=setup();await h.form.beginEdit(row.id);const initial=h.form.getSnapshot().draft;assert.equal(h.form.dirty(),false);
 for(const [field,value] of Object.entries({kind:'income',description:'',amountText:'NaN',categoryId:'',occurredOn:'2024-02-30'}))assert.equal(draftChanged({...initial,[field]:value},initial),true);
 assert.equal(draftChanged({...initial,amountText:'35.90'},initial),false);
 h.form.setDraft({kind:'income'});assert.equal(h.form.getSnapshot().draft.categoryId,'');assert.equal(h.form.dirty(),true);
 h.form.setDraft({...initial});assert.equal(h.form.dirty(),true); // changing kind clears category, requires explicit choice
 h.form.setDraft({categoryId:initial.categoryId});assert.equal(h.form.dirty(),false);
 const errors=formErrors({...initial,description:'',amountText:'35,901',categoryId:'income-salary',occurredOn:'9999-12-31'});assert.deepEqual(Object.keys(errors),['description','amountText','categoryId','occurredOn']);
});
test('F01/F03: new date initialized once; edits and catalog/renewal rerenders cannot reset it',()=>{
 const h=setup();h.form.beginCreate();const date=h.form.getSnapshot().draft.occurredOn;h.form.setDraft({occurredOn:'2024-02-29',description:'draft'});h.form.beginCreate();assert.equal(h.form.getSnapshot().draft.occurredOn,'2024-02-29');
 h.form.bind('unavailable');h.form.bind('authenticated','A');h.form.beginCreate();assert.equal(h.form.getSnapshot().draft.description,'draft');assert.ok(date);
 h.form.abandon();h.form.beginCreate();assert.equal(h.form.dirty(),false);assert.equal(h.form.getSnapshot().draft.description,'');
});
test('F04/F05: authorized baseline and immutable identity; late read never fills another ID',async()=>{
 const h=setup(),pending=wait();h.reader.get=id=>id===row.id?pending.promise:Promise.resolve({...row,id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'});
 const first=h.form.beginEdit(row.id);await h.form.beginEdit('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');pending.resolve(row);await first;assert.equal(h.form.getSnapshot().baseline.id,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
 h.form.setDraft({description:'changed'});await h.form.beginEdit(h.form.getSnapshot().id,true);assert.equal(h.form.getSnapshot().draft.description,'changed');
 h.form.abandon();h.reader.get=async()=>null;await h.form.beginEdit(row.id);assert.equal(h.form.getSnapshot().phase,'missing');assert.equal(await h.form.save(),false);
});
test('F08/F11/F12: discard never writes, busy exit/delete blocked and obsolete token cannot act on B',async()=>{
 const h=setup();h.form.beginCreate();h.form.setDraft({description:'private A',amountText:'1',categoryId:'expense-food'});const old=h.form.token();assert.equal(h.form.abandon(old),true);assert.equal(h.calls.length,0);
 h.form.beginCreate();h.form.setDraft({description:'pending',amountText:'1',categoryId:'expense-food'});const deferred=wait();h.writer=async()=>deferred.promise;
 const token=h.form.token(),saving=h.form.save();assert.equal(h.form.save(),saving);assert.equal(h.form.abandon(token),false);assert.equal(await h.form.remove(token),false);
 h.form.bind('authenticated','B');assert.equal(h.form.abandon(token),false);assert.equal(await h.form.remove(token),false);deferred.resolve(row);assert.equal(await saving,false);assert.equal(h.form.getSnapshot().owner,'B');assert.equal(h.form.getSnapshot().baseline,null);assert.equal(h.form.getSnapshot().draft.description,'');
});
test('F10/F11: uncertain create/update/delete freeze payload and reconcile same operation',async()=>{
 for(const kind of ['create','update','delete']){
  const h=setup();if(kind==='create')h.form.beginCreate();else await h.form.beginEdit(row.id);
  h.form.setDraft({description:'uncertain',amountText:'35,90',categoryId:'expense-food'});let first=true,operation;
  h.writer=async op=>{if(first){first=false;operation=op;throw new FinanceError('uncertain')}assert.equal(op,operation);return kind==='delete'?{id:row.id,confirmed:true,reconciled:true}:{...row,...(kind==='create'?op.intent.input:op.input)}};
  const submit=()=>kind==='delete'?h.form.remove(h.form.token()):h.form.save();assert.equal(await submit(),false);assert.equal(h.form.getSnapshot().phase,'uncertain');assert.equal(h.form.setDraft({description:'edited payload'}),false);assert.equal(h.form.getSnapshot().draft.description,'uncertain');
  assert.equal(await submit(),true);assert.equal(h.form.warnOnExit(),false);assert.equal(h.form.getSnapshot().phase,'complete');if(kind==='create')assert.equal(h.ids,1);
 }
});
test('F12: recovery prioritizes private cleanup; stale dialog cannot delete and errors never create fake baseline',async()=>{
 const h=setup();await h.form.beginEdit(row.id);h.form.setDraft({description:'private'});const token=h.form.token();h.form.bind('recovery');assert.equal(h.form.getSnapshot().baseline,null);assert.equal(h.form.warnOnExit(),false);assert.equal(await h.form.remove(token),false);
 h.form.bind('authenticated','A');h.reader.get=async()=>{throw new FinanceError('unavailable')};await h.form.beginEdit(row.id);assert.equal(h.form.getSnapshot().phase,'error');assert.equal(h.form.getSnapshot().baseline,null);assert.equal(await h.form.save(),false);
});

test('F05/F12: interrupted read stays blocked, explicit retry loads fresh and old response is ignored',async()=>{
 const h=setup(),old=wait();h.reader.get=()=>old.promise;const reading=h.form.beginEdit(row.id);
 h.form.bind('unavailable');h.form.bind('authenticated','A');assert.equal(h.form.getSnapshot().phase,'error');assert.ok(h.form.getSnapshot().message);
 h.reader.get=async()=>({...row,description:'fresh'});await h.form.beginEdit(row.id,true);old.resolve(row);await reading;
 assert.equal(h.form.getSnapshot().draft.description,'fresh');assert.equal(h.form.getSnapshot().phase,'ready');
});
test('F10: conflict after uncertain commit never generates a replacement UUID or unlocks payload',async()=>{
 const h=setup();h.form.beginCreate();h.form.setDraft({description:'conflict',amountText:'1',categoryId:'expense-food'});let first=true,original;
 h.writer=async op=>{if(first){first=false;original=op;throw new FinanceError('uncertain')}assert.equal(op,original);throw new FinanceError('conflict')};
 assert.equal(await h.form.save(),false);assert.equal(await h.form.save(),false);assert.equal(await h.form.save(),false);assert.equal(h.ids,1);
 assert.equal(h.form.getSnapshot().pending,original);assert.equal(h.form.setDraft({description:'replacement'}),false);assert.equal(h.form.warnOnExit(),true);
});
