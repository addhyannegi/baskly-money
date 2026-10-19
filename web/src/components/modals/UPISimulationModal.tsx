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
      <div className="tilt-card bg-[#FAF8F5] max-w-md w-full p-5 sm:p-8 space-y-5 sm:space-y-6">
        <div className="tilt-card-content space-y-5 sm:space-y-6">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 sm:pb-4 border-b border-[#121110]/10 gap-3">
            <div>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#0F6E56]">
                NPCI e-Mandate Atelier
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#121110] tracking-editorial mt-1">
                Configure <span className="font-serif-italic font-normal text-2xl sm:text-3xl">AutoPay</span>
              </h3>
            </div>
            <button 
              type="button"
              onClick={handleClose} 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#121110]/15 flex items-center justify-center text-sm hover:bg-[#121110] hover:text-[#F4EFEA] transition cursor-pointer flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {isSuccess ? (
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#121110]">Mandate Registered</h4>
                <p className="text-xs text-[#5C5752] mt-1">
                  NPCI UPI AutoPay mandate of ₹{formatINR(amount)}/mo successfully authorized on schedule ({debitDate} of every month).
                </p>
                <div className="font-mono text-[11px] text-[#8C857B] mt-2 bg-[#F4EFEA] p-2.5 rounded-xl border border-[#121110]/8">
                  Ref: {lastRef}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="btn-unseen w-full bg-[#121110] text-[#F4EFEA] py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                <span>Done ↗</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#5C5752] mb-1.5">
                  Select Curated Basket
                </label>
                <select 
                  value={selectedBasketId}
                  onChange={(e) => setSelectedBasketId(e.target.value)}
                  className="w-full text-xs font-medium border border-[#121110]/15 rounded-xl px-3.5 py-3 bg-[#F4EFEA] focus:outline-none focus:border-[#121110]"
                >
                  {baskets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.indexNum} / {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#5C5752] mb-1.5">
                    Monthly Debit
                  </label>
                  <select 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-xs font-mono font-semibold border border-[#121110]/15 rounded-xl px-3 py-3 bg-[#F4EFEA]"
                  >
                    <option value={1000}>₹1,000 / mo</option>
                    <option value={2500}>₹2,500 / mo</option>
                    <option value={5000}>₹5,000 / mo</option>
                    <option value={10000}>₹10,000 / mo</option>
                    <option value={25000}>₹25,000 / mo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#5C5752] mb-1.5">
                    Schedule Date
                  </label>
                  <select 
                    value={debitDate}
                    onChange={(e) => setDebitDate(e.target.value)}
                    className="w-full text-xs font-medium border border-[#121110]/15 rounded-xl px-3 py-3 bg-[#F4EFEA]"
                  >
                    <option value="1st">1st of month</option>
                    <option value="5th">5th of month</option>
                    <option value="10th">10th of month</option>
                    <option value="15th">15th of month</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#5C5752] mb-1.5">
                  Verified UPI Handle (VPA)
                </label>
                <input 
                  type="text" 
                  value={vpa}
                  onChange={(e) => setVpa(e.target.value)}
                  required
                  className="w-full text-xs font-mono border border-[#121110]/15 rounded-xl px-3.5 py-3 bg-[#F4EFEA] focus:outline-none focus:border-[#121110]"
                />
              </div>

              <div className="p-3.5 bg-[#F4EFEA] rounded-xl border border-[#121110]/8 text-[11px] text-[#5C5752]">
                ✓ Zero lock-in. Pause or revoke anytime from GPay, PhonePe, or Paytm.
              </div>

              <button 
                type="submit" 
                className="btn-unseen w-full bg-[#121110] text-[#F4EFEA] py-4 text-xs font-semibold uppercase tracking-widest cursor-pointer"
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
