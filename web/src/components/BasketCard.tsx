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
  const changeClass = isPositive ? "text-emerald-800 bg-emerald-950/5" : "text-rose-800 bg-rose-950/5";
  const isAssetRecentlyUpdated = Boolean(
    lastUpdatedSymbol && basket.assets.some((a) => a.symbol === lastUpdatedSymbol)
  );

  const topAssets = basket.assets.slice(0, 3);
  const remainingCount = basket.assets.length - 3;

  return (
    <div
      className="tilt-card p-5 sm:p-7 flex flex-col justify-between cursor-pointer group transition-all h-full"
      onClick={() => openBasketInspector(basket.id)}
    >
      <div className="tilt-card-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs text-[#8C857B]">/{basket.indexNum}</span>
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-semibold px-3 py-1 rounded-full tracking-wide uppercase"
              style={{
                backgroundColor: `${basket.riskColor}14`,
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
        <h3 className="text-xl sm:text-2xl font-semibold text-[#121110] tracking-editorial mb-1 group-hover:text-[#9A7B56] transition-colors">
          {basket.name.includes(basket.serifWord) ? (
            <>
              {basket.name.split(basket.serifWord)[0]}
              <span className="font-serif-italic font-normal text-2xl sm:text-3xl">{basket.serifWord}</span>
              {basket.name.split(basket.serifWord)[1]}
            </>
          ) : (
            basket.name
          )}
        </h3>

        {/* Live Unit NAV Display linked to Oracle */}
        <div className="flex items-center gap-2 mb-3 font-mono text-xs">
          <span className="text-[#8C857B] text-[10px] uppercase tracking-wider">Live NAV:</span>
          <span
            id={`basket-nav-${basket.id}`}
            className={`font-bold text-[#121110] px-1.5 py-0.5 rounded transition-all ${
              isAssetRecentlyUpdated ? "tick-flash-green scale-105" : ""
            }`}
          >
            ₹{basket.nav.toFixed(2)}
          </span>
          <span className="text-[10px] text-[#0F6E56] font-sans flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0F6E56] animate-ping" />
            Ticking
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed mb-4">{basket.tagline}</p>

        {/* Fund Performance Sparkline Chart on Card */}
        <div className="my-3 p-3 rounded-2xl bg-[#121110]/[0.02] border border-[#121110]/6">
          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
            <span className="text-[#8C857B] uppercase tracking-wider">NAV Trajectory</span>
            <span className="text-[#0F6E56] font-semibold font-mono">{basket.expected_cagr}% CAGR ↗</span>
          </div>
          <div className="w-full h-14 relative flex items-center justify-center">
            <CardSparkline basketId={basket.id} liveNav={basket.nav} />
          </div>
        </div>

        {/* Allocation Visual Bar & Constituent Tokens with Live INR Spot */}
        <div className="space-y-3 mb-6">
          <div className="w-full flex rounded-full overflow-hidden bg-[#121110]/5 p-[1px]">
            {basket.assets.map((a) => (
              <div
                key={a.symbol}
                style={{ width: `${a.weight}%`, backgroundColor: a.color || "#121110" }}
                className="h-1.5 transition-all duration-500"
                title={`${a.name}: ${a.weight}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {topAssets.map((a) => (
              <span
                key={a.symbol}
                className="inline-flex items-center text-[10px] sm:text-[11px] font-medium text-[#121110]/80 bg-[#F4EFEA]/90 border border-[#121110]/10 rounded-full px-2 sm:px-2.5 py-0.5"
              >
                <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: a.color || "#121110" }} />
                <span>
                  {a.symbol} {a.weight}%
                </span>
                <span className="ml-1 text-[9px] sm:text-[10px] text-[#5C5752] font-mono" data-token-symbol={a.symbol}>
                  ₹{formatINR(a.price_inr)}
                </span>
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="text-[10px] sm:text-[11px] text-[#8C857B] self-center pl-1 font-mono">+{remainingCount} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="tilt-card-content pt-4 sm:pt-5 border-t border-[#121110]/10 flex flex-wrap items-center justify-between gap-2.5 mt-2">
        <div>
          <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#8C857B] font-semibold">Monthly Mandate</div>
          <div className="text-sm sm:text-base font-bold text-[#121110] font-mono">
            ₹{formatINR(basket.min_sip)}
            <span className="text-xs font-normal text-[#8C857B]">/mo</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <div className="text-right">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#8C857B] font-semibold">Model CAGR</div>
            <div className="text-xs sm:text-sm font-bold text-[#0F6E56] font-mono">{basket.expected_cagr}%</div>
          </div>
          <button
            type="button"
            suppressHydrationWarning
            onClick={(e) => {
              e.stopPropagation();
              openBasketInspector(basket.id);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#121110]/15 flex items-center justify-center group-hover:bg-[#121110] group-hover:text-[#F4EFEA] transition-all duration-300 cursor-pointer flex-shrink-0"
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
            className="btn-unseen bg-[#121110] text-[#F4EFEA] px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider cursor-pointer flex-shrink-0"
          >
            <span>SIP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
