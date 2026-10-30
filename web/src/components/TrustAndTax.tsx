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
      <div id="faq" className="max-w-3xl mx-auto space-y-3.5 sm:space-y-4 pt-10 scroll-mt-24">
        <div className="text-center mb-8 sm:mb-10">
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#F59E0B]">Clarity First</span>
          <h3 className="text-2xl xs:text-3xl sm:text-4xl font-semibold text-white tracking-editorial mt-2">
            Questions Indian <span className="font-serif-italic font-normal text-3xl xs:text-4xl sm:text-5xl text-[#F59E0B]">investors</span> ask.
          </h3>
          <p className="text-xs sm:text-sm text-[#A39E93] mt-2 max-w-xl mx-auto">
            Everything you need to know about Indian VDA taxation, 1% TDS, NPCI UPI AutoPay, and 1:1 custody.
          </p>
        </div>

        {/* 1. Legality */}
        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl" open>
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>Is a monthly crypto SIP legal under Indian regulations?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            Yes. Virtual Digital Assets (VDAs) are recognized, regulated, and taxed under the Indian Finance Act 2022 (Sections 115BBH and 194S). Baskly operates fully within this domestic legal framework, mandating PAN verification, direct Indian bank settlement via NPCI rails, and automated TDS deductions.
          </p>
        </details>

        {/* 2. Indian VDA Taxation */}
        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl">
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>How is crypto taxed in India, and how does Baskly help?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            Under Section 115BBH of the Income Tax Act, net gains from the transfer of Virtual Digital Assets are taxed at a flat 30% (plus applicable surcharge and cess). Losses from one digital asset cannot be set off against gains from another. Baskly simplifies compliance by automatically generating downloadable, CA-ready transaction ledgers with calculated cost basis and NAV snapshots for seamless ITR filing.
          </p>
        </details>

        {/* 3. Section 194S 1% TDS */}
        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl">
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>How does the mandatory 1% TDS (Section 194S) work on Baskly?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            Under Section 194S, a statutory 1% Tax Deducted at Source (TDS) applies to all VDA transfers and redemptions. When you redeem units or execute a rebalance that triggers a transfer, Baskly automatically calculates and deducts the 1% TDS and deposits it against your verified PAN. You can cross-verify these credits directly on your annual Form 26AS / AIS on the Income Tax Portal.
          </p>
        </details>

        {/* 4. Baskets vs Picking Coins */}
        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl">
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>Why choose a basket over buying individual coins on an exchange?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            Individual digital assets experience extreme volatility and boom-and-bust cycles. Research shows that over 90% of retail day-traders lose capital attempting to time market tops and bottoms. A rule-based basket provides broad market diversification across top institutional assets, eliminating the need to guess which token will outperform next.
          </p>
        </details>

        {/* 5. Monthly Rebalancing */}
        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl">
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>How does monthly automated rebalancing work?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            Every 30 days, Baskly&apos;s quantitative engine checks portfolio drift against target weights. If an asset has surged and now represents a higher percentage than its target allocation, the engine automatically trims the profit and reallocates it into lagging quality assets. This disciplined process locks in gains and accumulates undervalued assets without emotional bias.
          </p>
        </details>

        {/* 6. Dynamic NAV Calculation */}
        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl">
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>How is the Net Asset Value (NAV) of each basket determined?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            Every basket is anchored to a baseline inception NAV of ₹100.00. Our Real-Time Pricing Oracle calculates dynamic NAV by combining high-frequency constituent prices via Binance WebSocket miniTickers and Indian Rupee spot rates from CoinDCX. This ensures live, transparent pricing directly in Rupees.
          </p>
        </details>

        {/* 7. UPI AutoPay Mandate */}
        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl">
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>How does the monthly SIP payment work via UPI AutoPay?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            Baskly utilizes NPCI UPI AutoPay rails. During onboarding, you authorize a recurring UPI mandate from your preferred Indian UPI app (Google Pay, PhonePe, Paytm, BHIM, or your bank app). Your chosen monthly SIP amount is then automatically debited on your scheduled date and invested into your selected basket units.
          </p>
        </details>

        {/* 8. Pause / Cancel autonomy */}
        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl">
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>Can I pause, edit, or cancel my SIP mandate anytime?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            Yes, with zero penalty. You maintain 100% autonomy over your capital. You can pause, adjust the monthly amount, or revoke your UPI mandate at any time directly through the Baskly dashboard or directly within your UPI app in seconds.
          </p>
        </details>

        {/* 9. Zero Lock-In & Bank Redemption */}
        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl">
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>Is my capital locked in, and how do withdrawals work?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            There is 0% lock-in. You can redeem partial or full basket holdings anytime at the live NAV. Redemption proceeds are processed via IMPS/NEFT straight into your verified Indian bank account with standard T+1 settlement. We never use peer-to-peer (P2P) transfers, protecting your bank account from freeze risks.
          </p>
        </details>

        {/* 10. Cold Custody */}
        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl">
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>Where are my underlying crypto assets stored?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            Every unit you own is backed 1:1 by physical underlying assets held in segregated, multi-signature cold storage vaults. We maintain proof of reserves and do not lend out, re-hypothecate, or leverage client deposits under any circumstance.
          </p>
        </details>

        {/* 11. Circuit Breaker */}
        <details className="tilt-card p-4 sm:p-6 cursor-pointer group bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-lg backdrop-blur-xl">
          <summary className="tilt-card-content font-semibold text-white text-sm sm:text-base list-none flex justify-between items-center gap-3">
            <span>What is the Baskly Emergency Circuit Breaker?</span>
            <span className="font-mono text-xs text-[#F59E0B] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
          </summary>
          <p className="tilt-card-content text-xs sm:text-sm text-[#A39E93] mt-3 leading-relaxed">
            The Circuit Breaker is an automated safeguard built into our pricing scheduler. In the event of extreme market volatility, network oracles disconnecting, or severe liquidity decoupling, the system immediately freezes NAV updates and prevents order fills to protect investor portfolios from predatory slippage and pricing anomalies.
          </p>
        </details>
      </div>
    </section>
  );
}
