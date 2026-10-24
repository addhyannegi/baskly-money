/**
 * Baskly.money — Real-Time Pricing Oracle & NAV Engine
 * Migrated directly from oracle/pricing_oracle.js and app.js (lines 1660-1970)
 * 
 * Sources:
 * 1. Binance Public WebSocket (wss://data-stream.binance.vision/stream?streams=... - Combined miniTickers)
 * 2. CoinDCX Public Ticker (USDT/INR Indian Exchange conversion, 15s poller)
 * 3. CoinGecko REST (Fallback for all tokens, 60s poller)
 * 
 * NAV Engine:
 * Formula: NAV(t) = (basketSum(t) / initialBaseSum) * 100.00
 * Anchored to Base ₹100.00 NAV at inception.
 */

import type { Basket } from "../types/baskly";

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

// Map Binance symbol pairs (e.g. "BTCUSDT") to internal asset symbols ("BTC")
export const BINANCE_PAIR_TO_SYMBOL: Record<string, string> = {};
Object.entries(ORACLE_SYMBOLS).forEach(([sym, cfg]) => {
  if (cfg.binance) {
    BINANCE_PAIR_TO_SYMBOL[cfg.binance.toUpperCase()] = sym;
  }
});

// Map CoinGecko IDs (e.g. "bitcoin") to internal asset symbols ("BTC")
export const COINGECKO_ID_TO_SYMBOL: Record<string, string> = {};
Object.entries(ORACLE_SYMBOLS).forEach(([sym, cfg]) => {
  if (cfg.coingecko) {
    COINGECKO_ID_TO_SYMBOL[cfg.coingecko.toLowerCase()] = sym;
  }
});

// Primary and fallback Binance WebSocket endpoints
export const BINANCE_WS_HOSTS = [
  "stream.binance.com:9443",
  "data-stream.binance.vision",
  "stream.binance.com"
];

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

export interface ParsedBinanceTick {
  symbolPair: string;
  priceUsd: number;
}

export interface NavResult {
  nav: number;
  change24h: number;
  status?: string;
  isFrozen?: boolean;
}

/**
 * Builds the official Binance combined-stream WebSocket URL.
 * Uses standard port 443 (default wss) to avoid port 9443 firewall/ISP blocks.
 */
export function constructBinanceStreamUrl(
  symbols: Record<string, OracleSymbolConfig> = ORACLE_SYMBOLS,
  host: string = BINANCE_WS_HOSTS[0]
): string {
  const streamNames = Object.values(symbols)
    .filter((cfg) => Boolean(cfg.binance))
    .map((cfg) => `${cfg.binance.toLowerCase()}@miniTicker`)
    .join("/");
  return `wss://${host}/stream?streams=${streamNames}`;
}

/**
 * Parses raw Binance WebSocket message supporting combined-stream wrapper,
 * direct miniTicker payloads, and miniTicker payload arrays.
 */
export function parseBinanceTickMessage(rawMessage: any): ParsedBinanceTick[] {
  if (!rawMessage) return [];

  let parsed: any = rawMessage;
  if (typeof rawMessage === "string") {
    try {
      parsed = JSON.parse(rawMessage);
    } catch {
      return [];
    }
  }

  // Combined stream messages are wrapped in { stream: string, data: any }
  const payload = (parsed && typeof parsed === "object" && "data" in parsed) ? parsed.data : parsed;
  if (!payload) return [];

  const ticks: any[] = Array.isArray(payload) ? payload : [payload];
  const results: ParsedBinanceTick[] = [];

  for (const item of ticks) {
    if (item && typeof item === "object" && typeof item.s === "string" && item.c !== undefined && item.c !== null) {
      const price = parseFloat(item.c);
      if (!isNaN(price) && price > 0 && isFinite(price)) {
        results.push({
          symbolPair: item.s.toUpperCase(),
          priceUsd: price
        });
      }
    }
  }

  return results;
}

export type OracleListener = (state: ClientOracleState, updatedSymbol?: string) => void;

export class PricingOracleEngine {
  private state: ClientOracleState;
  private listeners: Set<OracleListener> = new Set();
  private ws: any = null;
  private pollIntervals: any[] = [];
  private isStarted = false;
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;
  private wsHostIndex = 0;
  private startTime = Date.now();
  private cachedNavs: Record<string, NavResult> = {};

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
        // Crucial fix: initialize as "unavailable" with lastTick = 0 so reference
        // prices are never mistaken for fresh live market data
        status: "unavailable",
        lastTick: 0
      };
    });

    this.state = {
      usdtInr: defaultUsdtInr,
      usdtSource: "Reference Benchmark",
      usdtLastUpdate: 0,
      usdtStatus: "unavailable",
      tokens: initialTokens,
      tickCount: 0,
      wsConnected: false,
      isDegraded: true,
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
    this.startTime = Date.now();

    // 1. Initial Immediate Polls
    this.pollCoinDcxUsdtInr();
    this.connectBinanceWebSocket();
    this.pollCoinGeckoFallback();

    // 2. Scheduled Pollers matching specification
    this.pollIntervals.push(
      setInterval(() => this.pollCoinDcxUsdtInr(), 15000),   // USDT/INR every 15s
      setInterval(() => this.pollCoinGeckoFallback(), 60000), // CoinGecko fallback every 60s
      setInterval(() => this.checkStaleFeeds(), 10000)        // Staleness health check every 10s
    );
  }

  public stop() {
    this.isStarted = false;
    this.cleanupReconnectTimer();
    this.cleanupWebSocket();
    this.pollIntervals.forEach(clearInterval);
    this.pollIntervals = [];
    this.state.wsConnected = false;
    this.notify();
  }

  private cleanupReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private cleanupWebSocket() {
    if (this.ws) {
      const currentWs = this.ws;
      this.ws = null;
      try {
        currentWs.onopen = null;
        currentWs.onmessage = null;
        currentWs.onerror = null;
        currentWs.onclose = null;
        currentWs.close();
      } catch {}
    }
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
          if (json.success && typeof json.rate === "number" && json.rate > 0) {
            rate = json.rate;
          }
        }
      } catch {}

      // Fallback directly to CoinDCX
      if (!rate) {
        const directRes = await fetch("https://api.coindcx.com/exchange/ticker", { cache: "no-store" });
        if (directRes.ok) {
          const tickers = await directRes.json();
          if (Array.isArray(tickers)) {
            const usdtPair = tickers.find((t: any) => t && t.market === "USDTINR");
            if (usdtPair && usdtPair.last_price) {
              const parsedPrice = parseFloat(usdtPair.last_price);
              if (!isNaN(parsedPrice) && parsedPrice > 0) {
                rate = parsedPrice;
              }
            }
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
        }
        this.notify();
      } else {
        if (this.state.usdtLastUpdate > 0 && Date.now() - this.state.usdtLastUpdate > 120000) {
          this.state.usdtStatus = "stale";
          this.notify();
        }
      }
    } catch {
      if (this.state.usdtLastUpdate > 0 && Date.now() - this.state.usdtLastUpdate > 120000) {
        this.state.usdtStatus = "stale";
        this.notify();
      }
    }
  }

  // 2. Connect to Binance Public WebSocket (Streaming miniTickers)
  public connectBinanceWebSocket() {
    if (typeof window === "undefined" && typeof globalThis.WebSocket === "undefined") return;

    // Prevent duplicate simultaneous connections
    if (this.ws) {
      const state = this.ws.readyState;
      if (state === 0 /* CONNECTING */ || state === 1 /* OPEN */) {
        return;
      }
      this.cleanupWebSocket();
    }

    this.cleanupReconnectTimer();

    try {
      const host = BINANCE_WS_HOSTS[this.wsHostIndex % BINANCE_WS_HOSTS.length];
      const wsUrl = constructBinanceStreamUrl(ORACLE_SYMBOLS, host);
      const WebSocketClass = typeof window !== "undefined" ? window.WebSocket : (globalThis as any).WebSocket;
      if (!WebSocketClass) return;

      const ws = new WebSocketClass(wsUrl);
      this.ws = ws;

      ws.onopen = () => {
        if (this.ws !== ws) return;
        this.reconnectAttempts = 0;
        this.state.wsConnected = true;
        this.notify();
      };

      ws.onmessage = (event: any) => {
        if (this.ws !== ws || !event || !event.data) return;
        try {
          const ticks = parseBinanceTickMessage(event.data);
          for (const tick of ticks) {
            const sym = BINANCE_PAIR_TO_SYMBOL[tick.symbolPair];
            if (sym && tick.priceUsd > 0) {
              this.handleIncomingTokenTick(sym, tick.priceUsd, "Binance WS");
            }
          }
        } catch (err) {
          console.warn("[PricingOracle] Failed to parse WebSocket message:", err);
        }
      };

      ws.onerror = (err: any) => {
        console.warn(`[PricingOracle] Binance WebSocket error on host ${host}:`, err?.message || err || "Unknown WS error");
        // On connection failure, rotate to backup host for next attempt
        this.wsHostIndex++;
      };

      ws.onclose = () => {
        if (this.ws === ws) {
          this.ws = null;
          this.state.wsConnected = false;
          this.notify();
        }
        if (this.isStarted) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.warn("[PricingOracle] WebSocket setup error:", err);
      this.wsHostIndex++;
      if (this.isStarted) {
        this.scheduleReconnect();
      }
    }
  }

  private scheduleReconnect() {
    if (!this.isStarted) return;
    this.cleanupReconnectTimer();

    // Exponential backoff with jitter: 1s to 30s
    const baseDelay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30000);
    const jitter = Math.random() * 500;
    const delay = Math.round(baseDelay + jitter);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.isStarted) {
        this.connectBinanceWebSocket();
      }
    }, delay);
  }

  // 3. Fallback CoinGecko Poller for ALL supported basket tokens
  public async pollCoinGeckoFallback() {
    try {
      let data: any = null;
      // Try local Next.js proxy route first
      try {
        const localRes = await fetch("/api/oracle/coingecko", { cache: "no-store" });
        if (localRes.ok) {
          const json = await localRes.json();
          if (json.success && json.data) data = json.data;
        }
      } catch {}

      // Fallback direct query covering all configured tokens
      if (!data) {
        const ids = Object.values(ORACLE_SYMBOLS)
          .map((cfg) => cfg.coingecko)
          .filter(Boolean)
          .join(",");
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) data = await res.json();
      }

      if (data && typeof data === "object") {
        for (const [id, priceObj] of Object.entries(data)) {
          const sym = COINGECKO_ID_TO_SYMBOL[id.toLowerCase()];
          if (sym && priceObj && typeof (priceObj as any).usd === "number") {
            const priceUsd = (priceObj as any).usd;
            if (priceUsd > 0) {
              this.handleIncomingTokenTick(sym, priceUsd, "CoinGecko");
            }
          }
        }
      }
    } catch (e) {
      console.warn("[PricingOracle] CoinGecko poll error:", e);
    }
  }

  // 4. Handle Incoming Verified Tick (Validates price and rejects anomalous outliers)
  public handleIncomingTokenTick(sym: string, priceUsd: number, source: string) {
    const token = this.state.tokens[sym];
    if (!token || priceUsd <= 0 || isNaN(priceUsd) || !isFinite(priceUsd)) return;

    // Outlier rejection: if we already have a live verified price (>0 and lastTick > 0),
    // reject absurd sudden single-tick spikes (> 5x or < 0.2x)
    if (token.lastTick > 0 && token.usd > 0) {
      const ratio = priceUsd / token.usd;
      if (ratio > 5.0 || ratio < 0.2) {
        console.warn(`[PricingOracle] Outlier price rejected for ${sym}: ${priceUsd} USD (prev: ${token.usd})`);
        return;
      }
    }

    const prevInr = token.inr;
    const newInr = priceUsd * this.state.usdtInr;

    token.usd = priceUsd;
    token.prevInr = prevInr;
    token.inr = newInr;
    token.source = source;
    token.status = "healthy";
    token.lastTick = Date.now();
    this.state.tickCount++;

    // Recover from initial degraded state once multiple live ticks arrive
    if (this.state.tickCount >= 3) {
      this.state.isDegraded = false;
      this.state.isNavFrozen = false;
    }

    this.notify(sym);
  }

  // 5. Staleness Checker and Circuit Breaker
  public checkStaleFeeds() {
    const now = Date.now();
    let staleOrUnavailableCount = 0;

    Object.values(this.state.tokens).forEach((t) => {
      if (t.lastTick === 0) {
        t.status = "unavailable";
        staleOrUnavailableCount++;
        return;
      }
      const ageMs = now - t.lastTick;
      if (ageMs > 90000) {
        t.status = "stale";
        staleOrUnavailableCount++;
      } else if (ageMs > 30000) {
        t.status = "delayed";
      } else {
        t.status = "healthy";
      }
    });

    const usdtAge = this.state.usdtLastUpdate === 0 ? Infinity : now - this.state.usdtLastUpdate;
    if (this.state.usdtLastUpdate === 0) {
      this.state.usdtStatus = "unavailable";
    } else if (usdtAge > 120000) {
      this.state.usdtStatus = "stale";
    } else if (usdtAge > 30000) {
      this.state.usdtStatus = "delayed";
    } else {
      this.state.usdtStatus = "healthy";
    }

    // Circuit breaker: If > 4 tokens are stale/unavailable or USDT rate is older than 120s
    if (staleOrUnavailableCount > 4 || usdtAge > 120000) {
      this.state.isDegraded = true;
      this.state.isNavFrozen = true;
    } else {
      this.state.isDegraded = false;
      this.state.isNavFrozen = false;
    }

    this.notify();
  }

  // 6. Recalculate Live Basket NAV with Circuit Breaker and Weight Normalization
  public calculateBasketNav(basket: Basket): NavResult {
    if (!basket || !basket.assets || basket.assets.length === 0) {
      return { nav: 100.00, change24h: 0.0, status: "unavailable", isFrozen: false };
    }

    // Circuit breaker: Freeze NAV at last valid calculated value if circuit breaker is triggered
    if (this.state.isNavFrozen && this.cachedNavs[basket.id]) {
      const cached = this.cachedNavs[basket.id];
      return { ...cached, status: "frozen", isFrozen: true };
    }

    let basketSum = 0;
    let hasStale = false;
    let hasUnavailable = false;

    // Detect if weights are percentages (sum ~100) or fractions (sum ~1.0)
    const totalWeight = basket.assets.reduce((acc, a) => acc + (a.weight || 0), 0);
    const weightMultiplier = totalWeight > 1.5 ? 0.01 : 1.0;

    for (const a of basket.assets) {
      const token = this.state.tokens[a.symbol];
      if (token) {
        if (token.status === "stale") hasStale = true;
        if (token.status === "unavailable") hasUnavailable = true;
      }

      const livePrice = token?.inr ?? (a.price_inr && a.price_inr > 0 ? a.price_inr : (a.basePrice || 0));
      if (livePrice <= 0) {
        if (this.cachedNavs[basket.id]) {
          return { ...this.cachedNavs[basket.id], status: "degraded", isFrozen: false };
        }
        return { nav: 100.00, change24h: 0.0, status: "unavailable", isFrozen: false };
      }

      basketSum += livePrice * (a.weight * weightMultiplier);
    }

    // Use immutable canonical inception base sum in lockstep with current USDT/INR rate
    const baseSumUsd = CANONICAL_BASE_USD_SUMS[basket.id];
    const baseSum = baseSumUsd
      ? (baseSumUsd * this.state.usdtInr)
      : (CANONICAL_BASE_SUMS[basket.id] || basket.initialBaseSum || (basketSum > 0 ? basketSum : 1.0));

    const nav = baseSum > 0 ? Number(((basketSum / baseSum) * 100.00).toFixed(2)) : 100.00;
    const change24h = Number((((nav - 100.00) / 100.00) * 100).toFixed(2));

    const status = this.state.isNavFrozen
      ? "frozen"
      : (hasStale || hasUnavailable || this.state.isDegraded ? "degraded" : "healthy");

    const result: NavResult = { nav, change24h, status, isFrozen: this.state.isNavFrozen };
    this.cachedNavs[basket.id] = result;

    return result;
  }
}

// Global Singleton Instance
export const pricingOracle = new PricingOracleEngine();
