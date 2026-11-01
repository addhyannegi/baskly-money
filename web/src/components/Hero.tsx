"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { useBaskly } from "@/context/BasklyContext";
import { formatINR } from "@/data/baskets";

export default function Hero() {
  const { baskets, openUPIModal, openBasketInspector } = useBaskly();
  const top5 = baskets.find((b) => b.id === "top-5-index") || baskets[0];
  const baseFolioUnits = 4511.8;
  const liveValuation = Math.round(baseFolioUnits * (top5?.nav || 100));

  return (
    <section className="relative pt-6 sm:pt-8 md:pt-12 2xl:pt-16 pb-16 sm:pb-24 md:pb-32 2xl:pb-40 max-w-7xl 2xl:max-w-[1520px] 3xl:max-w-[1780px] 4xl:max-w-[1980px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 3xl:px-16">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 2xl:gap-16 3xl:gap-20 items-center">
        
        {/* Left 7 Columns: Monumental Editorial Typography */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 2xl:space-y-10">
          
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 backdrop-blur-md max-w-full shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#F59E0B] animate-pulse flex-shrink-0" />
            <span className="font-mono text-[9px] xs:text-[10px] sm:text-[11px] 2xl:text-xs uppercase tracking-[0.08em] xs:tracking-[0.12em] sm:tracking-[0.16em] text-[#FDBA74] leading-tight">
              Indian Rupee SIPs · NPCI AutoPay · 1% TDS Reconciled
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-[82px] 2xl:text-[96px] 3xl:text-[108px] font-semibold text-white tracking-editorial leading-[1.04] sm:leading-[0.98]">
            Quietly building<br />
            <span className="font-serif-italic font-light text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-[96px] 2xl:text-[112px] 3xl:text-[124px] text-[#F59E0B] pr-2">
              generational
            </span><br />
            crypto wealth.
          </h1>

          {/* Editorial Lead Paragraph */}
          <p className="text-sm sm:text-lg md:text-xl 2xl:text-2xl text-[#A39E93] max-w-xl 2xl:max-w-2xl font-normal leading-relaxed">
            Retire from 3 AM chart anxiety and speculative noise. Invest from{" "}
            <strong className="text-white font-semibold">₹1,000/month</strong> into rule-based, market-cap weighted crypto baskets—automated via UPI AutoPay.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            <Link 
              href="/signup" 
              className="btn-unseen bg-white text-[#0B0A09] hover:bg-[#EAE6DE] hover:text-[#0B0A09] px-6 sm:px-8 2xl:px-9 py-3.5 sm:py-4 2xl:py-4.5 text-xs sm:text-sm 2xl:text-base font-semibold tracking-wide shadow-sm hover:shadow-[0_8px_30px_rgba(255,255,255,0.18)] cursor-pointer text-center justify-center transition-all"
            >
              <span className="flex items-center justify-center gap-2 sm:gap-2.5">
                Get Started
                <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
              </span>
            </Link>

            <button 
              type="button"
              suppressHydrationWarning
              onClick={openUPIModal} 
              className="btn-unseen-light px-6 sm:px-7 2xl:px-8 py-3.5 sm:py-4 2xl:py-4.5 text-xs sm:text-sm 2xl:text-base font-semibold text-white/90 hover:text-white cursor-pointer text-center justify-center transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                Simulate UPI Mandate
              </span>
            </button>
          </div>

          {/* Micro Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 sm:pt-8 2xl:pt-10 border-t border-white/10 max-w-lg 2xl:max-w-xl">
            <div>
              <div className="font-mono text-[8px] xs:text-[9px] sm:text-[10px] uppercase tracking-wider text-[#736E65]">Minimum Habit</div>
              <div className="font-serif-italic text-lg sm:text-2xl md:text-3xl text-white mt-0.5 whitespace-nowrap">
                ₹1,000<span className="font-sans text-[10px] sm:text-xs not-italic text-[#736E65]">/mo</span>
              </div>
            </div>
            <div>
              <div className="font-mono text-[8px] xs:text-[9px] sm:text-[10px] uppercase tracking-wider text-[#736E65]">Rebalancing</div>
              <div className="font-serif-italic text-lg sm:text-2xl md:text-3xl text-white mt-0.5 whitespace-nowrap">
                Monthly <span className="font-sans text-[10px] sm:text-xs not-italic text-emerald-400">Auto</span>
              </div>
            </div>
            <div>
              <div className="font-mono text-[8px] xs:text-[9px] sm:text-[10px] uppercase tracking-wider text-[#736E65]">Custody Standard</div>
              <div className="font-serif-italic text-lg sm:text-2xl md:text-3xl text-white mt-0.5 whitespace-nowrap">
                1:1 <span className="font-sans text-[10px] sm:text-xs not-italic text-[#736E65]">Cold</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Floating Live Mandate Glass Artifact */}
        <div className="lg:col-span-5">
          <div className="tilt-card p-5 sm:p-7 md:p-8 2xl:p-9 3xl:p-10 animate-float bg-[#13110F]/90 border border-[#F59E0B]/25 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(245,158,11,0.12)]">
            <div className="tilt-card-content space-y-5 sm:space-y-6 2xl:space-y-7">
              
              <div className="flex items-start justify-between border-b border-white/10 pb-4 sm:pb-5 gap-2">
                <div>
                  <span className="font-mono text-[9px] sm:text-[10px] 2xl:text-[11px] uppercase tracking-[0.2em] text-[#F59E0B]">Active Folio · #IND-8841</span>
                  <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-semibold text-white tracking-editorial mt-1">
                    Top-5 <span className="font-serif-italic font-normal text-2xl sm:text-3xl 2xl:text-4xl text-[#F59E0B]">Bluechip</span> SIP
                  </h3>
                  <p className="text-[11px] sm:text-xs 2xl:text-sm text-[#A39E93] mt-0.5">HDFC Bank UPI AutoPay · 5th of every month</p>
                </div>
                <span className="px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] 2xl:text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex-shrink-0 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Compounding
                </span>
              </div>

              {/* Portfolio Valuation Display */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 2xl:gap-5 bg-[#1A1713] p-3.5 sm:p-4 2xl:p-5 rounded-2xl border border-white/10">
                <div>
                  <div className="font-mono text-[9px] sm:text-[10px] 2xl:text-[11px] uppercase tracking-wider text-[#736E65]">Current NAV Value</div>
                  <div id="hero-folio-valuation" className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-white font-mono mt-1">
                    ₹{formatINR(liveValuation)}
                  </div>
                  <div id="hero-folio-nav" className="text-[9px] sm:text-[10px] 2xl:text-[11px] text-[#A39E93] font-mono mt-0.5">
                    Top-5 NAV: ₹{(top5?.nav || 100).toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[9px] sm:text-[10px] 2xl:text-[11px] uppercase tracking-wider text-[#736E65]">Net XIRR Return</div>
                  <div id="hero-folio-xirr" className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-emerald-400 font-mono mt-1">
                    +31.4%
                  </div>
                  <div className="text-[9px] sm:text-[10px] 2xl:text-[11px] text-emerald-400 font-mono mt-0.5 flex items-center justify-end gap-1">
                    <span className="oracle-pulse-live" style={{ width: 5, height: 5 }} /> Streaming
                  </div>
                </div>
              </div>

              {/* Constituent Weights Breakdown */}
              <div className="space-y-2.5 2xl:space-y-3">
                <div className="flex justify-between text-[10px] sm:text-[11px] 2xl:text-xs font-mono uppercase tracking-wider text-[#736E65]">
                  <span>Automatic Allocation</span>
                  <span>Rebalanced 4d ago</span>
                </div>
                <div className="w-full h-2 2xl:h-2.5 rounded-full overflow-hidden flex bg-white/10">
                  <div style={{ width: "55%", background: "#D97706" }} />
                  <div style={{ width: "20%", background: "#4F46E5" }} />
                  <div style={{ width: "10%", background: "#0D9488" }} />
                  <div style={{ width: "8%", background: "#CA8A04" }} />
                  <div style={{ width: "7%", background: "#64748B" }} />
                </div>
                <div className="grid grid-cols-5 gap-1 sm:gap-1.5 2xl:gap-2 pt-2 text-center">
                  <div className="bg-[#1A1713] py-1.5 sm:py-2 2xl:py-2.5 px-0.5 rounded-xl border border-white/10">
                    <div className="font-mono text-[9px] sm:text-[10px] 2xl:text-xs font-bold text-white">BTC</div>
                    <div className="text-[9px] sm:text-[10px] 2xl:text-xs text-[#F59E0B] font-mono">55%</div>
                  </div>
                  <div className="bg-[#1A1713] py-1.5 sm:py-2 2xl:py-2.5 px-0.5 rounded-xl border border-white/10">
                    <div className="font-mono text-[9px] sm:text-[10px] 2xl:text-xs font-bold text-white">ETH</div>
                    <div className="text-[9px] sm:text-[10px] 2xl:text-xs text-[#818CF8] font-mono">20%</div>
                  </div>
                  <div className="bg-[#1A1713] py-1.5 sm:py-2 2xl:py-2.5 px-0.5 rounded-xl border border-white/10">
                    <div className="font-mono text-[9px] sm:text-[10px] 2xl:text-xs font-bold text-white">SOL</div>
                    <div className="text-[9px] sm:text-[10px] 2xl:text-xs text-[#2DD4BF] font-mono">10%</div>
                  </div>
                  <div className="bg-[#1A1713] py-1.5 sm:py-2 2xl:py-2.5 px-0.5 rounded-xl border border-white/10">
                    <div className="font-mono text-[9px] sm:text-[10px] 2xl:text-xs font-bold text-white">BNB</div>
                    <div className="text-[9px] sm:text-[10px] 2xl:text-xs text-[#FACC15] font-mono">8%</div>
                  </div>
                  <div className="bg-[#1A1713] py-1.5 sm:py-2 2xl:py-2.5 px-0.5 rounded-xl border border-white/10">
                    <div className="font-mono text-[9px] sm:text-[10px] 2xl:text-xs font-bold text-white">XRP</div>
                    <div className="text-[9px] sm:text-[10px] 2xl:text-xs text-[#94A3B8] font-mono">7%</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col xs:flex-row xs:items-center justify-between text-xs 2xl:text-sm text-[#A39E93] gap-2">
                <span className="font-mono text-[10px] sm:text-[11px] 2xl:text-xs truncate text-emerald-400 inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  Section 194S TDS Ready
                </span>
                <button 
                  type="button"
                  suppressHydrationWarning
                  onClick={() => openBasketInspector("top-5-index")} 
                  className="font-semibold text-white underline underline-offset-2 decoration-[#F59E0B]/50 hover:decoration-[#F59E0B] hover:text-[#F59E0B] transition-colors cursor-pointer text-[11px] sm:text-xs 2xl:text-sm whitespace-nowrap text-left xs:text-right"
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
