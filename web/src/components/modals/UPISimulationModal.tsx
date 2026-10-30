"use client";

import React, { useState } from "react";
import { useBaskly } from "@/context/BasklyContext";
import { formatINR } from "@/data/baskets";

export default function UPISimulationModal() {
  const { isUPIModalOpen, closeUPIModal, baskets, buyBasket } = useBaskly();
  const [selectedBasketId, setSelectedBasketId] = useState<string>("top-5-index");
  const [amount, setAmount] = useState<number>(5000);
  const [debitDate, setDebitDate] = useState<string>("5th");
  const [vpa, setVpa] = useState<string>("investor@okhdfcbank");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [lastRef, setLastRef] = useState<string>("");

  if (!isUPIModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tx = buyBasket(selectedBasketId, amount);
      setLastRef(tx.bankRef);
      setIsSuccess(true);
    } catch (err: any) {
      alert(err.message || "Failed to initiate mandate");
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    closeUPIModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="tilt-card bg-[#13110F]/95 backdrop-blur-2xl max-w-md w-full p-5 sm:p-8 space-y-5 sm:space-y-6 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(245,158,11,0.12)] rounded-3xl text-white">
        <div className="tilt-card-content space-y-5 sm:space-y-6">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 sm:pb-4 border-b border-white/10 gap-3">
            <div>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#F59E0B]">
                NPCI e-Mandate Atelier
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-editorial mt-1">
                Configure <span className="font-serif-italic font-normal text-2xl sm:text-3xl text-[#F59E0B]">AutoPay</span>
              </h3>
            </div>
            <button 
              type="button"
              onClick={handleClose} 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/15 flex items-center justify-center text-sm text-white/80 hover:bg-white hover:text-[#0B0A09] transition cursor-pointer flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {isSuccess ? (
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Mandate Registered</h4>
                <p className="text-xs text-[#A39E93] mt-1">
                  NPCI UPI AutoPay mandate of ₹{formatINR(amount)}/mo successfully authorized on schedule ({debitDate} of every month).
                </p>
                <div className="font-mono text-[11px] text-[#A39E93] mt-2 bg-[#1A1713] p-2.5 rounded-xl border border-white/5">
                  Ref: {lastRef}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="btn-unseen w-full bg-white text-[#0B0A09] hover:bg-[#F59E0B] py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                <span>Done ↗</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#A39E93] mb-1.5">
                  Select Curated Basket
                </label>
                <select 
                  value={selectedBasketId}
                  onChange={(e) => setSelectedBasketId(e.target.value)}
                  className="w-full text-xs font-medium border border-white/10 rounded-xl px-3.5 py-3 bg-[#1A1713] text-white focus:outline-none focus:border-[#F59E0B]"
                >
                  {baskets.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#1A1713] text-white">
                      {b.indexNum} / {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#A39E93] mb-1.5">
                    Monthly Debit
                  </label>
                  <select 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-xs font-mono font-semibold border border-white/10 rounded-xl px-3 py-3 bg-[#1A1713] text-white focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value={1000} className="bg-[#1A1713] text-white">₹1,000 / mo</option>
                    <option value={2500} className="bg-[#1A1713] text-white">₹2,500 / mo</option>
                    <option value={5000} className="bg-[#1A1713] text-white">₹5,000 / mo</option>
                    <option value={10000} className="bg-[#1A1713] text-white">₹10,000 / mo</option>
                    <option value={25000} className="bg-[#1A1713] text-white">₹25,000 / mo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#A39E93] mb-1.5">
                    Schedule Date
                  </label>
                  <select 
                    value={debitDate}
                    onChange={(e) => setDebitDate(e.target.value)}
                    className="w-full text-xs font-medium border border-white/10 rounded-xl px-3 py-3 bg-[#1A1713] text-white focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="1st" className="bg-[#1A1713] text-white">1st of month</option>
                    <option value="5th" className="bg-[#1A1713] text-white">5th of month</option>
                    <option value="10th" className="bg-[#1A1713] text-white">10th of month</option>
                    <option value="15th" className="bg-[#1A1713] text-white">15th of month</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#A39E93] mb-1.5">
                  Verified UPI Handle (VPA)
                </label>
                <input 
                  type="text" 
                  value={vpa}
                  onChange={(e) => setVpa(e.target.value)}
                  required
                  className="w-full text-xs font-mono border border-white/10 rounded-xl px-3.5 py-3 bg-[#1A1713] text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="p-3.5 bg-[#1A1713] rounded-xl border border-white/5 text-[11px] text-[#D4CFC7]">
                ✓ Zero lock-in. Pause or revoke anytime from GPay, PhonePe, or Paytm.
              </div>

              <button 
                type="submit" 
                className="btn-unseen w-full bg-white text-[#0B0A09] hover:bg-[#F59E0B] py-4 text-xs font-semibold uppercase tracking-widest cursor-pointer"
              >
                <span>Authorize NPCI e-Mandate ↗</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
