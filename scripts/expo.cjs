// Validate the same public config BEFORE Expo can inline it into a bundle.
const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { loadProjectEnv, setNodeEnv } = require('@expo/env'); // Already provided by Expo.
const { readPublicSupabaseConfig, SupabaseConfigurationError } = require('../src/config/supabase.ts');

const workspace = path.resolve(__dirname,'..');
const args = process.argv.slice(2);
try {
  setNodeEnv(args[0] === 'export' ? 'production' : 'development');
  loadProjectEnv(workspace,{silent:true});
  readPublicSupabaseConfig({
    url:process.env.EXPO_PUBLIC_SUPABASE_URL,
    publishableKey:process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (args[0] === 'export' && ['__spec002-check','__spec003-check'].some(name=>fs.existsSync(path.join(workspace,'public',name)))) {
    console.error('Remova os diagnósticos temporários com os scripts check-supabase-web.cjs/check-auth-web.cjs --clean antes de exportar.');
    process.exit(1);
  }
} catch (error) {
  console.error(error instanceof SupabaseConfigurationError ? error.message : 'Falha ao carregar configuração pública do aplicativo.');
  process.exit(1);
}
const cli = path.join(path.dirname(require.resolve('expo/package.json')),'bin','cli');
const result = spawnSync(process.execPath,[cli,...args],{cwd:workspace,stdio:'inherit',env:process.env});
process.exitCode = result.status ?? 1;
