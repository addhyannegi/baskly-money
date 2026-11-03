import React from "react";
import { FileCheck2, ShieldCheck, SmartphoneNfc, Landmark } from "lucide-react";

export default function TrustAndTax() {
  return (
    <section id="trust" className="py-16 sm:py-20 md:py-28 2xl:py-36 max-w-7xl 2xl:max-w-[1520px] 3xl:max-w-[1780px] 4xl:max-w-[1980px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 3xl:px-16">
      <div className="max-w-3xl 2xl:max-w-4xl mb-10 sm:mb-16 2xl:mb-20">
        <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-semibold text-white tracking-editorial leading-[1.05]">
          Engineered for <span className="font-serif-italic font-light text-4xl xs:text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl text-[#F59E0B]">Indian</span> regulatory peace of mind.
        </h2>
      </div>

      {/* 4 Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 2xl:gap-7 3xl:gap-8">
        
        <div className="tilt-card p-5 sm:p-7 2xl:p-8 space-y-3 sm:space-y-4 h-full bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-xl backdrop-blur-xl">
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
    </section>
  );
}
