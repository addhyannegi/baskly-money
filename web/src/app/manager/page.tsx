"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  ShieldCheck, 
  RotateCw, 
  Download, 
  ArrowLeft, 
  CheckCircle2 
} from "lucide-react";
import { useBaskly } from "@/context/BasklyContext";

export default function ManagerPage() {
  const { 
    user, 
    manager, 
    baskets, 
    toggleCircuitBreaker, 
    executeRebalance, 
    portfolio 
  } = useBaskly();

  const [lastNotice, setLastNotice] = useState<string | null>(null);

  const handleRebalanceClick = (basketId: string) => {
    try {
      const log = executeRebalance(basketId, user?.name ? `${user.name} (CIO)` : "CIO Algorithmic Engine");
      setLastNotice(`Successfully executed rebalance for ${log.basketName}. Slippage: ${log.slippagePct}%, Gas: ₹${log.gasCostINR}`);
      setTimeout(() => setLastNotice(null), 5000);
    } catch (err: any) {
      alert(err.message || "Rebalance failed");
    }
  };

  const handleExportTDS = () => {
    const headers = ["Transaction ID", "Timestamp", "Type", "Basket Name", "Gross INR", "1% Section 194S TDS INR", "Net Credited INR", "Bank Reference", "PAN Number"];
    const rows = portfolio.transactions.map((t) => [
      t.id,
      t.timestamp,
      t.type,
      `"${t.basketName}"`,
      t.amountINR.toFixed(2),
      t.tdsINR.toFixed(2),
      t.netAmountINR.toFixed(2),
      t.bankRef,
      user?.pan || "ABCDE1234F",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Baskly_Form16A_TDS_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportNAV = () => {
    const data = baskets.map((b) => ({
      id: b.id,
      name: b.name,
      nav: b.nav,
      cagr: b.expected_cagr,
      constituents: b.assets.map((a) => `${a.symbol} (${a.weight}%)`).join(", "),
    }));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `Baskly_Time_Series_NAV_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#121110] antialiased">
      
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#F4EFEA] border-b border-[#121110]/10 shadow-[0_1px_3px_rgba(18,17,16,0.03)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-full bg-[#121110] flex items-center justify-center text-[#F4EFEA] font-serif font-bold text-lg">
                b
              </div>
              <span className="text-xl font-bold tracking-tight text-[#121110]">
                baskly<span className="font-serif italic font-normal text-xl text-[#9A7B56]">.money</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#121110]/10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9A7B56]/15 text-[#9A7B56] font-mono text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9A7B56]" />
                Institutional CIO Terminal
              </span>
              <span className="font-mono text-xs text-[#8C857B]">· SEBI & CBDT Regulated Desk</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/portal" 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#121110]/15 text-xs font-medium text-[#121110] hover:bg-[#121110] hover:text-[#F4EFEA] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retail Investor Portal</span>
            </Link>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#121110]/15 rounded-full px-3 py-1 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#0F6E56]" />
              <span>{user?.name || "Chief Investment Officer"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Terminal Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner with Circuit Breaker Switch */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#121110]/10">
          <div>
            <div className="font-mono text-xs text-[#8C857B] uppercase tracking-widest mb-1">
              Institutional AUM & Algorithmic Realignment Desk
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-editorial text-[#121110]">
              Fund Manager Operations Terminal
            </h1>
            <p className="text-sm text-[#5C5752] mt-1 max-w-xl">
              Real-time portfolio constituent drift detection, autonomous rebalancing execution, and statutory regulatory reconciliation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              type="button"
              onClick={toggleCircuitBreaker}
              className={`px-5 py-3 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition flex items-center gap-2 cursor-pointer ${
                manager.circuitBreakerActive 
                  ? "bg-rose-700 text-white hover:bg-rose-800" 
                  : "bg-[#0F6E56]/10 text-[#0F6E56] border border-[#0F6E56]/30 hover:bg-[#0F6E56]/20"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>
                {manager.circuitBreakerActive ? "Circuit Breaker Active (HALTED)" : "Circuit Breaker: Normal"}
              </span>
            </button>
          </div>
        </div>

        {/* Notice banner */}
        {lastNotice && (
          <div className="p-4 rounded-2xl bg-[#0F6E56]/10 border border-[#0F6E56]/30 text-xs font-mono text-[#0F6E56] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{lastNotice}</span>
          </div>
        )}

        {/* Top KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="tilt-card p-6 bg-[#FAF8F5]">
            <div className="tilt-card-content">
              <div className="text-[#8C857B] font-mono text-xs uppercase tracking-wider mb-1">
                Institutional AUM (INR)
              </div>
              <div className="text-3xl font-bold font-mono text-[#121110]">
                ₹{(manager.totalAUM_INR / 10000000).toFixed(2)} Cr
              </div>
              <div className="text-xs text-[#0F6E56] font-mono mt-2">
                Across 6 Official Curated Indices
              </div>
            </div>
          </div>

          <div className="tilt-card p-6 bg-[#FAF8F5]">
            <div className="tilt-card-content">
              <div className="text-[#8C857B] font-mono text-xs uppercase tracking-wider mb-1">
                Verified Indian Investors
              </div>
              <div className="text-3xl font-bold font-mono text-[#121110]">
                {manager.verifiedInvestors.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-[#0F6E56] font-mono mt-2">
                100% KYC Verified with PAN
              </div>
            </div>
          </div>

          <div className="tilt-card p-6 bg-[#FAF8F5]">
            <div className="tilt-card-content">
              <div className="text-[#8C857B] font-mono text-xs uppercase tracking-wider mb-1">
                Emergency Market Status
              </div>
              <div className={`text-2xl font-bold font-mono ${manager.circuitBreakerActive ? "text-rose-700" : "text-[#0F6E56]"}`}>
                {manager.circuitBreakerActive ? "HALTED" : "LIVE & HEALTHY"}
              </div>
              <div className="text-xs text-[#8C857B] font-mono mt-2">
                Multi-Sig 1:1 Cold Vaults
              </div>
            </div>
          </div>
        </div>

        {/* Constituent Drift & Rebalance Execution Table */}
        <div className="tilt-card p-6 bg-[#FAF8F5]">
          <div className="tilt-card-content space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#121110]">Constituent Drift & Rebalance Atelier</h3>
                <p className="text-xs text-[#5C5752] mt-0.5">Automated drift detection vs. base target weights.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4EFEA] border-b border-[#121110]/10 text-[10px] font-mono text-[#8C857B] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Fund / Index</th>
                    <th className="py-3 px-3">Base Unit NAV</th>
                    <th className="py-3 px-3">Constituent Target Weights</th>
                    <th className="py-3 px-3">Max Drift %</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121110]/5 font-mono text-xs">
                  {baskets.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F4EFEA]/50">
                      <td className="py-3 px-3 font-bold text-[#121110]">
                        {b.name}
                      </td>
                      <td className="py-3 px-3 text-[#121110]">₹{b.nav.toFixed(2)}</td>
                      <td className="py-3 px-3 text-[#5C5752]">
                        {b.assets.map((a) => `${a.symbol} ${a.weight}%`).join(" · ")}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-amber-700">±1.4%</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRebalanceClick(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#121110] text-[#F4EFEA] text-[11px] font-mono font-bold hover:bg-[#9A7B56] transition flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Rebalance Now</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Rebalance Audit Logs */}
        <div className="tilt-card p-6 bg-[#FAF8F5]">
          <div className="tilt-card-content space-y-4">
            <h3 className="text-xl font-bold text-[#121110]">Rebalance Execution Audit Trail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4EFEA] border-b border-[#121110]/10 text-[10px] font-mono text-[#8C857B] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Basket</th>
                    <th className="py-2.5 px-3">Executed By</th>
                    <th className="py-2.5 px-3">Trades</th>
                    <th className="py-2.5 px-3">Slippage</th>
                    <th className="py-2.5 px-3">Gas Cost</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121110]/5 font-mono text-xs">
                  {manager.rebalanceLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F4EFEA]/50">
                      <td className="py-2.5 px-3 text-[#5C5752]">
                        {new Date(log.timestamp).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#121110]">{log.basketName}</td>
                      <td className="py-2.5 px-3 text-[#8C857B]">{log.managerName}</td>
                      <td className="py-2.5 px-3 text-[#121110]">{log.tradesExecuted} assets</td>
                      <td className="py-2.5 px-3 text-[#0F6E56] font-bold">{(log.slippagePct * 100).toFixed(2)}%</td>
                      <td className="py-2.5 px-3 text-[#5C5752]">₹{log.gasCostINR.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#0F6E56]/10 text-[#0F6E56]">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Regulatory Exporters */}
        <div className="tilt-card p-6 bg-[#FAF8F5]">
          <div className="tilt-card-content space-y-4">
            <h3 className="text-xl font-bold text-[#121110]">Statutory & Regulatory Data Exporters</h3>
            <p className="text-xs text-[#5C5752]">
              Generate auditable, CA-ready reports for CBDT 1% TDS reconciliation and database archives.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={handleExportTDS}
                className="px-5 py-3 rounded-full border border-[#121110]/15 bg-[#F4EFEA] hover:bg-[#121110] hover:text-[#F4EFEA] text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Form 16A TDS Reconciliation (CSV) ↗</span>
              </button>
              <button
                type="button"
                onClick={handleExportNAV}
                className="px-5 py-3 rounded-full border border-[#121110]/15 bg-[#F4EFEA] hover:bg-[#121110] hover:text-[#F4EFEA] text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Time-Series NAV Records (JSON) ↗</span>
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
