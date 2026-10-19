"use client";

import React from "react";
import { useBaskly } from "@/context/BasklyContext";
import BasketCard from "@/components/BasketCard";

export default function BasketsSection() {
  const { baskets } = useBaskly();

  return (
    <section id="baskets" className="py-16 sm:py-20 md:py-28 bg-[#EBE3DA]/45 border-y border-[#121110]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-4">
          <div>
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#9A7B56]">
              02 — Curated Indices
            </span>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#121110] tracking-editorial mt-3 leading-none">
              Six architectural <span className="font-serif-italic font-light text-4xl xs:text-5xl sm:text-6xl lg:text-7xl text-[#9A7B56]">baskets.</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5C5752] max-w-md mt-2 md:mt-0 leading-relaxed">
            Click any basket to inspect its live underlying asset weights, spot INR prices, rebalancing schedule, and historical CAGR.
          </p>
        </div>

        {/* 6 Curated Basket Cards Grid */}
        <div id="baskets-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {baskets.map((basket) => (
            <BasketCard key={basket.id} basket={basket} />
          ))}
        </div>

      </div>
    </section>
  );
}
