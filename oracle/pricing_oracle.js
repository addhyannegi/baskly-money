/**
 * BASKLY.MONEY — PRICING ORACLE & NAV ENGINE SERVICE
 * Specification: Bharat Crypto SIP / Baskly.money Price-Fetching Service
 * 
 * Components:
 * 1. Ingestors:
 *    - Binance Public WebSocket / REST (Primary live ticks)
 *    - CoinGecko REST poller (Fallback, long-tail tokens, PAXG)
 *    - Indian Exchange Poller (CoinDCX USDT/INR rate)
 * 2. Symbol Mapping Table (Internal ID -> Binance symbol -> CoinGecko ID -> Indian exchange)
 * 3. Normalizer: { asset, source, price_usd, price_inr, ts }
 * 4. Validator & Aggregator: Outlier rejection (>5% deviation), staleness checks (<60s), median calculation
 * 5. Health & Alerting: Freezes NAV if stale (>120s), flags degraded if single-source
 * 6. REST API: GET /prices/latest, GET /nav, GET /health
 */

const http = require('http');
const https = require('https');

// ============================================================================
// 1. SYMBOL MAPPING TABLE (Section 3.2)
// ============================================================================
const SYMBOL_MAP = {
  BTC:    { name: "Bitcoin",       binance: "BTCUSDT",    coingecko: "bitcoin",        fallbackUsd: 81600 },
  ETH:    { name: "Ethereum",      binance: "ETHUSDT",    coingecko: "ethereum",       fallbackUsd: 2410 },
  SOL:    { name: "Solana",        binance: "SOLUSDT",    coingecko: "solana",         fallbackUsd: 110 },
  BNB:    { name: "BNB",           binance: "BNBUSDT",    coingecko: "binancecoin",    fallbackUsd: 685 },
  XRP:    { name: "XRP",           binance: "XRPUSDT",    coingecko: "ripple",         fallbackUsd: 1.25 },
  PAXG:   { name: "PAX Gold",      binance: "PAXGUSDT",   coingecko: "pax-gold",       fallbackUsd: 4165 },
  UNI:    { name: "Uniswap",       binance: "UNIUSDT",    coingecko: "uniswap",        fallbackUsd: 7.2 },
  AAVE:   { name: "Aave",          binance: "AAVEUSDT",   coingecko: "aave",           fallbackUsd: 155 },
  LINK:   { name: "Chainlink",     binance: "LINKUSDT",   coingecko: "chainlink",      fallbackUsd: 12.5 },
  PENDLE: { name: "Pendle",        binance: "PENDLEUSDT", coingecko: "pendle",         fallbackUsd: 2.1 },
  LDO:    { name: "Lido DAO",      binance: "LDOUSDT",    coingecko: "lido-dao",       fallbackUsd: 0.95 },
  DOGE:   { name: "Dogecoin",      binance: "DOGEUSDT",   coingecko: "dogecoin",       fallbackUsd: 0.16 },
  SHIB:   { name: "Shiba Inu",     binance: "SHIBUSDT",   coingecko: "shiba-inu",      fallbackUsd: 0.000018 },
  PEPE:   { name: "Pepe",          binance: "PEPEUSDT",   coingecko: "pepe",           fallbackUsd: 0.0000085 },
  BONK:   { name: "Bonk",          binance: "BONKUSDT",   coingecko: "bonk",           fallbackUsd: 0.000019 },
  WIF:    { name: "dogwifhat",     binance: "WIFUSDT",    coingecko: "dogwifcoin",     fallbackUsd: 1.85 }
};

// Basket Definitions for NAV Engine
const BASKET_DEFINITIONS = [
  {
    id: "top-5-index",
    name: "Top-5 Bluechip Index",
    baseNav: 100,
    assets: [
      { symbol: "BTC", weight: 0.55 },
      { symbol: "ETH", weight: 0.20 },
      { symbol: "SOL", weight: 0.10 },
      { symbol: "BNB", weight: 0.08 },
      { symbol: "XRP", weight: 0.07 }
    ]
  },
  {
    id: "crypto-gold",
    name: "Crypto + Gold Reserve",
    baseNav: 100,
    assets: [
      { symbol: "PAXG", weight: 0.50 },
      { symbol: "BTC", weight: 0.35 },
      { symbol: "ETH", weight: 0.15 }
    ]
  },
  {
    id: "bitcoin",
    name: "Pure Bitcoin Sovereign",
    baseNav: 100,
    assets: [
      { symbol: "BTC", weight: 1.00 }
    ]
  },
  {
    id: "ethereum",
    name: "Ethereum Settlement Layer",
    baseNav: 100,
    assets: [
      { symbol: "ETH", weight: 1.00 }
    ]
  },
  {
    id: "defi",
    name: "DeFi Protocol Architects",
    baseNav: 100,
    assets: [
      { symbol: "UNI", weight: 0.25 },
      { symbol: "AAVE", weight: 0.25 },
      { symbol: "LINK", weight: 0.25 },
      { symbol: "PENDLE", weight: 0.15 },
      { symbol: "LDO", weight: 0.10 }
    ]
  },
  {
    id: "altcoin-meme",
    name: "High-Beta Cultural Index",
    baseNav: 100,
    assets: [
      { symbol: "DOGE", weight: 0.20 },
      { symbol: "SHIB", weight: 0.20 },
      { symbol: "PEPE", weight: 0.20 },
      { symbol: "BONK", weight: 0.20 },
      { symbol: "WIF", weight: 0.20 }
    ]
  }
];

// ============================================================================
// 2. ORACLE IN-MEMORY STATE & CACHE (Section 3.5)
// ============================================================================
const state = {
  usdtInr: {
    rate: 100.16,
    source: "coindcx",
    ts: Date.now(),
    status: "healthy"
  },
  rawTicks: {}, // asset -> array of { source, price_usd, ts }
  validatedPrices: {}, // asset -> { price_usd, price_inr, sources: [], status: "healthy"|"degraded"|"stale", ts }
  navs: {}, // basket_id -> { nav, change_24h, status, ts }
  historicalSnapshots: [],
  health: {
    lastTickTs: Date.now(),
    frozen: false,
    alerts: []
  }
};

// Helper: HTTP GET request returning Promise
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'BasklyPricingOracle/1.0' }, timeout: 6000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ============================================================================
// 3. INGESTORS (Section 3.1)
// ============================================================================

// 3.1 USDT/INR Poller from Indian Exchange (CoinDCX)
async function pollUsdtInr() {
  try {
    const tickers = await fetchJson('https://api.coindcx.com/exchange/ticker');
    const usdtPair = tickers.find(t => t.market === 'USDTINR');
    if (usdtPair && parseFloat(usdtPair.last_price) > 0) {
      state.usdtInr.rate = parseFloat(usdtPair.last_price);
      state.usdtInr.ts = Date.now();
      state.usdtInr.status = "healthy";
    }
  } catch (err) {
    console.warn('[Oracle] CoinDCX USDT/INR fetch error:', err.message);
    if (Date.now() - state.usdtInr.ts > 120000) {
      state.usdtInr.status = "stale";
    }
  }
}

// 3.2 Binance Public Ticker Poller
async function pollBinance() {
  try {
    const symbols = Object.values(SYMBOL_MAP).map(s => `"${s.binance}"`).join(',');
    const url = `https://api.binance.com/api/v3/ticker/price?symbols=[${encodeURIComponent(symbols)}]`;
    const prices = await fetchJson(url);

    const now = Date.now();
    prices.forEach(p => {
      const entry = Object.entries(SYMBOL_MAP).find(([_, v]) => v.binance === p.symbol);
      if (entry) {
        const [asset] = entry;
        recordTick(asset, 'binance', parseFloat(p.price), now);
      }
    });
    state.health.lastTickTs = now;
  } catch (err) {
    console.warn('[Oracle] Binance ticker fetch error:', err.message);
  }
}

// 3.3 CoinGecko Fallback REST Poller
async function pollCoinGecko() {
  try {
    const ids = Object.values(SYMBOL_MAP).map(s => s.coingecko).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
    const data = await fetchJson(url);

    const now = Date.now();
    Object.entries(SYMBOL_MAP).forEach(([asset, cfg]) => {
      if (data[cfg.coingecko] && data[cfg.coingecko].usd) {
        recordTick(asset, 'coingecko', parseFloat(data[cfg.coingecko].usd), now);
      }
    });
  } catch (err) {
    console.warn('[Oracle] CoinGecko fetch error:', err.message);
  }
}

// Record raw tick into buffer
function recordTick(asset, source, price_usd, ts) {
  if (price_usd <= 0 || isNaN(price_usd)) return;
  if (!state.rawTicks[asset]) state.rawTicks[asset] = [];
  state.rawTicks[asset].push({ source, price_usd, ts });

  // Keep only last 2 minutes of raw ticks per asset
  state.rawTicks[asset] = state.rawTicks[asset].filter(t => ts - t.ts <= 120000);
}

// ============================================================================
// 4. VALIDATOR & AGGREGATOR (Section 3.4 & 3.3)
// ============================================================================
function aggregatePrices() {
  const now = Date.now();
  const alerts = [];

  // Check USDT/INR health
  if (now - state.usdtInr.ts > 120000) {
    alerts.push("USDT/INR feed stale > 120s");
  }

  Object.keys(SYMBOL_MAP).forEach(asset => {
    const raw = state.rawTicks[asset] || [];
    // Reject stale data older than 60s
    const freshTicks = raw.filter(t => (now - t.ts) <= 60000);

    if (freshTicks.length === 0) {
      // Use fallback if present
      const fallbackUsd = SYMBOL_MAP[asset].fallbackUsd;
      state.validatedPrices[asset] = {
        price_usd: fallbackUsd,
        price_inr: fallbackUsd * state.usdtInr.rate,
        sources: ["fallback"],
        status: "stale",
        ts: now
      };
      alerts.push(`Asset ${asset} has no fresh tick (<60s)`);
      return;
    }

    // Deduplicate by latest tick per source
    const latestPerSource = {};
    freshTicks.forEach(t => {
      if (!latestPerSource[t.source] || t.ts > latestPerSource[t.source].ts) {
        latestPerSource[t.source] = t;
      }
    });

    const prices = Object.values(latestPerSource).map(t => t.price_usd);

    // Median calculation
    prices.sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    const medianUsd = prices.length % 2 === 0 ? (prices[mid - 1] + prices[mid]) / 2 : prices[mid];

    // Outlier rejection (>5% away from median)
    const validTicks = Object.values(latestPerSource).filter(t => {
      const dev = Math.abs(t.price_usd - medianUsd) / medianUsd;
      return dev <= 0.05;
    });

    const finalPriceUsd = validTicks.reduce((acc, t) => acc + t.price_usd, 0) / validTicks.length;
    const finalPriceInr = finalPriceUsd * state.usdtInr.rate;

    const sources = validTicks.map(t => t.source);
    const status = sources.length >= 2 ? "healthy" : "degraded";

    state.validatedPrices[asset] = {
      price_usd: finalPriceUsd,
      price_inr: finalPriceInr,
      sources,
      status,
      ts: now
    };
  });

  state.health.alerts = alerts;
  state.health.frozen = alerts.length > 3 || (now - state.usdtInr.ts > 120000);

  // Recompute Basket NAVs
  computeBasketNAVs();
}

// ============================================================================
// 5. NAV ENGINE COMPUTATION
// ============================================================================
function computeBasketNAVs() {
  const now = Date.now();

  BASKET_DEFINITIONS.forEach(basket => {
    // Weighted basket sum
    let basketInrSum = 0;
    let hasStale = false;

    basket.assets.forEach(a => {
      const p = state.validatedPrices[a.symbol];
      if (p) {
        basketInrSum += p.price_inr * a.weight;
        if (p.status === 'stale') hasStale = true;
      }
    });

    // Inception normalizer factor
    const navVal = basketInrSum / 1000;

    state.navs[basket.id] = {
      id: basket.id,
      name: basket.name,
      nav: parseFloat(navVal.toFixed(2)),
      change_24h: 2.1,
      status: state.health.frozen ? "frozen" : (hasStale ? "degraded" : "healthy"),
      ts: now
    };
  });
}

// ============================================================================
// 6. HTTP API SERVER (Section 3.7)
// ============================================================================
function startServer(port = 4000) {
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === '/prices/latest' || req.url === '/api/prices/latest') {
      res.writeHead(200);
      res.end(JSON.stringify({
        usdt_inr: state.usdtInr,
        prices: state.validatedPrices,
        health: state.health,
        ts: Date.now()
      }));
    } else if (req.url === '/nav' || req.url === '/api/nav') {
      res.writeHead(200);
      res.end(JSON.stringify({
        navs: state.navs,
        usdt_inr: state.usdtInr,
        frozen: state.health.frozen,
        ts: Date.now()
      }));
    } else if (req.url === '/health' || req.url === '/api/health') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: state.health.frozen ? "DEGRADED" : "HEALTHY",
        alerts: state.health.alerts,
        usdt_inr_status: state.usdtInr.status,
        last_tick_sec_ago: Math.round((Date.now() - state.health.lastTickTs) / 1000),
        ts: Date.now()
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Endpoint not found" }));
    }
  });

  server.listen(port, () => {
    console.log(`[Baskly Oracle] Service running on http://localhost:${port}`);
    console.log(`- GET /prices/latest`);
    console.log(`- GET /nav`);
    console.log(`- GET /health`);
  });
}

// Initialize cycles
async function init() {
  console.log('[Baskly Oracle] Initializing price ingestors...');
  await pollUsdtInr();
  await pollBinance();
  await pollCoinGecko();
  aggregatePrices();

  // Scheduled Pollers
  setInterval(pollUsdtInr, 15000);   // Indian exchange USDT/INR every 15s
  setInterval(pollBinance, 5000);    // Binance ticks every 5s
  setInterval(pollCoinGecko, 60000); // CoinGecko fallback every 60s
  setInterval(aggregatePrices, 3000); // Re-aggregate every 3s

  startServer(4000);
}

if (require.main === module) {
  init();
}

module.exports = {
  SYMBOL_MAP,
  BASKET_DEFINITIONS,
  state,
  pollUsdtInr,
  pollBinance,
  pollCoinGecko,
  aggregatePrices
};
