import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { goldRateService } from '../services/goldRateService.js';
import { getProviderConfig, saveProviderConfig, publicProviderConfig } from '../services/goldRateConfig.js';

const router = express.Router();

router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    res.json(await goldRateService.getRates());
  } catch (error) {
    res.status(error.status || 503).json({ success: false, code: error.code, message: error.message });
  }
});

// Middleware for admin settings authentication
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.cookies?.accessToken;
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({ success: false, message: 'Configure JWT_SECRET on the server to manage API credentials.' });
  }
  if (token?.startsWith('demo_admin_token')) {
    return res.status(401).json({ success: false, message: 'Sign in with a real administrator account to manage API settings.' });
  }
  res.set('Cache-Control', 'no-store');
  next();
};

router.use('/settings', adminAuth, requireAuth, requireAdmin);
router.use('/sync', adminAuth, requireAuth, requireAdmin);

router.get('/settings', async (req, res) => {
  try {
    const config = await getProviderConfig();
    res.json({
      success: true,
      settings: publicProviderConfig(config),
      cache: goldRateService.getStatus(),
    });
  } catch {
    res.status(503).json({ success: false, message: 'Rate settings are temporarily unavailable.' });
  }
});

router.put('/settings', async (req, res) => {
  const { enabled, apiKey, useEnvironmentKey = false } = req.body;
  if (typeof enabled !== 'boolean' || typeof useEnvironmentKey !== 'boolean' ||
      (apiKey !== undefined && (typeof apiKey !== 'string' || apiKey.length > 512 || /[\r\n]/.test(apiKey)))) {
    return res.status(400).json({ success: false, message: 'Provide a valid enabled flag and API key.' });
  }

  const cleanKey = apiKey ? apiKey.trim().replace(/^["']|["']$/g, '') : undefined;

  try {
    const config = await saveProviderConfig({ enabled, apiKey: cleanKey, useEnvironmentKey });
    // Immediately clear cooldown so new key is not blocked by old 4-hour timeout
    goldRateService.resetCooldown();

    let testResult = null;
    // If a new key was entered, perform an immediate live validation check
    if (cleanKey) {
      try {
        const testRes = await fetch('https://www.goldapi.io/api/XAU/INR', {
          headers: { 'x-access-token': cleanKey, Accept: 'application/json' },
          signal: AbortSignal.timeout(6000),
        });
        const testData = await testRes.json().catch(() => ({}));
        if (testRes.ok && !testData.error) {
          testResult = {
            verified: true,
            message: `Key verified with GoldAPI! Current 24K Gold: ₹${Math.round(testData.price_gram_24k || testData.price / 31.1035).toLocaleString('en-IN')}/g`,
          };
          // Invalidate old cache so fresh live data is served
          goldRateService.invalidateCache();
        } else {
          testResult = {
            verified: false,
            message: testData.error || `GoldAPI returned ${testRes.status} (${testRes.statusText})`,
          };
        }
      } catch (err) {
        testResult = { verified: false, message: err.message || 'Validation request timed out' };
      }
    }

    res.json({
      success: true,
      settings: publicProviderConfig(config),
      cache: goldRateService.getStatus(),
      testResult,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error?.message || 'Settings could not be saved. Check the database connection and server encryption secret.',
    });
  }
});

// Dedicated Instant Sync & Connection Test endpoint
router.post('/sync', async (req, res) => {
  try {
    const config = await getProviderConfig();
    const candidateKey = req.body.apiKey ? req.body.apiKey.trim().replace(/^["']|["']$/g, '') : config.apiKey;

    if (!candidateKey) {
      return res.status(400).json({
        success: false,
        message: 'No API key provided or configured. Please enter your GoldAPI key.',
      });
    }

    goldRateService.resetCooldown();

    const response = await fetch('https://www.goldapi.io/api/XAU/INR', {
      headers: { 'x-access-token': candidateKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok || body.error) {
      const errStr = String(body.error || '');
      let userFriendlyMsg = body.error || `GoldAPI HTTP Error ${response.status}`;

      if (response.status === 401 || /unauthorized|invalid token|access denied/i.test(errStr)) {
        userFriendlyMsg = 'Invalid API Key. GoldAPI returned 401 Unauthorized. Please verify your token on goldapi.io dashboard.';
      } else if (response.status === 403 || response.status === 429 || /quota|limit|MONTHLY_API_QUOTA_EXCEEDED/i.test(errStr)) {
        userFriendlyMsg = 'Monthly API Quota Exceeded on this key (status 403). Please upgrade or use another GoldAPI key.';
      }

      return res.status(400).json({
        success: false,
        error: body.error,
        statusCode: response.status,
        message: userFriendlyMsg,
      });
    }

    // Refresh service
    goldRateService.invalidateCache();
    await goldRateService.getRates().catch(() => {});

    res.json({
      success: true,
      message: `Connection successful! Fetched live rate: 24K Gold at ₹${Math.round(body.price_gram_24k || body.price / 31.1035).toLocaleString('en-IN')}/g`,
      rateSample: {
        price_gram_24k: body.price_gram_24k,
        price_gram_22k: body.price_gram_22k,
        timestamp: body.timestamp,
      },
      cache: goldRateService.getStatus(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Connection test failed. Network timeout connecting to GoldAPI.',
    });
  }
});

export default router;
