"use client";

import React, { useState } from "react";
import { HelpCircle, Mail, MessageSquare, Phone, ChevronDown, ChevronUp, ShieldCheck, FileText } from "lucide-react";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketText, setTicketText] = useState("");

  if (!isOpen) return null;

  const faqs = [
    {
      q: "How does the 1% Section 194S TDS deduction work?",
      a: "Under Section 194S of the Indian Income Tax Act, 1% TDS is mandatorily deducted on the gross sale or redemption value of Virtual Digital Assets (VDA). Baskly.money automatically remits this TDS directly to the Income Tax Department against your verified PAN, and it reflects in your Form 26AS / AIS for year-end tax returns.",
    },
    {
      q: "When and how do recurring SIP auto-debits execute?",
      a: "Depending on your mandate frequency (Daily, Weekly, or Monthly), debits are executed via NPCI UPI AutoPay or e-NACH at 09:30 AM IST on the scheduled date. Units are allotted at the exact Oracle NAV snapshot recorded at execution time with zero slippage.",
    },
    {
      q: "Can I pause, edit, or cancel my SIP mandate?",
      a: "Yes, you can pause or resume any active mandate instantly using the interactive toggle switch on your dashboard. There are zero cancellation charges or lock-in penalties.",
    },
    {
      q: "What are the settlement timelines for redemptions to my Indian bank?",
      a: "Redemptions are processed via instant IMPS or NEFT banking rails. Net proceeds (after 1% Section 194S TDS) typically hit your verified bank account within 2 to 15 minutes.",
    },
    {
      q: "How is the basket NAV calculated?",
      a: "Each basket is anchored to a base NAV of ₹100.00 at inception. The live NAV dynamically compounds in real-time based on live INR token valuations aggregated from CoinDCX, Binance, and our multi-source pricing oracle engine.",
    },
  ];

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketText.trim()) return;
    setTicketSent(true);
    setTimeout(() => {
      setTicketSent(false);
      setTicketText("");
      alert("Support Ticket #BSK-" + Math.floor(10000 + Math.random() * 90000) + " created. Our desk will contact you via email shortly.");
      onClose();
    }, 1200);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#1A1B20] rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8E4] dark:border-[#262830] max-h-[92vh] overflow-y-auto space-y-6 transition-colors">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#F1F5F2] dark:border-[#262830]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F4EC] dark:bg-[#22242B] text-[#0B3B24] dark:text-emerald-300 border dark:border-emerald-500/20 uppercase">
                Investor Support Desk
              </span>
              <span className="text-xs text-slate-400 font-mono">· 24/7 Priority Assistance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight mt-1">
              Help Center & Statutory Guides
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant answers on SIP mandates, Section 194S TDS, and direct helpdesk contact.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F7F5] dark:bg-[#22242B] hover:bg-[#E5EBE7] dark:hover:bg-[#2C2E37] flex items-center justify-center text-slate-500 dark:text-slate-400 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37] flex items-center gap-2.5 sm:gap-3 min-w-0 overflow-hidden">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0B3B24]/10 dark:bg-emerald-500/20 text-[#0B3B24] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold leading-tight">Email Desk</div>
              <a
                href="mailto:support@baskly.money"
                title="support@baskly.money"
                className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-[#0B3B24] dark:hover:text-emerald-400 truncate block transition-colors tracking-tight"
              >
                support@baskly.money
              </a>
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37] flex items-center gap-2.5 sm:gap-3 min-w-0 overflow-hidden">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0B3B24]/10 dark:bg-emerald-500/20 text-[#0B3B24] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold leading-tight">WhatsApp Hotline</div>
              <a
                href="https://wa.me/918047192800"
                target="_blank"
                rel="noreferrer"
                title="+91 80 4719 2800"
                className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-[#0B3B24] dark:hover:text-emerald-400 font-mono truncate block transition-colors"
              >
                +91 80 4719 2800
              </a>
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37] flex items-center gap-2.5 sm:gap-3 min-w-0 overflow-hidden">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0B3B24]/10 dark:bg-emerald-500/20 text-[#0B3B24] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold leading-tight">FIU-IND Reg.</div>
              <div
                title="FIU-VDA-2024-819"
                className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 font-mono truncate block"
              >
                FIU-VDA-2024-819
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Frequently Asked Questions
          </h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-[#E2E8E4] dark:border-[#2C2E37] rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-3.5 text-left text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between bg-[#F8FAF9] dark:bg-[#22242B] hover:bg-[#F2F6F3] dark:hover:bg-[#2C2E37] transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#1A1B20] border-t border-[#E2E8E4] dark:border-[#2C2E37]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Ticket Form */}
        <form onSubmit={handleSendTicket} className="p-4 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37] space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white">Have a specific question for the Investor Desk?</div>
          <textarea
            value={ticketText}
            onChange={(e) => setTicketText(e.target.value)}
            placeholder="Type your message, query about TDS, or mandate request here..."
            className="w-full text-xs p-3 rounded-xl border border-[#DCE4DE] dark:border-[#2C2E37] bg-white dark:bg-[#1A1B20] text-slate-900 dark:text-white focus:outline-none focus:border-[#0B3B24] dark:focus:border-emerald-500 min-h-[75px]"
          />
          <button
            type="submit"
            className="w-full bg-[#0B3B24] dark:bg-emerald-600 hover:bg-[#072919] dark:hover:bg-emerald-500 text-white py-2.5 rounded-full text-xs font-bold transition cursor-pointer shadow-xs"
          >
            {ticketSent ? "Submitting Ticket..." : "Submit to Investor Support ↗"}
          </button>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F2] dark:border-[#262830] text-xs text-slate-400">
          <span>Baskly.money Compliance & Support Desk</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#F4F7F5] dark:bg-[#22242B] hover:bg-[#E5EBE7] dark:hover:bg-[#2C2E37] text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
