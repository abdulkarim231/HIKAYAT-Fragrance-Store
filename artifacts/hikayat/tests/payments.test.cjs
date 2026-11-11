const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { createHash } = require('node:crypto');
const { createRequire } = require('node:module');
const localRequire = createRequire(path.resolve(__dirname, '../package.json'));

function load(file, imports = {}) {
  const source = readFileSync(path.resolve(__dirname, '../src', file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = {
    exports: {}, Buffer, URL, process: { env: {} }, console,
    require: (name) => name === 'server-only' ? {} : name in imports ? imports[name] : localRequire(name),
  };
  vm.runInNewContext(code, context);
  return context.exports;
}

const domain = load('domain/checkout.ts');
const input = {
  requestId: 'c7744096-d481-409e-bd9d-86c1a8b3fa70', locale: 'en',
  items: [{ productId: 'sample-oud', quantity: 1 }],
  delivery: { fullName: 'Test Shopper', email: 'test@example.org', phone: '+966500000000', city: 'Riyadh', address: 'Test Street 123' },
};

test('checkout rejects browser totals, duplicate lines and invalid quantities', () => {
  assert.equal(domain.checkoutSchema.safeParse(input).success, true);
  for (const bad of [
    { ...input, total: 1 },
    { ...input, items: [...input.items, ...input.items] },
    { ...input, items: [{ productId: 'sample-oud', quantity: 0 }] },
    { ...input, items: [{ productId: 'sample-oud', quantity: 11 }] },
    { ...input, items: [{ productId: 'sample-oud', quantity: 1.5 }] },
    { ...input, delivery: { ...input.delivery, status: 'paid' } },
  ]) assert.equal(domain.checkoutSchema.safeParse(bad).success, false);
});

test('money is converted to integer halalas and unsafe/free totals rejected', () => {
  assert.equal(domain.toMinorUnits(149.95), 14995);
  for (const price of [0, -1, Infinity, NaN, Number.MAX_SAFE_INTEGER]) assert.throws(() => domain.toMinorUnits(price));
});

function serviceFixture({ owned = true, paid = true, live = false, amount = 14995, metadataMismatch = false } = {}) {
  const queries = [];
  const order = { id: 'test-order', user_id: 'test-user', total: '149.95', status: 'pending', stripe_session_id: 'cs_test_fixture' };
  const pool = {
    query: async (sql, params) => {
      queries.push({ sql, params });
      if (sql.startsWith('select * from public.orders')) return { rows: owned ? [{ ...order }] : [] };
      if (sql.startsWith('select product_id')) return { rows: [{ product_id: 'sample-oud', quantity: 1, price: '149.95' }] };
      return { rows: [] };
    },
  };
  let stripeCalls = 0;
  const session = {
    id: 'cs_test_fixture', livemode: live, currency: 'sar', amount_total: amount,
    status: paid ? 'complete' : 'open', payment_status: paid ? 'paid' : 'unpaid',
    client_reference_id: order.id,
    metadata: { hikayat_order_id: metadataMismatch ? 'other-order' : order.id, hikayat_user_id: order.user_id },
  };
  const service = load('infrastructure/server/payment-service.ts', {
    '@/lib/db': { getSqlDb: async () => pool },
    '@/domain/product-schema': {},
    '@/domain/checkout': domain,
    './stripe-client': {
      getUncachableStripeClient: () => ({ checkout: { sessions: { retrieve: async () => { stripeCalls++; return session; } } } }),
      getStripeSync: async () => ({ processWebhook: async () => { throw new Error('Invalid signature'); } }),
    },
  });
  return { service, queries, stripeCalls: () => stripeCalls };
}

test('order verification scopes by authenticated owner before querying Stripe', async () => {
  const f = serviceFixture({ owned: false });
  await assert.rejects(() => f.service.verifyOrder('cs_test_fixture', 'test-user'), (e) => e.code === 'not_found');
  assert.equal(f.stripeCalls(), 0);
  assert.match(f.queries[0].sql, /user_id=\$2/);
  assert.equal(f.queries[0].params[1], 'test-user');
});

test('only a verified Stripe test payment transitions the order to paid', async () => {
  const f = serviceFixture();
  const result = await f.service.verifyOrder('cs_test_fixture', 'test-user');
  assert.equal(result.status, 'paid');
  assert.equal(result.total, 149.95);
  assert.equal(result.items[0].quantity, 1);
  assert.ok(f.queries.some((q) => q.sql.includes("set status='paid'") && q.sql.includes("status='pending'")));
});

test('unpaid sessions remain pending and do not mutate order status', async () => {
  const f = serviceFixture({ paid: false });
  assert.equal((await f.service.verifyOrder('cs_test_fixture', 'test-user')).status, 'pending');
  assert.equal(f.queries.some((q) => q.sql.startsWith('update')), false);
});

test('live mode, amount mismatch and metadata mismatch never mark orders paid', async () => {
  for (const opts of [{ live: true }, { amount: 1 }, { metadataMismatch: true }]) {
    const f = serviceFixture(opts);
    await assert.rejects(() => f.service.verifyOrder('cs_test_fixture', 'test-user'), (e) => e.code === 'payment_unavailable');
    assert.equal(f.queries.some((q) => q.sql.startsWith('update')), false);
  }
});

test('unverified webhook payloads cannot update orders', async () => {
  const f = serviceFixture();
  await assert.rejects(() => f.service.processPaymentWebhook(Buffer.from('{}'), 'bad-signature'));
  assert.equal(f.queries.length, 0);
});

test('checkout service uses database snapshots and real Stripe price IDs', () => {
  const source = readFileSync(path.resolve(__dirname, '../src/infrastructure/server/payment-service.ts'), 'utf8');
  assert.match(source, /pg_advisory_xact_lock/);
  assert.match(source, /idempotencyKey:/);
  assert.match(source, /checkout_fingerprint !== fingerprint/);
  assert.match(source, /stripe\.prices/);
  assert.doesNotMatch(source, /price_data:/);
  assert.match(source, /published=true/);
  assert.equal(typeof createHash('sha256').update('test').digest('hex'), 'string');
});
