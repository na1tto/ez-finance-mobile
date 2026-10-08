const { test } = require('node:test');
const assert = require('node:assert/strict');
const { assertHostedConfig, assertHostedBundle } = require('../scripts/build-hosted-web.cjs');

test('hosting refuses local endpoints and administrative keys before exporting', () => {
  const publishableKey = 'sb_publishable_fixture';
  for (const url of ['http://127.0.0.1:54321', 'http://localhost:54321',
    'http://project.supabase.co', 'https://project.supabase.co.attacker.test',
    'https://project.supabase.co:8443', 'https://project.supabase.co/path']) {
    assert.throws(() => assertHostedConfig({ url, publishableKey }));
  }
  assert.throws(() => assertHostedConfig({ url: 'https://project.supabase.co', publishableKey: 'sb_secret_fixture' }));
  assert.equal(assertHostedConfig({ url: 'https://project.supabase.co', publishableKey }).url,
    'https://project.supabase.co');
});

test('hosting refuses stale Metro bundles and mismatched public credentials', () => {
  const config = { url: 'https://project.supabase.co', publishableKey: 'sb_publishable_fixture' };
  assert.doesNotThrow(() => assertHostedBundle(config, [JSON.stringify(config)]));
  assert.throws(() => assertHostedBundle(config, ['http://127.0.0.1:54321 sb_publishable_fixture']));
  assert.throws(() => assertHostedBundle(config, [config.url + ' sb_publishable_other']));
  assert.throws(() => assertHostedBundle(config, [JSON.stringify(config), 'http://localhost:54321']));
  assert.throws(() => assertHostedBundle(config, []));
});
