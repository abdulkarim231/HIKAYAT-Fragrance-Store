const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

function loadDatabase(env = {}) {
  const source = readFileSync(path.join(root, 'src/lib/db.ts'), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const calls = [];
  const context = {
    exports: {},
    process: { env },
    require: (name) => {
      assert.equal(name, 'server-only');
      return {};
    },
    URL,
    Buffer,
    AbortSignal,
    fetch: async (url, options) => {
      calls.push({ url: String(url), options });
      return Response.json([]);
    },
  };
  vm.runInNewContext(code, context);
  return { getDb: context.exports.getDb, calls };
}

const fixture = {
  SUPABASE_URL: 'https://test-project.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_fixture_not_a_real_key',
};

test('configuration is lazy and the warm-instance client is reused', () => {
  const missing = loadDatabase();
  assert.throws(() => missing.getDb(), /supabase_settings_missing/);
  const { getDb } = loadDatabase(fixture);
  assert.equal(getDb(), getDb());
});

test('session tokens stay request-scoped and do not affect anonymous requests', async () => {
  const { getDb, calls } = loadDatabase(fixture);
  await getDb().request('/rest/v1/users', { accessToken: 'test-user-one' });
  await getDb().request('/rest/v1/users', { accessToken: 'test-user-two' });
  await getDb().request('/rest/v1/products');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-user-one');
  assert.equal(calls[1].options.headers.Authorization, 'Bearer test-user-two');
  assert.equal(calls[2].options.headers.Authorization, undefined);
  assert.equal(calls[2].options.cache, 'no-store');
});

test('external request paths and privileged keys are rejected', async () => {
  const { getDb } = loadDatabase(fixture);
  await assert.rejects(getDb().request('https://other.example/rest/v1/users'), /supabase_path_invalid/);
  assert.throws(() => loadDatabase({ ...fixture, SUPABASE_PUBLISHABLE_KEY: 'sb_secret_test_fixture' }).getDb(), /supabase_public_key_invalid/);
});

test('the repeatable SQL seed contains three distinct, valid fragrance products', () => {
  const sql = readFileSync(path.join(root, 'supabase/seed.sql'), 'utf8');
  const match = sql.match(/\$seed\$([\s\S]+?)\$seed\$/);
  assert.ok(match);
  const products = JSON.parse(match[1]);
  const source = readFileSync(path.join(root, 'src/domain/product-schema.ts'), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const context = { exports: {}, require };
  vm.runInNewContext(code, context);
  const valid = context.exports.productListSchema.parse(products);
  assert.equal(valid.length, 3);
  assert.equal(new Set(valid.map((product) => product.id)).size, valid.length);
  assert.match(sql, /on conflict \(id\) do nothing/i);
});
