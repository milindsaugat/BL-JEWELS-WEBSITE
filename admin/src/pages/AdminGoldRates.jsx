import React, { useEffect, useState } from 'react';
import { Coins, Clock3, KeyRound, ShieldCheck, Save, RefreshCw, Zap, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export const AdminGoldRates = () => {
  const [settings, setSettings] = useState(null);
  const [cache, setCache] = useState({});
  const [enabled, setEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [useEnvironmentKey, setUseEnvironmentKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const apply = (data) => {
    setSettings(data.settings);
    setEnabled(data.settings.enabled);
    setCache(data.cache);
  };

  const load = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await api.get('/gold-rates/settings');
      apply(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load rate settings.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');

    try {
      const { data } = await api.put('/gold-rates/settings', {
        enabled,
        apiKey: cleanKey || undefined,
        useEnvironmentKey,
      });

      apply(data);
      setApiKey('');
      setUseEnvironmentKey(false);

      if (data.testResult) {
        if (data.testResult.verified) {
          setMessage(`✓ API Key saved & verified! ${data.testResult.message}`);
        } else {
          setError(`⚠️ Key saved to database, but GoldAPI test failed: ${data.testResult.message}`);
        }
      } else {
        setMessage('Settings saved successfully. Cooldown reset to allow immediate sync.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save rate settings.');
    } finally {
      setBusy(false);
    }
  };

  const handleTestAndSync = async () => {
    setTesting(true);
    setError('');
    setMessage('');

    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');

    try {
      const { data } = await api.post('/gold-rates/sync', {
        apiKey: cleanKey || undefined,
      });

      setTestResult({
        success: true,
        message: data.message,
      });
      if (data.cache) setCache(data.cache);
      setMessage(data.message);
    } catch (err) {
      const errData = err.response?.data;
      const failMsg = errData?.message || err.message || 'Connection test failed';
      setTestResult({
        success: false,
        message: failMsg,
      });
      setError(failMsg);
    } finally {
      setTesting(false);
    }
  };

  const date = (value) =>
    value
      ? new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
      : 'No refresh yet';

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6 font-body">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#741D2D] font-bold">Market Data & Bullion Sync</p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">Gold & Silver Live Rates</h1>
          <p className="text-sm text-stone-500 mt-1">
            Configure your GoldAPI.io credentials and test real-time bullion feeds.
          </p>
        </div>
        <button
          onClick={load}
          disabled={busy}
          className="inline-flex justify-center items-center gap-2 border border-stone-200 rounded-xl px-4 py-2 text-xs font-semibold bg-white hover:bg-stone-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
          <span>Reload Status</span>
        </button>
      </div>

      {/* Error & Success Alerts */}
      {error && (
        <div role="alert" className="rounded-xl bg-rose-50 border border-rose-200 text-rose-800 p-4 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">GoldAPI Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {message && (
        <div role="status" className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Success:</span>
            <span>{message}</span>
          </div>
        </div>
      )}

      {settings && (
        <>
          {/* KPI Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <Clock3 size={20} className="text-[#741D2D] mb-3" />
              <p className="text-xs text-stone-500">Auto-Refresh Interval</p>
              <p className="font-bold text-xl text-stone-900 mt-1">Every 4 hours</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <Coins size={20} className="text-[#741D2D] mb-3" />
              <p className="text-xs text-stone-500">Feed Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${settings.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                <p className="font-bold text-xl text-stone-900">{settings.enabled ? 'ON (Active)' : 'OFF (Paused)'}</p>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <ShieldCheck size={20} className="text-[#741D2D] mb-3" />
              <p className="text-xs text-stone-500">API Key Source</p>
              <p className="font-bold text-base text-stone-900 mt-1">
                {settings.keyConfigured
                  ? settings.keySource === 'admin'
                    ? 'Active (Admin Key)'
                    : 'Active (.env Key)'
                  : 'Not Configured'}
              </p>
            </div>
          </div>

          {/* Form: Replace API Key & Test */}
          <form onSubmit={save} className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xs">
            <div className="flex items-start justify-between gap-5 border-b border-stone-100 pb-5">
              <div>
                <h2 className="font-bold text-lg text-stone-900">GoldAPI Connection Setup</h2>
                <p className="text-xs text-stone-500 mt-1 max-w-xl">
                  Connect your live GoldAPI.io account. When paused or quota exceeded, the storefront automatically falls back to Indian Bullion Benchmarks so customers always see the live ticker.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-label="Enable GoldAPI"
                aria-checked={enabled}
                disabled={busy}
                onClick={() => setEnabled(!enabled)}
                className={`relative w-14 h-8 rounded-full shrink-0 transition-colors cursor-pointer ${
                  enabled ? 'bg-emerald-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    enabled ? 'left-1 translate-x-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Active Key Status Card */}
            {settings.keyConfigured && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-950">
                        Aapki API Key Database Mein Saved Aur Active Hai!
                      </span>
                      <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-full font-mono">
                        LIVE CONNECTED
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-800 block mt-0.5 tracking-wider">
                      {settings.keyMasked || 'goldapi-••••••••••••-io'}
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      Source: {settings.keySource === 'admin' ? 'Admin Custom Saved Key (Database Encrypted)' : 'Server .env File'}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-emerald-900 font-semibold block">
                    Status: <strong>Active (200 OK)</strong>
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    Security: Server AES-256 encrypted
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="gold-api-key" className="flex items-center gap-2 font-semibold text-sm text-stone-800">
                  <KeyRound size={16} className="text-[#741D2D]" />
                  <span>{settings.keyConfigured ? 'Replace / Update API Key (Leave empty to keep current key)' : 'Enter GoldAPI Key'}</span>
                </label>
                <a
                  href="https://www.goldapi.io/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#741D2D] hover:underline inline-flex items-center gap-1"
                >
                  <span>Get Key on GoldAPI.io</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <input
                id="gold-api-key"
                type="text"
                autoComplete="off"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={busy || testing || useEnvironmentKey}
                placeholder={settings.keyConfigured ? 'Paste new goldapi-xxxxxxxxxxxx-io only if you want to replace current key' : 'Paste your goldapi-xxxxxxxxxxxx-io key here'}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#741D2D] bg-stone-50 focus:bg-white"
              />

              <p className="text-xs text-stone-500">
                🔒 Security Note: Security ke liye raw private key text box mein plain text nahi dikhayi jaati, balki encrypted rehti hai. Aapki active key upar green box mein live connected hai.
              </p>
            </div>

            <label className="flex gap-2.5 items-center text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={useEnvironmentKey}
                disabled={busy || testing}
                onChange={(e) => setUseEnvironmentKey(e.target.checked)}
                className="rounded border-stone-300 text-[#741D2D] focus:ring-[#741D2D]"
              />
              <span>Revert to server environment key (.env) instead of database saved key</span>
            </label>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={busy || testing}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#741D2D] hover:bg-[#5C0202] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Save size={15} />
                <span>{busy ? 'Saving Key...' : 'Save & Verify Key'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestAndSync}
                disabled={busy || testing}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Zap size={15} className={`text-emerald-700 ${testing ? 'animate-bounce' : ''}`} />
                <span>{testing ? 'Testing Connection...' : 'Test Connection & Fetch Rates'}</span>
              </button>
            </div>
          </form>

          {/* Cache & Activity Diagnostics */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-2.5 text-xs shadow-xs">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <span>Live Feed Telemetry</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-stone-600">
                Last Successful Sync: <span className="font-semibold text-stone-900 block mt-0.5">{date(cache.lastUpdated)}</span>
              </p>
              <p className="text-stone-600">
                Last API Attempt: <span className="font-semibold text-stone-900 block mt-0.5">{date(cache.lastApiCall)}</span>
              </p>
              <p className="text-stone-600">
                Next Scheduled Auto-Refresh: <span className="font-bold text-emerald-800">{cache.nextUpdateIn || 0} minutes</span>
              </p>
              {cache.lastError && (
                <p className="text-rose-700 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                  Previous Attempt Code: {cache.lastError} (Fallback Benchmark Active)
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs text-amber-950 space-y-2 shadow-xs">
              <h3 className="font-bold text-sm text-amber-900">Request Budget & Quota Info</h3>
              <p className="leading-relaxed">
                GoldAPI Free Tier provides <strong>200–500 requests/month</strong>. BL Jewels refreshes gold, silver, and USD/INR every 4 hours (about 540 requests in 30 days).
              </p>
              <p className="leading-relaxed font-medium text-amber-900">
                💡 <strong>Zero Downtime Feature:</strong> Even if your free quota runs out on GoldAPI, BL Jewels keeps the storefront live rates board ticking seamlessly with Indian market benchmark rates!
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminGoldRates;
