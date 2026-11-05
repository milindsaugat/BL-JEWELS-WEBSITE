import React, { useEffect, useState } from 'react';
import { Coins, Clock3, KeyRound, ShieldCheck, Save, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const AdminGoldRates = () => {
  const logout = useAuthStore(state => state.logout);
  const [settings, setSettings] = useState(null);
  const [cache, setCache] = useState({});
  const [enabled, setEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [useEnvironmentKey, setUseEnvironmentKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const apply = (data) => { setSettings(data.settings); setEnabled(data.settings.enabled); setCache(data.cache); };
  const load = async () => {
    setBusy(true); setError('');
    try { apply((await api.get('/gold-rates/settings')).data); }
    catch (err) {
      if (err.response?.status === 401) logout();
      setError(err.response?.data?.message || 'Unable to load rate settings.');
    }
    finally { setBusy(false); }
  };
  useEffect(() => { load(); }, []);
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const { data } = await api.put('/gold-rates/settings', { enabled, ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}), useEnvironmentKey });
      apply(data); setApiKey(''); setUseEnvironmentKey(false);
      setMessage('Settings saved. The existing refresh schedule is preserved.');
    } catch (err) {
      if (err.response?.status === 401) logout();
      setError(err.response?.data?.message || 'Unable to save rate settings.');
    }
    finally { setBusy(false); }
  };
  const date = value => value ? new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST' : 'No refresh yet';

  return <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><p className="text-xs uppercase tracking-widest text-amber-700 font-semibold">Market data</p><h1 className="text-2xl sm:text-3xl font-semibold mt-1">Gold & silver rates</h1><p className="text-sm text-stone-500 mt-2">Manage your feed and keep provider requests under control.</p></div>
      <button onClick={load} disabled={busy} className="inline-flex justify-center items-center gap-2 border rounded-xl px-4 py-2.5 text-sm bg-white disabled:opacity-50"><RefreshCw size={16} /> Reload status</button>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-800 p-4 text-sm">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-emerald-50 text-emerald-800 p-4 text-sm">{message}</p>}
    {settings && <>
      <div className="grid sm:grid-cols-3 gap-4">
        {[['Refresh interval', 'Every 4 hours', Clock3], ['Feed status', settings.enabled ? 'ON' : 'OFF', Coins], ['API key', settings.keyConfigured ? 'Configured' : 'Not configured', ShieldCheck]].map(([title, value, Icon]) => <div key={title} className="bg-white border border-stone-200 rounded-2xl p-5"><Icon size={20} className="text-amber-700 mb-4" /><p className="text-xs text-stone-500">{title}</p><p className="font-semibold text-xl mt-1">{value}</p></div>)}
      </div>
      <form onSubmit={save} className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 space-y-6">
        <div className="flex items-start justify-between gap-5 border-b pb-6">
          <div><h2 className="font-semibold text-lg">GoldAPI connection</h2><p className="text-sm text-stone-500 mt-1 max-w-xl">Turn OFF to stop new provider requests. Previously fetched rates remain available and are marked stale.</p></div>
          <button type="button" role="switch" aria-label="Enable GoldAPI" aria-checked={enabled} disabled={busy} onClick={() => setEnabled(!enabled)} className={`relative w-14 h-8 rounded-full shrink-0 transition-colors ${enabled ? 'bg-emerald-600' : 'bg-stone-300'}`}><span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${enabled ? 'left-1 translate-x-6' : 'left-1'}`} /></button>
        </div>
        <div><label htmlFor="gold-api-key" className="flex items-center gap-2 font-medium text-sm"><KeyRound size={16} /> Replace API key</label><input id="gold-api-key" type="password" autoComplete="new-password" value={apiKey} onChange={e => setApiKey(e.target.value)} disabled={busy || useEnvironmentKey} placeholder="Leave empty to keep the current key" className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /><p className="text-xs text-stone-500 mt-2">Keys are encrypted on the server and are never returned to this screen. Current source: {settings.keySource}.</p></div>
        <label className="flex gap-3 items-center text-sm"><input type="checkbox" checked={useEnvironmentKey} disabled={busy} onChange={e => setUseEnvironmentKey(e.target.checked)} /> Use the server environment key instead of the saved key</label>
        <button disabled={busy} className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#741D2D] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"><Save size={16} />{busy ? 'Saving...' : 'Save changes'}</button>
      </form>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 text-sm"><h2 className="font-semibold">Cache activity</h2><p>Last successful update: <span className="block text-stone-500">{date(cache.lastUpdated)}</span></p><p>Last API attempt: <span className="block text-stone-500">{date(cache.lastApiCall)}</span></p><p>Next eligible refresh: {cache.nextUpdateIn} minutes</p>{cache.lastError && <p className="text-amber-800">Last refresh failed. Cached data, if available, will be served.</p>}</div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><h2 className="font-semibold mb-2">Request budget</h2><p>Gold, silver and USD/INR require 3 requests per refresh: about 540 requests in 30 days at a 4-hour interval. This exceeds a 300-request plan.</p><p className="mt-3">Memory cache is shared within one running server. Restarts clear it; multiple server instances keep separate caches.</p></div>
      </div>
    </>}
  </div>;
};
