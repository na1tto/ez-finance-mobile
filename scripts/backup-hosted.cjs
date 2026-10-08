// Private staging only. Copy the completed directory to a protected off-device destination.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const projectRef = 'tgfdihnemrseyifvfwan';
const linked = fs.readFileSync(path.join(root, 'supabase/.temp/project-ref'), 'utf8').trim();
if (linked !== projectRef) throw new Error('Projeto vinculado diferente do destino aprovado; backup recusado.');
const output = path.join(root, '.expo/hosted-backups', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(output, { recursive: true });
const npx = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npx-cli.js');
const files = [
  ['roles.sql', '--role-only'],
  ['schema.sql', '--schema', 'public,auth,supabase_migrations'],
  ['data.sql', '--data-only', '--use-copy', '--schema', 'public,auth,supabase_migrations'],
];
const manifest = { projectRef, createdAt: new Date().toISOString(), cli: '2.120.0',
  scope: ['public', 'auth', 'supabase_migrations', 'custom roles'],
  excludes: ['external Auth/OAuth/SMTP configuration', 'storage files', 'off-device retention'], files: [] };
for (const [name, ...flags] of files) {
  const file = path.join(output, name);
  const result = spawnSync(process.execPath, [npx, '--yes', 'supabase@2.120.0', 'db', 'dump',
    '--linked', ...flags, '--file', file], { cwd: root, stdio: 'inherit', env: process.env });
  if (result.status !== 0) throw new Error('Backup incompleto: ' + name + '; diretório não deve ser tratado como cópia válida.');
  const contents = fs.readFileSync(file);
  if (!contents.length) throw new Error('Arquivo de backup vazio: ' + name);
  manifest.files.push({ name, bytes: contents.length, sha256: crypto.createHash('sha256').update(contents).digest('hex') });
}
fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Cópia privada preparada: ' + output);
console.log('Ainda é necessário transferir para destino privado fora desta máquina e conferir os hashes.');
