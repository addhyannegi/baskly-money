"use client";

import React from "react";
import { ArrowDownRight, Sparkles } from "lucide-react";
import { useBaskly } from "@/context/BasklyContext";
import { formatINR } from "@/data/baskets";

export default function Hero() {
  const { baskets, openUPIModal, openBasketInspector } = useBaskly();
  const top5 = baskets.find((b) => b.id === "top-5-index") || baskets[0];
  const baseFolioUnits = 4511.8;
  const liveValuation = Math.round(baseFolioUnits * top5.nav);

  return (
    <section className="relative pt-6 sm:pt-8 md:pt-12 pb-16 sm:pb-24 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left 7 Columns: Monumental Editorial Typography */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#FAF8F5]/85 border border-[#121110]/10 backdrop-blur-md max-w-full">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0F6E56] animate-pulse flex-shrink-0" />
            <span className="font-mono text-[9px] xs:text-[10px] sm:text-[11px] uppercase tracking-[0.08em] xs:tracking-[0.12em] sm:tracking-[0.16em] text-[#5C5752] leading-tight">
              Indian Rupee SIPs · NPCI AutoPay · 1% TDS Reconciled
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl xs:text-5xl sm:text-7xl lg:text-[82px] font-semibold text-[#121110] tracking-editorial leading-[1.0] sm:leading-[0.98]">
            Quietly building<br />
            <span className="font-serif-italic font-light text-5xl xs:text-6xl sm:text-8xl lg:text-[96px] text-[#9A7B56] pr-2">
              generational
            </span><br />
            crypto wealth.
          </h1>

          {/* Editorial Lead Paragraph */}
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-[#5C5752] max-w-xl font-normal leading-relaxed">
            Retire from 3 AM chart anxiety and speculative noise. Invest from{" "}
            <strong className="text-[#121110] font-semibold">₹1,000/month</strong> into rule-based, market-cap weighted crypto baskets—automated via UPI AutoPay.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 pt-2">
            <a 
              href="#baskets" 
              className="btn-unseen bg-[#121110] text-[#F4EFEA] px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold tracking-wide shadow-lg cursor-pointer text-center justify-center"
            >
              <span className="flex items-center justify-center gap-2 sm:gap-2.5">
                Explore 06 Curated Baskets
                <ArrowDownRight className="w-4 h-4 flex-shrink-0" />
              </span>
            </a>

            <button 
              type="button"
              onClick={openUPIModal} 
              className="btn-unseen-light px-6 sm:px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-[#121110] cursor-pointer text-center justify-center"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9A7B56] flex-shrink-0" />
                Simulate UPI Mandate
              </span>
            </button>
          </div>

          {/* Micro Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 sm:pt-8 border-t border-[#121110]/10 max-w-lg">
            <div>
              <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#8C857B]">Minimum Habit</div>
              <div className="font-serif-italic text-xl sm:text-2xl md:text-3xl text-[#121110] mt-0.5">
                ₹1,000<span className="font-sans text-[10px] sm:text-xs not-italic text-[#8C857B]">/mo</span>
              </div>
            </div>
            <div>
              <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#8C857B]">Rebalancing</div>
              <div className="font-serif-italic text-xl sm:text-2xl md:text-3xl text-[#121110] mt-0.5">
                Monthly <span className="font-sans text-[10px] sm:text-xs not-italic text-[#0F6E56]">Auto</span>
              </div>
            </div>
            <div>
              <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#8C857B]">Custody Standard</div>
              <div className="font-serif-italic text-xl sm:text-2xl md:text-3xl text-[#121110] mt-0.5">
                1:1 <span className="font-sans text-[10px] sm:text-xs not-italic text-[#8C857B]">Cold</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Floating Live Mandate Glass Artifact */}
        <div className="lg:col-span-5">
          <div className="tilt-card p-5 sm:p-7 md:p-8 animate-float">
            <div className="tilt-card-content space-y-5 sm:space-y-6">
              
              <div className="flex items-start justify-between border-b border-[#121110]/10 pb-4 sm:pb-5 gap-2">
                <div>
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#9A7B56]">Active Folio · #IND-8841</span>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#121110] tracking-editorial mt-1">
                    Top-5 <span className="font-serif-italic font-normal text-2xl sm:text-3xl">Bluechip</span> SIP
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#5C5752] mt-0.5">HDFC Bank UPI AutoPay · 5th of every month</p>
                </div>
                <span className="px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-mono uppercase tracking-wider bg-[#0F6E56]/10 text-[#0F6E56] font-semibold flex-shrink-0">
                  ● Compounding
                </span>
              </div>

              {/* Portfolio Valuation Display */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-[#F4EFEA]/80 p-3.5 sm:p-4 rounded-2xl border border-[#121110]/8">
                <div>
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#8C857B]">Current NAV Value</div>
                  <div id="hero-folio-valuation" className="text-xl sm:text-2xl font-bold text-[#121110] font-mono mt-1">
                    ₹{formatINR(liveValuation)}
                  </div>
                  <div id="hero-folio-nav" className="text-[9px] sm:text-[10px] text-[#5C5752] font-mono mt-0.5">
                    Top-5 NAV: ₹{top5.nav.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#8C857B]">Net XIRR Return</div>
                  <div id="hero-folio-xirr" className="text-xl sm:text-2xl font-bold text-[#0F6E56] font-mono mt-1">
                    +31.4%
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-[#0F6E56] font-mono mt-0.5 flex items-center justify-end gap-1">
                    <span className="oracle-pulse-live" style={{ width: 5, height: 5 }} /> Streaming
                  </div>
                </div>
              </div>

              {/* Constituent Weights Breakdown */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#8C857B]">
                  <span>Automatic Allocation</span>
                  <span>Rebalanced 4d ago</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#121110]/5">
                  <div style={{ width: "55%", background: "#D97706" }} />
                  <div style={{ width: "20%", background: "#4F46E5" }} />
                  <div style={{ width: "10%", background: "#0D9488" }} />
                  <div style={{ width: "8%", background: "#CA8A04" }} />
                  <div style={{ width: "7%", background: "#1E293B" }} />
                </div>
                <div className="grid grid-cols-5 gap-1 sm:gap-1.5 pt-2 text-center">
                  <div className="bg-[#FAF8F5] py-1.5 sm:py-2 px-0.5 rounded-xl border border-[#121110]/8">
                    <div className="font-mono text-[9px] sm:text-[10px] font-bold text-[#121110]">BTC</div>
                    <div className="text-[9px] sm:text-[10px] text-[#9A7B56] font-mono">55%</div>
                  </div>
                  <div className="bg-[#FAF8F5] py-1.5 sm:py-2 px-0.5 rounded-xl border border-[#121110]/8">
                    <div className="font-mono text-[9px] sm:text-[10px] font-bold text-[#121110]">ETH</div>
                    <div className="text-[9px] sm:text-[10px] text-[#4F46E5] font-mono">20%</div>
                  </div>
                  <div className="bg-[#FAF8F5] py-1.5 sm:py-2 px-0.5 rounded-xl border border-[#121110]/8">
                    <div className="font-mono text-[9px] sm:text-[10px] font-bold text-[#121110]">SOL</div>
                    <div className="text-[9px] sm:text-[10px] text-[#0D9488] font-mono">10%</div>
                  </div>
                  <div className="bg-[#FAF8F5] py-1.5 sm:py-2 px-0.5 rounded-xl border border-[#121110]/8">
                    <div className="font-mono text-[9px] sm:text-[10px] font-bold text-[#121110]">BNB</div>
                    <div className="text-[9px] sm:text-[10px] text-[#CA8A04] font-mono">8%</div>
                  </div>
                  <div className="bg-[#FAF8F5] py-1.5 sm:py-2 px-0.5 rounded-xl border border-[#121110]/8">
                    <div className="font-mono text-[9px] sm:text-[10px] font-bold text-[#121110]">XRP</div>
                    <div className="text-[9px] sm:text-[10px] text-[#1E293B] font-mono">7%</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#5C5752] gap-2">
                <span className="font-mono text-[10px] sm:text-[11px] truncate">✓ Section 194S TDS Ready</span>
                <button 
                  type="button"
                  onClick={() => openBasketInspector("top-5-index")} 
                  className="font-semibold text-[#121110] underline underline-offset-4 hover:text-[#9A7B56] transition-colors cursor-pointer text-[11px] sm:text-xs whitespace-nowrap"
                >
                  Inspect Methodology ↗
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
