"use client";

import React from "react";
import { ArrowDownRight, Sparkles } from "lucide-react";
import { useBaskly } from "@/context/BasklyContext";
import { formatINR } from "@/data/baskets";

export default function Hero() {
  const { baskets, openUPIModal, openBasketInspector } = useBaskly();
  const top5 = baskets.find((b) => b.id === "top-5-index") || baskets[0];
  const baseFolioUnits = 4511.8;
  const liveValuation = Math.round(baseFolioUnits * (top5?.nav || 100));

  return (
    <section className="relative pt-6 sm:pt-8 md:pt-12 pb-16 sm:pb-24 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left 7 Columns: Monumental Editorial Typography */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 backdrop-blur-md max-w-full shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#F59E0B] animate-pulse flex-shrink-0" />
            <span className="font-mono text-[9px] xs:text-[10px] sm:text-[11px] uppercase tracking-[0.08em] xs:tracking-[0.12em] sm:tracking-[0.16em] text-[#FDBA74] leading-tight">
              Indian Rupee SIPs · NPCI AutoPay · 1% TDS Reconciled
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl xs:text-5xl sm:text-7xl lg:text-[82px] font-semibold text-white tracking-editorial leading-[1.0] sm:leading-[0.98]">
            Quietly building<br />
            <span className="font-serif-italic font-light text-5xl xs:text-6xl sm:text-8xl lg:text-[96px] text-[#F59E0B] pr-2">
              generational
            </span><br />
            crypto wealth.
          </h1>

          {/* Editorial Lead Paragraph */}
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-[#A39E93] max-w-xl font-normal leading-relaxed">
            Retire from 3 AM chart anxiety and speculative noise. Invest from{" "}
            <strong className="text-white font-semibold">₹1,000/month</strong> into rule-based, market-cap weighted crypto baskets—automated via UPI AutoPay.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 pt-2">
            <a 
              href="#baskets" 
              className="btn-unseen bg-white text-[#0B0A09] hover:bg-[#F59E0B] hover:text-[#0B0A09] px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold tracking-wide shadow-[0_4px_25px_rgba(245,158,11,0.25)] cursor-pointer text-center justify-center transition-all"
            >
              <span className="flex items-center justify-center gap-2 sm:gap-2.5">
                Explore 06 Curated Baskets
                <ArrowDownRight className="w-4 h-4 flex-shrink-0" />
              </span>
            </a>

            <button 
              type="button"
              onClick={openUPIModal} 
              className="btn-unseen-light px-6 sm:px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-[#F59E0B] hover:text-white cursor-pointer text-center justify-center transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                Simulate UPI Mandate
              </span>
            </button>
          </div>

          {/* Micro Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 sm:pt-8 border-t border-white/10 max-w-lg">
            <div>
              <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#736E65]">Minimum Habit</div>
              <div className="font-serif-italic text-xl sm:text-2xl md:text-3xl text-white mt-0.5">
                ₹1,000<span className="font-sans text-[10px] sm:text-xs not-italic text-[#736E65]">/mo</span>
              </div>
            </div>
            <div>
              <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#736E65]">Rebalancing</div>
              <div className="font-serif-italic text-xl sm:text-2xl md:text-3xl text-white mt-0.5">
                Monthly <span className="font-sans text-[10px] sm:text-xs not-italic text-emerald-400">Auto</span>
              </div>
            </div>
            <div>
              <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#736E65]">Custody Standard</div>
              <div className="font-serif-italic text-xl sm:text-2xl md:text-3xl text-white mt-0.5">
                1:1 <span className="font-sans text-[10px] sm:text-xs not-italic text-[#736E65]">Cold</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Floating Live Mandate Glass Artifact */}
        <div className="lg:col-span-5">
          <div className="tilt-card p-5 sm:p-7 md:p-8 animate-float bg-[#13110F]/90 border border-[#F59E0B]/25 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(245,158,11,0.12)]">
            <div className="tilt-card-content space-y-5 sm:space-y-6">
              
              <div className="flex items-start justify-between border-b border-white/10 pb-4 sm:pb-5 gap-2">
                <div>
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#F59E0B]">Active Folio · #IND-8841</span>
                  <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-editorial mt-1">
                    Top-5 <span className="font-serif-italic font-normal text-2xl sm:text-3xl text-[#F59E0B]">Bluechip</span> SIP
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#A39E93] mt-0.5">HDFC Bank UPI AutoPay · 5th of every month</p>
                </div>
                <span className="px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex-shrink-0">
                  ● Compounding
                </span>
              </div>

              {/* Portfolio Valuation Display */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-[#1A1713] p-3.5 sm:p-4 rounded-2xl border border-white/10">
                <div>
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#736E65]">Current NAV Value</div>
                  <div id="hero-folio-valuation" className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
                    ₹{formatINR(liveValuation)}
                  </div>
                  <div id="hero-folio-nav" className="text-[9px] sm:text-[10px] text-[#A39E93] font-mono mt-0.5">
                    Top-5 NAV: ₹{(top5?.nav || 100).toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#736E65]">Net XIRR Return</div>
                  <div id="hero-folio-xirr" className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-1">
                    +31.4%
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center justify-end gap-1">
                    <span className="oracle-pulse-live" style={{ width: 5, height: 5 }} /> Streaming
                  </div>
                </div>
              </div>

              {/* Constituent Weights Breakdown */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#736E65]">
                  <span>Automatic Allocation</span>
                  <span>Rebalanced 4d ago</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-white/10">
                  <div style={{ width: "55%", background: "#D97706" }} />
                  <div style={{ width: "20%", background: "#4F46E5" }} />
                  <div style={{ width: "10%", background: "#0D9488" }} />
                  <div style={{ width: "8%", background: "#CA8A04" }} />
                  <div style={{ width: "7%", background: "#1E293B" }} />
                </div>
                <div className="grid grid-cols-5 gap-1 sm:gap-1.5 pt-2 text-center">
                  <div className="bg-[#1A1713] py-1.5 sm:py-2 px-0.5 rounded-xl border border-white/10">
                    <div className="font-mono text-[9px] sm:text-[10px] font-bold text-white">BTC</div>
                    <div className="text-[9px] sm:text-[10px] text-[#F59E0B] font-mono">55%</div>
                  </div>
                  <div className="bg-[#1A1713] py-1.5 sm:py-2 px-0.5 rounded-xl border border-white/10">
                    <div className="font-mono text-[9px] sm:text-[10px] font-bold text-white">ETH</div>
                    <div className="text-[9px] sm:text-[10px] text-[#818CF8] font-mono">20%</div>
                  </div>
                  <div className="bg-[#1A1713] py-1.5 sm:py-2 px-0.5 rounded-xl border border-white/10">
                    <div className="font-mono text-[9px] sm:text-[10px] font-bold text-white">SOL</div>
                    <div className="text-[9px] sm:text-[10px] text-[#2DD4BF] font-mono">10%</div>
                  </div>
                  <div className="bg-[#1A1713] py-1.5 sm:py-2 px-0.5 rounded-xl border border-white/10">
                    <div className="font-mono text-[9px] sm:text-[10px] font-bold text-white">BNB</div>
                    <div className="text-[9px] sm:text-[10px] text-[#FACC15] font-mono">8%</div>
                  </div>
                  <div className="bg-[#1A1713] py-1.5 sm:py-2 px-0.5 rounded-xl border border-white/10">
                    <div className="font-mono text-[9px] sm:text-[10px] font-bold text-white">XRP</div>
                    <div className="text-[9px] sm:text-[10px] text-[#94A3B8] font-mono">7%</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#A39E93] gap-2">
                <span className="font-mono text-[10px] sm:text-[11px] truncate text-emerald-400">✓ Section 194S TDS Ready</span>
                <button 
                  type="button"
                  onClick={() => openBasketInspector("top-5-index")} 
                  className="font-semibold text-white underline underline-offset-4 hover:text-[#F59E0B] transition-colors cursor-pointer text-[11px] sm:text-xs whitespace-nowrap"
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
