"use client";

import React, { useState } from "react";
import { Basket } from "@/types/baskly";
import { ArrowUpRight, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  baskets: Basket[];
  initialBasketId?: string;
  onBuySubmit: (basketId: string, amount: number) => void;
}

export default function InvestmentModal({
  isOpen,
  onClose,
  baskets,
  initialBasketId,
  onBuySubmit,
}: InvestmentModalProps) {
  const [selectedBasketId, setSelectedBasketId] = useState<string>(
    initialBasketId || baskets[0]?.id || "top-5-index"
  );
  const [amount, setAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "NETBANKING" | "CASH">("UPI");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentBasket = baskets.find((b) => b.id === selectedBasketId) || baskets[0];
  const liveNav = currentBasket?.nav || 100.0;
  const estimatedUnits = amount > 0 && liveNav > 0 ? Number((amount / liveNav).toFixed(4)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 500) {
      alert("Minimum investment amount is ₹500");
      return;
    }

    try {
      onBuySubmit(selectedBasketId, amount);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Purchase failed");
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#1A1B20] rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E2E8E4] dark:border-[#262830] space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F2] dark:border-[#262830]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F4EC] dark:bg-[#22242B] text-[#0B3B24] dark:text-[#34D399] uppercase">
                Instant Order Execution
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">· Oracle Verified</span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-slate-100 tracking-tight mt-1">
              Invest in Crypto Basket
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live INR conversion and estimated units allocation.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F7F5] dark:bg-[#22242B] hover:bg-[#E5EBE7] dark:hover:bg-[#2C2E37] flex items-center justify-center text-slate-500 dark:text-slate-300 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3 bg-[#E8F4EC]/60 dark:bg-[#22242B] rounded-2xl border border-[#0B3B24]/20 dark:border-emerald-500/30 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#0B3B24] dark:bg-emerald-600 text-white flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-[#0B3B24] dark:text-emerald-400">Order Settled Successfully</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Allocated {estimatedUnits} units in {currentBasket?.name}. Transactions reflected on ledger.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Basket Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Select Basket
              </label>
              <select
                value={selectedBasketId}
                onChange={(e) => setSelectedBasketId(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 rounded-2xl border border-[#DCE4DE] dark:border-[#2C2E37] bg-[#F8FAF9] dark:bg-[#22242B] text-slate-900 dark:text-white focus:outline-none focus:border-[#0B3B24] dark:focus:border-emerald-500"
              >
                {baskets.map((b) => (
                  <option key={b.id} value={b.id} className="dark:bg-[#1A1B20] dark:text-white">
                    {b.name} (Live NAV: ₹{b.nav.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Investment Amount (INR)
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Min ₹500</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-mono font-bold text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-base font-mono font-bold pl-9 pr-4 py-3 rounded-2xl border border-[#DCE4DE] dark:border-[#2C2E37] bg-[#F8FAF9] dark:bg-[#22242B] text-slate-900 dark:text-white focus:outline-none focus:border-[#0B3B24] dark:focus:border-emerald-500"
                />
              </div>

              {/* Quick Chips */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                {[1000, 5000, 10000, 25000, 50000].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setAmount(chip)}
                    className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium shrink-0 cursor-pointer ${
                      amount === chip
                        ? "bg-[#0B3B24] dark:bg-emerald-600 text-white"
                        : "bg-[#F4F7F5] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37] text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
                    }`}
                  >
                    ₹{chip.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Units Allocation Preview Card */}
            <div className="p-4 bg-[#F8FAF9] dark:bg-[#22242B] rounded-2xl border border-[#E2E8E4] dark:border-[#2C2E37] space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Live NAV Unit Price:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹{liveNav.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Units Allotted:</span>
                <span className="font-mono font-bold text-[#0B3B24] dark:text-emerald-400 text-sm">
                  {estimatedUnits.toFixed(4)} Units
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-[#EAEFEA] dark:border-[#2C2E37] pt-1.5">
                <span>Entry Load / Commission:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">0.00% (Direct Plan)</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "UPI", label: "Instant UPI" },
                  { id: "NETBANKING", label: "NetBanking" },
                  { id: "CASH", label: "Cash Balance" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition cursor-pointer ${
                      paymentMethod === m.id
                        ? "bg-[#0B3B24] dark:bg-emerald-600 text-white border-[#0B3B24] dark:border-emerald-600"
                        : "bg-white dark:bg-[#22242B] border-[#DCE4DE] dark:border-[#2C2E37] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2C2E37]"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#0B3B24] hover:bg-[#072919] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer"
            >
              Confirm Investment of ₹{amount.toLocaleString("en-IN")} ↗
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
