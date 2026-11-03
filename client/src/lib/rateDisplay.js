export const getRateError = (error) => error?.response?.data?.code === 'RATE_PROVIDER_QUOTA'
  ? 'Live rates are temporarily unavailable because the rate provider has reached its request limit. Please try again later.'
  : 'Live rates could not be loaded. Please try Refresh Rates again later.';

export const getRateDisplay = (data) => {
  const format = (value, multiplier = 1) => Number.isFinite(value) ? (value * multiplier).toLocaleString('en-IN') : 'Unavailable';
  const spot = (items, label, ask) => {
    const item = items?.find((entry) => entry.label === label);
    return { ask: Number.isFinite(ask) ? ask.toFixed(2) : (item?.ask ?? 'Unavailable'), high: item?.high ?? 'Unavailable', low: item?.low ?? 'Unavailable' };
  };
  const rates = data?.numericRates ?? {};
  return {
    goldSpot: spot(data?.goldRates, 'GOLD SPOT', data?.goldSpotAsk),
    silverSpot: spot(data?.silverRates, 'SILVER SPOT', data?.silverSpotAsk),
    inrSpot: spot(data?.goldRates, 'INR SPOT', data?.inrSpotAsk),
    tableRows: [
      { label: 'GOLD MCX (10g)', rate: format(rates['24K'], 10), isBold: true },
      ...['22K', '18K', '14K', '9K'].map((karat) => ({ label: karat + ' BL RATE', rate: format(rates[karat]) })),
      { label: '999 SILVER MCX (1 Kg)', rate: format(rates.silverPerGram, 1000), isBold: true },
    ],
  };
};
