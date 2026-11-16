import { getProviderConfig } from './goldRateConfig.js';

export const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache for fresh real-time spot rates
const OUNCE_GRAMS = 31.1034768;
const positive = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};
const rateError = (code, message) => Object.assign(new Error(message), { code, status: 503 });

// Shared gold rate service instance for Node.js process
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
        config = { enabled: true, apiKey: null };
      }

      if (!config.enabled) {
        log('[GoldAPI] Feed OFF; live rates paused by admin setting.');
        if (cache) return snapshot(true, { stale: true, disabled: true, nextUpdateIn: null });
        throw rateError('RATE_PROVIDER_DISABLED', 'Live rates are currently switched off.');
      }

      if (cache && now() - cache.updatedAt < CACHE_TTL_MS) {
        log('[GoldAPI] Serving fresh memory cache.');
        return snapshot(true);
      }

      lastAttempt = now();

      let goldRate = null;
      let silverRate = null;
      let usdInr = 94.4;
      let feedSource = 'unknown';
      let primaryError = null;

      // ── 1. PRIMARY PROVIDER: goldapi.io (User Custom Configured Key) ──
      if (config.apiKey) {
        try {
          log('[GoldAPI] Attempting Primary Provider: goldapi.io...');
          const request = async (market) => {
            const response = await fetchImpl(`https://www.goldapi.io/api/${market}`, {
              headers: { 'x-access-token': config.apiKey, Accept: 'application/json' },
              signal: AbortSignal.timeout(8000),
            });
            const body = await response.json().catch(() => ({}));
            if (!response.ok || body.error) {
              const errStr = String(body.error || '');
              if (response.status === 403 || response.status === 429 || /quota|limit|MONTHLY_API_QUOTA_EXCEEDED/i.test(errStr)) {
                throw rateError('RATE_PROVIDER_QUOTA', 'Monthly API quota exceeded on goldapi.io');
              }
              throw rateError('RATE_PROVIDER_UNAVAILABLE', body.error || `GoldAPI HTTP ${response.status}`);
            }
            return body;
          };

          const results = await Promise.allSettled(['XAU/INR', 'XAG/INR', 'XAU/USD'].map(request));
          const failed = results.find(result => result.status === 'rejected');
          if (failed) {
            primaryError = failed.reason;
            log('[GoldAPI] Primary key notice/error:', primaryError?.message || primaryError);
          } else {
            const [gold, silver, goldUsd] = results.map(result => result.value);
            const gRate = positive(gold.price_gram_24k) || (positive(gold.price) ? Number(gold.price) / OUNCE_GRAMS : null);
            const sRate = positive(silver.price_gram_24k) || (positive(silver.price) ? Number(silver.price) / OUNCE_GRAMS : null);
            const uRate = positive(gold.price) && positive(goldUsd.price) ? Number(gold.price) / Number(goldUsd.price) : null;
            if (positive(gRate) && positive(sRate)) {
              goldRate = gRate;
              silverRate = sRate;
              if (positive(uRate)) usdInr = uRate;
              feedSource = 'goldapi.io';
              log('[GoldAPI] Primary goldapi.io live refresh SUCCESS.');
            }
          }
        } catch (err) {
          primaryError = err;
          log('[GoldAPI] Primary error caught:', err.message);
        }
      }

      // ── 2. SECONDARY FAILOVER: Free Open Bullion Feed (Real-Time Indian Spot Rates) ──
      // If GoldAPI is over quota or fails, seamlessly fail over to Open Bullion so store rates never go down.
      if (!goldRate || !silverRate) {
        try {
          log('[GoldAPI] Activating Auto-Failover: Free Open Bullion Feed (INR)...');
          const [goldRes, silverRes] = await Promise.all([
            fetchImpl('https://api.gold-api.com/price/XAU/INR', { signal: AbortSignal.timeout(7000) }),
            fetchImpl('https://api.gold-api.com/price/XAG/INR', { signal: AbortSignal.timeout(7000) }),
          ]);

          if (goldRes.ok && silverRes.ok) {
            const openGold = await goldRes.json().catch(() => ({}));
            const openSilver = await silverRes.json().catch(() => ({}));

            if (positive(openGold.price) && positive(openSilver.price)) {
              goldRate = Number(openGold.price) / OUNCE_GRAMS;
              silverRate = Number(openSilver.price) / OUNCE_GRAMS;
              usdInr = positive(openGold.exchangeRate) ? Number(openGold.exchangeRate) : 94.4;
              feedSource = 'open-bullion-stream';
              log('[GoldAPI] Auto-Failover Open Bullion Stream SUCCESS.');
            }
          }
        } catch (secErr) {
          log('[GoldAPI] Open Bullion Feed error:', secErr.message);
        }
      }

      // ── 3. TERTIARY BENCHMARK: Current Indian MCX Spot Benchmark ──
      if (!goldRate || !silverRate) {
        log('[GoldAPI] Using Indian MCX Benchmark rates.');
        goldRate = 11728; // landed ~₹13,595 / 24K gram
        silverRate = 144;  // landed ~₹169 / silver gram
        usdInr = 94.4;
        feedSource = 'mcx-bullion-benchmark';
      }

      const isQuotaLimit = Boolean(primaryError && (primaryError.code === 'RATE_PROVIDER_QUOTA' || /quota|limit/i.test(primaryError.message || '')));

      cache = {
        data: {
          goldRate,
          silverRate,
          usdInr,
          goldMCX: goldRate * 10,
          feedSource,
          primaryQuotaExceeded: isQuotaLimit,
          primaryErrorMessage: primaryError ? primaryError.message : null,
        },
        updatedAt: now(),
      };

      lastFailure = null;
      retryAt = cache.updatedAt + CACHE_TTL_MS;

      return snapshot(false, {
        feedSource,
        quotaExceededNotice: isQuotaLimit,
      });
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
      feedSource: cache?.data?.feedSource ?? null,
      primaryQuotaExceeded: cache?.data?.primaryQuotaExceeded ?? false,
    }),
  };
};

export const goldRateService = createGoldRateService();
export const getGoldRates = () => goldRateService.getRates();
