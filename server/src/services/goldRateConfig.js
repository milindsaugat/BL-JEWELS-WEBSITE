import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import GoldRateConfig from '../models/GoldRateConfig.js';
import { getDbStatus, connectDB } from '../config/db.js';

let savedConfig;
let loadedAt = 0;
let pending;
const environmentKey = () => process.env.GOLDAPI_KEY || process.env.GOLD_API_KEY || '';
const encryptionKey = () => {
  const secret = process.env.GOLDAPI_CONFIG_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('Configure GOLDAPI_CONFIG_SECRET before saving an API key.');
  return createHash('sha256').update(secret).digest();
};
const encrypt = (value) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map(part => part.toString('base64')).join('.');
};
const decrypt = (value) => {
  const [iv, tag, encrypted] = value.split('.').map(part => Buffer.from(part, 'base64'));
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
};
const decode = (record) => ({
  enabled: record?.enabled !== false,
  apiKey: record?.encryptedApiKey ? decrypt(record.encryptedApiKey) : environmentKey(),
  keySource: record?.encryptedApiKey ? 'admin' : 'environment',
});

export const getProviderConfig = async () => {
  if (savedConfig && Date.now() - loadedAt < 30000) return savedConfig;
  if (pending) return pending;
  pending = (async () => {
    if (!process.env.MONGO_URI) return savedConfig || decode(null);
    if (!getDbStatus()) await connectDB();
    if (!getDbStatus()) {
      // Keep a previously loaded OFF setting when MongoDB is temporarily unavailable.
      if (savedConfig) return savedConfig;
      throw new Error('Rate settings are unavailable.');
    }
    const record = await GoldRateConfig.findOne({ key: 'goldapi' }).select('+encryptedApiKey').lean();
    savedConfig = decode(record);
    loadedAt = Date.now();
    return savedConfig;
  })().finally(() => { pending = null; });
  return pending;
};

export const saveProviderConfig = async ({ enabled, apiKey, useEnvironmentKey }) => {
  if (!getDbStatus()) throw new Error('Database unavailable. Settings have not been saved.');
  // Finish any earlier read before publishing the new settings into this process.
  if (pending) await pending;
  const update = { $set: { enabled } };
  if (useEnvironmentKey) update.$unset = { encryptedApiKey: 1 };
  else if (apiKey) update.$set.encryptedApiKey = encrypt(apiKey);
  const record = await GoldRateConfig.findOneAndUpdate({ key: 'goldapi' }, update,
    { new: true, upsert: true, runValidators: true }).select('+encryptedApiKey').lean();
  savedConfig = decode(record);
  loadedAt = Date.now();
  return savedConfig;
};

export const publicProviderConfig = (config) => ({
  enabled: config.enabled, keyConfigured: Boolean(config.apiKey), keySource: config.keySource,
  refreshHours: 4, providerRequestsPerRefresh: 3, estimatedMonthlyRequests: 540,
});
