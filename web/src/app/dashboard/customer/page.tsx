"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBaskly } from "@/context/BasklyContext";
import { ShieldCheck, UserCheck, LogOut } from "lucide-react";

export default function CustomerDashboardPlaceholder() {
  const { user, logout } = useBaskly();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#FAF8F5] border border-[#121110]/10 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6">
        
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0F6E56]/10 text-[#0F6E56] flex items-center justify-center">
          <UserCheck className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#0F6E56] font-bold">
            Customer Dashboard · Route Placeholder
          </span>
          <h1 className="text-2xl font-bold text-[#121110]">
            Welcome, {user?.givenName || user?.name || "Customer"}
          </h1>
          <p className="text-xs text-[#5C5752] leading-relaxed">
            This is the production-ready authenticated route destination for customers (<code className="bg-[#EBE3DA] px-1.5 py-0.5 rounded font-mono text-[11px]">/dashboard/customer</code>).
          </p>
        </div>

        <div className="bg-[#EBE3DA]/40 border border-[#121110]/10 rounded-2xl p-4 text-left text-xs space-y-2">
          <div className="flex justify-between items-center text-[#5C5752]">
            <span>Account Role:</span>
            <span className="font-mono font-bold text-[#121110]">CUSTOMER</span>
          </div>
          <div className="flex justify-between items-center text-[#5C5752]">
            <span>Email:</span>
            <span className="font-mono text-[#121110]">{user?.email || "customer@baskly.money"}</span>
          </div>
          <div className="flex justify-between items-center text-[#5C5752]">
            <span>KYC Status:</span>
            <span className="text-[#0F6E56] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/signin");
            }}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#121110]/15 text-[#5C5752] hover:text-[#B85D43] text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
