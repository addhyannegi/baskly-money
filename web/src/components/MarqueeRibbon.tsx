import React from "react";

export default function MarqueeRibbon() {
  const items = [
    "· RULE-BASED CRYPTO BASKETS",
    "· PRICED DIRECTLY IN INDIAN RUPEES (INR)",
    "· NPCI UPI AUTOPAY MANDATES",
    "· AUTOMATED 1% TDS & FORM 26AS SYNC",
    "· 1:1 SEGREGATED COLD VAULT CUSTODY",
    "· ZERO LOCK-IN · T+1 BANK REDEMPTION",
  ];

  // Repeat across 4 repetitions to ensure seamless infinite looping on 3440px / 5120px ultrawide displays
  const marqueeItems = [...items, ...items, ...items, ...items];

  return (
    <div className="marquee-wrap py-3 sm:py-4 2xl:py-5 bg-[#100E0C]/80 border-y border-white/10 backdrop-blur-md">
      <div className="marquee-track space-x-8 sm:space-x-12 2xl:space-x-16 text-[11px] sm:text-xs 2xl:text-sm font-mono uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#A39E93]">
        {marqueeItems.map((text, idx) => (
          <span key={idx} className="whitespace-nowrap transition-colors hover:text-[#F59E0B]">{text}</span>
        ))}
      </div>
    </div>
  );
}
