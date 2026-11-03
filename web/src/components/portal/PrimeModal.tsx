"use client";

import React, { useState } from "react";
import { Sparkles, Check, ShieldCheck, Zap, TrendingUp } from "lucide-react";

interface PrimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPrimeActive: boolean;
  onActivatePrime: () => void;
}

export default function PrimeModal({
  isOpen,
  onClose,
  isPrimeActive,
  onActivatePrime,
}: PrimeModalProps) {
  const [activated, setActivated] = useState(isPrimeActive);

  if (!isOpen) return null;

  const handleActivate = () => {
    onActivatePrime();
    setActivated(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#1A1B20] rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8E4] dark:border-[#262830] space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#F1F5F2] dark:border-[#262830]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0B3B24] dark:bg-[#22242B] text-emerald-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A] dark:text-slate-100 tracking-tight">
                Baskly Prime Membership
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Institutional Algorithmic Wealth Automation
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F7F5] dark:bg-[#22242B] hover:bg-[#E5EBE7] dark:hover:bg-[#2C2E37] flex items-center justify-center text-slate-500 dark:text-slate-300 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Feature List */}
        <div className="space-y-3 text-xs">
          {[
            {
              title: "Automated Algorithmic Drift Rebalancing",
              desc: "Monitors asset deviations and realigns back to target weights when tokens drift beyond ±5%.",
            },
            {
              title: "Zero Gas & Subsidized Network Fees",
              desc: "100% of blockchain gas fees are absorbed by Baskly algorithmic liquidity routing.",
            },
            {
              title: "Multi-Exchange Liquidity Execution",
              desc: "Orders route through Binance, CoinDCX, and Uniswap with sub-0.02% execution slippage.",
            },
            {
              title: "Priority Tax Advisory & Section 194S Reconciliation",
              desc: "Direct quarterly Form 16A certificates and chartered accountant reconciliation for VDA taxes.",
            },
          ].map((f, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37] flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#E8F4EC] dark:bg-[#1A1B20] text-[#0B3B24] dark:text-[#34D399] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{f.title}</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing / Activation Banner */}
        <div className="p-4 rounded-2xl bg-[#0B3B24] dark:bg-[#22242B] border border-transparent dark:border-[#2C2E37] text-white flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-200 dark:text-emerald-400 uppercase font-mono font-bold">Complimentary for Early Retail Investors</div>
            <div className="text-lg font-bold">₹0 Platform Fee / Year</div>
          </div>
          <div className="text-xs font-mono px-3 py-1 rounded-full bg-white/20 dark:bg-emerald-500/20 text-white dark:text-emerald-300 font-bold">
            TIER 1 RETAIL
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleActivate}
          className="w-full bg-[#0B3B24] hover:bg-[#072919] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md"
        >
          {activated ? "✓ Prime Tier Active on Account" : "Activate Baskly Prime Tier ↗"}
        </button>

      </div>
    </div>
  );
}
