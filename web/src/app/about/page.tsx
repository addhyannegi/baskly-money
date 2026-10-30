import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ModalsContainer from "@/components/modals/ModalsContainer";
import {
  Compass,
  IndianRupee,
  RefreshCw,
  FileCheck2,
  Lock,
  ArrowUpRight,
  Cpu,
  Layers,
} from "lucide-react";

export const metadata = {
  title: "About Us · Baskly.money",
  description:
    "Institutional discipline, calm design, and Indian regulatory clarity for systematic digital asset accumulation in Rupees.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F4EFEA] text-[#121110] relative selection:bg-[#9A7B56]/20">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 sm:pt-24 md:pt-32 pb-16 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBE3DA] border border-[#121110]/10 text-[#9A7B56] text-xs font-mono uppercase tracking-[0.2em] mb-6">
            <Compass className="w-3.5 h-3.5" />
            <span>01 — Our Mission & Manifesto</span>
          </div>

          <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-editorial text-[#121110] leading-[1.04] mb-8">
            Bringing institutional <span className="font-serif-italic font-light text-[#9A7B56]">discipline</span>,
            calm design, and regulatory clarity to Indian wealth.
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-[#5C5752] leading-relaxed max-w-3xl">
            Baskly was engineered to replace speculative, casino-like crypto exchanges with institutional calm, rule-based index baskets, automated monthly rebalancing, and native rupee SIPs.
          </p>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-16 sm:py-20 border-t border-[#121110]/10 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#9A7B56]">
              02 — The Problem We Solve
            </span>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl font-semibold tracking-editorial text-[#121110] mt-3 leading-tight">
              Why retail crypto in India was <span className="font-serif-italic font-normal text-[#9A7B56]">broken</span>.
            </h2>
            <p className="text-sm sm:text-base text-[#5C5752] mt-3 leading-relaxed">
              For years, everyday Indian investors navigating digital assets faced four systemic barriers designed against their long-term success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Problem 1 */}
            <div className="tilt-card p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#B85D43]/10 text-[#B85D43] flex items-center justify-center font-mono text-sm font-bold">
                01
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#121110] tracking-editorial">
                Emotional Speculation & Day-Trading
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                Traditional exchanges are structured like casinos—flashing red and green charts to provoke impulsive trades. Statistical studies consistently indicate that over 90% of active retail traders lose capital trying to time short-term momentum.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="tilt-card p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#B85D43]/10 text-[#B85D43] flex items-center justify-center font-mono text-sm font-bold">
                02
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#121110] tracking-editorial">
                P2P Bank Freeze Risks & Shady Spreads
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                Peer-to-peer (P2P) crypto payments expose Indian bank accounts to unwarranted cybercrime liens, predatory USDT conversion premiums, and opaque settlement counterparties.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="tilt-card p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#B85D43]/10 text-[#B85D43] flex items-center justify-center font-mono text-sm font-bold">
                03
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#121110] tracking-editorial">
                Tax & Compliance Anxiety
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                The Indian Finance Act 2022 established flat 30% VDA taxation, zero loss set-off, and mandatory 1% Section 194S TDS. Calculating, recording, and reporting individual trades across exchanges creates immense filing friction for taxpayers and Chartered Accountants.
              </p>
            </div>

            {/* Problem 4 */}
            <div className="tilt-card p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#B85D43]/10 text-[#B85D43] flex items-center justify-center font-mono text-sm font-bold">
                04
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#121110] tracking-editorial">
                Token Picking Fatigue
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                With thousands of speculative digital assets created weekly, guessing which individual coin will survive long-term compounding cycles is nearly impossible. Broad index baskets remove this guesswork entirely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Baskly Actually Does */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#9A7B56]">
            03 — The Baskly Solution
          </span>
          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-semibold tracking-editorial text-[#121110] mt-3 leading-tight">
            How Baskly works for <span className="font-serif-italic font-normal text-[#9A7B56]">Indian</span> investors.
          </h2>
          <p className="text-sm sm:text-base text-[#5C5752] mt-3 leading-relaxed">
            Every feature on Baskly is engineered for long-horizon compounding, absolute liquidity, and peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="tilt-card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center mb-6">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#121110] tracking-editorial mb-2">
                6 Thematic Baskets
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                Market-cap weighted indices ranging from Top-5 Bluechips and Crypto + Gold Reserve to Pure Bitcoin Sovereign, Ethereum Settlement Layer, and DeFi Protocol Architects.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#121110]/10 font-mono text-[11px] text-[#0F6E56]">
              ● Diversified Core
            </div>
          </div>

          {/* Feature 2 */}
          <div className="tilt-card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#9A7B56]/15 text-[#9A7B56] flex items-center justify-center mb-6">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#121110] tracking-editorial mb-2">
                Automated 30-Day Rebalancing
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                Our quantitative engine realigns portfolio drift every month—trimming assets that appreciated beyond their allocation to lock in gains and accumulating quality laggards at discount prices.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#121110]/10 font-mono text-[11px] text-[#0F6E56]">
              ● Zero Emotional Bias
            </div>
          </div>

          {/* Feature 3 */}
          <div className="tilt-card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#121110]/8 text-[#121110] flex items-center justify-center mb-6">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#121110] tracking-editorial mb-2">
                Native NPCI UPI AutoPay
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                Connect your Indian bank account via Google Pay, PhonePe, Paytm, or BHIM. Automated recurring monthly debits with 0% lock-in and 1-click mandate cancellation anytime.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#121110]/10 font-mono text-[11px] text-[#0F6E56]">
              ● Direct Banking Rails
            </div>
          </div>

          {/* Feature 4 */}
          <div className="tilt-card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center mb-6">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#121110] tracking-editorial mb-2">
                Section 194S 1% TDS Automated
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                Every redemption automatically deducts the statutory 1% TDS and deposits it against your PAN. Instantly download ready-to-file Form 26AS reports for seamless tax compliance.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#121110]/10 font-mono text-[11px] text-[#0F6E56]">
              ● CA-Ready Ledger
            </div>
          </div>

          {/* Feature 5 */}
          <div className="tilt-card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#9A7B56]/15 text-[#9A7B56] flex items-center justify-center mb-6">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#121110] tracking-editorial mb-2">
                1:1 Segregated Cold Custody
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                Every unit issued is backed 100% by physical underlying assets held in segregated multi-signature cold vaults. We practice zero lending, zero re-hypothecation, and zero leverage.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#121110]/10 font-mono text-[11px] text-[#0F6E56]">
              ● Proof of Reserves
            </div>
          </div>

          {/* Feature 6 */}
          <div className="tilt-card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#121110]/8 text-[#121110] flex items-center justify-center mb-6">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#121110] tracking-editorial mb-2">
                Live Pricing Oracle & Circuit Breaker
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                Transparent NAV calculations anchored to ₹100.00 base. Live pricing feeds from Binance WebSocket and CoinDCX INR conversion, with an automated Circuit Breaker that freezes updates during market decoupling.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#121110]/10 font-mono text-[11px] text-[#0F6E56]">
              ● Institutional Safeguard
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 sm:py-24 border-t border-[#121110]/10 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#9A7B56]">
              04 — Guiding Principles
            </span>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl font-semibold tracking-editorial text-[#121110] mt-3 leading-tight">
              The values that dictate our <span className="font-serif-italic font-normal text-[#9A7B56]">code</span>.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            <div className="p-6 rounded-2xl bg-[#F4EFEA] border border-[#121110]/10 space-y-3">
              <div className="font-mono text-xs text-[#9A7B56]">01 / METHODOLOGY</div>
              <h3 className="text-lg font-semibold text-[#121110]">Compounding over Timing</h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                Rupee-Cost Averaging across market cycles consistently beats emotional market timing for 99% of wealth builders.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F4EFEA] border border-[#121110]/10 space-y-3">
              <div className="font-mono text-xs text-[#9A7B56]">02 / COMPLIANCE</div>
              <h3 className="text-lg font-semibold text-[#121110]">Compliance by Design</h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                We operate strictly within the legal framework of Indian VDA taxation, PAN verification, and direct banking rails.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F4EFEA] border border-[#121110]/10 space-y-3">
              <div className="font-mono text-xs text-[#9A7B56]">03 / INTEGRITY</div>
              <h3 className="text-lg font-semibold text-[#121110]">Radical Transparency</h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                Zero hidden exit loads, zero withdrawal penalties, and 100% public visibility into basket weights and live NAV math.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F4EFEA] border border-[#121110]/10 space-y-3">
              <div className="font-mono text-xs text-[#9A7B56]">04 / EXPERIENCE</div>
              <h3 className="text-lg font-semibold text-[#121110]">Institutional Calm</h3>
              <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
                An Apple-minimalist alabaster palette designed to inspire discipline, focus, and peace of mind rather than FOMO.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-[#121110] text-[#F4EFEA] p-8 sm:p-12 md:p-16 relative overflow-hidden text-center max-w-4xl mx-auto shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A97E]">
              Disciplined Wealth Building
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-editorial leading-tight">
              Ready to start your systematic <span className="font-serif-italic font-normal text-[#C8A97E]">Rupee SIP</span>?
            </h2>
            <p className="text-sm sm:text-base text-[#BDB5AB] leading-relaxed">
              Explore the 6 curated baskets, calculate your compound returns, or automate your monthly debit via UPI AutoPay in under 3 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/#baskets"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FAF8F5] text-[#121110] font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#EBE3DA] transition-all cursor-pointer"
              >
                <span>Explore Baskets</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#calculator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#FAF8F5]/20 text-[#FAF8F5] font-medium text-xs sm:text-sm hover:bg-white/10 transition-all cursor-pointer"
              >
                <span>Run Compounding Calculator</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
      <ModalsContainer />
    </main>
  );
}
