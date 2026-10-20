"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Calendar, 
  Wallet, 
  ShieldCheck, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Pause, 
  Play 
} from "lucide-react";
import { useBaskly } from "@/context/BasklyContext";
import { formatINR, formatINRCurrency } from "@/data/baskets";

export default function PortalPage() {
  const { 
    user, 
    portfolio, 
    baskets, 
    buyBasket, 
    withdrawBasket, 
    toggleMandate, 
    openAuthModal 
  } = useBaskly();

  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "1Y" | "5Y">("1Y");
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const [selectedBasketId, setSelectedBasketId] = useState<string>("top-5-index");
  const [buyAmount, setBuyAmount] = useState<number>(5000);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(5000);

  // Calculate live portfolio summary
  let totalInvested = 0;
  let totalWealth = 0;

  const holdingsWithLiveNav = portfolio.holdings.map((h) => {
    const liveNav = baskets.find((b) => b.id === h.basketId)?.nav || h.avgBuyNav || 100.0;
    const currentVal = Number((h.units * liveNav).toFixed(2));
    const profit = Number((currentVal - h.investedAmountINR).toFixed(2));
    const retPct = h.investedAmountINR > 0 ? (profit / h.investedAmountINR) * 100 : 0;

    totalInvested += h.investedAmountINR;
    totalWealth += currentVal;

    return {
      ...h,
      liveNav,
      currentVal,
      profit,
      retPct,
    };
  });

  const totalProfit = totalWealth - totalInvested;
  const totalReturnPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
  const activeSipAmount = portfolio.mandates
    .filter((m) => m.status === "ACTIVE")
    .reduce((sum, m) => sum + m.monthlyAmountINR, 0);

  const handleBuySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      buyBasket(selectedBasketId, buyAmount);
      setIsBuyModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Purchase failed");
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = withdrawBasket(selectedBasketId, withdrawAmount);
      alert(`Withdrawal initiated! Gross: ₹${formatINR(res.gross)}, 1% Section 194S TDS: ₹${formatINR(res.tds)}, Net Bank Credit: ₹${formatINR(res.net)}`);
      setIsWithdrawModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Withdrawal failed");
    }
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] font-mono text-xs font-semibold">
                <span className="oracle-pulse-live" style={{ width: 6, height: 6 }} />
                Retail Investor Desk
              </span>
              <span className="font-mono text-xs text-[#8C857B]">· Base ₹100.00 Inception NAV</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/manager" 
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#121110]/15 text-xs font-medium text-[#121110] hover:bg-[#121110] hover:text-[#F4EFEA] transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fund Manager Terminal</span>
            </Link>

            {/* User Profile Pill */}
            <div 
              onClick={openAuthModal} 
              className="flex items-center gap-3 bg-[#FAF8F5] border border-[#121110]/10 rounded-full pl-3 pr-1.5 py-1 shadow-xs cursor-pointer hover:border-[#121110]/30 transition"
              title="Click to switch account"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-[#121110]">
                  {user ? user.name : "Investor Account"}
                </div>
                <div className="text-[10px] text-[#0F6E56] font-mono">
                  KYC Verified · PAN {user?.pan || "ABCDE1234F"}
                </div>
              </div>
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full object-cover border border-[#121110]/15"
              />
              <div className="w-7 h-7 rounded-full bg-[#121110]/5 flex items-center justify-center text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#121110]/10">
          <div>
            <div className="font-mono text-xs text-[#8C857B] uppercase tracking-widest mb-1">
              Portfolio Intelligence Desk
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-editorial text-[#121110]">
              Welcome back, <span>{user ? user.givenName || user.name.split(" ")[0] : "Investor"}</span>.
            </h1>
            <p className="text-sm text-[#5C5752] mt-1 max-w-xl">
              Automated Indian crypto baskets with real-time Oracle valuation, statutory 1% TDS accounting, and persistent PostgreSQL persistence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              type="button"
              onClick={() => setIsBuyModalOpen(true)} 
              className="btn-unseen bg-[#121110] text-[#F4EFEA] px-5 py-3 text-xs font-semibold uppercase tracking-widest cursor-pointer"
            >
              <span>+ Invest in Basket ↗</span>
            </button>
            <button 
              type="button"
              onClick={() => setIsWithdrawModalOpen(true)} 
              className="px-5 py-3 rounded-full border border-[#121110]/20 bg-[#FAF8F5] text-[#121110] text-xs font-semibold uppercase tracking-widest hover:border-[#121110] transition cursor-pointer"
            >
              <span>Withdraw to Bank (1% TDS) ↗</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="tilt-card p-6 bg-[#FAF8F5]">
            <div className="tilt-card-content">
              <div className="flex items-center justify-between text-[#8C857B] font-mono text-xs uppercase tracking-wider mb-2">
                <span>Total Portfolio Wealth</span>
                <span className="oracle-pulse-live" style={{ width: 6, height: 6 }} />
              </div>
              <div className="text-3xl font-bold font-mono text-[#121110]">
                ₹{formatINRCurrency(totalWealth)}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs font-mono text-[#5C5752]">
                <span>Net Invested: ₹{formatINR(totalInvested)}</span>
                <span>·</span>
                <span className="text-[#0F6E56] font-semibold">100% Inception Base</span>
              </div>
            </div>
          </div>

          <div className="tilt-card p-6 bg-[#FAF8F5]">
            <div className="tilt-card-content">
              <div className="flex items-center justify-between text-[#8C857B] font-mono text-xs uppercase tracking-wider mb-2">
                <span>Accumulated Profit</span>
                <TrendingUp className="w-4 h-4 text-[#0F6E56]" />
              </div>
              <div className="text-3xl font-bold font-mono text-[#0F6E56]">
                +₹{formatINRCurrency(totalProfit)}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs font-mono">
                <span className="text-[#0F6E56] font-bold">+{totalReturnPct.toFixed(1)}% Total Return</span>
                <span className="text-[#8C857B]">· Multi-Asset</span>
              </div>
            </div>
          </div>

          <div className="tilt-card p-6 bg-[#FAF8F5]">
            <div className="tilt-card-content">
              <div className="flex items-center justify-between text-[#8C857B] font-mono text-xs uppercase tracking-wider mb-2">
                <span>Active Monthly SIP</span>
                <Calendar className="w-4 h-4 text-[#9A7B56]" />
              </div>
              <div className="text-3xl font-bold font-mono text-[#121110]">
                ₹{formatINR(activeSipAmount)}/mo
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs font-mono text-[#0F6E56]">
                <span>● {portfolio.mandates.filter((m) => m.status === "ACTIVE").length} Mandates Active</span>
                <span className="text-[#8C857B]">· UPI AutoPay</span>
              </div>
            </div>
          </div>

          <div className="tilt-card p-6 bg-[#FAF8F5]">
            <div className="tilt-card-content">
              <div className="flex items-center justify-between text-[#8C857B] font-mono text-xs uppercase tracking-wider mb-2">
                <span>Available Cash Balance</span>
                <Wallet className="w-4 h-4 text-[#121110]" />
              </div>
              <div className="text-3xl font-bold font-mono text-[#121110]">
                ₹{formatINRCurrency(portfolio.cashBalanceINR)}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs font-mono text-[#5C5752]">
                <span>T+1 Bank Settlement</span>
                <span>·</span>
                <span className="text-[#0F6E56]">Instant Top-up</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Holdings Table */}
        <div className="tilt-card p-6 bg-[#FAF8F5]">
          <div className="tilt-card-content space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#121110]">Curated Basket Holdings</h3>
                <p className="text-xs text-[#5C5752] mt-0.5">Underlying asset allocation and performance breakdown.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsBuyModalOpen(true)} 
                className="text-xs font-bold text-[#0F6E56] hover:underline cursor-pointer"
              >
                + Add Investment ↗
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4EFEA] border-b border-[#121110]/10 text-[10px] font-mono text-[#8C857B] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Basket Name</th>
                    <th className="py-3 px-3">Units Held</th>
                    <th className="py-3 px-3">Avg Buy NAV</th>
                    <th className="py-3 px-3">Live NAV</th>
                    <th className="py-3 px-3">Invested Amount</th>
                    <th className="py-3 px-3">Current Valuation</th>
                    <th className="py-3 px-3 text-right">Returns</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121110]/5 font-mono text-xs">
                  {holdingsWithLiveNav.map((h) => (
                    <tr key={h.basketId} className="hover:bg-[#F4EFEA]/50">
                      <td className="py-3 px-3 font-bold text-[#121110]">
                        {h.basketName}
                      </td>
                      <td className="py-3 px-3 text-[#5C5752]">{h.units.toFixed(2)}</td>
                      <td className="py-3 px-3 text-[#5C5752]">₹{h.avgBuyNav.toFixed(2)}</td>
                      <td className="py-3 px-3 font-bold text-[#121110]">₹{h.liveNav.toFixed(2)}</td>
                      <td className="py-3 px-3 text-[#5C5752]">₹{formatINR(h.investedAmountINR)}</td>
                      <td className="py-3 px-3 font-bold text-[#121110]">₹{formatINR(h.currentVal)}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-[#0F6E56]">
                          +{h.retPct.toFixed(1)}% (+₹{formatINR(h.profit)})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Active UPI AutoPay Mandates */}
        <div className="tilt-card p-6 bg-[#FAF8F5]">
          <div className="tilt-card-content space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#121110]">Active NPCI UPI AutoPay Mandates</h3>
                <p className="text-xs text-[#5C5752] mt-0.5">Systematic monthly debits configured on your Indian bank account.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {portfolio.mandates.map((m) => {
                const isActive = m.status === "ACTIVE";
                return (
                  <div key={m.id} className="p-4 rounded-2xl bg-[#F4EFEA] border border-[#121110]/8 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#121110]">{m.basketName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          isActive ? "bg-[#0F6E56]/10 text-[#0F6E56]" : "bg-amber-600/10 text-amber-700"
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[#5C5752] mt-1">
                        ₹{formatINR(m.monthlyAmountINR)}/mo · Debits {m.debitDay} of every month
                      </div>
                      <div className="text-[10px] font-mono text-[#8C857B] mt-0.5">
                        VPA: {m.vpa} · Next: {m.nextDebitDate}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleMandate(m.id)}
                      className="px-3 py-1.5 rounded-lg border border-[#121110]/15 text-xs font-mono font-bold hover:bg-[#121110] hover:text-[#F4EFEA] transition flex items-center gap-1 cursor-pointer"
                    >
                      {isActive ? (
                        <>
                          <Pause className="w-3 h-3" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" /> Resume
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transaction History Ledger with 1% Section 194S TDS */}
        <div className="tilt-card p-6 bg-[#FAF8F5]">
          <div className="tilt-card-content space-y-4">
            <div>
              <h3 className="text-xl font-bold text-[#121110]">Statutory Transaction Ledger</h3>
              <p className="text-xs text-[#5C5752] mt-0.5">Reconciled with Section 194S 1% TDS and NPCI/IMPS banking rails.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4EFEA] border-b border-[#121110]/10 text-[10px] font-mono text-[#8C857B] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Basket</th>
                    <th className="py-2.5 px-3">Gross INR</th>
                    <th className="py-2.5 px-3">1% Section 194S TDS</th>
                    <th className="py-2.5 px-3">Net Settled INR</th>
                    <th className="py-2.5 px-3">Bank Reference</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#121110]/5 font-mono text-xs">
                  {portfolio.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#F4EFEA]/50">
                      <td className="py-2.5 px-3 text-[#5C5752]">
                        {new Date(tx.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          tx.type === "BUY" ? "text-[#0F6E56]" : "text-[#B85D43]"
                        }`}>
                          {tx.type === "BUY" ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#121110]">{tx.basketName}</td>
                      <td className="py-2.5 px-3 text-[#121110]">₹{formatINR(tx.amountINR)}</td>
                      <td className="py-2.5 px-3 text-rose-700">
                        {tx.tdsINR > 0 ? `-₹${formatINR(tx.tdsINR)}` : "₹0.00"}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#121110]">₹{formatINR(tx.netAmountINR)}</td>
                      <td className="py-2.5 px-3 text-[#8C857B] text-[10px]">{tx.bankRef}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#0F6E56]/10 text-[#0F6E56]">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>

      {/* Quick Buy Modal */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="tilt-card bg-[#FAF8F5] max-w-md w-full p-7 space-y-6">
            <div className="tilt-card-content space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#121110]/10">
                <h3 className="text-xl font-bold text-[#121110]">Invest in Crypto Basket</h3>
                <button 
                  type="button" 
                  onClick={() => setIsBuyModalOpen(false)}
                  className="w-7 h-7 rounded-full border border-[#121110]/15 flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleBuySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#5C5752] mb-1">Select Basket</label>
                  <select 
                    value={selectedBasketId}
                    onChange={(e) => setSelectedBasketId(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-xl border border-[#121110]/15 bg-[#F4EFEA]"
                  >
                    {baskets.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} (NAV: ₹{b.nav.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#5C5752] mb-1">Investment Amount (INR)</label>
                  <input 
                    type="number"
                    min={1000}
                    step={500}
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold p-3 rounded-xl border border-[#121110]/15 bg-[#F4EFEA]"
                  />
                </div>
                <div className="p-3 bg-[#F4EFEA] rounded-xl border border-[#121110]/8 text-xs text-[#5C5752]">
                  Units Allotted: <strong>{(buyAmount / (baskets.find(b => b.id === selectedBasketId)?.nav || 100)).toFixed(4)}</strong>
                </div>
                <button 
                  type="submit" 
                  className="btn-unseen w-full bg-[#121110] text-[#F4EFEA] py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Confirm Investment ↗
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal (1% Section 194S TDS) */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="tilt-card bg-[#FAF8F5] max-w-md w-full p-7 space-y-6">
            <div className="tilt-card-content space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#121110]/10">
                <h3 className="text-xl font-bold text-[#121110]">Withdraw to Indian Bank</h3>
                <button 
                  type="button" 
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="w-7 h-7 rounded-full border border-[#121110]/15 flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#5C5752] mb-1">Select Basket to Redeem</label>
                  <select 
                    value={selectedBasketId}
                    onChange={(e) => setSelectedBasketId(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-xl border border-[#121110]/15 bg-[#F4EFEA]"
                  >
                    {portfolio.holdings.map((h) => (
                      <option key={h.basketId} value={h.basketId}>{h.basketName} ({h.units.toFixed(2)} units)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#5C5752] mb-1">Gross Redemption Amount (INR)</label>
                  <input 
                    type="number"
                    min={500}
                    step={500}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold p-3 rounded-xl border border-[#121110]/15 bg-[#F4EFEA]"
                  />
                </div>
                <div className="p-3 bg-[#F4EFEA] rounded-xl border border-[#121110]/8 text-xs text-[#5C5752] space-y-1">
                  <div className="flex justify-between">
                    <span>Gross Amount:</span>
                    <span className="font-mono font-bold">₹{formatINR(withdrawAmount)}</span>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span>1% Section 194S TDS:</span>
                    <span className="font-mono font-bold">-₹{formatINR(withdrawAmount * 0.01)}</span>
                  </div>
                  <div className="flex justify-between text-[#0F6E56] font-bold border-t border-[#121110]/10 pt-1">
                    <span>Net Bank Payout:</span>
                    <span className="font-mono">₹{formatINR(withdrawAmount * 0.99)}</span>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="btn-unseen w-full bg-[#121110] text-[#F4EFEA] py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Liquidate & Settle to Bank ↗
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
