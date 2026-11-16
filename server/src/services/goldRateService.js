import { getProviderConfig } from './goldRateConfig.js';

export const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours refresh cache
const OUNCE_GRAMS = 31.1034768;
const positive = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};
const rateError = (code, message) => Object.assign(new Error(message), { code, status: 503 });

// Shared gold rate service instance for Node.js process (Single Provider: GoldAPI.io)
export const createGoldRateService = ({
  getConfig = getProviderConfig,
  fetchImpl = globalThis.fetch,
  now = Date.now,
  log = console.log,
} = {}) => {
  let cache = null;
  let lastAttempt = null;
  let retryAt = 0;
  let lastFailure = null;
  let pending = null;

  const snapshot = (cached, extra = {}) => ({
    success: true,
    data: { ...cache.data },
    meta: {
      cached,
      stale: now() - cache.updatedAt >= CACHE_TTL_MS,
      lastUpdated: new Date(cache.updatedAt).toISOString(),
      lastApiCall: lastAttempt === null ? null : new Date(lastAttempt).toISOString(),
      nextUpdateIn: Math.max(0, Math.ceil((Math.max(cache.updatedAt + CACHE_TTL_MS, retryAt) - now()) / 60000)),
      ...extra,
    },
  });

  const getRates = async () => {
    if (pending) {
      log('[GoldAPI] Sharing the in-flight refresh.');
      const result = await pending;
      return { ...result, data: { ...result.data }, meta: { ...result.meta, cached: true } };
    }

    pending = (async () => {
      let config;
      try {
        config = await getConfig();
      } catch {
        if (cache) return snapshot(true, { stale: true, reason: 'RATE_SETTINGS_UNAVAILABLE' });
        throw rateError('RATE_SETTINGS_UNAVAILABLE', 'Live-rate settings are temporarily unavailable.');
      }

      if (!config.enabled) {
        log('[GoldAPI] Feed OFF; no provider request.');
        if (cache) return snapshot(true, { stale: true, disabled: true, nextUpdateIn: null });
        throw rateError('RATE_PROVIDER_DISABLED', 'Live rates are currently switched off.');
      }

      if (cache && now() - cache.updatedAt < CACHE_TTL_MS) {
        log('[GoldAPI] Serving fresh memory cache.');
        return snapshot(true);
      }

      if (now() < retryAt) {
        log('[GoldAPI] Refresh cooldown; no provider request.');
        if (cache) return snapshot(true, { stale: true, reason: lastFailure?.code });
        throw lastFailure;
      }

      if (!config.apiKey) {
        throw rateError('RATE_PROVIDER_NOT_CONFIGURED', 'The live-rate API key is not configured.');
      }

      lastAttempt = now();
      retryAt = lastAttempt + CACHE_TTL_MS;
      log('[GoldAPI] Calling provider: only XAU/INR and XAG/INR (saved quota).');

      const request = async (market) => {
        const response = await fetchImpl(`https://www.goldapi.io/api/${market}`, {
          headers: { 'x-access-token': config.apiKey, Accept: 'application/json' },
          signal: AbortSignal.timeout(8000),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || body.error) {
          const errStr = String(body.error || '');
          if (response.status === 403 || response.status === 429 || /quota|limit|MONTHLY_API_QUOTA_EXCEEDED/i.test(errStr)) {
            throw rateError('RATE_PROVIDER_QUOTA', 'The live-rate provider request limit has been reached.');
          }
          throw rateError('RATE_PROVIDER_UNAVAILABLE', body.error || `GoldAPI HTTP ${response.status}`);
        }
        return body;
      };

      try {
        // Direct Rupee calls only: XAU/INR & XAG/INR (No wasted XAU/USD call)
        const results = await Promise.allSettled(['XAU/INR', 'XAG/INR'].map(request));
        const failed = results.find(result => result.status === 'rejected');
        if (failed) throw failed.reason;

        const [gold, silver] = results.map(result => result.value);
        const goldRate = positive(gold.price_gram_24k) || (positive(gold.price) ? Number(gold.price) / OUNCE_GRAMS : null);
        const silverRate = positive(silver.price_gram_24k) || (positive(silver.price) ? Number(silver.price) / OUNCE_GRAMS : null);
        const usdInr = 94.4; // Benchmark USD/INR without burning extra API quota

        if (![goldRate, silverRate].every(positive)) {
          throw rateError('RATE_PROVIDER_INVALID_DATA', 'The provider returned incomplete rate data.');
        }

        cache = {
          data: { goldRate, silverRate, usdInr, goldMCX: goldRate * 10 },
          updatedAt: now(),
        };
        lastFailure = null;
        retryAt = cache.updatedAt + CACHE_TTL_MS;
        return snapshot(false);
      } catch (error) {
        lastFailure = typeof error?.code === 'string' && error.code.startsWith('RATE_')
          ? error
          : rateError('RATE_PROVIDER_UNAVAILABLE', 'Live rates could not be refreshed.');
        log('[GoldAPI] Refresh failed:', lastFailure.code);
        if (cache) return snapshot(true, { stale: true, reason: lastFailure.code });
        throw lastFailure;
      }
    })();

    try {
      return await pending;
    } finally {
      pending = null;
    }
  };

  const resetCooldown = () => {
    retryAt = 0;
    lastFailure = null;
    lastAttempt = null;
  };

  const invalidateCache = () => {
    cache = null;
    retryAt = 0;
    lastFailure = null;
    lastAttempt = null;
  };

  return {
    getRates,
    resetCooldown,
    invalidateCache,
    getStatus: () => ({
      hasCache: Boolean(cache),
      refreshInProgress: Boolean(pending),
      lastUpdated: cache ? new Date(cache.updatedAt).toISOString() : null,
      lastApiCall: lastAttempt === null ? null : new Date(lastAttempt).toISOString(),
      nextUpdateIn: Math.max(0, Math.ceil((retryAt - now()) / 60000)),
      lastError: lastFailure?.code ?? null,
    }),
  };
};

export const goldRateService = createGoldRateService();
export const getGoldRates = () => goldRateService.getRates();
