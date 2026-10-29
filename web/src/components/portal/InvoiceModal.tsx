"use client";

import React from "react";
import { Transaction } from "@/types/baskly";
import { Printer, Download, ShieldCheck, CheckCircle2 } from "lucide-react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  tx: Transaction | null;
  userName?: string;
  userPan?: string;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  tx,
  userName = "Investor",
  userPan = "ABCDE1234F",
}: InvoiceModalProps) {
  if (!isOpen || !tx) return null;

  const invoiceNumber = `BSK-INV-${tx.id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase()}`;
  const formattedDate = new Date(tx.timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#1A1B20] rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8E4] dark:border-[#262830] max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Top Action Bar (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F2] dark:border-[#262830] print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F4EC] dark:bg-[#22242B] text-[#0B3B24] dark:text-[#34D399] uppercase">
              Tax Settlement Invoice
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">· Section 194S Certified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-full bg-[#F4F7F5] dark:bg-[#22242B] hover:bg-[#E5EBE7] dark:hover:bg-[#2C2E37] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F4F7F5] dark:bg-[#22242B] hover:bg-[#E5EBE7] dark:hover:bg-[#2C2E37] flex items-center justify-center text-slate-500 dark:text-slate-300 transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="space-y-6 text-[#0F172A] dark:text-slate-100" id="invoice-sheet">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#262830]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-[#0B3B24] dark:bg-emerald-600 text-white font-serif font-bold flex items-center justify-center text-sm">
                  b
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  baskly<span className="font-serif italic text-emerald-800 dark:text-emerald-400">.money</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institutional Crypto Baskets & Systematic SIP Engine
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                GSTIN: 29AAECB1029Q1Z8 · TAN: BLRB91024D
              </p>
            </div>

            <div className="sm:text-right text-xs space-y-0.5">
              <div className="font-mono font-bold text-sm text-[#0B3B24] dark:text-emerald-400">{invoiceNumber}</div>
              <div className="text-slate-500 dark:text-slate-400">Issued: {formattedDate}</div>
              <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Bank Ref: {tx.bankRef}</div>
            </div>
          </div>

          {/* Billed To & Settlement Status */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">
                Billed To (Investor):
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{userName}</div>
              <div className="text-slate-600 dark:text-slate-400 font-mono">PAN: {userPan} (KYC Verified)</div>
              <div className="text-slate-500 dark:text-slate-500 text-[11px]">Resident Individual · India</div>
            </div>

            <div className="sm:text-right">
              <div className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">
                Settlement Status:
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono uppercase bg-[#E8F4EC] dark:bg-[#22242B] text-[#0B3B24] dark:text-[#34D399] border border-[#0B3B24]/20 dark:border-emerald-500/30">
                  ● {tx.status}
                </span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 font-mono">
                Transaction Type: {tx.type}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 dark:border-[#262830] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] dark:bg-[#22242B] border-b border-slate-200 dark:border-[#262830] text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-3">Units</th>
                  <th className="py-3 px-3">Settlement NAV</th>
                  <th className="py-3 px-4 text-right">Gross INR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#262830] font-mono">
                <tr>
                  <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-slate-100">
                    {tx.basketName}
                    <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 font-mono">
                      Allocation under VDA Systematic Program
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{tx.units.toFixed(4)}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">₹{tx.nav.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                    ₹{tx.amountINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="p-4 bg-[#F8FAF9] dark:bg-[#22242B] border-t border-slate-200 dark:border-[#262830] space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Gross Order Value:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₹{tx.amountINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {tx.type === "WITHDRAWAL" ? (
                <div className="flex justify-between text-rose-700 dark:text-rose-400 font-semibold">
                  <span>Less: Section 194S 1% TDS Remitted:</span>
                  <span className="font-mono font-bold">
                    -₹{tx.tdsINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Entry Load / Platform Fees:</span>
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">₹0.00 (Zero Commission)</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-[#0B3B24] dark:text-emerald-400 border-t border-slate-200 dark:border-[#262830] pt-2">
                <span>Net Settled Amount:</span>
                <span className="font-mono text-base">
                  ₹{tx.netAmountINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Compliance & Footnote */}
          <div className="p-4 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37] space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-[#0B3B24] dark:text-emerald-400" />
              <span>Section 194S Statutory Compliance Endorsement</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
              This tax invoice is digitally generated by Baskly.money in compliance with Rule 31A of the Indian Income Tax Rules, 1962 and Section 194S for transfer of Virtual Digital Assets. For redemption transactions, TDS challan (Form 16A) is deposited quarterly under TAN BLRB91024D and verifiable via TRACES / Form 26AS.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center pt-2 text-[11px] text-slate-400 dark:text-slate-500 print:hidden">
          Official Electronic Record · Retain for Indian Income Tax Filing
        </div>
      </div>
    </div>
  );
}
