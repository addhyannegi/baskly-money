"use client";

import React from "react";
import { useBaskly } from "@/context/BasklyContext";
import { ShieldAlert } from "lucide-react";
import { formatINRCurrency } from "@/data/baskets";

interface TokenPriceRow {
  symbol: string;
  name: string;
  usd: number;
  inr: number;
  source: string;
  status: "healthy" | "degraded";
}

const ORACLE_TOKENS: TokenPriceRow[] = [
  { symbol: "BTC", name: "Bitcoin", usd: 81600.0, inr: 8173056.0, source: "Binance WS", status: "healthy" },
  { symbol: "ETH", name: "Ethereum", usd: 2410.0, inr: 241385.6, source: "Binance WS", status: "healthy" },
  { symbol: "SOL", name: "Solana", usd: 110.0, inr: 11017.6, source: "Binance WS", status: "healthy" },
  { symbol: "BNB", name: "BNB", usd: 685.0, inr: 68609.6, source: "Binance WS", status: "healthy" },
  { symbol: "XRP", name: "XRP", usd: 1.25, inr: 125.2, source: "Binance WS", status: "healthy" },
  { symbol: "PAXG", name: "PAX Gold", usd: 4165.0, inr: 417166.4, source: "CoinGecko", status: "healthy" },
  { symbol: "UNI", name: "Uniswap", usd: 7.2, inr: 721.15, source: "Binance WS", status: "healthy" },
  { symbol: "AAVE", name: "Aave", usd: 155.0, inr: 15524.8, source: "Binance WS", status: "healthy" },
  { symbol: "LINK", name: "Chainlink", usd: 12.5, inr: 1252.0, source: "Binance WS", status: "healthy" },
  { symbol: "PENDLE", name: "Pendle", usd: 2.1, inr: 210.33, source: "Binance WS", status: "healthy" },
  { symbol: "LDO", name: "Lido DAO", usd: 0.95, inr: 95.15, source: "Binance WS", status: "healthy" },
  { symbol: "DOGE", name: "Dogecoin", usd: 0.16, inr: 16.02, source: "Binance WS", status: "healthy" },
  { symbol: "SHIB", name: "Shiba Inu", usd: 0.000018, inr: 0.0018, source: "Binance WS", status: "healthy" },
  { symbol: "PEPE", name: "Pepe", usd: 0.0000085, inr: 0.00085, source: "Binance WS", status: "healthy" },
  { symbol: "BONK", name: "Bonk", usd: 0.000019, inr: 0.0019, source: "Binance WS", status: "healthy" },
  { symbol: "WIF", name: "dogwifhat", usd: 1.85, inr: 185.3, source: "Binance WS", status: "healthy" },
];

export default function OracleModal() {
  const { isOracleModalOpen, closeOracleModal, oracleState, lastUpdatedSymbol } = useBaskly();

  if (!isOracleModalOpen) return null;

  const tokens = Object.values(oracleState?.tokens || {});
  const isWsConnected = oracleState?.wsConnected;
  const usdtRate = oracleState?.usdtInr || 100.16;
  const tickCount = oracleState?.tickCount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="tilt-card bg-[#FAF8F5] max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 md:p-9 space-y-5 sm:space-y-6">
        <div className="tilt-card-content space-y-5 sm:space-y-6">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#121110]/10 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="oracle-pulse-live flex-shrink-0" />
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#0F6E56] font-semibold">
                  Pricing Oracle Service · Real-Time
                </span>
              </div>
              <h3 className="text-xl sm:text-3xl font-semibold text-[#121110] tracking-editorial mt-1">
                Multi-Source Feed & <span className="font-serif-italic font-normal text-2xl sm:text-3xl">NAV Engine</span>
              </h3>
              <p className="text-xs text-[#5C5752] mt-0.5">
                Binance WebSocket + CoinDCX USDT/INR + CoinGecko Fallback ({tickCount} Ticks Processed)
              </p>
            </div>
            <button 
              type="button"
              onClick={closeOracleModal} 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#121110]/15 flex items-center justify-center text-sm hover:bg-[#121110] hover:text-[#F4EFEA] transition cursor-pointer flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {/* System Architecture Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-center">
            <div className="bg-[#F4EFEA] p-3 rounded-2xl border border-[#121110]/8">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#8C857B]">Primary Feed</div>
              <div className="text-xs font-bold text-[#121110] mt-1 flex items-center justify-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isWsConnected ? "bg-[#0F6E56]" : "bg-amber-600 animate-pulse"}`} /> Binance WS
              </div>
              <div className="text-[10px] text-[#5C5752] mt-0.5 font-mono">
                {isWsConnected ? "Stream Connected" : "Connecting..."}
              </div>
            </div>
            <div className="bg-[#F4EFEA] p-3 rounded-2xl border border-[#121110]/8">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#8C857B]">Indian Exchange Rate</div>
              <div id="modal-usdt-rate" className="text-xs font-bold text-[#0F6E56] mt-1 font-mono">₹{usdtRate.toFixed(2)}</div>
              <div className="text-[10px] text-[#5C5752] mt-0.5">CoinDCX Poller (15s)</div>
            </div>
            <div className="bg-[#F4EFEA] p-3 rounded-2xl border border-[#121110]/8">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#8C857B]">Validator / Median</div>
              <div className="text-xs font-bold text-[#0F6E56] mt-1">±5% Outlier Rejection</div>
              <div className="text-[10px] text-[#5C5752] mt-0.5 font-mono">Stale cutoff: 60s</div>
            </div>
          </div>

          {/* Live Asset Price Table */}
          <div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[#8C857B] mb-2">
              <span>Validated Constituent Assets ({tokens.length})</span>
              <span id="oracle-tick-counter">{tickCount} Ticks Live</span>
            </div>
            <div className="max-h-64 overflow-x-auto overflow-y-auto border border-[#121110]/10 rounded-2xl bg-[#FAF8F5]">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="bg-[#F4EFEA] border-b border-[#121110]/10 text-[10px] font-mono text-[#8C857B] uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">USD Price</th>
                    <th className="py-2.5 px-3">Spot INR Price</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody id="oracle-prices-table-body" className="divide-y divide-[#121110]/5 font-mono text-[11px]">
                  {tokens.map((row) => {
                    const isRecentlyUpdated = lastUpdatedSymbol === row.symbol;
                    const statusClass = row.status === "healthy" 
                      ? "bg-[#0F6E56]/10 text-[#0F6E56]" 
                      : row.status === "delayed" 
                      ? "bg-amber-100 text-amber-800" 
                      : "bg-[#B85D43]/10 text-[#B85D43]";

                    return (
                      <tr 
                        key={row.symbol} 
                        id={`oracle-row-${row.symbol}`}
                        className={`hover:bg-[#F4EFEA]/50 transition-colors ${isRecentlyUpdated ? "bg-[#0F6E56]/5" : ""}`}
                      >
                        <td className="py-2 px-3 font-bold text-[#121110]">
                          {row.name} <span className="text-[10px] font-normal text-[#8C857B]">({row.symbol})</span>
                        </td>
                        <td className="py-2 px-3 text-[#5C5752]">
                          ${row.usd >= 1 ? row.usd.toLocaleString('en-US', { maximumFractionDigits: 2 }) : row.usd.toFixed(6)}
                        </td>
                        <td id={`oracle-spot-${row.symbol}`} className="py-2 px-3 font-bold text-[#121110]">
                          ₹{formatINRCurrency(row.inr)}
                        </td>
                        <td className="py-2 px-3 text-[#8C857B]">{row.source}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${statusClass}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Circuit Breaker Protection */}
          <div className="p-3.5 bg-[#F4EFEA] rounded-2xl border border-[#121110]/8 text-xs text-[#5C5752] space-y-1">
            <div className="font-semibold text-[#121110] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#0F6E56]" />
              Failover & Freeze Circuit Breaker
            </div>
            <p className="text-[11px] leading-relaxed">
              If an asset has no fresh price for 120s or feeds diverge, the engine displays <strong>&quot;Price Delayed&quot;</strong> and freezes official NAV rather than publishing incorrect valuations.
            </p>
          </div>

          <button 
            type="button"
            onClick={closeOracleModal} 
            className="btn-unseen w-full bg-[#121110] text-[#F4EFEA] py-3.5 text-xs font-semibold uppercase tracking-widest cursor-pointer"
          >
            <span>Close Telemetry Monitor ↗</span>
          </button>

        </div>
      </div>
    </div>
  );
}
