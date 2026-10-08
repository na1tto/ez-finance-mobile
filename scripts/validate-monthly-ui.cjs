// SPEC-006: reuse the SPEC-005 isolated fixture transport and exact cleanup.
// setup, seed, proxy, mode <normal|read-fail>, verify, cleanup.
process.env.EZFINANCE_UI_SPEC='006';
if(process.argv[2]!=='seed')require('./validate-forms-ui.cjs');
else {
const fs=require('node:fs'),{parseEnv}=require('node:util'),{randomUUID}=require('node:crypto');
const {createClient}=require('@supabase/supabase-js');
(async()=>{
 const env=parseEnv(fs.readFileSync('.env.local','utf8'));
 if(env.EXPO_PUBLIC_SUPABASE_URL!=='http://127.0.0.1:54321')throw Error('Somente stack local.');
 const state=JSON.parse(fs.readFileSync('supabase/.temp/spec006-ui-private.json','utf8'));
 const client=createClient(env.EXPO_PUBLIC_SUPABASE_URL,env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const u=state.users[0];const login=await client.auth.signInWithPassword({email:u.email,password:u.password});if(login.error)throw Error('Login fixture');
 const previous=await client.from('transactions').select('id').eq('user_id',u.id);if(previous.error||previous.data.length)throw Error('Seed recusado: conta deve estar vazia.');
 const rows=[['income','income-salary',10000,'2026-10-01','salario'],['expense','expense-food',3000,'2026-10-02','comida'],['expense','expense-transport',1000,'2026-10-03','transporte'],['expense','expense-food',2000,'2026-09-30','setembro']].map(([kind,category_id,amount_cents,occurred_on,label])=>({id:randomUUID(),user_id:u.id,kind,category_id,amount_cents,occurred_on,description:'SPEC-006 UI '+label}));
 const insert=await client.from('transactions').insert(rows);if(insert.error)throw Error(insert.error.code);
 console.log('Fixture: outubro receitas 100, despesas 40, saldo 60; setembro despesa 20.');await client.auth.signOut();
})().catch(e=>{console.error(e.message);process.exitCode=1});

}
