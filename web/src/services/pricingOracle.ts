/**
 * Baskly.money — Real-Time Pricing Oracle & NAV Engine
 * Migrated directly from oracle/pricing_oracle.js and app.js (lines 1660-1970)
 * 
 * Sources:
 * 1. Binance Public WebSocket (wss://stream.binance.com:9443 - Real-time miniTickers)
 * 2. CoinDCX Public Ticker (USDT/INR Indian Exchange conversion, 15s poller)
 * 3. CoinGecko REST (Fallback for PAXG physical gold, PENDLE, BONK, 60s poller)
 * 
 * NAV Engine:
 * Formula: NAV(t) = (basketSum(t) / initialBaseSum) * 100.00
 * Anchored to Base ₹100.00 NAV at inception.
 */

import { Basket } from "@/types/baskly";

export interface OracleSymbolConfig {
  name: string;
  binance: string;
  coingecko: string;
  fallbackUsd: number;
}

export const ORACLE_SYMBOLS: Record<string, OracleSymbolConfig> = {
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

// Canonical Inception Base Sums from original app.js (lines 15-138)
export const CANONICAL_BASE_USD_SUMS: Record<string, number> = {
  "top-5-index": 45430.4875,
  "crypto-gold": 31005.05,
  "bitcoin": 81604.0,
  "ethereum": 2411.0,
  "defi": 43.795,
  "altcoin-meme": 0.40040926
};

export const CANONICAL_BASE_SUMS: Record<string, number> = {
  "top-5-index": 4550317.63,
  "crypto-gold": 3105465.81,
  "bitcoin": 8173456.64,
  "ethereum": 241485.76,
  "defi": 4386.51,
  "altcoin-meme": 40.10499
};

export type FeedStatus = "healthy" | "delayed" | "stale" | "unavailable";

export interface LiveTokenState {
  symbol: string;
  name: string;
  usd: number;
  inr: number;
  prevInr: number;
  change24h: number;
  source: string;
  status: FeedStatus;
  lastTick: number;
}

export interface ClientOracleState {
  usdtInr: number;
  usdtSource: string;
  usdtLastUpdate: number;
  usdtStatus: FeedStatus;
  tokens: Record<string, LiveTokenState>;
  tickCount: number;
  wsConnected: boolean;
  isDegraded: boolean;
  isNavFrozen: boolean;
}

type OracleListener = (state: ClientOracleState, updatedSymbol?: string) => void;

class PricingOracleEngine {
  private state: ClientOracleState;
  private listeners: Set<OracleListener> = new Set();
  private ws: WebSocket | null = null;
  private pollIntervals: any[] = [];
  private isStarted = false;

  constructor() {
    const defaultUsdtInr = 100.16;
    const initialTokens: Record<string, LiveTokenState> = {};

    Object.entries(ORACLE_SYMBOLS).forEach(([sym, cfg]) => {
      const inrVal = cfg.fallbackUsd * defaultUsdtInr;
      initialTokens[sym] = {
        symbol: sym,
        name: cfg.name,
        usd: cfg.fallbackUsd,
        inr: inrVal,
        prevInr: inrVal,
        change24h: 0.0,
        source: "Reference Anchor",
        status: "healthy",
        lastTick: Date.now()
      };
    });

    this.state = {
      usdtInr: defaultUsdtInr,
      usdtSource: "CoinDCX Live",
      usdtLastUpdate: Date.now(),
      usdtStatus: "healthy",
      tokens: initialTokens,
      tickCount: 0,
      wsConnected: false,
      isDegraded: false,
      isNavFrozen: false
    };
  }

  public getState(): ClientOracleState {
    return this.state;
  }

  public subscribe(listener: OracleListener): () => void {
    this.listeners.add(listener);
    try {
      listener(this.state);
    } catch (e) {
      console.warn("[PricingOracle] Listener error on initial subscribe:", e);
    }
    return () => this.listeners.delete(listener);
  }

  private notify(updatedSymbol?: string) {
    this.listeners.forEach((fn) => {
      try {
        fn(this.state, updatedSymbol);
      } catch (e) {
        console.warn("[PricingOracle] Listener error:", e);
      }
    });
  }

  public start() {
    if (this.isStarted || typeof window === "undefined") return;
    this.isStarted = true;

    // 1. Initial Immediate Polls
    this.pollCoinDcxUsdtInr();
    this.connectBinanceWebSocket();
    this.pollCoinGeckoFallback();

    // 2. Scheduled Pollers matching original specification
    this.pollIntervals.push(
      setInterval(() => this.pollCoinDcxUsdtInr(), 15000),   // USDT/INR every 15s
      setInterval(() => this.pollCoinGeckoFallback(), 60000), // CoinGecko fallback every 60s
      setInterval(() => this.checkStaleFeeds(), 10000)        // Staleness health check every 10s
    );
  }

  public stop() {
    this.isStarted = false;
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this.pollIntervals.forEach(clearInterval);
    this.pollIntervals = [];
  }

  // 1. Poll CoinDCX for real USDT/INR rate (proxied via /api/oracle/coindcx for zero CORS errors)
  public async pollCoinDcxUsdtInr() {
    try {
      let rate: number | null = null;
      // Try local Next.js route first to eliminate CORS issues
      try {
        const localRes = await fetch("/api/oracle/coindcx", { cache: "no-store" });
        if (localRes.ok) {
          const json = await localRes.json();
          if (json.success && json.rate > 0) rate = json.rate;
        }
      } catch {}

      // Fallback directly to CoinDCX
      if (!rate) {
        const directRes = await fetch("https://api.coindcx.com/exchange/ticker", { cache: "no-store" });
        if (directRes.ok) {
          const tickers: any[] = await directRes.json();
          const usdtPair = Array.isArray(tickers) ? tickers.find((t: any) => t.market === "USDTINR") : null;
          if (usdtPair && parseFloat(usdtPair.last_price) > 0) {
            rate = parseFloat(usdtPair.last_price);
          }
        }
      }

      if (rate && rate > 0) {
        const oldRate = this.state.usdtInr;
        this.state.usdtInr = rate;
        this.state.usdtLastUpdate = Date.now();
        this.state.usdtSource = "CoinDCX Live";
        this.state.usdtStatus = "healthy";

        // Recompute all INR prices if USDT changed or on initial poll
        if (Math.abs(oldRate - rate) > 0.01 || this.state.tickCount === 0) {
          Object.keys(this.state.tokens).forEach((sym) => {
            const t = this.state.tokens[sym];
            t.inr = t.usd * this.state.usdtInr;
          });
          this.notify();
        }
      }
    } catch (err) {
      // Retain last known good rate
      if (Date.now() - this.state.usdtLastUpdate > 120000) {
        this.state.usdtStatus = "stale";
      }
    }
  }

  // 2. Connect to Binance Public WebSocket (Streaming miniTickers)
  public connectBinanceWebSocket() {
    if (typeof window === "undefined" || typeof WebSocket === "undefined") return;

    try {
      const streamNames = "btcusdt@miniTicker/ethusdt@miniTicker/solusdt@miniTicker/bnbusdt@miniTicker/xrpusdt@miniTicker/dogeusdt@miniTicker/shibusdt@miniTicker/pepeusdt@miniTicker/uniusdt@miniTicker/aaveusdt@miniTicker/linkusdt@miniTicker/wifusdt@miniTicker";
      const wsUrl = `wss://stream.binance.com:9443/ws/${streamNames}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.state.wsConnected = true;
        this.notify();
      };

      this.ws.onmessage = (event) => {
        try {
          const tick = JSON.parse(event.data);
          if (tick && tick.s && tick.c) {
            const symbolPair = tick.s; // e.g. "BTCUSDT"
            const priceUsd = parseFloat(tick.c);

            const entry = Object.entries(ORACLE_SYMBOLS).find(([_, cfg]) => cfg.binance === symbolPair);
            if (entry && priceUsd > 0) {
              const [sym] = entry;
              this.handleIncomingTokenTick(sym, priceUsd, "Binance WS");
            }
          }
        } catch {}
      };

      this.ws.onerror = () => {
        if (this.ws) {
          try { this.ws.close(); } catch {}
        }
      };

      this.ws.onclose = () => {
        this.state.wsConnected = false;
        this.notify();
        if (this.isStarted) {
          setTimeout(() => this.connectBinanceWebSocket(), 5000);
        }
      };
    } catch (err) {
      console.warn("[PricingOracle] WebSocket setup error:", err);
    }
  }

  // 3. Fallback CoinGecko Poller for PAXG (Gold), PENDLE, BONK
  public async pollCoinGeckoFallback() {
    try {
      let data: any = null;
      // Try proxy route first
      try {
        const localRes = await fetch("/api/oracle/coingecko", { cache: "no-store" });
        if (localRes.ok) {
          const json = await localRes.json();
          if (json.success && json.data) data = json.data;
        }
      } catch {}

      // Fallback direct
      if (!data) {
        const url = "https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,pendle,bonk&vs_currencies=usd";
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) data = await res.json();
      }

      if (data) {
        if (data["pax-gold"]?.usd) {
          this.handleIncomingTokenTick("PAXG", data["pax-gold"].usd, "CoinGecko");
        }
        if (data["pendle"]?.usd) {
          this.handleIncomingTokenTick("PENDLE", data["pendle"].usd, "CoinGecko");
        }
        if (data["bonk"]?.usd) {
          this.handleIncomingTokenTick("BONK", data["bonk"].usd, "CoinGecko");
        }
      }
    } catch (e) {}
  }

  // 4. Handle Incoming Verified Tick (Directly matching app.js lines 1811-1843)
  public handleIncomingTokenTick(sym: string, priceUsd: number, source: string) {
    const token = this.state.tokens[sym];
    if (!token || priceUsd <= 0 || isNaN(priceUsd)) return;

    const prevInr = token.inr;
    const newInr = priceUsd * this.state.usdtInr;

    token.usd = priceUsd;
    token.prevInr = prevInr;
    token.inr = newInr;
    token.source = source;
    token.status = "healthy";
    token.lastTick = Date.now();
    this.state.tickCount++;

    this.notify(sym);
  }

  // 5. Staleness Checker (Directly matching app.js lines 1946-1969)
  public checkStaleFeeds() {
    const now = Date.now();
    let staleCount = 0;

    Object.values(this.state.tokens).forEach((t) => {
      const ageMs = now - t.lastTick;
      if (ageMs > 90000) {
        t.status = "stale";
        staleCount++;
      } else if (ageMs > 30000) {
        t.status = "delayed";
      } else {
        t.status = "healthy";
      }
    });

    const usdtAge = now - this.state.usdtLastUpdate;
    if (staleCount > 4 || usdtAge > 120000) {
      this.state.isDegraded = true;
      this.state.isNavFrozen = true;
    } else {
      this.state.isDegraded = false;
      this.state.isNavFrozen = false;
    }

    this.notify();
  }

  // 6. Recalculate Live Basket NAV (Exact original implementation from app.js lines 1867-1886)
  public calculateBasketNav(basket: Basket): { nav: number; change24h: number } {
    let basketSum = 0;

    basket.assets.forEach((a) => {
      const livePrice = this.state.tokens[a.symbol]?.inr || a.price_inr || a.basePrice || 0;
      basketSum += livePrice * (a.weight / 100);
    });

    // Use immutable canonical inception base sum in lockstep with current USDT/INR rate
    const baseSumUsd = CANONICAL_BASE_USD_SUMS[basket.id];
    const baseSum = baseSumUsd
      ? (baseSumUsd * this.state.usdtInr)
      : (CANONICAL_BASE_SUMS[basket.id] || basket.initialBaseSum || (basketSum > 0 ? basketSum : 1.0));
    const nav = baseSum > 0 ? Number(((basketSum / baseSum) * 100.00).toFixed(2)) : 100.00;
    const change24h = Number((((nav - 100.00) / 100.00) * 100).toFixed(2));

    return { nav, change24h };
  }
}

// Global Singleton Instance
export const pricingOracle = new PricingOracleEngine();
