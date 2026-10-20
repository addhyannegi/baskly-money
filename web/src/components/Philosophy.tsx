import React from "react";
import { Compass, IndianRupee, ShieldCheck } from "lucide-react";

export default function Philosophy() {
  return (
    <section id="methodology" className="py-16 sm:py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-end mb-10 sm:mb-16">
        <div className="lg:col-span-7">
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#9A7B56]">
            01 — The Manifesto
          </span>
          <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#121110] tracking-editorial mt-3 leading-[1.04]">
            Why 92% of traders lose.<br />
            And why <span className="font-serif-italic font-light text-4xl xs:text-5xl sm:text-6xl lg:text-7xl text-[#9A7B56]">patience</span> wins.
          </h2>
        </div>
        <div className="lg:col-span-5 text-sm sm:text-base text-[#5C5752] leading-relaxed">
          Speculative exchanges are engineered like casinos—flashing red and green to provoke impulsive trades. Baskly is engineered like a private wealth endowment: mathematical weights, monthly rebalancing, and calm rupee-cost averaging.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-7">
        
        {/* Pillar 1 */}
        <div className="tilt-card p-6 sm:p-8 md:p-9 flex flex-col justify-between h-full">
          <div className="tilt-card-content">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <span className="font-mono text-xs text-[#9A7B56]">/ 01</span>
              <Compass className="w-5 h-5 text-[#121110]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#121110] tracking-editorial mb-3">
              Baskets, <span className="font-serif-italic font-normal text-2xl sm:text-3xl">Not Bets</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
              Never guess which token will outperform next quarter. Own the entire digital asset economy through strict market-cap weighted indices that trim winners and accumulate laggards every 30 days.
            </p>
          </div>
          <div className="tilt-card-content mt-6 sm:mt-10 pt-4 border-t border-[#121110]/10 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#0F6E56]">
            ● Zero Emotional Bias
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="tilt-card p-6 sm:p-8 md:p-9 flex flex-col justify-between h-full">
          <div className="tilt-card-content">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <span className="font-mono text-xs text-[#9A7B56]">/ 02</span>
              <IndianRupee className="w-5 h-5 text-[#121110]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#121110] tracking-editorial mb-3">
              Rupees In, <span className="font-serif-italic font-normal text-2xl sm:text-3xl">Rupees Out</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
              Forget shady P2P bank freezes, USDT conversion spreads, or lost seed phrases. Authorize a standard UPI AutoPay mandate from your Indian bank account and redeem directly to INR anytime.
            </p>
          </div>
          <div className="tilt-card-content mt-6 sm:mt-10 pt-4 border-t border-[#121110]/10 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#0F6E56]">
            ● Direct NPCI Banking Rails
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="tilt-card p-6 sm:p-8 md:p-9 flex flex-col justify-between h-full">
          <div className="tilt-card-content">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <span className="font-mono text-xs text-[#9A7B56]">/ 03</span>
              <ShieldCheck className="w-5 h-5 text-[#121110]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#121110] tracking-editorial mb-3">
              1:1 Custody & <span className="font-serif-italic font-normal text-2xl sm:text-3xl">Tax Clarity</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
              Every basket unit is backed 1:1 in institutional multi-sig cold vaults with zero lending out. Section 194S 1% TDS is automatically filed against your PAN with clean CA-ready annual reports.
            </p>
          </div>
          <div className="tilt-card-content mt-6 sm:mt-10 pt-4 border-t border-[#121110]/10 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#0F6E56]">
            ● Form 26AS Synchronised
          </div>
        </div>

      </div>
    </section>
  );
}
