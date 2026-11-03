"use client";

import React, { useState } from "react";
import { User } from "@/types/baskly";
import { ShieldCheck, Building2, UserCheck, Key, Bell, LogOut, CheckCircle2, Copy, ExternalLink } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  onOpenAuthModal: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenAuthModal,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "banking" | "tax" | "security">("profile");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyPan = () => {
    navigator.clipboard.writeText(user?.pan || "ABCDE1234F");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#1A1B20] rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E2E8E4] dark:border-[#262830] max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#F1F5F2] dark:border-[#262830]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F4EC] dark:bg-[#0B3B24] text-[#0B3B24] dark:text-emerald-300 uppercase">
                Investor Profile & Settings
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">· KYC Verified</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight mt-1">
              Account Settings & Preferences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your personal KYC details, linked banking rails, and tax identification.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F7F5] dark:bg-[#22242B] hover:bg-[#E5EBE7] dark:hover:bg-[#2A2C35] flex items-center justify-center text-slate-500 dark:text-slate-300 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#F1F5F2] dark:border-[#262830] pb-3 text-xs overflow-x-auto">
          {[
            { id: "profile", label: "Personal & KYC" },
            { id: "banking", label: "Linked Bank & VPA" },
            { id: "tax", label: "PAN & Section 194S" },
            { id: "security", label: "Security & Sessions" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#0B3B24] text-white shadow-xs"
                  : "bg-[#F8FAF9] dark:bg-[#22242B] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A2C35]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Profile & KYC */}
        {activeTab === "profile" && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37]">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"}
                alt="Avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#0B3B24] dark:border-emerald-500"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 dark:text-white">{user?.name || "Investor"}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F4EC] dark:bg-[#0B3B24] text-[#0B3B24] dark:text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{user?.email || "investor@baskly.money"}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">Account ID: {user?.id || "usr_investor"}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37]">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Legal Full Name</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">{user?.name || "Investor"}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37]">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Registered Email</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1 font-mono">{user?.email || "investor@baskly.money"}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37]">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Mobile Country Code</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1 font-mono">+91 98765 43214</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37]">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Tax Residency</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">Resident Indian (Individual)</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Linked Banking */}
        {activeTab === "banking" && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0B3B24] dark:text-emerald-400" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">Primary Settlement Bank Account</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F4EC] dark:bg-[#0B3B24] text-[#0B3B24] dark:text-emerald-300">
                  Penny Drop Verified
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 text-slate-600 dark:text-slate-300 font-mono">
                <div>Bank Name: <strong className="text-slate-900 dark:text-white font-sans">HDFC Bank Ltd</strong></div>
                <div>Account No: <strong className="text-slate-900 dark:text-white">50100482190124</strong></div>
                <div>IFSC Code: <strong className="text-slate-900 dark:text-white">HDFC0000240</strong></div>
                <div>Branch: <strong className="text-slate-900 dark:text-white font-sans">Indiranagar, Bengaluru</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Active NPCI UPI AutoPay VPA</span>
                <span className="font-mono text-xs text-[#0B3B24] dark:text-emerald-400 font-bold">investor@okhdfcbank</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                All systematic recurring mandates debit automatically from this verified VPA.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: PAN & Tax */}
        {activeTab === "tax" && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-[#22242B] border border-amber-200/80 dark:border-[#2C2E37] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-800 dark:text-amber-400" />
                  <span className="font-bold text-amber-950 dark:text-amber-300 text-sm">Permanent Account Number (PAN)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPan}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A1B20] border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white tracking-wider">
                {user?.pan || "ABCDE1234F"}
              </div>
              <p className="text-[11px] text-amber-900 dark:text-amber-300/80 leading-relaxed">
                Mandatory for 1% TDS deduction under Section 194S of the Income Tax Act. TDS deposited quarterly under TAN BLRB91024D is reflected automatically in your Form 26AS and Annual Information Statement (AIS).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37] flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Form 16A TDS Certificates</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Download quarterly TDS deduction certificate for AY 2026-27.</div>
              </div>
              <button
                type="button"
                onClick={() => alert("Form 16A quarterly TDS certificate will be generated at the end of the current financial quarter.")}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1B20] border border-[#DCE4DE] dark:border-[#2C2E37] text-slate-700 dark:text-slate-200 font-semibold text-xs hover:border-[#0B3B24] dark:hover:border-emerald-500 transition cursor-pointer"
              >
                Request 16A
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Security & Sessions */}
        {activeTab === "security" && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8FAF9] dark:bg-[#22242B] border border-[#E2E8E4] dark:border-[#2C2E37] flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Switch / Switch Account</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Authenticate as another investor or change credentials.</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#0B3B24] text-white font-semibold text-xs transition cursor-pointer"
              >
                Switch Account
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-[#22242B] border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-rose-950 dark:text-rose-300">Sign Out of Session</div>
                <div className="text-[11px] text-rose-800 dark:text-rose-400 mt-0.5">Clears session cookie and local credentials.</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F2] dark:border-[#262830] text-xs text-slate-400 dark:text-slate-500">
          <span>Baskly.money Institutional Retail Desk v2.4</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#F4F7F5] dark:bg-[#22242B] hover:bg-[#E5EBE7] dark:hover:bg-[#2A2C35] text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
