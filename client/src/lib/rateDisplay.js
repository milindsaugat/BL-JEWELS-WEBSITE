export const getRateError = (error) => {
  const code = error?.response?.data?.code;
  if (code === 'RATE_PROVIDER_DISABLED') return 'Live-rate updates are currently paused by the store.';
  if (code === 'RATE_PROVIDER_QUOTA') return 'API rate limit reached. Rates currently not available.';
  return 'Live rates could not be loaded. Please try Refresh Rates again later.';
};

export const getRateDisplay = (data) => {
  const isAvailable = data?.ratesAvailable !== false && data?.liveAvailable !== false;
  const format = (value, multiplier = 1) =>
    isAvailable && Number.isFinite(value) && value > 0
      ? `₹${Math.round(value * multiplier).toLocaleString('en-IN')}`
      : 'Not Available';

  const spot = (items, labelMatch, defaultAsk) => {
    const item = items?.find((entry) => entry.label?.includes(labelMatch));
    const isNA = !isAvailable || item?.isUnavailable || item?.ask === 'Not Available' || (!item?.ask && !defaultAsk);
    return {
      label: item?.label || labelMatch,
      ask: isNA ? 'Not Available' : (item?.ask || (Number.isFinite(defaultAsk) ? Math.round(defaultAsk).toLocaleString('en-IN') : 'Not Available')),
      high: isNA ? 'Not Available' : (item?.high || 'Not Available'),
      low: isNA ? 'Not Available' : (item?.low || 'Not Available'),
      trend: item?.trend ?? 'up',
      change: isNA ? '' : (item?.change ?? ''),
      unit: item?.unit ?? '',
      isUnavailable: isNA,
    };
  };

  const rates = data?.numericRates ?? {};
  const goldItems = data?.goldRates ?? [];
  const silverItems = data?.silverRates ?? [];

  const getGoldItem = (labelFragment) => goldItems.find(i => i.label?.includes(labelFragment));
  const getSilverItem = (labelFragment) => silverItems.find(i => i.label?.includes(labelFragment));

  const mcxGold = getGoldItem('GOLD MCX') || getGoldItem('GOLD (10g)') || getGoldItem('GOLD (10G)');
  const silver999 = getSilverItem('999 SILVER');
  const silver925 = getSilverItem('925 STERLING');
  const silverCoin = getSilverItem('SILVER COIN');

  const checkNA = (item, numericVal) =>
    !isAvailable || item?.isUnavailable || item?.rate === 'Not Available' || !numericVal || numericVal <= 0;

  const tableRows = [
    {
      id: 'gold_mcx',
      label: 'GOLD MCX (10g)',
      purity: '99.9% 24K Pure Gold',
      rate: checkNA(mcxGold, mcxGold?.numeric || rates['24K']) ? 'Not Available' : (mcxGold?.rate || format(rates['24K'], 10)),
      numeric: checkNA(mcxGold, mcxGold?.numeric || rates['24K']) ? 0 : (mcxGold?.numeric || (rates['24K'] ? rates['24K'] * 10 : 0)),
      trend: mcxGold?.trend || 'up',
      change: checkNA(mcxGold, mcxGold?.numeric || rates['24K']) ? '' : (mcxGold?.change || ''),
      isBold: true,
      unit: '/10g',
      isUnavailable: checkNA(mcxGold, mcxGold?.numeric || rates['24K']),
    },
    ...['22', '18', '14', '9'].map((karat) => {
      const item = getGoldItem(`${karat}KT`);
      const purityMap = {
        '22': '91.6% BIS 916',
        '18': '75.0% Diamond Grade',
        '14': '58.5% Everyday Wear',
        '9': '37.5% Modern Lustre',
      };
      const numVal = item?.numeric || rates[`${karat}K`];
      const isNA = checkNA(item, numVal);
      return {
        id: `gold_${karat}k`,
        label: `${karat}KT BL RATE`,
        purity: item?.purity || purityMap[karat],
        rate: isNA ? 'Not Available' : (item?.rate || format(rates[`${karat}K`])),
        numeric: isNA ? 0 : (numVal || 0),
        trend: item?.trend || 'up',
        change: isNA ? '' : (item?.change || ''),
        isBold: karat === '22',
        unit: '/g',
        isUnavailable: isNA,
      };
    }),
    {
      id: 'silver_999',
      label: '999 SILVER MCX (1 Kg)',
      purity: '99.9% Pure Silver',
      rate: checkNA(silver999, silver999?.numeric || rates.silverPerGram) ? 'Not Available' : (silver999?.rate || format(rates.silverPerGram, 1000)),
      numeric: checkNA(silver999, silver999?.numeric || rates.silverPerGram) ? 0 : (silver999?.numeric || (rates.silverPerGram ? rates.silverPerGram * 1000 : 0)),
      trend: silver999?.trend || 'up',
      change: checkNA(silver999, silver999?.numeric || rates.silverPerGram) ? '' : (silver999?.change || ''),
      isBold: true,
      unit: '/Kg',
      isUnavailable: checkNA(silver999, silver999?.numeric || rates.silverPerGram),
    },
    {
      id: 'silver_925',
      label: '925 STERLING SILVER (1 Kg)',
      purity: '92.5% Sterling Grade',
      rate: checkNA(silver925, silver925?.numeric || rates.silverPerGram) ? 'Not Available' : (silver925?.rate || format(rates.silverPerGram, 925)),
      numeric: checkNA(silver925, silver925?.numeric || rates.silverPerGram) ? 0 : (silver925?.numeric || (rates.silverPerGram ? rates.silverPerGram * 925 : 0)),
      trend: silver925?.trend || 'up',
      change: checkNA(silver925, silver925?.numeric || rates.silverPerGram) ? '' : (silver925?.change || ''),
      isBold: false,
      unit: '/Kg',
      isUnavailable: checkNA(silver925, silver925?.numeric || rates.silverPerGram),
    },
    {
      id: 'silver_coin',
      label: 'SILVER COIN (10g)',
      purity: '99.9% Auspicious Coin',
      rate: checkNA(silverCoin, silverCoin?.numeric || rates.silverPerGram) ? 'Not Available' : (silverCoin?.rate || format(rates.silverPerGram, 10)),
      numeric: checkNA(silverCoin, silverCoin?.numeric || rates.silverPerGram) ? 0 : (silverCoin?.numeric || (rates.silverPerGram ? rates.silverPerGram * 10 : 0)),
      trend: silverCoin?.trend || 'up',
      change: checkNA(silverCoin, silverCoin?.numeric || rates.silverPerGram) ? '' : (silverCoin?.change || ''),
      isBold: false,
      unit: '/coin',
      isUnavailable: checkNA(silverCoin, silverCoin?.numeric || rates.silverPerGram),
    },
  ];

  return {
    goldSpot: spot(goldItems, 'GOLD MCX', data?.goldSpotAsk),
    silverSpot: spot(silverItems, 'SILVER MCX', data?.silverSpotAsk),
    inrSpot: spot(goldItems, 'USD / INR', data?.inrSpotAsk),
    tableRows,
  };
};
