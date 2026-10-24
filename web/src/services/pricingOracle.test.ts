import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  PricingOracleEngine,
  ORACLE_SYMBOLS,
  BINANCE_PAIR_TO_SYMBOL,
  CANONICAL_BASE_USD_SUMS,
  constructBinanceStreamUrl,
  parseBinanceTickMessage
} from "./pricingOracle.ts";

describe("Pricing Oracle Engine & Live NAV Test Suite", () => {

  describe("1. Binance WebSocket URL Construction", () => {
    test("Constructs valid combined-stream WebSocket URL", () => {
      const url = constructBinanceStreamUrl();
      assert.ok(url.startsWith("wss://stream.binance.com:9443/stream?streams="), "Must use official combined stream endpoint");
      
      // Verify every symbol in ORACLE_SYMBOLS is included in the subscription
      for (const [sym, cfg] of Object.entries(ORACLE_SYMBOLS)) {
        if (cfg.binance) {
          const expectedStream = `${cfg.binance.toLowerCase()}@miniTicker`;
          assert.ok(url.includes(expectedStream), `Stream must include ${expectedStream} for token ${sym}`);
        }
      }
    });

    test("Uses slash separator between stream names", () => {
      const url = constructBinanceStreamUrl({
        BTC: { name: "Bitcoin", binance: "BTCUSDT", coingecko: "bitcoin", fallbackUsd: 81604 },
        ETH: { name: "Ethereum", binance: "ETHUSDT", coingecko: "ethereum", fallbackUsd: 2411 }
      });
      assert.equal(url, "wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker");
    });
  });

  describe("2. Binance Message Parser", () => {
    test("Parses combined-stream wrapped payload", () => {
      const raw = JSON.stringify({
        stream: "btcusdt@miniTicker",
        data: {
          e: "24hrMiniTicker",
          E: 1729800000000,
          s: "BTCUSDT",
          c: "81604.50"
        }
      });
      const parsed = parseBinanceTickMessage(raw);
      assert.equal(parsed.length, 1);
      assert.equal(parsed[0].symbolPair, "BTCUSDT");
      assert.equal(parsed[0].priceUsd, 81604.50);
    });

    test("Parses direct raw miniTicker payload", () => {
      const raw = JSON.stringify({
        s: "ETHUSDT",
        c: "2411.25"
      });
      const parsed = parseBinanceTickMessage(raw);
      assert.equal(parsed.length, 1);
      assert.equal(parsed[0].symbolPair, "ETHUSDT");
      assert.equal(parsed[0].priceUsd, 2411.25);
    });

    test("Parses array of miniTicker payloads", () => {
      const raw = JSON.stringify([
        { s: "SOLUSDT", c: "112.50" },
        { s: "BNBUSDT", c: "685.00" }
      ]);
      const parsed = parseBinanceTickMessage(raw);
      assert.equal(parsed.length, 2);
      assert.equal(parsed[0].symbolPair, "SOLUSDT");
      assert.equal(parsed[0].priceUsd, 112.50);
      assert.equal(parsed[1].symbolPair, "BNBUSDT");
      assert.equal(parsed[1].priceUsd, 685.00);
    });

    test("Safely ignores non-tick responses and subscription ACKs", () => {
      const ack = JSON.stringify({ result: null, id: 1 });
      assert.deepEqual(parseBinanceTickMessage(ack), []);

      const ping = JSON.stringify({ ping: 12345678 });
      assert.deepEqual(parseBinanceTickMessage(ping), []);

      assert.deepEqual(parseBinanceTickMessage(""), []);
      assert.deepEqual(parseBinanceTickMessage(null), []);
      assert.deepEqual(parseBinanceTickMessage("{ invalid json ]"), []);
    });

    test("Filters out zero, negative, or NaN prices", () => {
      const invalid = JSON.stringify([
        { s: "BTCUSDT", c: "0" },
        { s: "ETHUSDT", c: "-100" },
        { s: "SOLUSDT", c: "abc" },
        { s: "XRPUSDT", c: "1.25" }
      ]);
      const parsed = parseBinanceTickMessage(invalid);
      assert.equal(parsed.length, 1);
      assert.equal(parsed[0].symbolPair, "XRPUSDT");
      assert.equal(parsed[0].priceUsd, 1.25);
    });
  });

  describe("3. Symbol and Token Pair Mapping", () => {
    test("Maps all configured Binance trading pairs to internal tokens", () => {
      for (const [sym, cfg] of Object.entries(ORACLE_SYMBOLS)) {
        if (cfg.binance) {
          assert.equal(BINANCE_PAIR_TO_SYMBOL[cfg.binance.toUpperCase()], sym);
        }
      }
    });
  });

  describe("4. Initial Feed-Health and Reference Reporting", () => {
    test("Initializes reference prices as 'unavailable' with lastTick 0", () => {
      const engine = new PricingOracleEngine();
      const state = engine.getState();

      assert.equal(state.isDegraded, true, "Engine must start degraded until live ticks arrive");
      assert.equal(state.tickCount, 0);
      assert.equal(state.wsConnected, false);
      assert.equal(state.usdtStatus, "unavailable");
      assert.equal(state.usdtLastUpdate, 0);

      for (const [sym, token] of Object.entries(state.tokens)) {
        assert.equal(token.symbol, sym);
        assert.equal(token.status, "unavailable", `Token ${sym} must not be marked healthy initially`);
        assert.equal(token.lastTick, 0, `Token ${sym} lastTick must be 0`);
        assert.equal(token.source, "Reference Anchor");
        assert.equal(token.usd, ORACLE_SYMBOLS[sym].fallbackUsd);
      }
    });

    test("Updates token to 'healthy' and records source on live tick", () => {
      const engine = new PricingOracleEngine();
      const before = Date.now();

      engine.handleIncomingTokenTick("BTC", 82000, "Binance WS");
      const token = engine.getState().tokens["BTC"];

      assert.equal(token.status, "healthy");
      assert.equal(token.source, "Binance WS");
      assert.equal(token.usd, 82000);
      assert.ok(token.lastTick >= before);
      assert.equal(engine.getState().tickCount, 1);
    });
  });

  describe("5. Outlier Rejection & Price Validation", () => {
    test("Rejects extreme price spikes or crash anomalies once baseline is established", () => {
      const engine = new PricingOracleEngine();
      // Establish legitimate live price
      engine.handleIncomingTokenTick("BTC", 80000, "Binance WS");
      assert.equal(engine.getState().tokens["BTC"].usd, 80000);

      // Attempt 10x spike (800,000)
      engine.handleIncomingTokenTick("BTC", 800000, "Binance WS");
      assert.equal(engine.getState().tokens["BTC"].usd, 80000, "Must reject 10x price spike");

      // Attempt 0.05x flash crash (4,000)
      engine.handleIncomingTokenTick("BTC", 4000, "Binance WS");
      assert.equal(engine.getState().tokens["BTC"].usd, 80000, "Must reject 0.05x flash crash");

      // Valid normal price move (84,000, +5%)
      engine.handleIncomingTokenTick("BTC", 84000, "Binance WS");
      assert.equal(engine.getState().tokens["BTC"].usd, 84000, "Must accept reasonable price change");
    });
  });

  describe("6. Stale-Price Detection and Circuit Breaker", () => {
    test("Transitions status through healthy -> delayed -> stale", () => {
      const engine = new PricingOracleEngine();
      engine.handleIncomingTokenTick("BTC", 80000, "Binance WS");
      
      const btc = engine.getState().tokens["BTC"];
      const now = Date.now();

      // Recent (< 30s) -> healthy
      btc.lastTick = now - 10000;
      engine.checkStaleFeeds();
      assert.equal(btc.status, "healthy");

      // Delayed (> 30s, <= 90s) -> delayed
      btc.lastTick = now - 45000;
      engine.checkStaleFeeds();
      assert.equal(btc.status, "delayed");

      // Stale (> 90s) -> stale
      btc.lastTick = now - 100000;
      engine.checkStaleFeeds();
      assert.equal(btc.status, "stale");
    });

    test("Freezes NAV circuit breaker when > 4 feeds are stale or USDT rate is stale", () => {
      const engine = new PricingOracleEngine();
      const state = engine.getState();
      const now = Date.now();

      // Mark 5 tokens as stale
      const symbols = ["BTC", "ETH", "SOL", "BNB", "XRP"];
      symbols.forEach(s => {
        state.tokens[s].lastTick = now - 120000;
      });

      engine.checkStaleFeeds();
      assert.equal(state.isDegraded, true);
      assert.equal(state.isNavFrozen, true);
    });
  });

  describe("7. WebSocket Connection Lifecycle", () => {
    let originalWebSocket: any;

    beforeEach(() => {
      originalWebSocket = (globalThis as any).WebSocket;
    });

    afterEach(() => {
      (globalThis as any).WebSocket = originalWebSocket;
    });

    test("Manages connection lifecycle, prevents duplicates, and cleans up on stop", () => {
      let openCalls = 0;
      let closeCalls = 0;

      class MockWebSocket {
        static CONNECTING = 0;
        static OPEN = 1;
        static CLOSING = 2;
        static CLOSED = 3;

        readyState = MockWebSocket.CONNECTING;
        onopen: any = null;
        onclose: any = null;
        onerror: any = null;
        onmessage: any = null;

        url: string;
        constructor(url: string) {
          this.url = url;
          openCalls++;
          setTimeout(() => {
            this.readyState = MockWebSocket.OPEN;
            if (this.onopen) this.onopen();
          }, 10);
        }

        close() {
          closeCalls++;
          this.readyState = MockWebSocket.CLOSED;
          if (this.onclose) this.onclose();
        }
      }

      (globalThis as any).WebSocket = MockWebSocket;

      const engine = new PricingOracleEngine();
      engine.connectBinanceWebSocket();
      assert.equal(openCalls, 1);

      // Attempt duplicate connect while connecting/open
      engine.connectBinanceWebSocket();
      assert.equal(openCalls, 1, "Must prevent duplicate connections");

      // Stop engine
      engine.stop();
      assert.equal(engine.getState().wsConnected, false);
      assert.ok(closeCalls >= 1, "Must close socket on stop");
    });
  });

  describe("8. NAV Baseline and Recalculation Parity", () => {
    test("Calculates exact ₹100.00 baseline NAV for all 6 baskets at reference prices", () => {
      const engine = new PricingOracleEngine();

      const baskets = [
        {
          id: "top-5-index",
          assets: [
            { symbol: "BTC", weight: 55 },
            { symbol: "ETH", weight: 20 },
            { symbol: "SOL", weight: 10 },
            { symbol: "BNB", weight: 8 },
            { symbol: "XRP", weight: 7 }
          ]
        },
        {
          id: "crypto-gold",
          assets: [
            { symbol: "PAXG", weight: 50 },
            { symbol: "BTC", weight: 35 },
            { symbol: "ETH", weight: 15 }
          ]
        },
        {
          id: "bitcoin",
          assets: [
            { symbol: "BTC", weight: 100 }
          ]
        },
        {
          id: "ethereum",
          assets: [
            { symbol: "ETH", weight: 100 }
          ]
        },
        {
          id: "defi",
          assets: [
            { symbol: "UNI", weight: 25 },
            { symbol: "AAVE", weight: 25 },
            { symbol: "LINK", weight: 25 },
            { symbol: "PENDLE", weight: 15 },
            { symbol: "LDO", weight: 10 }
          ]
        },
        {
          id: "altcoin-meme",
          assets: [
            { symbol: "DOGE", weight: 20 },
            { symbol: "SHIB", weight: 20 },
            { symbol: "PEPE", weight: 20 },
            { symbol: "BONK", weight: 20 },
            { symbol: "WIF", weight: 20 }
          ]
        }
      ];

      for (const basket of baskets) {
        const { nav, change24h } = engine.calculateBasketNav(basket as any);
        assert.equal(nav, 100.00, `Basket ${basket.id} must initialize at ₹100.00 NAV`);
        assert.equal(change24h, 0.0, `Basket ${basket.id} 24h change must initialize at 0.0%`);
      }
    });

    test("Supports both decimal weights (0.55) and percentage weights (55)", () => {
      const engine = new PricingOracleEngine();

      const percentageBasket = {
        id: "top-5-index",
        assets: [
          { symbol: "BTC", weight: 55 },
          { symbol: "ETH", weight: 20 },
          { symbol: "SOL", weight: 10 },
          { symbol: "BNB", weight: 8 },
          { symbol: "XRP", weight: 7 }
        ]
      };

      const decimalBasket = {
        id: "top-5-index",
        assets: [
          { symbol: "BTC", weight: 0.55 },
          { symbol: "ETH", weight: 0.20 },
          { symbol: "SOL", weight: 0.10 },
          { symbol: "BNB", weight: 0.08 },
          { symbol: "XRP", weight: 0.07 }
        ]
      };

      const resPercent = engine.calculateBasketNav(percentageBasket as any);
      const resDecimal = engine.calculateBasketNav(decimalBasket as any);

      assert.equal(resPercent.nav, 100.00);
      assert.equal(resDecimal.nav, 100.00);
    });

    test("Recalculates NAV proportionally on constituent price changes", () => {
      const engine = new PricingOracleEngine();

      const top5Basket = {
        id: "top-5-index",
        assets: [
          { symbol: "BTC", weight: 55 },
          { symbol: "ETH", weight: 20 },
          { symbol: "SOL", weight: 10 },
          { symbol: "BNB", weight: 8 },
          { symbol: "XRP", weight: 7 }
        ]
      };

      // Increase BTC by 10% from 81604 to 89764.40
      engine.handleIncomingTokenTick("BTC", 89764.40, "Binance WS");

      const { nav, change24h } = engine.calculateBasketNav(top5Basket as any);
      // ΔBTC * 0.55 = 8160.40 * 0.55 = 4488.22 USD
      // 4488.22 / 45430.4875 * 100 = 9.88% -> NAV 109.88
      assert.equal(nav, 109.88);
      assert.equal(change24h, 9.88);
    });

    test("Freezes NAV when circuit breaker is active", () => {
      const engine = new PricingOracleEngine();
      const btcBasket = {
        id: "bitcoin",
        assets: [{ symbol: "BTC", weight: 100 }]
      };

      // Calculate initial valid NAV
      const initial = engine.calculateBasketNav(btcBasket as any);
      assert.equal(initial.nav, 100.00);

      // Trigger circuit breaker
      engine.getState().isNavFrozen = true;

      // Price changes during frozen state
      engine.handleIncomingTokenTick("BTC", 90000, "Binance WS");

      const frozenResult = engine.calculateBasketNav(btcBasket as any);
      assert.equal(frozenResult.nav, 100.00, "NAV must remain frozen at last valid value");
      assert.equal(frozenResult.isFrozen, true);
      assert.equal(frozenResult.status, "frozen");
    });
  });
});
