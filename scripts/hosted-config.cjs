// Use the authenticated CLI; server OAuth credentials travel only to Supabase Auth.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { loadProjectEnv, setNodeEnv } = require('@expo/env');

const action = process.argv[2];
const profile = process.argv[3] ?? 'base';
if (!['diff', 'push'].includes(action)) {
  console.error('Uso: node scripts/hosted-config.cjs diff|push [base|google]');
  process.exit(1);
}
if (!['base', 'google'].includes(profile)) throw new Error('Perfil de configuração inválido.');
if (profile === 'google') {
  setNodeEnv('production');
  loadProjectEnv(path.resolve(__dirname, '..'), { silent: true });
}
const secret = profile === 'google' ? process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET : undefined;
if (profile === 'google' && (!secret || !process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)) {
  console.error('Credenciais de servidor Google ausentes; configuração não enviada.');
  process.exit(1);
}
const npxCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js');
if (!fs.existsSync(npxCli)) throw new Error('Ferramenta npm não encontrada junto ao Node.');
const args = [npxCli, '--yes', 'supabase@2.120.0', 'config', action,
  '--workdir', profile === 'google' ? 'deployment/google' : 'deployment', '--project-ref', 'tgfdihnemrseyifvfwan'];
if (action === 'push') args.push('--yes');
const cliEnvironment = { ...process.env };
if (profile === 'base') {
  delete cliEnvironment.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID;
  delete cliEnvironment.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET;
}
const result = spawnSync(process.execPath, args, {
  cwd: path.resolve(__dirname, '..'), env: cliEnvironment, encoding: 'utf8',
});
for (const output of [result.stdout, result.stderr]) {
  if (output) process.stdout.write(secret ? output.split(secret).join('[REDACTED]') : output);
}
process.exitCode = result.status ?? 1;
