import React from "react";
import { FileCheck2, ShieldCheck, SmartphoneNfc, Landmark } from "lucide-react";

export default function TrustAndTax() {
  return (
    <section id="trust" className="py-16 sm:py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="max-w-3xl mb-10 sm:mb-16">
        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#F59E0B]">
          05 — Institutional Architecture
        </span>
        <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-editorial mt-3 leading-[1.05]">
          Engineered for <span className="font-serif-italic font-light text-4xl xs:text-5xl sm:text-6xl lg:text-7xl text-[#F59E0B]">Indian</span> regulatory peace of mind.
        </h2>
      </div>

      {/* 4 Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20">
        
        <div className="tilt-card p-5 sm:p-7 space-y-3 sm:space-y-4 h-full bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-xl backdrop-blur-xl">
          <div className="tilt-card-content space-y-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#736E65]">Section 194S</div>
            <h3 className="text-lg sm:text-xl font-semibold text-white tracking-editorial">1% TDS Automated</h3>
            <p className="text-xs text-[#A39E93] leading-relaxed">
              Every rebalance or redemption automatically computes and deposits 1% TDS against your PAN. Download ready-to-file Form 26AS & ITR schedules in one click.
            </p>
          </div>
        </div>

        <div className="tilt-card p-5 sm:p-7 space-y-3 sm:space-y-4 h-full bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-xl backdrop-blur-xl">
          <div className="tilt-card-content space-y-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#736E65]">Proof of Reserves</div>
            <h3 className="text-lg sm:text-xl font-semibold text-white tracking-editorial">1:1 Cold Custody</h3>
            <p className="text-xs text-[#A39E93] leading-relaxed">
              Your basket units are backed 100% by real underlying coins in segregated multi-signature cold storage. Zero lending, zero leverage, zero commingling.
            </p>
          </div>
        </div>

        <div className="tilt-card p-5 sm:p-7 space-y-3 sm:space-y-4 h-full bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-xl backdrop-blur-xl">
          <div className="tilt-card-content space-y-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <SmartphoneNfc className="w-5 h-5" />
            </div>
            <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#736E65]">NPCI Protocol</div>
            <h3 className="text-lg sm:text-xl font-semibold text-white tracking-editorial">Native UPI AutoPay</h3>
            <p className="text-xs text-[#A39E93] leading-relaxed">
              Works seamlessly with Google Pay, PhonePe, Paytm, and BHIM. Pause, skip a month, or revoke your mandate directly from your UPI app in 5 seconds.
            </p>
          </div>
        </div>

        <div className="tilt-card p-5 sm:p-7 space-y-3 sm:space-y-4 h-full bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-xl backdrop-blur-xl">
          <div className="tilt-card-content space-y-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#736E65]">Zero Lock-In</div>
            <h3 className="text-lg sm:text-xl font-semibold text-white tracking-editorial">T+1 INR Liquidity</h3>
            <p className="text-xs text-[#A39E93] leading-relaxed">
              Redeem partial or full units anytime at live NAV. Funds settle straight to your verified Indian bank account via IMPS/NEFT with zero P2P intermediary risk.
            </p>
          </div>
        </div>

      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="max-w-3xl mx-auto space-y-3.5 sm:space-y-4">
        <div className="text-center mb-8 sm:mb-10">
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#F59E0B]">Clarity First</span>
          <h3 className="text-2xl xs:text-3xl sm:text-4xl font-semibold text-white tracking-editorial mt-2">
            Questions Indian <span className="font-serif-italic font-normal text-3xl xs:text-4xl sm:text-5xl text-[#F59E0B]">investors</span> ask.
          </h3>
        </div>

        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl" open>
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>Is a monthly crypto SIP legal under Indian regulations?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            Yes. Virtual Digital Assets (VDAs) are regulated and taxed under the Finance Act 2022 (Section 115BBH & Section 194S). Baskly operates with full PAN/Aadhaar KYC verification, direct Indian bank settlement, and automated TDS reporting.
          </p>
        </details>

        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl">
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>Why choose a basket over buying Bitcoin or Solana on an exchange?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            Individual tokens go through extreme boom-and-bust cycles. A rule-based basket automatically rebalances monthly—trimming assets that have become overvalued and buying quality assets while they are undervalued—giving you smoother risk-adjusted compounding.
          </p>
        </details>

        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl">
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>Can I pause or cancel my UPI AutoPay mandate anytime?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            Yes, with zero penalty. You are in complete control of your mandate both inside Baskly and inside your Google Pay / PhonePe / Paytm Autopay settings.
          </p>
        </details>
      </div>
    </section>
  );
}
