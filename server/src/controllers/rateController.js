import { goldRateService } from '../services/goldRateService.js';

// Compatibility adapter: old storefront consumers and the new endpoint share ONE cache.
export const getLiveRates = async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const result = await goldRateService.getRates();
    const { goldRate, silverRate, usdInr, goldMCX } = result.data;
    const numericRates = Object.fromEntries([24, 22, 18, 14, 9].map(karat => [karat + 'K', goldRate * karat / 24]));
    numericRates.silverPerGram = silverRate;
    const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
    const spot = (label, ask) => ({ type: 'spot', label, ask: ask.toFixed(2), icon: 'fa-solid fa-chart-line' });
    const goldSpotAsk = goldRate * 31.1034768 / usdInr;
    const silverSpotAsk = silverRate * 31.1034768 / usdInr;
    res.json({
      ...result, liveAvailable: true, cached: result.meta.cached, stale: result.meta.stale,
      source: 'GoldAPI spot prices; refreshed every 4 hours', lastUpdated: result.meta.lastUpdated,
      numericRates, goldSpotAsk, silverSpotAsk, inrSpotAsk: usdInr,
      goldRates: [
        spot('GOLD SPOT', goldSpotAsk),
        { type: 'rate', label: 'GOLD (10g)', rate: money(goldMCX), icon: 'uil uil-gold' },
        ...[22, 18, 14, 9].map(karat => ({ type: 'rate', label: karat + 'KT BL RATE', rate: money(numericRates[karat + 'K']), unit: '/g', icon: 'uil uil-gold' })),
        spot('INR SPOT', usdInr),
      ],
      silverRates: [spot('SILVER SPOT', silverSpotAsk),
        { type: 'rate', label: '999 SILVER', rate: money(silverRate * 1000), unit: '/Kg', icon: 'uil uil-coins' }],
    });
  } catch (error) {
    res.status(error.status || 503).json({ success: false, liveAvailable: false, code: error.code, message: error.message });
  }
};
