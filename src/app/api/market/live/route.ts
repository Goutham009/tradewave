import { NextResponse } from 'next/server';

type CommodityPrice = {
  commodity: string;
  symbol: string;
  price: number;
  changePercent: number;
  unit: string;
};

// --- LME metals-api.com configuration ---
// Set METALS_API_KEY in .env.local to enable real LME settlement prices.
// Free tier: 50 requests/month at https://metals-api.com
const METALS_API_KEY = process.env.METALS_API_KEY || '';

const LME_METALS: Array<{
  commodity: string;
  symbol: string;
  metalApiSymbol: string;
  unit: string;
}> = [
  { commodity: 'Copper', symbol: 'LME-CU', metalApiSymbol: 'CU', unit: 'USD/MT' },
  { commodity: 'Aluminum', symbol: 'LME-AL', metalApiSymbol: 'AL', unit: 'USD/MT' },
  { commodity: 'Nickel', symbol: 'LME-NI', metalApiSymbol: 'NI', unit: 'USD/MT' },
  { commodity: 'Zinc', symbol: 'LME-ZN', metalApiSymbol: 'ZN', unit: 'USD/MT' },
  { commodity: 'Lead', symbol: 'LME-PB', metalApiSymbol: 'PB', unit: 'USD/MT' },
  { commodity: 'Tin', symbol: 'LME-SN', metalApiSymbol: 'SN', unit: 'USD/MT' },
];

// --- Yahoo Finance fallback configuration ---
const YAHOO_WATCHLIST: Array<{ commodity: string; symbol: string; unit: string }> = [
  { commodity: 'Copper', symbol: 'HG=F', unit: 'USD/lb' },
  { commodity: 'Aluminum', symbol: 'ALI=F', unit: 'USD/MT' },
  { commodity: 'Nickel', symbol: 'NI=F', unit: 'USD/MT' },
  { commodity: 'Iron Ore', symbol: 'TIO=F', unit: 'USD/MT' },
  { commodity: 'Platinum', symbol: 'PL=F', unit: 'USD/oz' },
  { commodity: 'Palladium', symbol: 'PA=F', unit: 'USD/oz' },
];

const FALLBACK_PRICES: CommodityPrice[] = [
  { commodity: 'Copper', symbol: 'LME-CU', price: 8542.5, changePercent: 2.3, unit: 'USD/MT' },
  { commodity: 'Aluminum', symbol: 'LME-AL', price: 2285, changePercent: -0.8, unit: 'USD/MT' },
  { commodity: 'Nickel', symbol: 'LME-NI', price: 16250, changePercent: 1.2, unit: 'USD/MT' },
  { commodity: 'Zinc', symbol: 'LME-ZN', price: 2650, changePercent: 0.5, unit: 'USD/MT' },
  { commodity: 'Lead', symbol: 'LME-PB', price: 2180, changePercent: -0.3, unit: 'USD/MT' },
  { commodity: 'Tin', symbol: 'LME-SN', price: 25800, changePercent: 1.8, unit: 'USD/MT' },
];

// In-memory cache to avoid hitting rate limits
let cachedResponse: { data: CommodityPrice[]; source: string; timestamp: number } | null = null;
const CACHE_TTL_MS = 120_000; // 2 minutes

// --- Strategy 1: metals-api.com (real LME settlement prices) ---
async function fetchFromMetalsApi(): Promise<{ prices: CommodityPrice[]; source: string } | null> {
  if (!METALS_API_KEY) return null;

  try {
    const symbols = LME_METALS.map((m) => m.metalApiSymbol).join(',');
    const endpoint = `https://metals-api.com/api/latest?access_key=${METALS_API_KEY}&base=USD&symbols=${symbols}`;

    const response = await fetch(endpoint, { next: { revalidate: 120 } });
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.rates) return null;

    // metals-api returns rates as 1/price (i.e. how many units per 1 USD), so we invert
    const prices: CommodityPrice[] = LME_METALS.map((metal) => {
      const rate = data.rates[metal.metalApiSymbol];
      if (!rate || rate === 0) {
        const fb = FALLBACK_PRICES.find((f) => f.symbol === metal.symbol);
        return fb || { commodity: metal.commodity, symbol: metal.symbol, price: 0, changePercent: 0, unit: metal.unit };
      }
      const price = Number((1 / rate).toFixed(2));
      // metals-api doesn't provide change%, estimate from fallback baseline
      const baseline = FALLBACK_PRICES.find((f) => f.symbol === metal.symbol);
      const changePercent = baseline
        ? Number((((price - baseline.price) / baseline.price) * 100).toFixed(2))
        : 0;

      return {
        commodity: metal.commodity,
        symbol: metal.symbol,
        price,
        changePercent,
        unit: metal.unit,
      };
    });

    return { prices, source: 'LME via metals-api.com' };
  } catch (error) {
    console.error('metals-api.com fetch failed:', error);
    return null;
  }
}

// --- Strategy 2: Yahoo Finance (commodity futures) ---
async function fetchFromYahoo(): Promise<{ prices: CommodityPrice[]; source: string } | null> {
  try {
    const symbolList = YAHOO_WATCHLIST.map((item) => item.symbol).join(',');
    const endpoint = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolList)}`;

    const response = await fetch(endpoint, {
      headers: { 'User-Agent': 'tradewave-market-intelligence' },
      next: { revalidate: 120 },
    });

    if (!response.ok) return null;

    const payload = await response.json();
    const result = payload.quoteResponse?.result || [];
    if (!result.length) return null;

    const quoteMap = new Map(
      result.map((q: { symbol?: string; regularMarketPrice?: number; regularMarketChangePercent?: number }) => [q.symbol, q])
    );

    const prices: CommodityPrice[] = YAHOO_WATCHLIST.map((item) => {
      const quote = quoteMap.get(item.symbol) as {
        regularMarketPrice?: number;
        regularMarketChangePercent?: number;
      } | undefined;

      if (!quote || typeof quote.regularMarketPrice !== 'number') {
        const fb = FALLBACK_PRICES.find((f) => f.commodity === item.commodity);
        return fb || { commodity: item.commodity, symbol: item.symbol, price: 0, changePercent: 0, unit: item.unit };
      }

      return {
        commodity: item.commodity,
        symbol: item.symbol,
        price: Number(quote.regularMarketPrice.toFixed(2)),
        changePercent: typeof quote.regularMarketChangePercent === 'number'
          ? Number(quote.regularMarketChangePercent.toFixed(2))
          : 0,
        unit: item.unit,
      };
    });

    return { prices, source: 'Yahoo Finance' };
  } catch (error) {
    console.error('Yahoo Finance fetch failed:', error);
    return null;
  }
}

export async function GET() {
  const headers = {
    'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
  };

  // Return cached data if still fresh
  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      {
        prices: cachedResponse.data,
        updatedAt: new Date(cachedResponse.timestamp).toISOString(),
        sourceLabel: cachedResponse.source,
        fallback: false,
      },
      { headers }
    );
  }

  // Try LME (metals-api.com) first, then Yahoo Finance, then fallback
  const lmeResult = await fetchFromMetalsApi();
  if (lmeResult) {
    cachedResponse = { data: lmeResult.prices, source: lmeResult.source, timestamp: Date.now() };
    return NextResponse.json(
      {
        prices: lmeResult.prices,
        updatedAt: new Date().toISOString(),
        sourceLabel: lmeResult.source,
        fallback: false,
      },
      { headers }
    );
  }

  const yahooResult = await fetchFromYahoo();
  if (yahooResult) {
    cachedResponse = { data: yahooResult.prices, source: yahooResult.source, timestamp: Date.now() };
    return NextResponse.json(
      {
        prices: yahooResult.prices,
        updatedAt: new Date().toISOString(),
        sourceLabel: yahooResult.source,
        fallback: false,
      },
      { headers }
    );
  }

  // All sources failed — use fallback
  console.error('All market data sources failed, using fallback');
  return NextResponse.json(
    {
      prices: FALLBACK_PRICES,
      updatedAt: new Date().toISOString(),
      sourceLabel: 'Fallback snapshot',
      fallback: true,
    },
    { headers }
  );
}
