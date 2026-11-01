import React from "react";
import { Compass, IndianRupee, ShieldCheck } from "lucide-react";

export default function Philosophy() {
  return (
    <section id="methodology" className="py-16 sm:py-20 md:py-28 2xl:py-36 max-w-7xl 2xl:max-w-[1520px] 3xl:max-w-[1780px] 4xl:max-w-[1980px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 3xl:px-16">
      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 2xl:gap-12 items-end mb-10 sm:mb-16 2xl:mb-20">
        <div className="lg:col-span-7">
          <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-semibold text-white tracking-editorial leading-[1.04]">
            Why 92% of traders lose.<br />
            And why <span className="font-serif-italic font-light text-4xl xs:text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl text-[#F59E0B]">patience</span> wins.
          </h2>
        </div>
        <div className="lg:col-span-5 text-sm sm:text-base 2xl:text-lg text-[#D4CFC7] leading-relaxed">
          Speculative exchanges are engineered like casinos—flashing red and green to provoke impulsive trades. Baskly is engineered like a private wealth endowment: mathematical weights, monthly rebalancing, and calm rupee-cost averaging.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-7 2xl:gap-8 3xl:gap-10">
        
        {/* Pillar 1 */}
        <div className="tilt-card p-6 sm:p-8 md:p-9 2xl:p-11 flex flex-col justify-between h-full bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-xl backdrop-blur-xl">
          <div className="tilt-card-content">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
                <Compass className="w-5 h-5 2xl:w-6 2xl:h-6" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-semibold text-white tracking-editorial mb-3">
              Baskets, <span className="font-serif-italic font-normal text-2xl sm:text-3xl 2xl:text-4xl text-[#F59E0B]">Not Bets</span>
            </h3>
            <p className="text-xs sm:text-sm 2xl:text-base text-[#D4CFC7] leading-relaxed">
              Never guess which token will outperform next quarter. Own the entire digital asset economy through strict market-cap weighted indices that trim winners and accumulate laggards every 30 days.
            </p>
          </div>
          <div className="tilt-card-content mt-6 sm:mt-10 2xl:mt-12 pt-4 border-t border-white/10 font-mono text-[10px] sm:text-[11px] 2xl:text-xs uppercase tracking-wider text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block flex-shrink-0 mr-2" />Zero Emotional Bias
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="tilt-card p-6 sm:p-8 md:p-9 2xl:p-11 flex flex-col justify-between h-full bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-xl backdrop-blur-xl">
          <div className="tilt-card-content">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
                <IndianRupee className="w-5 h-5 2xl:w-6 2xl:h-6" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-semibold text-white tracking-editorial mb-3">
              Rupees In, <span className="font-serif-italic font-normal text-2xl sm:text-3xl 2xl:text-4xl text-[#F59E0B]">Rupees Out</span>
            </h3>
            <p className="text-xs sm:text-sm 2xl:text-base text-[#D4CFC7] leading-relaxed">
              Forget shady P2P bank freezes, USDT conversion spreads, or lost seed phrases. Authorize a standard UPI AutoPay mandate from your Indian bank account and redeem directly to INR anytime.
            </p>
          </div>
          <div className="tilt-card-content mt-6 sm:mt-10 2xl:mt-12 pt-4 border-t border-white/10 font-mono text-[10px] sm:text-[11px] 2xl:text-xs uppercase tracking-wider text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block flex-shrink-0 mr-2" />Direct NPCI Banking Rails
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="tilt-card p-6 sm:p-8 md:p-9 2xl:p-11 flex flex-col justify-between h-full bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-xl backdrop-blur-xl">
          <div className="tilt-card-content">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
                <ShieldCheck className="w-5 h-5 2xl:w-6 2xl:h-6" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-semibold text-white tracking-editorial mb-3">
              1:1 Custody & <span className="font-serif-italic font-normal text-2xl sm:text-3xl 2xl:text-4xl text-[#F59E0B]">Tax Clarity</span>
            </h3>
            <p className="text-xs sm:text-sm 2xl:text-base text-[#D4CFC7] leading-relaxed">
              Every basket unit is backed 1:1 in institutional multi-sig cold vaults with zero lending out. Section 194S 1% TDS is automatically filed against your PAN with clean CA-ready annual reports.
            </p>
          </div>
          <div className="tilt-card-content mt-6 sm:mt-10 2xl:mt-12 pt-4 border-t border-white/10 font-mono text-[10px] sm:text-[11px] 2xl:text-xs uppercase tracking-wider text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block flex-shrink-0 mr-2" />Form 26AS Synchronised
          </div>
        </div>

      </div>
    </section>
  );
}
