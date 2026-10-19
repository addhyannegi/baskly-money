// Trace app.js step-by-step
const ORACLE_SYMBOLS = {
  BTC:    { name: "Bitcoin",       binance: "BTCUSDT",    coingecko: "bitcoin",        fallbackUsd: 81604 },
  ETH:    { name: "Ethereum",      binance: "ETHUSDT",    coingecko: "ethereum",       fallbackUsd: 2411 },
  SOL:    { name: "Solana",        binance: "SOLUSDT",    coingecko: "solana",         fallbackUsd: 112 },
  BNB:    { name: "BNB",           binance: "BNBUSDT",    coingecko: "binancecoin",    fallbackUsd: 685 },
  XRP:    { name: "XRP",           binance: "XRPUSDT",    coingecko: "ripple",         fallbackUsd: 1.25 },
  PAXG:   { name: "PAX Gold",      binance: "PAXGUSDT",   coingecko: "pax-gold",       fallbackUsd: 4164 },
  UNI:    { name: "Uniswap",       binance: "UNIUSDT",    coingecko: "uniswap",        fallbackUsd: 7.15 },
  AAVE:   { name: "Aave",          binance: "AAVEUSDT",   coingecko: "aave",           fallbackUsd: 154 },
  LINK:   { name: "Chainlink",     binance: "LINKUSDT",   coingecko: "chainlink",      fallbackUsd: 12.4 },
  PENDLE: { name: "Pendle",        binance: "PENDLEUSDT", coingecko: "pendle",         fallbackUsd: 2.09 },
  LDO:    { name: "Lido DAO",      binance: "LDOUSDT",    coingecko: "lido-dao",       fallbackUsd: 0.94 },
  DOGE:   { name: "Dogecoin",      binance: "DOGEUSDT",   coingecko: "dogecoin",       fallbackUsd: 0.162 },
  SHIB:   { name: "Shiba Inu",     binance: "SHIBUSDT",   coingecko: "shiba-inu",      fallbackUsd: 0.0000185 },
  PEPE:   { name: "Pepe",          binance: "PEPEUSDT",   coingecko: "pepe",           fallbackUsd: 0.0000086 },
  BONK:   { name: "Bonk",          binance: "BONKUSDT",   coingecko: "bonk",           fallbackUsd: 0.0000192 },
  WIF:    { name: "dogwifhat",     binance: "WIFUSDT",    coingecko: "dogwifcoin",     fallbackUsd: 1.84 }
};

const clientOracleState = {
  usdtInr: 100.16,
  tokens: {}
};

Object.entries(ORACLE_SYMBOLS).forEach(([sym, cfg]) => {
  clientOracleState.tokens[sym] = {
    usd: cfg.fallbackUsd,
    inr: cfg.fallbackUsd * clientOracleState.usdtInr,
  };
});

const basketsData = [
  {
    id: "top-5-index",
    assets: [
      { symbol: "BTC", weight: 55, price_inr: 7739249 },
      { symbol: "ETH", weight: 20, price_inr: 228879 },
      { symbol: "SOL", weight: 10, price_inr: 9800 },
      { symbol: "BNB", weight: 8, price_inr: 68535 },
      { symbol: "XRP", weight: 7, price_inr: 123 }
    ]
  }
];

function recalculateAllBasketNAVs() {
  basketsData.forEach(basket => {
    let basketSum = 0;
    basket.assets.forEach(a => {
      const livePrice = clientOracleState.tokens[a.symbol]?.inr || a.price_inr;
      basketSum += livePrice * (a.weight / 100);
    });

    if (!basket.initialBaseSum || basket.initialBaseSum === 0) {
      basket.initialBaseSum = basketSum;
    }
    const normalizedNav = basket.initialBaseSum > 0 
      ? Number(((basketSum / basket.initialBaseSum) * 100.00).toFixed(2))
      : 100.00;
    basket.nav = normalizedNav;
    console.log('basketSum:', basketSum, 'initialBaseSum:', basket.initialBaseSum, 'nav:', basket.nav);
  });
}

// Initial recalculation before ticks
recalculateAllBasketNAVs();
