import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { goldRateService } from '../services/goldRateService.js';
import { getProviderConfig, saveProviderConfig, publicProviderConfig } from '../services/goldRateConfig.js';

const router = express.Router();
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try { res.json(await goldRateService.getRates()); }
  catch (error) { res.status(error.status || 503).json({ success: false, code: error.code, message: error.message }); }
});

// API credentials require a real administrator session, never the legacy demo bypass.
router.use('/settings', (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.cookies?.accessToken;
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({ success: false, message: 'Configure JWT_SECRET on the server to manage API credentials. Your session has not been changed.' });
  }
  if (token?.startsWith('demo_admin_token')) {
    return res.status(401).json({ success: false, message: 'Sign in with a real administrator account to manage API settings.' });
  }
  res.set('Cache-Control', 'no-store');
  next();
}, requireAuth, requireAdmin);

router.get('/settings', async (req, res) => {
  try { res.json({ success: true, settings: publicProviderConfig(await getProviderConfig()), cache: goldRateService.getStatus() }); }
  catch { res.status(503).json({ success: false, message: 'Rate settings are temporarily unavailable.' }); }
});

router.put('/settings', async (req, res) => {
  const { enabled, apiKey, useEnvironmentKey = false } = req.body;
  if (typeof enabled !== 'boolean' || typeof useEnvironmentKey !== 'boolean' ||
      (apiKey !== undefined && (typeof apiKey !== 'string' || apiKey.length > 512 || /[\r\n]/.test(apiKey)))) {
    return res.status(400).json({ success: false, message: 'Provide a valid enabled flag and API key.' });
  }
  try {
    const config = await saveProviderConfig({ enabled, apiKey: apiKey?.trim(), useEnvironmentKey });
    res.json({ success: true, settings: publicProviderConfig(config), cache: goldRateService.getStatus() });
  } catch {
    res.status(503).json({ success: false, message: 'Settings could not be saved. Check the database connection and server encryption secret.' });
  }
});

export default router;
