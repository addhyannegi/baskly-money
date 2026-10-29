"use client";

import React, { useState } from "react";
import { Holding, Basket } from "@/types/baskly";
import { ShieldCheck, ArrowDownLeft, AlertCircle, Building2, CheckCircle2 } from "lucide-react";

interface RedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  baskets: Basket[];
  userPan?: string;
  initialBasketId?: string;
  onWithdrawSubmit: (basketId: string, amount: number) => { gross: number; tds: number; net: number };
}

export default function RedemptionModal({
  isOpen,
  onClose,
  holdings,
  baskets,
  userPan = "ABCDE1234F",
  initialBasketId,
  onWithdrawSubmit,
}: RedemptionModalProps) {
  const activeHoldings = holdings.filter((h) => h.units > 0);
  const defaultBasketId = initialBasketId || activeHoldings[0]?.basketId || "top-5-index";
  const [selectedBasketId, setSelectedBasketId] = useState<string>(defaultBasketId);
  const [amount, setAmount] = useState<number>(5000);
  const [isSuccess, setIsSuccess] = useState(false);
  const [settledResult, setSettledResult] = useState<{ gross: number; tds: number; net: number } | null>(null);

  if (!isOpen) return null;

  const currentHolding = activeHoldings.find((h) => h.basketId === selectedBasketId) || activeHoldings[0];
  const liveNav = baskets.find((b) => b.id === selectedBasketId)?.nav || currentHolding?.avgBuyNav || 100.0;
  const currentHoldingVal = currentHolding ? Number((currentHolding.units * liveNav).toFixed(2)) : 0;

  // 1% Section 194S TDS calculations
  const grossAmount = Math.min(amount, currentHoldingVal > 0 ? currentHoldingVal : amount);
  const tdsAmount = Number((grossAmount * 0.01).toFixed(2));
  const netBankPayout = Number((grossAmount - tdsAmount).toFixed(2));
  const unitsLiquidated = liveNav > 0 ? Number((grossAmount / liveNav).toFixed(4)) : 0;

  const handleQuickPercent = (pct: number) => {
    if (currentHoldingVal > 0) {
      const calculated = Math.floor(currentHoldingVal * pct);
      setAmount(calculated > 100 ? calculated : 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHolding) {
      alert("No active basket holding found to redeem.");
      return;
    }
    if (grossAmount < 100) {
      alert("Minimum redemption amount is ₹100");
      return;
    }
    if (grossAmount > currentHoldingVal) {
      alert(`Requested amount exceeds available holding value of ₹${currentHoldingVal.toLocaleString("en-IN")}`);
      return;
    }

    try {
      const result = onWithdrawSubmit(selectedBasketId, grossAmount);
      setSettledResult(result);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSettledResult(null);
        onClose();
      }, 2500);
    } catch (err: any) {
      alert(err.message || "Redemption request failed");
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#1A1B20] rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E2E8E4] dark:border-[#262830] space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F2] dark:border-[#262830]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 uppercase">
                Section 194S TDS Compliant
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">· PAN {userPan}</span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-slate-100 tracking-tight mt-1">
              Redeem & Settle to Bank
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Liquidate basket units with statutory 1% TDS deduction breakdown.
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

        {isSuccess && settledResult ? (
          <div className="p-8 text-center space-y-3 bg-[#E8F4EC]/60 dark:bg-[#22242B] rounded-2xl border border-[#0B3B24]/20 dark:border-emerald-500/30 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#0B3B24] dark:bg-emerald-600 text-white flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-[#0B3B24] dark:text-emerald-400">Redemption Order Processed</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Gross: ₹{settledResult.gross.toLocaleString("en-IN")} · 1% TDS: ₹{settledResult.tds.toFixed(2)} · Net Bank Credit: ₹{settledResult.net.toLocaleString("en-IN")}.
            </p>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-[#1A1B20] p-2.5 rounded-xl border border-[#DCE4DE] dark:border-[#2C2E37]">
              TDS challan will be reported in your Form 26AS under Section 194S.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Basket Holding Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Select Basket to Redeem
              </label>
              <select
                value={selectedBasketId}
                onChange={(e) => setSelectedBasketId(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 rounded-2xl border border-[#DCE4DE] dark:border-[#2C2E37] bg-[#F8FAF9] dark:bg-[#22242B] text-slate-900 dark:text-white focus:outline-none focus:border-[#0B3B24] dark:focus:border-emerald-500"
              >
                {activeHoldings.map((h) => {
                  const bNav = baskets.find((b) => b.id === h.basketId)?.nav || h.avgBuyNav || 100;
                  const val = (h.units * bNav).toFixed(2);
                  return (
                    <option key={h.basketId} value={h.basketId} className="dark:bg-[#1A1B20] dark:text-white">
                      {h.basketName} — {h.units.toFixed(2)} units (₹{Number(val).toLocaleString("en-IN")})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Available Balance Pill */}
            <div className="p-3 bg-[#F8FAF9] dark:bg-[#22242B] rounded-2xl border border-[#E2E8E4] dark:border-[#2C2E37] flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Available Basket Valuation:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                ₹{currentHoldingVal.toLocaleString("en-IN")} ({currentHolding?.units?.toFixed(4) || "0"} Units)
              </span>
            </div>

            {/* Amount to Redeem */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Gross Redemption Amount (INR)
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Min ₹100</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-mono font-bold text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min={100}
                  max={currentHoldingVal || 1000000}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-base font-mono font-bold pl-9 pr-4 py-3 rounded-2xl border border-[#DCE4DE] dark:border-[#2C2E37] bg-[#F8FAF9] dark:bg-[#22242B] text-slate-900 dark:text-white focus:outline-none focus:border-[#0B3B24] dark:focus:border-emerald-500"
                />
              </div>

              {/* Percentage Quick Chips */}
              <div className="flex items-center gap-2 mt-2">
                {[
                  { label: "25%", val: 0.25 },
                  { label: "50%", val: 0.5 },
                  { label: "75%", val: 0.75 },
                  { label: "Max (100%)", val: 1.0 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleQuickPercent(chip.val)}
                    className="flex-1 py-1.5 rounded-xl text-xs font-medium bg-[#F4F7F5] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37] text-slate-700 dark:text-slate-300 hover:border-[#0B3B24] dark:hover:border-emerald-500 transition cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 194S 1% TDS Deduction Breakdown Card */}
            <div className="p-4 bg-[#F8FAF9] dark:bg-[#22242B] rounded-2xl border border-[#DCE4DE] dark:border-[#2C2E37] space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Gross Redemption Value:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₹{grossAmount.toLocaleString("en-IN")} ({unitsLiquidated.toFixed(4)} Units)
                </span>
              </div>

              {/* 1% Section 194S TDS line */}
              <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 font-semibold bg-rose-50/70 dark:bg-rose-950/30 p-2 rounded-xl border border-rose-200/60 dark:border-rose-900/50">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
                  <span>Section 194S 1% TDS Deduction:</span>
                </div>
                <span className="font-mono font-bold">-₹{tdsAmount.toFixed(2)}</span>
              </div>

              {/* Net Payout line */}
              <div className="flex items-center justify-between text-sm font-bold text-[#0B3B24] dark:text-emerald-400 pt-1 border-t border-[#E2E8E4] dark:border-[#2C2E37]">
                <span>Net Bank Payout Credited:</span>
                <span className="font-mono text-base">₹{netBankPayout.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Statutory Compliance Notice */}
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Statutory Indian Tax Compliance (Section 194S)</span>
              </div>
              <p className="text-[10px] text-amber-800 dark:text-amber-300/80 leading-relaxed">
                As per the Indian Income Tax Act, 1% TDS is mandatorily deducted at the time of redemption and remitted to the Income Tax Department against your PAN <strong>{userPan}</strong>. Form 16A / 26AS quarterly TDS certificate will be furnished automatically.
              </p>
            </div>

            {/* Bank Destination Info */}
            <div className="p-3 bg-white dark:bg-[#22242B] rounded-2xl border border-[#E2E8E4] dark:border-[#2C2E37] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">HDFC Bank · Primary Linked Account</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">A/C: ****4821 · IFSC: HDFC0000240</div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                IMPS Instant T+0
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#0B3B24] hover:bg-[#072919] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer"
            >
              Liquidate & Transfer ₹{netBankPayout.toLocaleString("en-IN")} to Bank ↗
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
