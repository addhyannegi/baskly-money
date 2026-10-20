"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBaskly } from "@/context/BasklyContext";
import { ShieldCheck, X } from "lucide-react";

interface SocialItem {
  name: string;
  url?: string; // Optional: when provided, renders an <a> link; when undefined, renders as an intentional non-navigating placeholder
  icon: React.ReactNode;
  hoverClasses: string;
}

const SOCIAL_ITEMS: SocialItem[] = [
  {
    name: "LinkedIn",
    url: undefined, // Structure ready: add verified URL string when official channel is active
    hoverClasses:
      "hover:text-[#0A66C2] hover:border-[#0A66C2] hover:bg-[#0A66C2]/10",
    icon: (
      <svg className="w-[19px] h-[19px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 0-3.06 1.53 1.53 0 0 0 0 3.06m1.4 9.74V9.93H5.06v8.57h2.8z"/>
      </svg>
    ),
  },
  {
    name: "X",
    url: undefined, // Structure ready: add verified URL string when official channel is active
    hoverClasses:
      "hover:text-[#FFFFFF] hover:border-[#FFFFFF] hover:bg-white/10",
    icon: (
      <svg className="w-[17px] h-[17px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: "Instagram",
    url: undefined, // Structure ready: add verified URL string when official channel is active
    hoverClasses:
      "hover:text-[#E1306C] hover:border-[#E1306C] hover:bg-[#E1306C]/10",
    icon: (
      <svg className="w-[19px] h-[19px] fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    ),
  },
  {
    name: "YouTube",
    url: undefined, // Structure ready: add verified URL string when official channel is active
    hoverClasses:
      "hover:text-[#FF0000] hover:border-[#FF0000] hover:bg-[#FF0000]/10",
    icon: (
      <svg className="w-[19px] h-[19px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

interface LegalModalData {
  title: string;
  subtitle: string;
  clauses: { heading: string; body: string }[];
}

const LEGAL_DOCS: Record<string, LegalModalData> = {
  terms: {
    title: "Terms & Conditions",
    subtitle: "Baskly.money Platform & Algorithmic Index Agreement",
    clauses: [
      {
        heading: "1. Regulatory Nature of Platform",
        body: "Baskly.money provides automated algorithmic index tracking, recurring Rupee-Cost Averaging tools, and portfolio accounting software for Virtual Digital Assets (VDAs). Baskly is not a SEBI-registered Investment Adviser (RIA) or Portfolio Management Service (PMS). All index allocations are non-discretionary and initiated strictly upon the user's explicit mandate.",
      },
      {
        heading: "2. Eligibility & Indian Tax Residency",
        body: "To utilize Baskly.money services, you must be an Indian tax resident aged 18 years or older possessing a valid Permanent Account Number (PAN) issued by the Income Tax Department of India.",
      },
      {
        heading: "3. 1% Section 194S TDS Compliance",
        body: "In accordance with Section 194S of the Indian Income Tax Act 1961, tax deduction at source (TDS) of 1% is mandatorily deducted on the gross consideration of every VDA transfer or redemption. Deductions are deposited against your PAN with quarterly Form 16A certificates provided for seamless ITR filing.",
      },
      {
        heading: "4. Systematic Mandate & NPCI UPI AutoPay",
        body: "Recurring investment mandates configured via NPCI UPI AutoPay can be paused, skipped, or revoked at any time directly through your UPI application (Google Pay, PhonePe, Paytm, BHIM) or within the Baskly Investor Portal without penalty or lock-in periods.",
      },
      {
        heading: "5. Segregated 1:1 Cold Vault Custody",
        body: "All constituent digital assets backing basket units are held 1:1 in segregated institutional multi-signature cold storage vaults. Baskly strictly prohibits re-hypothecation, lending, yield farming, or commingling of customer assets with corporate operational reserves.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "Enterprise Data Protection & Cryptographic Security",
    clauses: [
      {
        heading: "1. Information Collection & Purpose",
        body: "We collect strictly necessary identity and financial information required for statutory compliance under the Prevention of Money Laundering Act (PMLA) and Indian tax regulations, including your verified legal name, email address, PAN, and bank mandate reference numbers.",
      },
      {
        heading: "2. Cryptographic Security Standards",
        body: "All investor data is encrypted in transit using TLS 1.3 and at rest using AES-256 institutional encryption. Database snapshots and cryptographic keys are isolated within hardware security modules (HSMs).",
      },
      {
        heading: "3. Zero Commercial Data Monetization",
        body: "Baskly never sells, monetizes, or shares user information with third-party advertisers or data brokers. Data sharing is strictly confined to statutory authorities (e.g., CBDT and FIU-IND) as mandated by Indian law.",
      },
      {
        heading: "4. Data Portability & Rights",
        body: "Investors maintain continuous access to download complete historical transaction ledgers, NAV performance series, and tax withholding certificates in standard CSV or PDF formats at any time.",
      },
    ],
  },
  risk: {
    title: "Risk Disclosure Statement",
    subtitle: "Virtual Digital Asset (VDA) Volatility & Regulatory Notice",
    clauses: [
      {
        heading: "1. High Volatility & Price Fluctuation",
        body: "Virtual Digital Assets are subject to extreme market volatility driven by global liquidity conditions, technological developments, and macroeconomic events. Basket Net Asset Values (NAVs) fluctuate in real-time and may decline below your initial invested principal.",
      },
      {
        heading: "2. Non-Guaranteed Returns",
        body: "Model CAGRs and historical basket performances are purely mathematical simulations from base ₹100.00 inception and do not guarantee future returns. Cryptocurrencies are not sovereign legal tender in India and lack deposit insurance.",
      },
      {
        heading: "3. Flat 30% Capital Gains Taxation",
        body: "Under Section 115BBH of the Indian Income Tax Act, gains arising from the transfer of VDAs are taxed at a flat rate of 30% plus applicable surcharge and 4% cess. Losses incurred in one VDA cannot be set off against gains in another VDA or any other income head.",
      },
      {
        heading: "4. Protocol & Smart Contract Vulnerabilities",
        body: "Constituent blockchain networks and smart contracts (such as Uniswap, Aave, and Lido) carry technological risks including network reorganizations, hard forks, and validator consensus delays beyond Baskly's control.",
      },
    ],
  },
  aml: {
    title: "AML & KYC Compliance",
    subtitle: "Prevention of Money Laundering & FIU-IND Alignment",
    clauses: [
      {
        heading: "1. Mandatory PAN & Identity Verification",
        body: "All investors must complete electronic Know Your Customer (e-KYC) verification. Anonymous or pseudonymous accounts, pooled transactions, and third-party deposits are categorically prohibited.",
      },
      {
        heading: "2. Closed-Loop Bank Settlement",
        body: "Funds deposited via UPI or Net Banking can only be redeemed back into the verified Indian bank account registered under the investor's verified PAN, ensuring strict closed-loop provenance.",
      },
      {
        heading: "3. Automated On-Chain Surveillance",
        body: "Baskly deploys real-time blockchain analytics to monitor institutional wallet interactions and prevent interactions with sanctioned entities or illicit mixers.",
      },
    ],
  },
};

export default function FooterSection() {
  const { openUPIModal, openOracleModal, openBasketInspector } = useBaskly();
  const [activeLegalKey, setActiveLegalKey] = useState<string | null>(null);

  const activeLegalDoc = activeLegalKey ? LEGAL_DOCS[activeLegalKey] : null;

  return (
    <>
      {/* Monumental Editorial Footer CTA */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="rounded-[24px] sm:rounded-[32px] bg-[#121110] text-[#F4EFEA] p-6 xs:p-8 sm:p-14 md:p-20 text-center relative overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[250px] bg-[#9A7B56]/25 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5 sm:space-y-6">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#9A7B56]">
              Begin Your Habit
            </span>
            <h2 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-light tracking-editorial leading-[1.04] sm:leading-[1.02]">
              ₹1,000 a month.<br />
              <span className="font-serif-italic text-4xl xs:text-5xl sm:text-7xl lg:text-8xl text-[#E8DFD5]">Zero</span> chart noise.
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#F4EFEA]/70 max-w-lg mx-auto leading-relaxed">
              Set your mandate once in 3 minutes. Let mathematical rebalancing and multi-year Rupee-Cost Averaging do the rest.
            </p>

            <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <button 
                type="button"
                onClick={openUPIModal} 
                className="btn-unseen bg-[#F4EFEA] text-[#121110] px-7 sm:px-9 py-3.5 sm:py-4 text-xs font-bold uppercase tracking-widest hover:text-[#F4EFEA] cursor-pointer text-center justify-center"
              >
                <span>Start Your ₹1,000 SIP ↗</span>
              </button>
              <a 
                href="#baskets" 
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border border-[#F4EFEA]/20 text-xs font-mono uppercase tracking-widest hover:border-[#F4EFEA] transition cursor-pointer text-center justify-center"
              >
                Inspect All 06 Baskets
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer: Deep Warm Dark Espresso Palette matching BitSave Structure & Proportions */}
      <footer className="relative z-10 bg-[#141312] text-[#F4EFEA] border-t border-[#262422] transition-colors">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-[90px] pt-12 sm:pt-16 pb-0">
          
          {/* Top 4-Column Layout matching BitSave Proportions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-10 sm:pb-14">
            
            {/* Column 1: Brand Section (~400–450px on desktop) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Brand Logo: Prominent, fixed warm off-white brand identity (no hover color change) */}
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="w-[34px] h-[34px] rounded-full bg-[#FAF8F5] text-[#141312] flex items-center justify-center font-serif italic text-xl font-bold flex-shrink-0">
                  b
                </div>
                <span className="text-[27px] sm:text-[28px] leading-[34px] font-bold tracking-tight text-[#F4EFEA]">
                  Baskly
                </span>
              </Link>

              {/* Tagline: Target 16–17px, Line-height 24px */}
              <p className="text-[16px] sm:text-[17px] leading-[24px] font-medium text-[#C8A97E] tracking-tight">
                Lorem. Ipsum. Dolor.
              </p>

              {/* Description: Target 15–15.5px, Line-height 26px */}
              <div className="text-[15px] sm:text-[15.5px] leading-[26px] font-normal text-[#BDB5AB] space-y-1 max-w-[380px]">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <p>Sed do eiusmod tempor incididunt ut labore.</p>
              </div>

              {/* Social Media Circular Outline Placeholders (LinkedIn, X, Instagram, YouTube) */}
              <div className="flex items-center gap-3 pt-3">
                {SOCIAL_ITEMS.map((item) => {
                  const baseClasses =
                    "w-10 h-10 rounded-full border border-[#36322E] text-[#BDB5AB] flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 cursor-pointer";

                  if (item.url) {
                    return (
                      <a
                        key={item.name}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.name}
                        className={`${baseClasses} ${item.hoverClasses}`}
                      >
                        {item.icon}
                      </a>
                    );
                  }

                  return (
                    <span
                      key={item.name}
                      role="img"
                      aria-label={item.name}
                      title={`${item.name} (Official channel coming soon)`}
                      className={`${baseClasses} select-none ${item.hoverClasses}`}
                    >
                      {item.icon}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Column 2: PRODUCTS (~36% offset) */}
            <div className="lg:col-span-2 lg:col-start-5 space-y-4">
              {/* Column Title: Target 11px, Line-height 16px, Weight 500 */}
              <div className="font-mono text-[11px] leading-[16px] uppercase tracking-[0.2em] font-medium text-[#8C857B] mb-4">
                PRODUCTS
              </div>
              {/* Navigation Options: Spacious 13.5px, Line-height 21px */}
              <ul className="space-y-3 text-[13.5px] leading-[21px] font-normal text-[#BDB5AB]">
                <li>
                  <button
                    type="button"
                    onClick={() => openBasketInspector("top-5-index")}
                    className="hover:text-[#FFFFFF] transition-colors text-left cursor-pointer"
                  >
                    Crypto Index
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openBasketInspector("crypto-gold")}
                    className="hover:text-[#FFFFFF] transition-colors text-left cursor-pointer"
                  >
                    Crypto & Gold
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openBasketInspector("bitcoin")}
                    className="hover:text-[#FFFFFF] transition-colors text-left cursor-pointer"
                  >
                    Bitcoin
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: RESOURCES (~57% offset) */}
            <div className="lg:col-span-3 lg:col-start-8 space-y-4">
              {/* Column Title */}
              <div className="font-mono text-[11px] leading-[16px] uppercase tracking-[0.2em] font-medium text-[#8C857B] mb-4">
                RESOURCES
              </div>
              {/* Navigation Options */}
              <ul className="space-y-3 text-[13.5px] leading-[21px] font-normal text-[#BDB5AB]">
                <li>
                  <a
                    href="#trust"
                    className="hover:text-[#FFFFFF] transition-colors block"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <span
                    className="text-[#BDB5AB] hover:text-[#FFFFFF] transition-colors cursor-default select-none block"
                    title="Blogs (Coming Soon)"
                  >
                    Blogs
                  </span>
                </li>
                <li>
                  <span
                    className="text-[#BDB5AB] hover:text-[#FFFFFF] transition-colors cursor-default select-none block"
                    title="Video Library (Coming Soon)"
                  >
                    Video Library
                  </span>
                </li>
                <li>
                  <span
                    className="text-[#BDB5AB] hover:text-[#FFFFFF] transition-colors cursor-default select-none block"
                    title="Newsletter (Coming Soon)"
                  >
                    Newsletter
                  </span>
                </li>
                <li>
                  <span
                    className="text-[#BDB5AB] hover:text-[#FFFFFF] transition-colors cursor-default select-none block"
                    title="Insights (Coming Soon)"
                  >
                    Insights
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 4: COMPANY (~78% offset) */}
            <div className="lg:col-span-2 lg:col-start-11 space-y-4">
              {/* Column Title */}
              <div className="font-mono text-[11px] leading-[16px] uppercase tracking-[0.2em] font-medium text-[#8C857B] mb-4">
                COMPANY
              </div>
              {/* Navigation Options */}
              <ul className="space-y-3 text-[13.5px] leading-[21px] font-normal text-[#BDB5AB]">
                <li>
                  <a
                    href="#methodology"
                    className="hover:text-[#FFFFFF] transition-colors block"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#trust"
                    className="hover:text-[#FFFFFF] transition-colors block"
                  >
                    Trust & Security
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@baskly.money"
                    className="hover:text-[#FFFFFF] transition-colors block"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:partners@baskly.money"
                    className="hover:text-[#FFFFFF] transition-colors block"
                  >
                    Partner with Us
                  </a>
                </li>
                <li>
                  <span
                    className="text-[#BDB5AB] hover:text-[#FFFFFF] transition-colors cursor-default select-none block"
                    title="WhatsApp Concierge (Coming Soon)"
                  >
                    WhatsApp
                  </span>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveLegalKey("terms")}
                    className="hover:text-[#FFFFFF] transition-colors text-left cursor-pointer"
                  >
                    Terms
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveLegalKey("privacy")}
                    className="hover:text-[#FFFFFF] transition-colors text-left cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveLegalKey("aml")}
                    className="hover:text-[#FFFFFF] transition-colors text-left cursor-pointer"
                  >
                    AML & KYC
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveLegalKey("risk")}
                    className="hover:text-[#FFFFFF] transition-colors text-left cursor-pointer"
                  >
                    Disclaimer
                  </button>
                </li>
                <li>
                  <span
                    className="text-[#BDB5AB] hover:text-[#FFFFFF] transition-colors cursor-default select-none block"
                    title="AI Info (Coming Soon)"
                  >
                    AI Info
                  </span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Information Bar: Balanced, spacious, and clean */}
          <div className="border-t border-[#262422] py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Left Content: Target 13px, Line-height 20px */}
            <div className="text-[12px] sm:text-[13px] leading-[18px] sm:leading-[20px] font-normal text-[#8C857B] font-mono">
              © 2026 Baskly · A Casper Wealth Group product · Kochi, India
            </div>

            {/* Right Button: Clean 12px, Line-height 18px */}
            <button
              type="button"
              onClick={openOracleModal}
              title="Inspect Live Multi-Feed Pricing Oracle & Proof of Reserves"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#9A7B56]/50 bg-[#1E1C1A] text-[#C8A97E] hover:border-[#C8A97E] hover:text-[#FFFFFF] hover:bg-[#9A7B56]/15 font-mono text-[11px] sm:text-[12px] leading-[18px] font-medium tracking-wide transition-all duration-200 cursor-pointer group flex-shrink-0"
            >
              <span>Proof-of-Reserves & Liabilities</span>
              <span className="group-hover:translate-x-0.5 transition-transform font-bold">→</span>
            </button>

          </div>

        </div>

        {/* Separate Legal Disclaimer Section: Subtly Darker (#0D0C0B), Clean and spacious */}
        <div className="bg-[#0D0C0B] border-t border-[#1C1A18] py-3.5 sm:py-4 px-4 sm:px-8 lg:px-[90px]">
          <div className="max-w-[1200px] mx-auto text-center text-[11px] sm:text-[12px] leading-[18px] sm:leading-[20px] font-normal text-[#7D766D] font-sans">
            <p>
              Crypto products and VDAs are unregulated and can be highly risky. 30% capital gains tax &amp; 1% TDS apply under Indian law.
            </p>
          </div>
        </div>
      </footer>

      {/* Interactive Legal Document Modal */}
      {activeLegalDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          onClick={() => setActiveLegalKey(null)}
        >
          <div
            className="tilt-card bg-[#FAF8F5] max-w-2xl w-full max-h-[88vh] flex flex-col rounded-3xl border border-[#121110]/15 shadow-2xl overflow-hidden text-[#171615]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 sm:p-8 pb-4 border-b border-[#121110]/10 bg-[#FAF8F5] flex-shrink-0">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9A7B56]">
                  Regulatory & Compliance Disclosure
                </span>
                <h3 className="text-2xl sm:text-3xl font-semibold text-[#171615] tracking-editorial mt-1">
                  {activeLegalDoc.title}
                </h3>
                <p className="text-xs text-[#625D56] mt-0.5 font-mono">
                  {activeLegalDoc.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveLegalKey(null)}
                className="w-9 h-9 rounded-full border border-[#121110]/15 flex items-center justify-center text-sm text-[#171615] hover:bg-[#121110] hover:text-[#F4EFEA] transition cursor-pointer flex-shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Clauses */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-4 space-y-5 text-xs sm:text-sm text-[#625D56] leading-relaxed">
              {activeLegalDoc.clauses.map((clause, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F5F1EB] border border-[#DED7CE] space-y-1.5">
                  <h4 className="font-semibold text-[#171615] tracking-tight">
                    {clause.heading}
                  </h4>
                  <p>{clause.body}</p>
                </div>
              ))}
              <div className="p-4 rounded-2xl bg-[#0F6E56]/8 border border-[#0F6E56]/15 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#0F6E56] flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#0F6E56] font-mono leading-relaxed">
                  Baskly operates strictly in alignment with Section 194S guidelines, Prevention of Money Laundering Act (PMLA), and institutional custodial standards.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-[#121110]/10 bg-[#FAF8F5] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLegalKey(null)}
                className="px-6 py-2.5 rounded-full bg-[#121110] text-[#F4EFEA] text-xs font-semibold hover:bg-[#9A7B56] transition cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
