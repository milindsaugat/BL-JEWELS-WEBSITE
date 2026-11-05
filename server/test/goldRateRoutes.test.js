import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import router from '../src/routes/goldRate.routes.js';
import User from '../src/models/User.js';
import { goldRateService } from '../src/services/goldRateService.js';
import { getLiveRates } from '../src/controllers/rateController.js';

const invoke = (method, url, token, body = {}) => new Promise((resolve, reject) => {
  const req = { method, url, headers: token ? { authorization: `Bearer ${token}` } : {}, cookies: {}, body };
  const res = { statusCode: 200, set() { return this; }, status(code) { this.statusCode = code; return this; },
    json(data) { resolve({ status: this.statusCode, data }); } };
  router.handle(req, res, error => reject(error || new Error('Route did not respond')));
});

test('rate settings reject anonymous, demo and non-admin sessions; validate updates', async () => {
  const previousSecret = process.env.JWT_SECRET;
  const previousFind = User.findById;
  process.env.JWT_SECRET = 'route-test-secret';
  try {
    assert.equal((await invoke('GET', '/settings')).status, 401);
    assert.equal((await invoke('GET', '/settings', 'demo_admin_token')).status, 401);
    assert.equal((await invoke('PUT', '/settings', 'demo_admin_token_2026', { enabled: true, apiKey: 'test' })).status, 401);
    User.findById = () => ({ select: async () => ({ role: 'customer' }) });
    const token = jwt.sign({ id: 'test' }, process.env.JWT_SECRET);
    assert.equal((await invoke('GET', '/settings', token)).status, 403);
    User.findById = () => ({ select: async () => ({ role: 'admin' }) });
    assert.equal((await invoke('PUT', '/settings', token, { enabled: 'yes' })).status, 400);
  } finally {
    User.findById = previousFind;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test('new endpoint and existing storefront adapter use the same rate service', async () => {
  const original = goldRateService.getRates;
  let calls = 0;
  const snapshot = { success: true, data: { goldRate: 10000, silverRate: 100, usdInr: 80, goldMCX: 100000 },
    meta: { cached: true, stale: true, lastUpdated: '2026-11-04T00:00:00.000Z', nextUpdateIn: 240 } };
  goldRateService.getRates = async () => { calls++; return snapshot; };
  try {
    assert.deepEqual((await invoke('GET', '/')).data, snapshot);
    let result;
    await getLiveRates({}, { set() {}, json(value) { result = value; } });
    assert.equal(calls, 2);
    assert.equal(result.numericRates['22K'], 10000 * 22 / 24);
    assert.equal(result.meta.stale, true);
    assert.equal(result.lastUpdated, snapshot.meta.lastUpdated);
  } finally { goldRateService.getRates = original; }
});
