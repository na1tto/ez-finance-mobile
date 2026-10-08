const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const output = mkdtempSync(path.join(tmpdir(), 'ezfinance-domain-'));
try {
  const compiler = require.resolve('typescript/bin/tsc');
  const build = spawnSync(process.execPath, [compiler, '-p', 'tsconfig.tests.json', '--outDir', output], { stdio: 'inherit' });
  if (build.status !== 0) process.exitCode = build.status ?? 1;
  else {
    const files = ['tests/domain.test.cjs', 'tests/supabase.test.cjs', 'tests/auth.test.cjs', 'tests/transactions.test.cjs', 'tests/form.test.cjs'];
    if (process.argv.includes('--integration')) files.push('tests/auth.integration.cjs');
    if (process.argv.includes('--finance')) files.push('tests/transactions.integration.cjs');
    const tests = spawnSync(process.execPath, ['--test', ...files], {
      stdio: 'inherit', env: {
        ...process.env, EZFINANCE_DOMAIN_BUILD: output,
        NODE_PATH: [path.resolve('node_modules'), process.env.NODE_PATH].filter(Boolean).join(path.delimiter),
      },
    });
    process.exitCode = tests.status ?? 1;
  }
} finally {
  const prefix = path.resolve(tmpdir(), 'ezfinance-domain-');
  if (!path.isAbsolute(output) || !path.resolve(output).startsWith(prefix)) {
    throw new Error('Unexpected temporary build path; cleanup refused.');
  }
  rmSync(output, { recursive: true, force: true });
}
