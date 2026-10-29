"use client";

import React, { useState } from "react";
import { Basket } from "@/types/baskly";
import { Calendar, Clock, ShieldCheck, Check, AlertCircle, Smartphone, Building2 } from "lucide-react";

interface SIPMandateModalProps {
  isOpen: boolean;
  onClose: () => void;
  baskets: Basket[];
  onCreateMandate: (payload: {
    basketId: string;
    amountINR: number;
    debitDay: number;
    vpa: string;
    frequency: "Daily" | "Weekly" | "Monthly";
    weeklyDay?: string;
    nextDebitDate?: string;
    paymentRail: "UPI_AUTOPAY" | "ENACH";
  }) => Promise<any>;
}

export default function SIPMandateModal({
  isOpen,
  onClose,
  baskets,
  onCreateMandate,
}: SIPMandateModalProps) {
  const [selectedBasketId, setSelectedBasketId] = useState<string>(
    baskets[0]?.id || "top-5-index"
  );
  const [frequency, setFrequency] = useState<"Daily" | "Weekly" | "Monthly">("Monthly");
  const [debitDay, setDebitDay] = useState<number>(5);
  const [weeklyDay, setWeeklyDay] = useState<string>("Monday");
  const [dailyTime, setDailyTime] = useState<string>("09:30 AM IST");
  const [amount, setAmount] = useState<number>(5000);
  const [paymentRail, setPaymentRail] = useState<"UPI_AUTOPAY" | "ENACH">("UPI_AUTOPAY");
  const [vpa, setVpa] = useState<string>("investor@okhdfcbank");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedBasket = baskets.find((b) => b.id === selectedBasketId) || baskets[0];

  // Calculate next execution date string
  const calculateNextExecutionDate = () => {
    const now = new Date();
    if (frequency === "Daily") {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }) + ` at ${dailyTime}`;
    }
    if (frequency === "Weekly") {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const targetIdx = daysOfWeek.indexOf(weeklyDay);
      const currentIdx = now.getDay();
      let diff = targetIdx - currentIdx;
      if (diff <= 0) diff += 7;
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + diff);
      return nextDate.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    // Monthly
    let nextYear = now.getFullYear();
    let nextMonth = now.getMonth();
    if (debitDay <= now.getDate()) {
      nextMonth += 1;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear += 1;
      }
    }
    const daysInMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    const finalDay = Math.min(debitDay, daysInMonth);
    const targetDate = new Date(nextYear, nextMonth, finalDay);
    return targetDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate ISO string (YYYY-MM-DD) for next debit date
  const getNextDebitDateISO = () => {
    const now = new Date();
    if (frequency === "Daily") {
      const d = new Date(now);
      d.setDate(now.getDate() + 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    if (frequency === "Weekly") {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const targetIdx = daysOfWeek.indexOf(weeklyDay);
      const currentIdx = now.getDay();
      let diff = targetIdx - currentIdx;
      if (diff <= 0) diff += 7;
      const d = new Date(now);
      d.setDate(now.getDate() + diff);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    // Monthly
    let nextYear = now.getFullYear();
    let nextMonth = now.getMonth();
    if (debitDay <= now.getDate()) {
      nextMonth += 1;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear += 1;
      }
    }
    const daysInMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    const finalDay = Math.min(debitDay, daysInMonth);
    const d = new Date(nextYear, nextMonth, finalDay);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 500) {
      alert("Minimum systematic auto-debit amount is ₹500");
      return;
    }
    if (!vpa.trim()) {
      alert("Please enter a valid VPA or Bank Account identifier");
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreateMandate({
        basketId: selectedBasketId,
        amountINR: amount,
        debitDay: frequency === "Monthly" ? debitDay : 1,
        vpa: vpa.trim(),
        frequency,
        weeklyDay: frequency === "Weekly" ? weeklyDay : undefined,
        nextDebitDate: getNextDebitDateISO(),
        paymentRail,
      });

      setSuccessMessage(
        `AutoPay Mandate Registered! Next auto-debit scheduled on ${calculateNextExecutionDate()}`
      );
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        onClose();
      }, 1600);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err.message || "Failed to register mandate");
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-white rounded-[28px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8E4] max-h-[92vh] overflow-y-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#F1F5F2]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F4EC] text-[#0B3B24] uppercase tracking-wider">
                NPCI AutoPay & e-NACH
              </span>
              <span className="text-xs text-slate-400 font-mono">· RBI Regulated</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight mt-1">
              Setup Systematic SIP Mandate
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated crypto basket wealth compounding with zero manual intervention.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F7F5] hover:bg-[#E5EBE7] flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {successMessage ? (
          <div className="p-8 text-center space-y-3 bg-[#E8F4EC]/60 rounded-2xl border border-[#0B3B24]/20 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#0B3B24] text-white flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-[#0B3B24]">Mandate Setup Complete</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basket Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Crypto Basket
              </label>
              <select
                value={selectedBasketId}
                onChange={(e) => setSelectedBasketId(e.target.value)}
                className="w-full text-xs font-semibold p-3.5 rounded-2xl border border-[#DCE4DE] bg-[#F8FAF9] text-slate-900 focus:outline-none focus:border-[#0B3B24] focus:ring-2 focus:ring-[#0B3B24]/10 transition cursor-pointer"
              >
                {baskets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Live NAV: ₹{b.nav.toFixed(2)} · CAGR: +{b.expected_cagr}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Recurring Frequency Selector: Daily, Weekly, Monthly */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                2. Auto-Debit Frequency
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "Daily", label: "Daily", sub: "Micro-DCA" },
                  { id: "Weekly", label: "Weekly", sub: "RCA 4x/mo" },
                  { id: "Monthly", label: "Monthly", sub: "Salary cycle" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFrequency(f.id as any)}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${frequency === f.id
                      ? "bg-[#0B3B24] border-[#0B3B24] text-white shadow-xs"
                      : "bg-[#F8FAF9] border-[#DCE4DE] text-slate-700 hover:bg-[#F2F6F3]"
                      }`}
                  >
                    <div className="text-xs font-bold">{f.label}</div>
                    <div className={`text-[10px] ${frequency === f.id ? "text-emerald-200" : "text-slate-400"}`}>
                      {f.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Execution Date Calendar / Picker */}
            <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E2E8E4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0B3B24]" />
                  Execution Date Calendar
                </span>
                <span className="text-[10px] font-mono font-semibold text-[#0B3B24]">
                  Automated Recurring Execution
                </span>
              </div>

              {frequency === "Monthly" && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500">
                    Select the calendar day of every month for automatic debit:
                  </p>
                  {/* Calendar 28-day interactive grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setDebitDay(day)}
                        className={`h-8 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer ${debitDay === day
                          ? "bg-[#0B3B24] text-white shadow-xs scale-105"
                          : "bg-white border border-[#E2E8E4] text-slate-700 hover:border-[#0B3B24] hover:bg-[#E8F4EC]/40"
                          }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-[#E2E8E4] flex items-center justify-between mt-2">
                    <span>Selected debit day: <strong>{debitDay}th of every month</strong></span>
                    <span className="text-[#0B3B24] font-semibold">First: {calculateNextExecutionDate()}</span>
                  </div>
                </div>
              )}

              {frequency === "Weekly" && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500">
                    Select recurring day of the week:
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setWeeklyDay(day)}
                        className={`h-9 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center cursor-pointer ${weeklyDay === day
                          ? "bg-[#0B3B24] text-white shadow-xs"
                          : "bg-white border border-[#E2E8E4] text-slate-700 hover:border-[#0B3B24]"
                          }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-[#E2E8E4] flex items-center justify-between">
                    <span>Recurring day: <strong>Every {weeklyDay}</strong></span>
                    <span className="text-[#0B3B24] font-semibold">First: {calculateNextExecutionDate()}</span>
                  </div>
                </div>
              )}

              {frequency === "Daily" && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500">
                    Select daily execution time window:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {["09:30 AM IST (Morning)", "06:00 PM IST (Evening)"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDailyTime(t)}
                        className={`p-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${dailyTime === t
                          ? "bg-[#0B3B24] text-white"
                          : "bg-white border border-[#E2E8E4] text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-[#E2E8E4] flex items-center justify-between">
                    <span>Daily schedule: <strong>Active 7 days/week</strong></span>
                    <span className="text-[#0B3B24] font-semibold">Next: {calculateNextExecutionDate()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mandate Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  3. Recurring Amount (INR)
                </label>
                <span className="text-[11px] text-slate-400">Min: ₹500</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-base font-mono font-bold pl-9 pr-4 py-3 rounded-2xl border border-[#DCE4DE] bg-[#F8FAF9] text-slate-900 focus:outline-none focus:border-[#0B3B24] focus:ring-2 focus:ring-[#0B3B24]/10 transition"
                  placeholder="5000"
                />
              </div>

              {/* Quick amount chips */}
              <div className="flex items-center gap-2 mt-2.5">
                {[1000, 2500, 5000, 10000, 25000].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setAmount(chip)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition cursor-pointer ${amount === chip
                      ? "bg-[#0B3B24] text-white"
                      : "bg-[#F4F7F5] border border-[#E2E8E4] text-slate-600 hover:border-slate-400"
                      }`}
                  >
                    ₹{chip.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Rail Selector: UPI AutoPay vs e-NACH */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                4. Select Payment Mandate Rail
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentRail("UPI_AUTOPAY")}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${paymentRail === "UPI_AUTOPAY"
                    ? "bg-[#E8F4EC] border-[#0B3B24] ring-1 ring-[#0B3B24]"
                    : "bg-[#F8FAF9] border-[#DCE4DE] hover:bg-slate-50"
                    }`}
                >
                  <Smartphone className="w-5 h-5 text-[#0B3B24] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">NPCI UPI AutoPay</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      GPay, PhonePe, Paytm or BHIM UPI apps.
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentRail("ENACH")}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${paymentRail === "ENACH"
                    ? "bg-[#E8F4EC] border-[#0B3B24] ring-1 ring-[#0B3B24]"
                    : "bg-[#F8FAF9] border-[#DCE4DE] hover:bg-slate-50"
                    }`}
                >
                  <Building2 className="w-5 h-5 text-[#0B3B24] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">e-NACH Mandate</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Direct NetBanking recurring mandate (All Banks).
                    </div>
                  </div>
                </div>
              </div>

              {/* VPA / Account Identifier Input */}
              <div className="mt-3">
                <label className="block text-[11px] font-mono text-slate-500 mb-1">
                  {paymentRail === "UPI_AUTOPAY" ? "UPI ID (VPA)" : "Bank Account / Customer ID"}
                </label>
                <input
                  type="text"
                  value={vpa}
                  onChange={(e) => setVpa(e.target.value)}
                  placeholder={paymentRail === "UPI_AUTOPAY" ? "yourname@okhdfcbank" : "HDFC Bank A/C 50100234912"}
                  className="w-full text-xs font-mono font-semibold p-3 rounded-xl border border-[#DCE4DE] bg-[#F8FAF9] text-slate-900 focus:outline-none focus:border-[#0B3B24]"
                />
              </div>
            </div>

            {/* Bottom Summary Pill */}
            <div className="p-3.5 bg-[#F4F7F5] rounded-2xl border border-[#E2E8E4] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-[#0B3B24]" />
                <span>Zero Lock-in · Pause or cancel anytime at 0 cost</span>
              </div>
              <div className="font-mono font-bold text-[#0B3B24]">
                ₹{amount.toLocaleString("en-IN")}/{frequency === "Daily" ? "day" : frequency === "Weekly" ? "wk" : "mo"}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0B3B24] hover:bg-[#072919] text-white py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Registering Mandate with NPCI..." : "Authorize AutoPay Mandate ↗"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
