// Hosting always exports afresh; the local development environment must not ship.
const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { loadProjectEnv, setNodeEnv } = require('@expo/env');
const { readPublicSupabaseConfig } = require('../src/config/supabase.ts');

function assertHostedConfig(environment) {
  const config = readPublicSupabaseConfig(environment);
  const url = new URL(config.url);
  if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname)
      || url.port || url.pathname !== '/') {
    throw new Error('Publicação exige a URL HTTPS do projeto Supabase hospedado; o ambiente local não pode ser publicado.');
  }
  return config;
}

function assertHostedBundle(config, bundles) {
  const contents = bundles.join('\n');
  if (!contents.includes(config.url) || !contents.includes(config.publishableKey)
      || /http:\/\/(?:127\.0\.0\.1|localhost|\[::1\]):54321/.test(contents)) {
    throw new Error('Bundle incompatível com o Supabase hospedado; publicação recusada.');
  }
}

function main() {
  const workspace = path.resolve(__dirname, '..');
  try {
    setNodeEnv('production');
    loadProjectEnv(workspace, { silent: true });
    const config = assertHostedConfig({
      url: process.env.EXPO_PUBLIC_SUPABASE_URL,
      publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    });
    const result = spawnSync(process.execPath,
      [path.join(__dirname, 'expo.cjs'), 'export', '--platform', 'web', '--clear'],
      { cwd: workspace, stdio: 'inherit', env: process.env });
    if (result.status !== 0) { process.exitCode = result.status ?? 1; return; }
    for (const file of ['index.html', 'transactions.html', 'auth/account.html', 'expenses/new.html', 'expenses/[id].html',
      'auth/callback.html', 'auth/reset-password.html', 'auth/sign-in.html', 'auth/sign-up.html']) {
      if (!fs.existsSync(path.join(workspace, 'dist', file))) {
        throw new Error(`Exportação incompleta: ${file} ausente.`);
      }
    }
    const bundleDir = path.join(workspace, 'dist/_expo/static/js/web');
    const bundles = fs.readdirSync(bundleDir).filter(name => name.endsWith('.js'))
      .map(name => fs.readFileSync(path.join(bundleDir, name), 'utf8'));
    assertHostedBundle(config, bundles);
    console.log('Exportação para Hosting concluída; rotas essenciais presentes.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) main();
module.exports = { assertHostedConfig, assertHostedBundle };
