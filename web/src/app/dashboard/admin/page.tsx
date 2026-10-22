"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBaskly } from "@/context/BasklyContext";
import { ShieldAlert, LogOut, ArrowLeft } from "lucide-react";

export default function AdminDashboardPlaceholder() {
  const { user, logout } = useBaskly();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-[#FAF8F5] border border-[#B85D43]/20 rounded-3xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#B85D43]/10 text-[#B85D43] flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#121110]">Access Restricted</h2>
            <p className="text-xs text-[#5C5752] mt-1">
              You do not have administrative privileges to view this section.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#121110] text-[#F4EFEA] text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#FAF8F5] border border-[#121110]/10 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6">
        
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#121110] text-[#F4EFEA] flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9A7B56] font-bold">
            Administrative Control · Route Placeholder
          </span>
          <h1 className="text-2xl font-bold text-[#121110]">
            System Administration
          </h1>
          <p className="text-xs text-[#5C5752] leading-relaxed">
            This route (<code className="bg-[#EBE3DA] px-1.5 py-0.5 rounded font-mono text-[11px]">/dashboard/admin</code>) is strictly reserved for authenticated administrators. The actual administrative dashboard will be implemented in a subsequent phase.
          </p>
        </div>

        <div className="bg-[#EBE3DA]/40 border border-[#121110]/10 rounded-2xl p-4 text-left text-xs space-y-2">
          <div className="flex justify-between items-center text-[#5C5752]">
            <span>Account:</span>
            <span className="font-mono font-bold text-[#121110]">{user?.name}</span>
          </div>
          <div className="flex justify-between items-center text-[#5C5752]">
            <span>Role Authority:</span>
            <span className="font-mono font-bold text-[#9A7B56]">ADMIN</span>
          </div>
          <div className="flex justify-between items-center text-[#5C5752]">
            <span>Email:</span>
            <span className="font-mono text-[#121110]">{user?.email}</span>
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
