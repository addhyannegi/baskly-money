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
      <div className="tilt-card bg-[#13110F]/95 backdrop-blur-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 md:p-9 space-y-5 sm:space-y-6 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(245,158,11,0.12)] rounded-3xl text-white">
        <div className="tilt-card-content space-y-5 sm:space-y-6">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="oracle-pulse-live flex-shrink-0" />
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#10B981] font-semibold">
                  Pricing Oracle Service · Real-Time
                </span>
              </div>
              <h3 className="text-xl sm:text-3xl font-semibold text-white tracking-editorial mt-1">
                Multi-Source Feed & <span className="font-serif-italic font-normal text-2xl sm:text-3xl text-[#F59E0B]">NAV Engine</span>
              </h3>
              <p className="text-xs text-[#A39E93] mt-0.5">
                Binance WebSocket + CoinDCX USDT/INR + CoinGecko Fallback ({tickCount} Ticks Processed)
              </p>
            </div>
            <button 
              type="button"
              onClick={closeOracleModal} 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/15 flex items-center justify-center text-sm text-white/80 hover:bg-white hover:text-[#0B0A09] transition cursor-pointer flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {/* System Architecture Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-center">
            <div className="bg-[#1A1713]/80 p-3 rounded-2xl border border-white/5">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#A39E93]">Primary Feed</div>
              <div className="text-xs font-bold text-white mt-1 flex items-center justify-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isWsConnected ? "bg-[#10B981]" : "bg-amber-500 animate-pulse"}`} /> Binance WS
              </div>
              <div className="text-[10px] text-[#A39E93] mt-0.5 font-mono">
                {isWsConnected ? "Stream Connected" : "Connecting..."}
              </div>
            </div>
            <div className="bg-[#1A1713]/80 p-3 rounded-2xl border border-white/5">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#A39E93]">Indian Exchange Rate</div>
              <div id="modal-usdt-rate" className="text-xs font-bold text-[#10B981] mt-1 font-mono">₹{usdtRate.toFixed(2)}</div>
              <div className="text-[10px] text-[#A39E93] mt-0.5">CoinDCX Poller (15s)</div>
            </div>
            <div className="bg-[#1A1713]/80 p-3 rounded-2xl border border-white/5">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#A39E93]">Validator / Median</div>
              <div className="text-xs font-bold text-[#10B981] mt-1">±5% Outlier Rejection</div>
              <div className="text-[10px] text-[#A39E93] mt-0.5 font-mono">Stale cutoff: 60s</div>
            </div>
          </div>

          {/* Live Asset Price Table */}
          <div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[#A39E93] mb-2">
              <span>Validated Constituent Assets ({tokens.length})</span>
              <span id="oracle-tick-counter">{tickCount} Ticks Live</span>
            </div>
            <div className="max-h-64 overflow-x-auto overflow-y-auto border border-white/10 rounded-2xl bg-[#100E0C]">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="bg-[#1A1713] border-b border-white/10 text-[10px] font-mono text-[#A39E93] uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">USD Price</th>
                    <th className="py-2.5 px-3">Spot INR Price</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody id="oracle-prices-table-body" className="divide-y divide-white/5 font-mono text-[11px]">
                  {tokens.map((row) => {
                    const isRecentlyUpdated = lastUpdatedSymbol === row.symbol;
                    const statusClass = row.status === "healthy" 
                      ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30" 
                      : row.status === "delayed" 
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" 
                      : "bg-rose-500/15 text-rose-400 border border-rose-500/30";

                    return (
                      <tr 
                        key={row.symbol} 
                        id={`oracle-row-${row.symbol}`}
                        className={`hover:bg-white/5 transition-colors ${isRecentlyUpdated ? "bg-[#10B981]/10" : ""}`}
                      >
                        <td className="py-2 px-3 font-bold text-white">
                          {row.name} <span className="text-[10px] font-normal text-[#A39E93]">({row.symbol})</span>
                        </td>
                        <td className="py-2 px-3 text-[#D4CFC7]">
                          ${row.usd >= 1 ? row.usd.toLocaleString('en-US', { maximumFractionDigits: 2 }) : row.usd.toFixed(6)}
                        </td>
                        <td id={`oracle-spot-${row.symbol}`} className="py-2 px-3 font-bold text-white">
                          ₹{formatINRCurrency(row.inr)}
                        </td>
                        <td className="py-2 px-3 text-[#A39E93]">{row.source}</td>
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
          <div className="p-3.5 bg-[#1A1713]/80 rounded-2xl border border-white/5 text-xs text-[#A39E93] space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#10B981]" />
              Failover & Freeze Circuit Breaker
            </div>
            <p className="text-[11px] leading-relaxed">
              If an asset has no fresh price for 120s or feeds diverge, the engine displays <strong>&quot;Price Delayed&quot;</strong> and freezes official NAV rather than publishing incorrect valuations.
            </p>
          </div>

          <button 
            type="button"
            onClick={closeOracleModal} 
            className="btn-unseen w-full bg-white text-[#0B0A09] hover:bg-[#F59E0B] py-3.5 text-xs font-semibold uppercase tracking-widest cursor-pointer"
          >
            <span>Close Telemetry Monitor ↗</span>
          </button>

        </div>
      </div>
    </div>
  );
}
