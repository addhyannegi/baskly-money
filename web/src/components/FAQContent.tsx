"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, ChevronDown, HelpCircle, Mail, ArrowUpRight, Sparkles } from "lucide-react";

interface FAQItem {
  id: string;
  category: "taxes" | "upi" | "baskets" | "security";
  categoryLabel: string;
  question: string;
  answer: string;
  tags: string[];
}

const FAQ_ITEMS: FAQItem[] = [
  // 1. Taxes & Legality
  {
    id: "legality",
    category: "taxes",
    categoryLabel: "Legality & Taxes",
    question: "Is a monthly crypto SIP legal under Indian regulations?",
    answer:
      "Yes. Virtual Digital Assets (VDAs) are recognized, regulated, and taxed under the Indian Finance Act 2022 (Sections 115BBH and 194S). Baskly operates fully within this domestic legal framework, mandating PAN verification, direct Indian bank settlement via NPCI rails, and automated TDS deductions.",
    tags: ["legal", "regulation", "finance act", "pan", "npci"],
  },
  {
    id: "taxation",
    category: "taxes",
    categoryLabel: "Legality & Taxes",
    question: "How is crypto taxed in India, and how does Baskly help?",
    answer:
      "Under Section 115BBH of the Income Tax Act, net gains from the transfer of Virtual Digital Assets are taxed at a flat 30% (plus applicable surcharge and cess). Losses from one digital asset cannot be set off against gains from another. Baskly simplifies compliance by automatically generating downloadable, CA-ready transaction ledgers with calculated cost basis and NAV snapshots for seamless ITR filing.",
    tags: ["tax", "30%", "section 115bbh", "itr", "ca-ready", "ledger"],
  },
  {
    id: "tds",
    category: "taxes",
    categoryLabel: "Legality & Taxes",
    question: "How does the mandatory 1% TDS (Section 194S) work on Baskly?",
    answer:
      "Under Section 194S, a statutory 1% Tax Deducted at Source (TDS) applies to all VDA transfers and redemptions. When you redeem units or execute a rebalance that triggers a transfer, Baskly automatically calculates and deducts the 1% TDS and deposits it against your verified PAN. You can cross-verify these credits directly on your annual Form 26AS / AIS on the Income Tax Portal.",
    tags: ["tds", "1%", "section 194s", "form 26as", "ais", "pan"],
  },
  {
    id: "tds-verification",
    category: "taxes",
    categoryLabel: "Legality & Taxes",
    question: "How do I verify that my TDS has been credited to my Income Tax account?",
    answer:
      "Within 45 days after the end of each financial quarter, our automated tax filing system submits quarterly TDS returns (Form 26Q) to the Income Tax Department. You can log into incometax.gov.in and view the deducted TDS reflecting directly under Section 194S in your Form 26AS and Annual Information Statement (AIS).",
    tags: ["tds return", "form 26q", "incometax.gov.in", "verify"],
  },

  // 2. UPI AutoPay & SIP
  {
    id: "upi-autopay",
    category: "upi",
    categoryLabel: "UPI AutoPay & SIP",
    question: "How does the monthly SIP payment work via UPI AutoPay?",
    answer:
      "Baskly utilizes NPCI UPI AutoPay rails. During onboarding, you authorize a recurring UPI mandate from your preferred Indian UPI app (Google Pay, PhonePe, Paytm, BHIM, or your bank app). Your chosen monthly SIP amount is then automatically debited on your scheduled date and invested into your selected basket units.",
    tags: ["upi", "autopay", "mandate", "gpay", "phonepe", "paytm", "bhim"],
  },
  {
    id: "mandate-control",
    category: "upi",
    categoryLabel: "UPI AutoPay & SIP",
    question: "Can I pause, edit, or cancel my SIP mandate anytime?",
    answer:
      "Yes, with zero penalty. You maintain 100% autonomy over your capital. You can pause, adjust the monthly amount, or revoke your UPI mandate at any time directly through the Baskly dashboard or directly within your UPI app in seconds.",
    tags: ["pause", "cancel", "revoke", "modify", "sip amount", "penalty"],
  },
  {
    id: "withdrawals",
    category: "upi",
    categoryLabel: "UPI AutoPay & SIP",
    question: "Is my capital locked in, and how do withdrawals work?",
    answer:
      "There is 0% lock-in. You can redeem partial or full basket holdings anytime at the live NAV. Redemption proceeds are processed via IMPS/NEFT straight into your verified Indian bank account with standard T+1 settlement. We never use peer-to-peer (P2P) transfers, protecting your bank account from freeze risks.",
    tags: ["lock-in", "withdrawal", "redeem", "imps", "neft", "t+1", "bank", "p2p"],
  },
  {
    id: "minimum-investment",
    category: "upi",
    categoryLabel: "UPI AutoPay & SIP",
    question: "What is the minimum monthly investment to start a Baskly SIP?",
    answer:
      "You can start systematic compounding from just ₹1,000 per month. There are no account opening fees, no hidden maintenance charges, and no minimum holding commitments.",
    tags: ["minimum", "₹1000", "fees", "account opening", "cost"],
  },

  // 3. Baskets & Methodology
  {
    id: "baskets-vs-coins",
    category: "baskets",
    categoryLabel: "Baskets & Methodology",
    question: "Why choose a basket over buying individual coins on an exchange?",
    answer:
      "Individual digital assets experience extreme volatility and boom-and-bust cycles. Research shows that over 90% of retail day-traders lose capital attempting to time market tops and bottoms. A rule-based basket provides broad market diversification across top institutional assets, eliminating the need to guess which token will outperform next.",
    tags: ["diversification", "trading", "index", "volatility", "risk"],
  },
  {
    id: "rebalancing",
    category: "baskets",
    categoryLabel: "Baskets & Methodology",
    question: "How does monthly automated rebalancing work?",
    answer:
      "Every 30 days, Baskly's quantitative engine checks portfolio drift against target weights. If an asset has surged and now represents a higher percentage than its target allocation, the engine automatically trims the profit and reallocates it into lagging quality assets. This disciplined process locks in gains and accumulates undervalued assets without emotional bias.",
    tags: ["rebalance", "portfolio drift", "30 days", "target weight", "discipline"],
  },
  {
    id: "nav-calculation",
    category: "baskets",
    categoryLabel: "Baskets & Methodology",
    question: "How is the Net Asset Value (NAV) of each basket determined?",
    answer:
      "Every basket is anchored to a baseline inception NAV of ₹100.00. Our Real-Time Pricing Oracle calculates dynamic NAV by combining high-frequency constituent prices via Binance WebSocket miniTickers and Indian Rupee spot rates from CoinDCX. This ensures live, transparent pricing directly in Rupees.",
    tags: ["nav", "pricing oracle", "binance", "coindcx", "₹100", "websocket"],
  },

  // 4. Security & Custody
  {
    id: "cold-custody",
    category: "security",
    categoryLabel: "Security & Custody",
    question: "Where are my underlying crypto assets stored?",
    answer:
      "Every unit you own is backed 1:1 by physical underlying assets held in segregated, multi-signature cold storage vaults. We maintain proof of reserves and do not lend out, re-hypothecate, or leverage client deposits under any circumstance.",
    tags: ["custody", "cold storage", "multi-sig", "proof of reserves", "1:1", "safety"],
  },
  {
    id: "wallet-keys",
    category: "security",
    categoryLabel: "Security & Custody",
    question: "Do I need a separate crypto wallet or private keys?",
    answer:
      "No. Baskly provides institutional-grade custody so you never have to worry about lost seed phrases, compromised hardware wallets, or network gas fees. Everything is secured in multi-signature cold vaults while you track your portfolio seamlessly in INR.",
    tags: ["wallet", "private keys", "seed phrase", "hardware wallet", "gas fees"],
  },
  {
    id: "circuit-breaker",
    category: "security",
    categoryLabel: "Security & Custody",
    question: "What is the Baskly Emergency Circuit Breaker?",
    answer:
      "The Circuit Breaker is an automated safeguard built into our pricing scheduler. In the event of extreme market volatility, network oracles disconnecting, or severe liquidity decoupling, the system immediately freezes NAV updates and prevents order fills to protect investor portfolios from predatory slippage and pricing anomalies.",
    tags: ["circuit breaker", "safeguard", "freeze", "slippage", "oracle", "protection"],
  },
];

type CategoryFilter = "all" | "taxes" | "upi" | "baskets" | "security";

export default function FAQContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    legality: true, // First question open by default
  });

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "taxes", label: "Legality & Taxes" },
    { id: "upi", label: "UPI AutoPay & SIP" },
    { id: "baskets", label: "Baskets & Methodology" },
    { id: "security", label: "Security & Custody" },
  ];

  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      // Category match
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    filteredItems.forEach((item) => {
      allOpen[item.id] = true;
    });
    setOpenIds(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenIds({});
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Search and Category Filters */}
      <div className="max-w-3xl 2xl:max-w-4xl 3xl:max-w-5xl mx-auto space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C857B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. TDS, 30% tax, UPI mandate, rebalance, custody)..."
            suppressHydrationWarning
            data-lpignore="true"
            data-1p-ignore="true"
            autoComplete="off"
            className="w-full h-12 sm:h-13 pl-11 pr-10 rounded-2xl bg-[#13110F] border border-white/10 text-sm text-white placeholder:text-[#736E65] focus:outline-none focus:border-[#F59E0B]/50 focus:ring-1 focus:ring-[#F59E0B]/30 transition-all backdrop-blur-xl"
          />
          {searchQuery && (
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8C857B] hover:text-white transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills & Expand/Collapse Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count =
                cat.id === "all"
                  ? FAQ_ITEMS.length
                  : FAQ_ITEMS.filter((item) => item.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#F59E0B] text-[#0B0A09] font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                      : "bg-[#1A1713] text-[#A39E93] hover:text-white border border-white/10"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#8C857B]">
            <button
              type="button"
              suppressHydrationWarning
              onClick={handleExpandAll}
              className="hover:text-[#F59E0B] transition-colors cursor-pointer underline underline-offset-2"
            >
              Expand All
            </button>
            <span>·</span>
            <button
              type="button"
              suppressHydrationWarning
              onClick={handleCollapseAll}
              className="hover:text-[#F59E0B] transition-colors cursor-pointer underline underline-offset-2"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="max-w-3xl 2xl:max-w-4xl 3xl:max-w-5xl mx-auto space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#13110F]/60 rounded-3xl border border-white/5 space-y-3">
            <HelpCircle className="w-8 h-8 text-[#8C857B] mx-auto" />
            <h4 className="text-lg font-semibold text-white">No matching questions found</h4>
            <p className="text-xs sm:text-sm text-[#A39E93] max-w-md mx-auto">
              We couldn&apos;t find any questions matching &ldquo;{searchQuery}&rdquo;. Try another search term or get in touch with our team directly.
            </p>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-mono text-[#F59E0B] hover:underline cursor-pointer"
            >
              Reset search filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isOpen = !!openIds[item.id];
            return (
              <div
                key={item.id}
                className="tilt-card rounded-2xl bg-[#13110F]/90 border border-white/10 hover:border-[#F59E0B]/40 shadow-xl backdrop-blur-xl transition-colors overflow-hidden"
              >
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer select-none group"
                >
                  <div className="space-y-1.5 flex-1 pr-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#F59E0B] block">
                      {item.categoryLabel}
                    </span>
                    <span className="font-semibold text-white text-base sm:text-lg tracking-editorial group-hover:text-[#F59E0B] transition-colors leading-snug block">
                      {item.question}
                    </span>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0 transition-transform duration-200 mt-0.5 ${
                      isOpen ? "rotate-180 bg-white/10 text-[#F59E0B]" : "text-[#8C857B]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#D4CFC7] leading-relaxed border-t border-white/5 space-y-3">
                    <p>{item.answer}</p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono text-[#8C857B] bg-[#1A1713] border border-white/5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Institutional Support Reassurance Card */}
      <div className="max-w-3xl 2xl:max-w-4xl 3xl:max-w-5xl mx-auto">
        <div className="tilt-card p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#161310] via-[#100E0C] to-[#0D0B0A] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="tilt-card-content flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.16em] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Direct Desk Support
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-editorial">
                Have a specific tax or regulatory question?
              </h3>
              <p className="text-xs sm:text-sm text-[#A39E93] leading-relaxed">
                Our institutional compliance team assists with Form 26AS verification, CA reconciliation, high-volume mandates, and banking queries.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
              <a
                href="mailto:support@baskly.money"
                className="btn-unseen inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white text-[#0B0A09] hover:bg-[#EAE6DE] text-xs font-semibold uppercase tracking-wider cursor-pointer whitespace-nowrap shadow-md transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Desk</span>
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-[#1A1713] hover:bg-[#25221E] border border-white/10 text-white text-xs font-mono uppercase tracking-wider cursor-pointer whitespace-nowrap transition-all"
              >
                <span>View Baskets</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#F59E0B]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
