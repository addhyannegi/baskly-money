// Node 22 has built-in WebSocket

const ORACLE_SYMBOLS = {
  BTC:    { name: "Bitcoin",       binance: "BTCUSDT",    fallbackUsd: 81604 },
  ETH:    { name: "Ethereum",      binance: "ETHUSDT",    fallbackUsd: 2411 },
  SOL:    { name: "Solana",        binance: "SOLUSDT",    fallbackUsd: 112 },
  BNB:    { name: "BNB",           binance: "BNBUSDT",    fallbackUsd: 685 },
  XRP:    { name: "XRP",           binance: "XRPUSDT",    fallbackUsd: 1.25 },
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
    const baseFolioUnits = 4511.8;
    const liveValuation = Math.round(baseFolioUnits * basket.nav);
    console.log(`[TICK] Top-5 NAV: ₹${basket.nav.toFixed(2)} | Portfolio Value: ₹${liveValuation.toLocaleString('en-IN')}`);
  });
}

// Initial calculation (before any ticks)
recalculateAllBasketNAVs();

const streamNames = "btcusdt@miniTicker/ethusdt@miniTicker/solusdt@miniTicker/bnbusdt@miniTicker/xrpusdt@miniTicker";
const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamNames}`);

let tickCount = 0;
ws.onmessage = (event) => {
  const data = event.data;
  const tick = JSON.parse(data.toString());
  if (tick && tick.s && tick.c) {
    const entry = Object.entries(ORACLE_SYMBOLS).find(([_, cfg]) => cfg.binance === tick.s);
    if (entry) {
      const [sym] = entry;
      const priceUsd = parseFloat(tick.c);
      const token = clientOracleState.tokens[sym];
      token.usd = priceUsd;
      token.inr = priceUsd * clientOracleState.usdtInr;
      recalculateAllBasketNAVs();
      tickCount++;
      if (tickCount >= 10) {
        ws.close();
        process.exit(0);
      }
    }
  }
};
