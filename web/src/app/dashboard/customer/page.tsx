"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portal");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#DDE4DF] flex items-center justify-center font-sans">
      <div className="bg-white rounded-3xl p-8 border border-[#E1E8E3] shadow-md text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-3 border-[#0B3B24] border-t-transparent animate-spin mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Redirecting to Retail Investor Portal...</h2>
        <p className="text-xs text-slate-500">Connecting your portfolio, live NAV charts, and SIP mandates.</p>
      </div>
    </div>
  );
}
