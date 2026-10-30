"use client";

import React from "react";
import { Basket } from "@/types/baskly";
import { formatINR } from "@/data/baskets";
import { useBaskly } from "@/context/BasklyContext";
import CardSparkline from "@/components/CardSparkline";

interface BasketCardProps {
  basket: Basket;
}

export default function BasketCard({ basket }: BasketCardProps) {
  const { openBasketInspector, openUPIModal, lastUpdatedSymbol } = useBaskly();
  const isPositive = basket.change_24h >= 0;
  const changeSign = isPositive ? "+" : "";
  const changeClass = isPositive 
    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" 
    : "text-rose-400 bg-rose-500/10 border border-rose-500/20";
  const isAssetRecentlyUpdated = Boolean(
    lastUpdatedSymbol && basket.assets.some((a) => a.symbol === lastUpdatedSymbol)
  );

  const topAssets = basket.assets.slice(0, 3);
  const remainingCount = basket.assets.length - 3;

  return (
    <div
      className="tilt-card p-5 sm:p-7 flex flex-col justify-between cursor-pointer group transition-all h-full bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/45 shadow-xl hover:shadow-[0_20px_50px_rgba(245,158,11,0.12)] backdrop-blur-xl"
      onClick={() => openBasketInspector(basket.id)}
    >
      <div className="tilt-card-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs text-[#736E65]">/{basket.indexNum}</span>
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-semibold px-3 py-1 rounded-full tracking-wide uppercase border border-white/5"
              style={{
                backgroundColor: `${basket.riskColor}22`,
                color: basket.riskColor,
              }}
            >
              {basket.risk}
            </span>
            <span
              id={`basket-change-${basket.id}`}
              className={`font-mono text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${changeClass}`}
            >
              {changeSign}{basket.change_24h.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-editorial mb-1 group-hover:text-[#F59E0B] transition-colors">
          {basket.name.includes(basket.serifWord) ? (
            <>
              {basket.name.split(basket.serifWord)[0]}
              <span className="font-serif-italic font-normal text-2xl sm:text-3xl text-[#F59E0B]">{basket.serifWord}</span>
              {basket.name.split(basket.serifWord)[1]}
            </>
          ) : (
            basket.name
          )}
        </h3>

        {/* Live Unit NAV Display linked to Oracle */}
        <div className="flex items-center gap-2 mb-3 font-mono text-xs">
          <span className="text-[#736E65] text-[10px] uppercase tracking-wider">Live NAV:</span>
          <span
            id={`basket-nav-${basket.id}`}
            className={`font-bold text-white px-2 py-0.5 rounded bg-[#1A1713] border border-white/10 transition-all ${
              isAssetRecentlyUpdated ? "tick-flash-green scale-105" : ""
            }`}
          >
            ₹{basket.nav.toFixed(2)}
          </span>
          <span className="text-[10px] text-emerald-400 font-sans flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Ticking
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#A39E93] leading-relaxed mb-4">{basket.tagline}</p>

        {/* Fund Performance Sparkline Chart on Card */}
        <div className="my-3 p-3 rounded-2xl bg-[#1A1713]/80 border border-white/10">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
            <span className="text-[#736E65] uppercase tracking-wider">NAV Trajectory</span>
            <span className="text-emerald-400 font-semibold font-mono">{basket.expected_cagr}% CAGR ↗</span>
          </div>
          <div className="w-full h-14 relative flex items-center justify-center">
            <CardSparkline basketId={basket.id} liveNav={basket.nav} />
          </div>
        </div>

        {/* Allocation Visual Bar & Constituent Tokens with Live INR Spot */}
        <div className="space-y-3 mb-6">
          <div className="w-full flex rounded-full overflow-hidden bg-white/10 p-[1px]">
            {basket.assets.map((a) => (
              <div
                key={a.symbol}
                style={{ width: `${a.weight}%`, backgroundColor: a.color || "#FFFFFF" }}
                className="h-1.5 transition-all duration-500"
                title={`${a.name}: ${a.weight}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {topAssets.map((a) => (
              <span
                key={a.symbol}
                className="inline-flex items-center text-[10px] sm:text-[11px] font-medium text-white/90 bg-[#1A1713] border border-white/10 rounded-full px-2 sm:px-2.5 py-0.5"
              >
                <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: a.color || "#FFFFFF" }} />
                <span>
                  {a.symbol} {a.weight}%
                </span>
                <span className="ml-1 text-[9px] sm:text-[10px] text-[#A39E93] font-mono" data-token-symbol={a.symbol}>
                  ₹{formatINR(a.price_inr)}
                </span>
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="text-[10px] sm:text-[11px] text-[#736E65] self-center pl-1 font-mono">+{remainingCount} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="tilt-card-content pt-4 sm:pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5 mt-2">
        <div>
          <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#736E65] font-semibold">Monthly Mandate</div>
          <div className="text-sm sm:text-base font-bold text-white font-mono">
            ₹{formatINR(basket.min_sip)}
            <span className="text-xs font-normal text-[#736E65]">/mo</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <div className="text-right">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#736E65] font-semibold">Model CAGR</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">{basket.expected_cagr}%</div>
          </div>
          <button
            type="button"
            suppressHydrationWarning
            onClick={(e) => {
              e.stopPropagation();
              openBasketInspector(basket.id);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-[#0B0A09] transition-all duration-300 cursor-pointer flex-shrink-0"
            title="Inspect Specs"
          >
            ↗
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={(e) => {
              e.stopPropagation();
              openUPIModal();
            }}
            className="btn-unseen bg-white text-[#0B0A09] hover:bg-[#F59E0B] hover:text-[#0B0A09] px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider cursor-pointer flex-shrink-0 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <span>SIP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
