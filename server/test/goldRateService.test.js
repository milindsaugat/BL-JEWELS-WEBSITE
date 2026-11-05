import test from 'node:test';
import assert from 'node:assert/strict';
import { createGoldRateService, CACHE_TTL_MS } from '../src/services/goldRateService.js';
import { publicProviderConfig } from '../src/services/goldRateConfig.js';

const setup = () => {
  let clock = Date.UTC(2026, 10, 4), calls = 0, fail = false, release;
  let blocker = null;
  const config = { enabled: true, apiKey: 'test-secret' };
  const service = createGoldRateService({
    now: () => clock, getConfig: async () => config, log: () => {},
    fetchImpl: async (url, options) => {
      calls++;
      assert.equal(options.headers['x-access-token'], 'test-secret');
      if (blocker) await blocker;
      if (fail) return { ok: false, status: 403, json: async () => ({ error: 'Monthly quota exceeded' }) };
      const data = url.endsWith('XAU/INR') ? { price_gram_24k: 10000, price: 310000 }
        : url.endsWith('XAG/INR') ? { price_gram_24k: 100, price: 3100 }
          : { price: 4000 };
      return { ok: true, json: async () => data };
    },
  });
  return { service, config, calls: () => calls, advance: ms => { clock += ms; },
    fail: () => { fail = true; }, block: () => { blocker = new Promise(resolve => { release = resolve; }); },
    release: () => release() };
};

test('10,000 simultaneous visitors share exactly one refresh and fresh data never refetches', async () => {
  const h = setup(); h.block();
  const visits = Array.from({ length: 10000 }, () => h.service.getRates());
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.calls(), 3);
  h.release();
  const results = await Promise.all(visits);
  assert.deepEqual(results[0].data, { goldRate: 10000, silverRate: 100, usdInr: 77.5, goldMCX: 100000 });
  assert.equal(results[0].meta.cached, false);
  assert.equal(results[1].meta.cached, true);
  assert.equal(results[0].meta.nextUpdateIn, 240);
  assert.equal(results[0].meta.stale, false);
  assert.ok(results[0].meta.lastApiCall);
  h.advance(CACHE_TTL_MS - 1);
  assert.equal((await h.service.getRates()).meta.cached, true);
  assert.equal(h.calls(), 3);
  h.advance(1);
  await Promise.all(Array.from({ length: 100 }, () => h.service.getRates()));
  assert.equal(h.calls(), 6);
});

test('failed refresh serves last good data as stale and prevents retry storms', async () => {
  const h = setup(); const first = await h.service.getRates();
  h.advance(CACHE_TTL_MS); h.fail();
  const stale = await h.service.getRates();
  assert.equal(stale.meta.stale, true);
  assert.equal(stale.meta.cached, true);
  assert.equal(stale.meta.lastUpdated, first.meta.lastUpdated);
  assert.equal(stale.meta.reason, 'RATE_PROVIDER_QUOTA');
  assert.equal(stale.meta.nextUpdateIn, 240);
  await Promise.all(Array.from({ length: 100 }, () => h.service.getRates()));
  assert.equal(h.calls(), 6);
});

test('empty cache failures never return fabricated prices or retry per visitor', async () => {
  const h = setup(); h.fail();
  await assert.rejects(h.service.getRates(), { code: 'RATE_PROVIDER_QUOTA', status: 503 });
  const results = await Promise.allSettled(Array.from({ length: 100 }, () => h.service.getRates()));
  assert.ok(results.every(result => result.status === 'rejected'));
  assert.equal(h.calls(), 3);
  h.advance(CACHE_TTL_MS);
  await assert.rejects(h.service.getRates());
  assert.equal(h.calls(), 6);
});

test('OFF stops requests, serves stale cache, and ON preserves the refresh window', async () => {
  const h = setup(); h.config.enabled = false;
  await assert.rejects(h.service.getRates(), { code: 'RATE_PROVIDER_DISABLED' });
  assert.equal(h.calls(), 0);
  h.config.enabled = true; await h.service.getRates();
  h.config.enabled = false;
  const disabled = await h.service.getRates();
  assert.equal(disabled.meta.disabled, true); assert.equal(disabled.meta.stale, true);
  assert.equal(disabled.meta.nextUpdateIn, null);
  h.config.enabled = true; await h.service.getRates();
  assert.equal(h.calls(), 3);
});

test('missing key does not call provider; settings response never exposes a key', async () => {
  const h = setup(); h.config.apiKey = '';
  await assert.rejects(h.service.getRates(), { code: 'RATE_PROVIDER_NOT_CONFIGURED' });
  assert.equal(h.calls(), 0);
  const data = publicProviderConfig({ enabled: true, apiKey: 'do-not-expose', keySource: 'admin' });
  assert.equal(data.keyConfigured, true);
  assert.ok(!JSON.stringify(data).includes('do-not-expose'));
});

test('timeouts and invalid data become controlled errors, not application crashes', async () => {
  for (const fetchImpl of [
    async () => { throw new DOMException('Timed out', 'TimeoutError'); },
    async () => ({ ok: true, json: async () => ({ price: 'not-a-number' }) }),
  ]) {
    const service = createGoldRateService({ getConfig: async () => ({ enabled: true, apiKey: 'test' }), fetchImpl, log: () => {} });
    await assert.rejects(service.getRates(), error => error.status === 503 && error.code.startsWith('RATE_'));
  }
});
