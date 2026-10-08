const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const load = (file) => require(path.join(process.env.EZFINANCE_DOMAIN_BUILD, file));
const money = load('domain/money.js');
const dates = load('domain/dates.js');
const domain = load('domain/transactions.js');
const { transactionCategories } = load('constants/transactionCategories.js');
const today = '2026-10-07';
const input = (changes = {}) => ({ kind: 'expense', description: ' Teste ', amountCents: 3590,
  categoryId: 'expense-food', occurredOn: today, ...changes });
const tx = (changes = {}) => ({ ...input(), id: 'local-test', userId: 'user-a', createdAt: '2026-10-07T12:00:00Z', ...changes });

test('M01/M02: exact conversion and inclusive boundaries', () => {
  for (const [text, cents] of [['40',4000], ['32,50',3250], ['32.50',3250], ['0,1',10], ['0,01',1], ['999999,99',99999999], [' 00032,50 ',3250]]) {
    assert.equal(money.parseAmountCents(text), cents);
  }
});
test('M03: reject malformed, nonfinite and out-of-range amounts', () => {
  for (const text of ['0', '-1', '', 'Infinity', 'NaN', '1e3', '1.250,50', '1,234', '1000000', '1,', '.1', '+1', '1 0', '1\n2']) {
    assert.throws(() => money.parseAmountCents(text), undefined, text);
  }
});
test('M04/M06: exact sums beyond per-entry ceiling and overflow rejection', () => {
  assert.equal(money.safeSumCents([3590,2250,4000]),9840);
  assert.equal(money.safeSumCents([10,20]),30);
  assert.equal(domain.transactionTotals([input({amountCents:99999999}), input({amountCents:99999999})]).expenseCents,199999998);
  assert.throws(() => money.safeSumCents([Number.MAX_SAFE_INTEGER,1]));
  assert.throws(() => money.safeSumCents([0.1]));
});
test('M05: filtered totals, negative and empty balance', () => {
  assert.deepEqual(domain.transactionTotals([input({kind:'income',categoryId:'income-salary',amountCents:10000}),input()]),
    {incomeCents:10000,expenseCents:3590,balanceCents:6410});
  assert.equal(domain.transactionTotals([input()]).balanceCents,-3590);
  assert.deepEqual(domain.transactionTotals([]),{incomeCents:0,expenseCents:0,balanceCents:0});
  const result = domain.queryTransactions([tx(),tx({kind:'income',categoryId:'income-salary',amountCents:10000})],{month:'2026-10',categoryId:'expense-food'});
  assert.equal(result.transactions.length,1);
  assert.equal(result.totals.incomeCents,0);
  assert.equal(result.totals.balanceCents,-3590);
});
test('BRL: exact formatting of entries, negative balances and safe maximum', () => {
  assert.equal(money.formatBRL(3250),'R$\u00a032,50');
  assert.equal(money.formatBRL(-3590),'-R$\u00a035,90');
  assert.equal(money.formatBRL(99999999),'R$\u00a0999.999,99');
  assert.equal(money.formatBRL(Number.MAX_SAFE_INTEGER),'R$\u00a090.071.992.547.409,91');
  assert.throws(() => money.formatBRL(Infinity));
});
test('D01: injectable today, default date and future rejected on every input', () => {
  assert.equal(domain.validateTransactionInput(input(),today).occurredOn,today);
  assert.equal(domain.validateTransactionInput(input({occurredOn:'2026-10-06'}),today).occurredOn,'2026-10-06');
  assert.throws(() => domain.validateTransactionInput(input({occurredOn:'2026-10-08'}),today));
  assert.equal(domain.validateTransactionDraft({kind:'expense',description:'x',amountText:'1',categoryId:'expense-food'},today).occurredOn,today);
  assert.equal(dates.civilToday(new Date('2026-10-08T02:59:59Z')),today);
  assert.equal(dates.civilToday(new Date('2026-10-08T03:00:00Z')),'2026-10-08');
});
test('D02: calendar, leap centuries, format and civil bounds', () => {
  for (const value of ['2024-02-29','2000-02-29','0001-01-01','9999-12-31']) assert.equal(dates.validateCivilDate(value),value);
  for (const value of ['2025-02-29','2026-02-30','1900-02-29','0000-01-01','2026-13-01','2026-00-01','2026-01-00','2026-1-01']) assert.throws(() => dates.validateCivilDate(value));
});
test('D03: month bounds including December, no timezone conversion', () => {
  assert.deepEqual(dates.monthlyPeriod('2026-12'),{start:'2026-12-01',endExclusive:'2027-01-01'});
  const result = domain.queryTransactions(['2026-09-30','2026-10-01','2026-10-31','2026-11-01'].map(occurredOn => tx({occurredOn})),{month:'2026-10'});
  assert.deepEqual(result.transactions.map(t=>t.occurredOn),['2026-10-01','2026-10-31']);
  assert.equal(result.totals.expenseCents,7180);
  assert.equal(domain.queryTransactions([tx({occurredOn:'9999-12-31'})],{month:'9999-12'}).transactions.length,1);
  assert.throws(() => dates.monthlyPeriod('2026-13'));
});
test('C01/V01: fixed catalog, coherent kind/category and valid fields', () => {
  assert.equal(transactionCategories.length,10);
  assert.equal(new Set(transactionCategories.map(c=>c.id)).size,10);
  for (const category of transactionCategories) assert.doesNotThrow(() => domain.validateTransactionInput(input({kind:category.kind,categoryId:category.id}),today));
  for (const changes of [{kind:'income'}, {categoryId:'missing'}, {kind:'unknown'}, {description:' \t\n '}, ...[0,-1,1.5,NaN,Infinity,100000000].map(amountCents=>({amountCents}))]) {
    assert.throws(() => domain.validateTransactionInput(input(changes),today));
  }
  assert.equal(domain.validateTransactionInput(input(),today).description,'Teste');
});
test('DTO mapping strips identity and preserves units/civil dates', () => {
  const row = domain.transactionInputToRow(tx(),today);
  assert.deepEqual(row,{kind:'expense',description:'Teste',amount_cents:3590,category_id:'expense-food',occurred_on:today});
  assert.deepEqual(domain.transactionFromRow({...row,id:'id',user_id:'a',created_at:'2026-10-07T12:00:00Z'}),
    tx({id:'id',userId:'a',description:'Teste'}));
});

test('S02/C01: deployable migration has matching catalog and no financial/user fixtures', () => {
  const sql = require('node:fs').readFileSync(path.join(__dirname,'../supabase/migrations/20261007000100_financial_foundation.sql'),'utf8');
  const catalog = [...sql.matchAll(/\('((?:expense|income)-[^']+)', '(expense|income)', '([^']+)'\)/g)]
    .map(([,id,kind,name]) => ({id,kind,name}));
  assert.deepEqual(catalog,transactionCategories);
  assert.doesNotMatch(sql,/insert\s+into\s+(?:auth\.users|public\.transactions)/i);
});
