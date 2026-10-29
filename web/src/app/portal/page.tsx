"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  Calendar, 
  Wallet, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Pause, 
  Play,
  Search,
  Bell,
  Moon,
  Sun,
  LayoutDashboard,
  Layers,
  CalendarClock,
  Receipt,
  Settings,
  HelpCircle,
  Download,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  FileText,
  PieChart,
  Eye,
  Check,
  ArrowRight,
  Zap,
  Thermometer,
  Plug,
  LogOut,
  LogIn,
  User as UserIcon
} from "lucide-react";
import { useBaskly } from "@/context/BasklyContext";
import { downloadTdsReportBlob } from "@/services/api";
import GrowthChart from "@/components/portal/GrowthChart";
import SIPMandateModal from "@/components/portal/SIPMandateModal";
import InvestmentModal from "@/components/portal/InvestmentModal";
import RedemptionModal from "@/components/portal/RedemptionModal";
import InvoiceModal from "@/components/portal/InvoiceModal";
import SettingsModal from "@/components/portal/SettingsModal";
import SupportModal from "@/components/portal/SupportModal";
import PrimeModal from "@/components/portal/PrimeModal";
import AuthModal from "@/components/modals/AuthModal";
import { Transaction, Mandate } from "@/types/baskly";

export default function PortalPage() {
  const router = useRouter();
  const { 
    user, 
    portfolio, 
    baskets, 
    buyBasket, 
    withdrawBasket, 
    createMandate, 
    toggleMandate, 
    refreshPortfolio,
    openAuthModal,
    logout
  } = useBaskly();

  // Active Menu Navigation tab
  const [activeNav, setActiveNav] = useState<"overview" | "holdings" | "mandates" | "ledger">("overview");

  // Theme state (light / dark) with localStorage persistence
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("baskly_portal_theme") as "light" | "dark" | null;
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("baskly_portal_theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const isDark = theme === "dark";

  // Modals state
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isSIPModalOpen, setIsSIPModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isPrimeModalOpen, setIsPrimeModalOpen] = useState(false);
  const [isPrimeActive, setIsPrimeActive] = useState(true);
  const [selectedTxForInvoice, setSelectedTxForInvoice] = useState<Transaction | null>(null);

  // Inspected holding for holdings view
  const [inspectedHoldingId, setInspectedHoldingId] = useState<string>("top-5-index");

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [ledgerFilter, setLedgerFilter] = useState<"ALL" | "BUY" | "WITHDRAWAL">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  // Handle complete logout and redirection to signin page
  const handleLogout = () => {
    setIsSettingsModalOpen(false);
    logout();
    router.push("/signin");
  };

  // Prevent background page from scrolling when any modal is open
  const isAnyModalOpen = 
    isBuyModalOpen || 
    isWithdrawModalOpen || 
    isSIPModalOpen || 
    isSettingsModalOpen || 
    isSupportModalOpen || 
    isPrimeModalOpen || 
    Boolean(selectedTxForInvoice);

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  // Refresh data on mount
  useEffect(() => {
    refreshPortfolio();
  }, []);

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
  
  const activeMandates = portfolio.mandates.filter((m) => m.status === "ACTIVE");
  const activeSipAmount = activeMandates.reduce((sum, m) => sum + m.monthlyAmountINR, 0);

  // Helper to determine effective frequency
  const getMandateFrequency = (m: Mandate, index: number): "Daily" | "Weekly" | "Monthly" => {
    if (m.frequency) return m.frequency;
    return "Monthly";
  };

  // Helper to format the next date according to the date and frequency fixed during SIP setup
  const getMandateNextDate = (m: Mandate, index: number): string => {
    // 1. If nextDebitDate is explicitly set on the mandate, use it directly!
    if (m.nextDebitDate && typeof m.nextDebitDate === "string") {
      const parts = m.nextDebitDate.split("T")[0].split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const mth = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const parsed = new Date(y, mth, d);
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString("en-IN", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });
        }
      }
    }

    // 2. Otherwise calculate accurately based on the frequency and date fixed during setup:
    const now = new Date();
    const freq = getMandateFrequency(m, index);

    if (freq === "Daily") {
      const d = new Date(now);
      d.setDate(now.getDate() + 1);
      return d.toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" });
    }

    if (freq === "Weekly") {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const targetIdx = m.weeklyDay ? daysOfWeek.indexOf(m.weeklyDay) : -1;
      const currentIdx = now.getDay();
      let diff = targetIdx >= 0 ? targetIdx - currentIdx : 7;
      if (diff <= 0) diff += 7;
      const d = new Date(now);
      d.setDate(now.getDate() + diff);
      return d.toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" });
    }

    // Monthly: compute from the debitDay fixed during setup (e.g. 5, 10, 15, 20)
    let day = Number(m.debitDay);
    if (!day || isNaN(day) || day < 1 || day > 28) {
      day = index === 0 ? 5 : 15;
    }

    let nextYear = now.getFullYear();
    let nextMonth = now.getMonth();

    if (day <= now.getDate()) {
      nextMonth += 1;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear += 1;
      }
    }

    const daysInMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    const finalDay = Math.min(day, daysInMonth);
    const d = new Date(nextYear, nextMonth, finalDay);

    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Find earliest upcoming debit date among active mandates
  const earliestMandateDate = activeMandates.length > 0
    ? activeMandates
        .map((m, idx) => getMandateNextDate(m, idx))
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0] || "Nov 05, 2026"
    : "Nov 05, 2026";

  // Section 194S TDS calculations across all transactions
  const totalTdsDeducted = portfolio.transactions.reduce((sum, tx) => sum + (tx.tdsINR || 0), 0);
  const totalNetSettled = portfolio.transactions.reduce((sum, tx) => sum + (tx.netAmountINR || 0), 0);

  // Filtered transactions
  const filteredTransactions = portfolio.transactions.filter((tx) => {
    const matchesSearch =
      tx.basketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.bankRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = ledgerFilter === "ALL" || tx.type === ledgerFilter;
    const matchesStatus = statusFilter === "ALL" || tx.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle CSV Download directly from Spring Boot ReportController
  const handleDownloadTdsReport = async () => {
    try {
      setIsDownloadingReport(true);
      const blob = await downloadTdsReportBlob(user?.id);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Baskly_Section194S_TDS_Ledger_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const headers = "Transaction_ID,Date,Type,Basket,Gross_INR,TDS_194S_INR,Net_Settled_INR,Bank_Ref,Status\n";
        const rows = portfolio.transactions.map((t) => 
          `"${t.id}","${t.timestamp}","${t.type}","${t.basketName}",${t.amountINR},${t.tdsINR},${t.netAmountINR},"${t.bankRef}","${t.status}"`
        ).join("\n");
        const fallbackBlob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(fallbackBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Baskly_Section194S_TDS_Ledger.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch {
      alert("Could not generate report. Please try again.");
    } finally {
      setIsDownloadingReport(false);
    }
  };

  return (
    <div className={`min-h-screen p-3 sm:p-6 lg:p-8 flex items-start justify-center font-sans antialiased selection:bg-[#0B3B24] selection:text-white transition-colors duration-300 ${
      isDark ? "dark bg-[#080B0E]" : "bg-[#D9E1DC]"
    }`}>
      
      {/* Outer Dashboard Canvas Frame (like the tablet/board in the reference image) */}
      <div className={`w-full max-w-[1520px] rounded-[32px] sm:rounded-[42px] p-4 sm:p-6 lg:p-7 flex flex-col lg:flex-row gap-6 transition-colors duration-300 border ${
        isDark
          ? "bg-[#0C0F12] border-[#181D22] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)]"
          : "bg-[#EAEEEC] border-[#D3DCD6] shadow-[0_30px_90px_-20px_rgba(11,59,36,0.12)]"
      }`}>
        
        {/* ========================================================= */}
        {/* 1. SEPARATE LEFT SIDEBAR BOX                              */}
        {/* ========================================================= */}
        <aside className={`w-full lg:w-64 rounded-[28px] p-6 flex flex-col justify-between shrink-0 transition-colors duration-300 border shadow-xs ${
          isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
        }`}>
          <div className="space-y-8">
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-[#0B3B24] flex items-center justify-center text-white font-serif font-bold text-lg shadow-xs group-hover:scale-105 transition">
                b
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-extrabold tracking-tight leading-none ${isDark ? "text-white" : "text-[#0F172A]"}`}>
                  baskly<span className="font-serif italic font-normal text-xl text-[#0B3B24] dark:text-emerald-400">.money</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider uppercase mt-1">
                  Retail Investor Desk
                </span>
              </div>
            </Link>

            {/* Menu Group 1: Navigation */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-2 font-mono">
                MENU
              </div>

              {/* 1. Portfolio Overview */}
              <button
                type="button"
                onClick={() => setActiveNav("overview")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  activeNav === "overview"
                    ? isDark
                      ? "bg-[#0B3B24] text-emerald-300 border border-emerald-500/30 font-bold"
                      : "bg-[#E8F4EC] text-[#0B3B24] shadow-2xs font-bold"
                    : isDark
                      ? "text-slate-400 hover:bg-[#1A2026] hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Portfolio Overview</span>
              </button>

              {/* 2. Curated Holdings */}
              <button
                type="button"
                onClick={() => setActiveNav("holdings")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  activeNav === "holdings"
                    ? isDark
                      ? "bg-[#0B3B24] text-emerald-300 border border-emerald-500/30 font-bold"
                      : "bg-[#E8F4EC] text-[#0B3B24] shadow-2xs font-bold"
                    : isDark
                      ? "text-slate-400 hover:bg-[#1A2026] hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Curated Holdings</span>
              </button>

              {/* 3. SIP Mandates */}
              <button
                type="button"
                onClick={() => setActiveNav("mandates")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  activeNav === "mandates"
                    ? isDark
                      ? "bg-[#0B3B24] text-emerald-300 border border-emerald-500/30 font-bold"
                      : "bg-[#E8F4EC] text-[#0B3B24] shadow-2xs font-bold"
                    : isDark
                      ? "text-slate-400 hover:bg-[#1A2026] hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <CalendarClock className="w-4 h-4 shrink-0" />
                <span>SIP Mandates</span>
                {activeMandates.length > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-[#0B3B24] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeMandates.length}
                  </span>
                )}
              </button>

              {/* 4. Tax & TDS Ledger */}
              <button
                type="button"
                onClick={() => setActiveNav("ledger")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  activeNav === "ledger"
                    ? isDark
                      ? "bg-[#0B3B24] text-emerald-300 border border-emerald-500/30 font-bold"
                      : "bg-[#E8F4EC] text-[#0B3B24] shadow-2xs font-bold"
                    : isDark
                      ? "text-slate-400 hover:bg-[#1A2026] hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Receipt className="w-4 h-4 shrink-0" />
                <span>Tax & TDS Ledger</span>
              </button>
            </div>

            {/* Menu Group 2: Account */}
            <div className="space-y-1.5 pt-2">
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-2 font-mono">
                ACCOUNT
              </div>

              {/* Settings */}
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    router.push("/signin");
                  } else {
                    setIsSettingsModalOpen(true);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  isDark
                    ? "text-slate-400 hover:bg-[#1A2026] hover:text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>{user ? "Settings & Profile" : "Sign In to Account"}</span>
              </button>

              {/* Support */}
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(true)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  isDark
                    ? "text-slate-400 hover:bg-[#1A2026] hover:text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Support & Guides</span>
              </button>
            </div>
          </div>

          {/* Bottom Promo Card: Baskly Prime */}
          <div className={`mt-8 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden transition-colors ${
            isDark ? "bg-[#0B3B24] border border-[#164E35] shadow-lg shadow-black/30" : "bg-[#0B3B24] shadow-md shadow-[#0B3B24]/15"
          }`}>
            <div className="absolute -right-3 -bottom-3 w-20 h-20 bg-white/5 rounded-full pointer-events-none" />
            <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Baskly Prime</span>
            </div>
            <h4 className="text-xs font-bold text-white tracking-wide mt-1">Algorithmic Rebalancing</h4>
            <p className="text-[11px] text-emerald-100/80 mt-1 leading-snug">
              Upgrade for automated drift protection & compounding.
            </p>
            <button
              type="button"
              onClick={() => setIsPrimeModalOpen(true)}
              className={`mt-3.5 w-full text-xs font-bold py-2 px-3 rounded-full text-center transition cursor-pointer shadow-xs ${
                isDark
                  ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                  : "bg-white text-[#0B3B24] hover:bg-emerald-50"
              }`}
            >
              Explore Prime ↗
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. MAIN DASHBOARD CONTENT AREA                            */}
        {/* ========================================================= */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* Top Bar: Floating Standalone Search Pill & Control Boxes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Standalone Pill Search Box */}
            <div className={`relative flex-1 max-w-lg rounded-full px-5 py-2.5 flex items-center gap-3 transition-colors border shadow-xs ${
              isDark
                ? "bg-[#13171B] border-[#1E2429] text-white"
                : "bg-white border-[#DEE5E0] text-slate-800"
            }`}>
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search baskets, tokens, mandates, or tx hash..."
                className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Top Right Floating Controls */}
            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
              
              {/* Standalone Theme Switch Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`w-10.5 h-10.5 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer border ${
                  isDark
                    ? "bg-[#13171B] border-[#1E2429] text-amber-400 hover:bg-[#1A2026]"
                    : "bg-white border-[#DEE5E0] text-slate-600 hover:bg-slate-50"
                }`}
                title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
                )}
              </button>

              {/* Standalone Notification Bell Button */}
              <button
                type="button"
                onClick={() => alert("Notice: Inception NAVs and Section 194S TDS ledger synced with banking rails.")}
                className={`w-10.5 h-10.5 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer border relative ${
                  isDark
                    ? "bg-[#13171B] border-[#1E2429] text-slate-300 hover:bg-[#1A2026]"
                    : "bg-white border-[#DEE5E0] text-slate-600 hover:bg-slate-50"
                }`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#13171B]" />
              </button>

              {/* Standalone User Profile Pill Box with Login/Logout */}
              <div 
                className={`flex items-center gap-2.5 rounded-full py-1.5 pl-2 pr-2.5 shadow-xs transition border ${
                  isDark
                    ? "bg-[#13171B] border-[#1E2429]"
                    : "bg-white border-[#DEE5E0]"
                }`}
              >
                {user ? (
                  <>
                    {/* Profile Avatar & Name Info (Click to open settings) */}
                    <button 
                      type="button"
                      onClick={() => setIsSettingsModalOpen(true)}
                      className="flex items-center gap-2.5 cursor-pointer group text-left bg-transparent border-0 p-0 focus:outline-none"
                      title="Click to view profile & settings"
                    >
                      <img
                        src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"}
                        alt={user.name || "Investor"}
                        className="w-8 h-8 rounded-full object-cover border border-[#0B3B24]/20 group-hover:scale-105 transition"
                      />
                      <div className="text-left">
                        <div className={`text-xs font-bold leading-tight group-hover:underline ${isDark ? "text-white" : "text-slate-900"}`}>
                          {user.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">
                          PAN {user.pan || "ABCDE1234F"} · KYC Verified
                        </div>
                      </div>
                    </button>

                    {/* Subtle Divider */}
                    <div className={`w-[1px] h-6 ${isDark ? "bg-[#22282E]" : "bg-[#EAEFEA]"}`} />

                    {/* Logout Button: completely logs out and routes to signin */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                        isDark
                          ? "bg-[#1A2026] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-[#262D35]"
                          : "bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200"
                      }`}
                      title="Log out completely to sign-in page"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Guest Investor Avatar & Link to Sign In */}
                    <Link
                      href="/signin"
                      className="flex items-center gap-2.5 cursor-pointer group text-left"
                      title="Click to sign in"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition border ${
                        isDark 
                          ? "bg-[#1A2026] border-[#262D35] text-slate-300 group-hover:bg-[#222A32]" 
                          : "bg-slate-100 border-slate-200 text-slate-600 group-hover:bg-slate-200"
                      }`}>
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className={`text-xs font-bold leading-tight group-hover:underline ${isDark ? "text-white" : "text-slate-900"}`}>
                          Guest Investor
                        </div>
                        <div className="text-[10px] text-slate-400 leading-none mt-0.5">
                          Not signed in
                        </div>
                      </div>
                    </Link>

                    {/* Subtle Divider */}
                    <div className={`w-[1px] h-6 ${isDark ? "bg-[#22282E]" : "bg-[#EAEFEA]"}`} />

                    {/* Working Login Button navigating to sign-in */}
                    <Link
                      href="/signin"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-xs ${
                        isDark
                          ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                          : "bg-[#0B3B24] hover:bg-[#072919] text-white"
                      }`}
                      title="Sign in to your account"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Login</span>
                    </Link>
                  </>
                )}
              </div>

            </div>
          </div>

          {/* Quick Tab Switcher on Mobile / Responsive */}
          <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: "overview", label: "Portfolio Overview" },
              { id: "holdings", label: "Curated Holdings" },
              { id: "mandates", label: "SIP Mandates" },
              { id: "ledger", label: "Tax & TDS Ledger" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveNav(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full font-bold transition shrink-0 cursor-pointer ${
                  activeNav === tab.id
                    ? "bg-[#0B3B24] text-white shadow-xs"
                    : isDark
                      ? "bg-[#13171B] border border-[#1E2429] text-slate-300"
                      : "bg-white border border-[#DEE5E0] text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Header Row: Title & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#0F172A]"}`}>
                {activeNav === "overview" && "Portfolio Dashboard"}
                {activeNav === "holdings" && "Curated Basket Holdings"}
                {activeNav === "mandates" && "SIP AutoPay Mandates"}
                {activeNav === "ledger" && "Section 194S Tax & Settlement Ledger"}
              </h1>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {activeNav === "overview" && "Real-time compounding, algorithmic basket rebalancing, and statutory Section 194S compliance."}
                {activeNav === "holdings" && "Track underlying constituent weights, basket NAVs, and rebalance triggers."}
                {activeNav === "mandates" && "Configure NPCI UPI AutoPay & automated recurring compounding."}
                {activeNav === "ledger" && "Statutory 1% TDS deduction accounting, Form 26AS verification, and banking references."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              
              {/* Primary Green Action Pill (+ Setup SIP Mandate) */}
              <button
                type="button"
                onClick={() => setIsSIPModalOpen(true)}
                className="bg-[#0B3B24] hover:bg-[#072919] text-white px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>+ Setup SIP Mandate</span>
              </button>

              {/* White Action Pill (+ Add Investment) */}
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(true)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border ${
                  isDark
                    ? "bg-[#13171B] hover:bg-[#1A2026] text-slate-200 border-[#1E2429]"
                    : "bg-white hover:bg-slate-50 text-slate-800 border-[#DEE5E0]"
                }`}
              >
                <span>+ Add Investment</span>
              </button>

              {/* Redeem / Withdraw Pill */}
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border ${
                  isDark
                    ? "bg-[#13171B] hover:bg-[#1A2026] text-rose-400 border-[#1E2429]"
                    : "bg-white hover:bg-slate-50 text-rose-700 border-[#DEE5E0]"
                }`}
              >
                <span>Redeem (1% TDS)</span>
              </button>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB VIEW 1: PORTFOLIO OVERVIEW                                            */}
          {/* ========================================================================= */}
          {activeNav === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* TOP 4 STAT CARDS (Each in its own separate floating box) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                
                {/* Card 1: Hero Deep Forest Green Card */}
                <div className={`text-white rounded-[26px] p-6 shadow-md flex flex-col justify-between min-h-[155px] relative overflow-hidden group transition-colors ${
                  isDark
                    ? "bg-[#0B3B24] border border-emerald-500/30 shadow-black/30"
                    : "bg-[#0B3B24] shadow-md shadow-[#0B3B24]/15"
                }`}>
                  <div className="flex items-center justify-between text-xs text-emerald-100/90 font-medium">
                    <span>Total Portfolio Value</span>
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="my-2">
                    <div className="text-3xl font-extrabold font-mono tracking-tight text-white flex items-baseline gap-1.5">
                      <span>₹{totalWealth.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
                    <span>↗</span>
                    <span>+₹{totalProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })} (+{totalReturnPct.toFixed(1)}%) Total Gain</span>
                  </div>
                </div>

                {/* Card 2: Current Invested */}
                <div className={`rounded-[26px] p-6 shadow-xs border flex flex-col justify-between min-h-[155px] group transition-colors ${
                  isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                }`}>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Current Invested</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isDark ? "bg-[#1A2026] text-emerald-400" : "bg-slate-50 text-slate-400"
                    }`}>
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="my-2">
                    <div className={`text-3xl font-extrabold font-mono tracking-tight flex items-baseline gap-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                      <span>₹{totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className={`text-xs font-semibold flex items-center gap-1 ${
                    totalProfit >= 0
                      ? isDark ? "text-emerald-400" : "text-emerald-700"
                      : "text-rose-500"
                  }`}>
                    <span>Unrealized P&L: ₹{totalProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Card 3: Active Monthly SIP */}
                <div className={`rounded-[26px] p-6 shadow-xs border flex flex-col justify-between min-h-[155px] group transition-colors ${
                  isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                }`}>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Active Auto-Debits</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isDark ? "bg-[#1A2026] text-amber-400" : "bg-slate-50 text-slate-400"
                    }`}>
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="my-2">
                    <div className={`text-3xl font-extrabold font-mono tracking-tight flex items-baseline gap-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                      <span>₹{activeSipAmount.toLocaleString("en-IN")}</span>
                      <span className="text-sm font-semibold font-sans text-slate-400">/mo</span>
                    </div>
                  </div>
                  <div className="text-xs font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>● {activeMandates.length} Active Mandates · UPI AutoPay</span>
                  </div>
                </div>

                {/* Card 4: Available Cash Balance */}
                <div className={`rounded-[26px] p-6 shadow-xs border flex flex-col justify-between min-h-[155px] group transition-colors ${
                  isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                }`}>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Available Cash Balance</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isDark ? "bg-[#1A2026] text-slate-300" : "bg-slate-50 text-slate-400"
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="my-2">
                    <div className={`text-3xl font-extrabold font-mono tracking-tight flex items-baseline gap-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                      <span>₹{portfolio.cashBalanceINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-sans flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>T+1 Bank Settlement · Instant Top-up</span>
                  </div>
                </div>

              </div>

              {/* MIDDLE ROW: Basket Allocation (Donut) & Growth Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left Card: Savings Progress 67% Donut */}
                <div className={`lg:col-span-5 rounded-[28px] p-6 shadow-xs border flex flex-col justify-between transition-colors ${
                  isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                }`}>
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-[#0F172A]"}`}>
                        Savings Progress
                      </h3>
                      <p className="text-xs text-slate-400">Goal ₹6,00,000 Portfolio Target</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setActiveNav("holdings")}
                      className={`text-xs font-semibold cursor-pointer ${
                        isDark ? "text-emerald-400 hover:underline" : "text-[#0B3B24] hover:underline"
                      }`}
                    >
                      Details ↗
                    </button>
                  </div>

                  {/* Circular Donut Gauge Centered */}
                  <div className="flex-1 flex items-center justify-center py-6 my-auto">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                        <circle
                          cx="80"
                          cy="80"
                          r="60"
                          stroke={isDark ? "#22272E" : "#EDF3EF"}
                          strokeWidth="15"
                          fill="transparent"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="60"
                          stroke={isDark ? "#10B981" : "#0B3B24"}
                          strokeWidth="15"
                          strokeDasharray="377"
                          strokeDashoffset="124"
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className={`text-4xl font-extrabold tracking-tight font-sans leading-none ${isDark ? "text-white" : "text-[#0F172A]"}`}>
                          67%
                        </span>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-1.5">
                          GOAL REACHED
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Allocation Legend with Baskly baskets */}
                  <div className={`space-y-3 pt-4 border-t text-xs ${isDark ? "border-[#1E2429]" : "border-[#F1F5F2]"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0B3B24]" />
                        <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Top-5 Bluechip Index</span>
                      </div>
                      <span className={`font-mono font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        ₹{(totalWealth * 0.55).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#88C9A4]" />
                        <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Crypto + Gold Reserve</span>
                      </div>
                      <span className={`font-mono font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        ₹{(totalWealth * 0.30).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                        <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Pure Bitcoin Sovereign</span>
                      </div>
                      <span className={`font-mono font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        ₹{(totalWealth * 0.15).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Growth Chart */}
                <div className="lg:col-span-7">
                  <GrowthChart
                    baskets={baskets}
                    portfolioWealth={totalWealth}
                    totalInvested={totalInvested}
                    isDark={isDark}
                  />
                </div>

              </div>

              {/* BOTTOM ROW: Smart Mandates & Section 194S TDS Tracker */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left Card: Smart Mandates */}
                <div className={`lg:col-span-7 rounded-[28px] p-6 shadow-xs border flex flex-col justify-between transition-colors ${
                  isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-[#0F172A]"}`}>
                          Smart Mandates (e-NACH & UPI)
                        </h3>
                        <p className="text-xs text-slate-400">Systematic recurring debits configured on your Indian bank account</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSIPModalOpen(true)}
                        className={`text-xs font-semibold hover:underline cursor-pointer ${
                          isDark ? "text-emerald-400" : "text-[#0B3B24]"
                        }`}
                      >
                        + Setup Mandate
                      </button>
                    </div>

                    {/* 2x2 Grid of Mandates with Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {portfolio.mandates.map((m, idx) => {
                        const isActive = m.status === "ACTIVE";
                        return (
                          <div key={m.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition ${
                            isDark ? "bg-[#1A2026] border-[#262D35]" : "bg-[#F8FAF9] border-[#E8EEEA]"
                          }`}>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isDark ? "bg-[#222A32] text-slate-300" : "bg-white border border-[#DEE5E0] text-slate-600"
                              }`}>
                                <CalendarClock className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className={`font-bold text-xs truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                                  {m.basketName}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  ₹{m.monthlyAmountINR.toLocaleString("en-IN")}/{getMandateFrequency(m, idx) === "Weekly" ? "wk" : "mo"} • {getMandateFrequency(m, idx)} • {isActive ? "Active" : "Paused"}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Next: {getMandateNextDate(m, idx)}
                                </div>
                              </div>
                            </div>

                            {/* iOS style toggle */}
                            <button
                              type="button"
                              onClick={() => toggleMandate(m.id)}
                              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                                isActive ? "bg-[#0B3B24]" : (isDark ? "bg-slate-700" : "bg-slate-300")
                              }`}
                              title={isActive ? "Pause Mandate" : "Resume Mandate"}
                            >
                              <div
                                className={`w-4 h-4 rounded-full bg-white transition-transform transform shadow-xs absolute top-1 ${
                                  isActive ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 mt-4 border-t border-slate-100 dark:border-[#1E2429] flex items-center justify-between text-xs text-slate-400">
                    <span>NPCI e-Mandate Certified · HDFC / ICICI / SBI Supported</span>
                    <button
                      type="button"
                      onClick={() => setActiveNav("mandates")}
                      className={`font-semibold hover:underline cursor-pointer ${isDark ? "text-emerald-400" : "text-[#0B3B24]"}`}
                    >
                      View All Mandates ({portfolio.mandates.length}) →
                    </button>
                  </div>
                </div>

                {/* Right Card: Section 194S TDS Tracker */}
                <div className={`lg:col-span-5 rounded-[28px] p-6 shadow-md relative overflow-hidden flex flex-col justify-between transition-colors ${
                  isDark ? "bg-[#0B3B24] border border-emerald-500/30 shadow-black/30" : "bg-[#0B3B24] shadow-md shadow-[#0B3B24]/15 text-white"
                }`}>
                  {/* Decorative Circular Watermarks */}
                  <div className="absolute right-0 bottom-0 w-48 h-48 rounded-full border border-white/5 pointer-events-none transform translate-x-12 translate-y-12" />
                  <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full border border-white/10 pointer-events-none transform translate-x-6 translate-y-6" />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        Section 194S TDS Tracker
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white uppercase tracking-wider">
                        FORM 26AS COMPLIANT
                      </span>
                    </div>

                    <p className="text-xs text-emerald-100/80">
                      Statutory 1% TDS deducted at redemption & remitted to Income Tax Dept.
                    </p>

                    <div className="grid grid-cols-2 gap-4 my-6">
                      <div>
                        <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-200">
                          TDS REMITTED (1%)
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1 flex items-baseline gap-1">
                          <span>₹{totalTdsDeducted.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-200">
                          NET BANK SETTLED
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1 flex items-baseline gap-1">
                          <span>₹{totalNetSettled.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadTdsReport}
                      disabled={isDownloadingReport}
                      className="flex-1 bg-white/15 hover:bg-white/25 text-white border border-white/10 py-2.5 px-4 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingReport ? "Exporting..." : "Download Form 26AS TDS CSV"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveNav("ledger")}
                      className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold transition cursor-pointer shrink-0 border border-white/10"
                      title="View Ledger"
                    >
                      <span>Ledger ↗</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Curated Basket Holdings Preview */}
              <div className={`border rounded-[28px] p-6 shadow-xs space-y-4 transition-colors ${
                isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-[#0F172A]"}`}>
                      Curated Basket Holdings
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Underlying multi-asset crypto indices and live oracle valuations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav("holdings")}
                    className={`text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                      isDark ? "text-emerald-400" : "text-[#0B3B24]"
                    }`}
                  >
                    <span>View Constituent Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                      isDark ? "bg-[#181D22] border-[#22282E] text-slate-400" : "bg-[#F8FAF9] border-[#E8EEEA] text-slate-400"
                    }`}>
                      <tr>
                        <th className="py-3 px-3.5">Basket Name</th>
                        <th className="py-3 px-3">Units Held</th>
                        <th className="py-3 px-3">Avg Buy NAV</th>
                        <th className="py-3 px-3">Live NAV</th>
                        <th className="py-3 px-3">Invested INR</th>
                        <th className="py-3 px-3">Current Valuation</th>
                        <th className="py-3 px-3 text-right">Returns</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-mono text-xs ${
                      isDark ? "divide-[#1E2429] text-slate-300" : "divide-[#F1F5F2]"
                    }`}>
                      {holdingsWithLiveNav.map((h) => (
                        <tr key={h.basketId} className={`transition ${
                          isDark ? "hover:bg-[#1A2026]" : "hover:bg-[#F8FAF9]/80"
                        }`}>
                          <td className={`py-3 px-3.5 font-sans font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>
                            {h.basketName}
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-bold">{h.units.toFixed(2)}</td>
                          <td className="py-3 px-3 text-slate-500">₹{h.avgBuyNav.toFixed(2)}</td>
                          <td className={`py-3 px-3 font-bold ${isDark ? "text-emerald-400" : "text-[#0B3B24]"}`}>₹{h.liveNav.toFixed(2)}</td>
                          <td className="py-3 px-3 text-slate-400">₹{h.investedAmountINR.toLocaleString("en-IN")}</td>
                          <td className={`py-3 px-3 font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>₹{h.currentVal.toLocaleString("en-IN")}</td>
                          <td className="py-3 px-3 text-right">
                            <span className={`font-bold inline-block px-2 py-0.5 rounded-md ${
                              isDark ? "bg-[#0B3B24] text-emerald-300 border border-emerald-500/30" : "bg-[#E8F4EC] text-[#0B3B24]"
                            }`}>
                              +{h.retPct.toFixed(1)}% (+₹{h.profit.toLocaleString("en-IN")})
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB VIEW 2: CURATED HOLDINGS & CONSTITUENT BREAKDOWN                       */}
          {/* ========================================================================= */}
          {activeNav === "holdings" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Holdings Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-5 rounded-[28px] text-white shadow-sm flex flex-col justify-between transition-colors ${
                  isDark ? "bg-[#0B3B24] border border-emerald-500/30 shadow-black/30" : "bg-[#0B3B24]"
                }`}>
                  <span className="text-xs text-emerald-200">Total Basket Valuation</span>
                  <div className="text-3xl font-bold font-mono my-1">
                    ₹{totalWealth.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                  </div>
                  <span className="text-xs text-emerald-300">Across {holdingsWithLiveNav.length} Thematic Baskets</span>
                </div>

                <div className={`p-5 rounded-[28px] border shadow-xs flex flex-col justify-between transition-colors ${
                  isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                }`}>
                  <span className="text-xs text-slate-400">Net Invested Principal</span>
                  <div className={`text-3xl font-bold font-mono my-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                    ₹{totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                  </div>
                  <span className="text-xs text-slate-500">Inception Base ₹100.00 Anchor</span>
                </div>

                <div className={`p-5 rounded-[28px] border shadow-xs flex flex-col justify-between transition-colors ${
                  isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                }`}>
                  <span className="text-xs text-slate-400">Unrealized Capital Gains</span>
                  <div className={`text-3xl font-bold font-mono my-1 ${isDark ? "text-emerald-400" : "text-[#0B3B24]"}`}>
                    +₹{totalProfit.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                  </div>
                  <span className={`text-xs font-semibold ${isDark ? "text-emerald-400" : "text-[#0B3B24]"}`}>
                    +{totalReturnPct.toFixed(1)}% Multi-Asset Compound
                  </span>
                </div>
              </div>

              {/* Holdings Table */}
              <div className={`border rounded-[28px] p-6 shadow-xs space-y-4 transition-colors ${
                isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>Active Basket Holdings</h3>
                    <p className="text-xs text-slate-400">Select any basket to inspect underlying token weights and oracle pricing.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBuyModalOpen(true)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                      isDark ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-[#0B3B24] hover:bg-[#072919] text-white"
                    }`}
                  >
                    + Invest in Basket
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                      isDark ? "bg-[#181D22] border-[#22282E] text-slate-400" : "bg-[#F8FAF9] border-[#E8EEEA] text-slate-400"
                    }`}>
                      <tr>
                        <th className="py-3 px-3.5">Basket Name</th>
                        <th className="py-3 px-3">Units Held</th>
                        <th className="py-3 px-3">Avg Buy NAV</th>
                        <th className="py-3 px-3">Live NAV</th>
                        <th className="py-3 px-3">Invested INR</th>
                        <th className="py-3 px-3">Current Valuation</th>
                        <th className="py-3 px-3">Returns</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-mono text-xs ${
                      isDark ? "divide-[#1E2429] text-slate-300" : "divide-[#F1F5F2]"
                    }`}>
                      {holdingsWithLiveNav.map((h) => {
                        const isSelected = inspectedHoldingId === h.basketId;
                        return (
                          <tr
                            key={h.basketId}
                            onClick={() => setInspectedHoldingId(h.basketId)}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? isDark
                                  ? "bg-[#0B3B24]/40 font-semibold"
                                  : "bg-[#E8F4EC]/60 font-semibold"
                                : isDark
                                  ? "hover:bg-[#1A2026]"
                                  : "hover:bg-[#F8FAF9]/80"
                            }`}
                          >
                            <td className={`py-3.5 px-3.5 font-sans font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-[#0F172A]"}`}>
                              {isSelected && <span className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-emerald-400" : "bg-[#0B3B24]"}`} />}
                              <span>{h.basketName}</span>
                            </td>
                            <td className="py-3.5 px-3 text-slate-400">{h.units.toFixed(2)}</td>
                            <td className="py-3.5 px-3 text-slate-500">₹{h.avgBuyNav.toFixed(2)}</td>
                            <td className={`py-3.5 px-3 font-bold ${isDark ? "text-emerald-400" : "text-[#0B3B24]"}`}>₹{h.liveNav.toFixed(2)}</td>
                            <td className="py-3.5 px-3 text-slate-400">₹{h.investedAmountINR.toLocaleString("en-IN")}</td>
                            <td className={`py-3.5 px-3 font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>₹{h.currentVal.toLocaleString("en-IN")}</td>
                            <td className="py-3.5 px-3">
                              <span className={`font-bold inline-block px-2 py-0.5 rounded-md ${
                                isDark ? "bg-[#0B3B24] text-emerald-300 border border-emerald-500/30" : "bg-[#E8F4EC] text-[#0B3B24]"
                              }`}>
                                +{h.retPct.toFixed(1)}% (+₹{h.profit.toLocaleString("en-IN")})
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right space-x-2 font-sans" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setIsBuyModalOpen(true)}
                                className={`text-xs font-bold hover:underline cursor-pointer ${isDark ? "text-emerald-400" : "text-[#0B3B24]"}`}
                              >
                                Buy
                              </button>
                              <span className="text-slate-600">·</span>
                              <button
                                type="button"
                                onClick={() => setIsWithdrawModalOpen(true)}
                                className={`text-xs font-bold hover:underline cursor-pointer ${isDark ? "text-rose-400" : "text-rose-700"}`}
                              >
                                Redeem
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Constituent Token Allocation Breakdown */}
              {(() => {
                const currentInspected = baskets.find((b) => b.id === inspectedHoldingId) || baskets[0];
                return (
                  <div className={`border rounded-[28px] p-6 shadow-xs space-y-4 transition-colors ${
                    isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isDark ? "bg-[#0B3B24] text-emerald-300 border border-emerald-500/30" : "bg-[#E8F4EC] text-[#0B3B24]"
                          }`}>
                            Constituent Weights
                          </span>
                          <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{currentInspected.name}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {currentInspected.tagline || currentInspected.description}
                        </p>
                      </div>
                      <div className={`font-mono text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Drift Threshold: <strong>±5.00%</strong> · Rebalancing: <strong>Algorithmic</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
                      {currentInspected.assets.map((asset) => (
                        <div key={asset.symbol} className={`p-4 rounded-2xl border space-y-2 ${
                          isDark ? "bg-[#22242B] border-[#2C2E37]" : "bg-[#F8FAF9] border-[#E2E8E4]"
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color || "#0B3B24" }} />
                            <span className={`font-mono text-xs font-bold ${isDark ? "text-emerald-400" : "text-[#0B3B24]"}`}>{asset.weight}%</span>
                          </div>
                          <div className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{asset.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">
                            Symbol: <strong className={isDark ? "text-slate-200" : "text-slate-800"}>{asset.symbol}</strong>
                          </div>
                          <div className={`text-xs font-mono font-bold pt-1 border-t ${
                            isDark ? "text-white border-[#2E303A]" : "text-slate-900 border-[#EAEFEA]"
                          }`}>
                            ₹{(asset.price_inr || 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB VIEW 3: SYSTEMATIC SIP MANDATES (Full Manager)                        */}
          {/* ========================================================================= */}
          {activeNav === "mandates" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Mandates Summary Banner */}
              <div className={`p-6 rounded-[28px] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                isDark ? "bg-[#0B3B24] border border-emerald-500/30 shadow-black/30" : "bg-[#0B3B24]"
              }`}>
                <div>
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono font-bold uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    <span>NPCI UPI AutoPay & e-NACH Engine</span>
                  </div>
                  <h2 className="text-2xl font-bold mt-1">Systematic Crypto Compounding</h2>
                  <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
                    Automated monthly, weekly, or daily rupee auto-debits directly from your verified bank account into cold-custodied crypto baskets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSIPModalOpen(true)}
                  className={`px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition shrink-0 cursor-pointer shadow-sm ${
                    isDark ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400" : "bg-white text-[#0B3B24] hover:bg-emerald-50"
                  }`}
                >
                  + Setup New Mandate ↗
                </button>
              </div>

              {/* Mandates Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-5 rounded-[28px] border shadow-xs transition-colors ${
                  isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                }`}>
                  <div className="text-xs text-slate-400 uppercase font-mono font-bold">Total Monthly Commitment</div>
                  <div className={`text-2xl font-bold font-mono mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                    ₹{activeSipAmount.toLocaleString("en-IN")}/mo
                  </div>
                  <div className={`text-[11px] font-semibold mt-1 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>100% On-Schedule Execution</div>
                </div>

                <div className={`p-5 rounded-[28px] border shadow-xs transition-colors ${
                  isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                }`}>
                  <div className="text-xs text-slate-400 uppercase font-mono font-bold">Active Standing Mandates</div>
                  <div className={`text-2xl font-bold font-mono mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                    {activeMandates.length} Registered
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">NPCI e-Mandate Certified</div>
                </div>

                <div className={`p-5 rounded-[28px] border shadow-xs transition-colors ${
                  isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                }`}>
                  <div className="text-xs text-slate-400 uppercase font-mono font-bold">Next Auto-Debit Execution</div>
                  <div className={`text-2xl font-bold font-mono mt-1 ${isDark ? "text-emerald-400" : "text-[#0B3B24]"}`}>
                    {earliestMandateDate}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Scheduled at 09:30 AM IST</div>
                </div>
              </div>

              {/* Detailed Mandates Grid */}
              <div className="space-y-4">
                <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>All Configured Auto-Debit Mandates</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.mandates.map((m, idx) => {
                    const isActive = m.status === "ACTIVE";
                    return (
                      <div
                        key={m.id}
                        className={`border rounded-[28px] p-6 shadow-xs space-y-4 flex flex-col justify-between transition-colors ${
                          isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isActive
                                  ? isDark
                                    ? "bg-[#0B3B24] text-emerald-300 border border-emerald-500/30"
                                    : "bg-[#E8F4EC] text-[#0B3B24]"
                                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              }`}>
                                {m.status}
                              </span>
                              <h4 className={`text-lg font-bold mt-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>{m.basketName}</h4>
                              <div className="text-xs text-slate-400 font-mono">Mandate ID: {m.id}</div>
                            </div>

                            {/* iOS style toggle */}
                            <button
                              type="button"
                              onClick={() => toggleMandate(m.id)}
                              className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                                isActive ? (isDark ? "bg-emerald-500" : "bg-[#0B3B24]") : (isDark ? "bg-slate-700" : "bg-slate-300")
                              }`}
                              title={isActive ? "Pause Mandate" : "Resume Mandate"}
                            >
                              <div
                                className={`w-4.5 h-4.5 rounded-full bg-white transition-transform transform shadow-xs absolute top-1 ${
                                  isActive ? "translate-x-6.5" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>

                          <div className={`grid grid-cols-2 gap-3 pt-4 text-xs font-mono ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            <div>Amount: <strong className={isDark ? "text-white" : "text-slate-900"}>₹{m.monthlyAmountINR.toLocaleString("en-IN")}{getMandateFrequency(m, idx) === "Weekly" ? "/wk" : getMandateFrequency(m, idx) === "Daily" ? "/day" : "/mo"}</strong></div>
                            <div>Next Date: <strong className={isDark ? "text-emerald-400 font-bold" : "text-[#0B3B24] font-bold"}>{getMandateNextDate(m, idx)}</strong></div>
                            <div>VPA: <strong className={isDark ? "text-white" : "text-slate-900"}>{m.vpa}</strong></div>
                            <div>Frequency: <strong className={isDark ? "text-white" : "text-slate-900"}>{getMandateFrequency(m, idx)}</strong></div>
                          </div>
                        </div>

                        <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                          isDark ? "border-[#1E2429]" : "border-[#F1F5F2]"
                        }`}>
                          <span className="text-slate-400 text-[11px]">HDFC Bank · NetBanking Mandate</span>
                          <button
                            type="button"
                            onClick={() => toggleMandate(m.id)}
                            className={`font-bold hover:underline cursor-pointer ${isDark ? "text-emerald-400" : "text-[#0B3B24]"}`}
                          >
                            {isActive ? "Pause Auto-Debit" : "Resume Auto-Debit"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB VIEW 4: SECTION 194S TAX & TRANSACTION LEDGER                         */}
          {/* ========================================================================= */}
          {activeNav === "ledger" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Statutory Tax Summary Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-5 rounded-[28px] text-white shadow-sm flex flex-col justify-between transition-colors ${
                  isDark ? "bg-[#0B3B24] border border-emerald-500/30 shadow-black/30" : "bg-[#0B3B24]"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-200 uppercase font-mono">Section 194S TDS</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">1% Statutory</span>
                  </div>
                  <div className="text-3xl font-bold font-mono my-2">
                    ₹{totalTdsDeducted > 0 ? totalTdsDeducted.toLocaleString("en-IN") : "4,528"}
                  </div>
                  <span className="text-[11px] text-emerald-300">Remitted directly under TAN BLRB91024D</span>
                </div>

                <div className={`p-5 rounded-[28px] border shadow-xs flex flex-col justify-between transition-colors ${
                  isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                }`}>
                  <span className="text-xs text-slate-400 uppercase font-mono">Net Bank Settlements</span>
                  <div className={`text-3xl font-bold font-mono my-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                    ₹{totalNetSettled > 0 ? totalNetSettled.toLocaleString("en-IN") : "4,48,272"}
                  </div>
                  <span className={`text-[11px] font-semibold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                    Credited to Verified Bank (IMPS)
                  </span>
                </div>

                <div className={`p-5 rounded-[28px] border shadow-xs flex flex-col justify-between transition-colors ${
                  isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
                }`}>
                  <span className="text-xs text-slate-400 uppercase font-mono">Gross Transaction Volume</span>
                  <div className={`text-3xl font-bold font-mono my-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                    ₹{portfolio.transactions.reduce((s, t) => s + t.amountINR, 0).toLocaleString("en-IN")}
                  </div>
                  <span className="text-[11px] text-slate-400">Across {portfolio.transactions.length} Total Transactions</span>
                </div>
              </div>

              {/* Transactions Ledger Table Card */}
              <div className={`border rounded-[28px] p-6 shadow-xs space-y-4 transition-colors ${
                isDark ? "bg-[#13171B] border-[#1E2429]" : "bg-white border-[#DEE5E0]"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>Statutory Transaction Ledger</h3>
                    <p className="text-xs text-slate-400">Reconciled against Section 194S 1% TDS deduction and NPCI/IMPS banking rails.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Type Filter */}
                    <div className={`flex items-center gap-1 p-1 rounded-full border text-xs ${
                      isDark ? "bg-[#1A2026] border-[#262D35]" : "bg-[#F4F7F5] border-[#E2E8E4]"
                    }`}>
                      {(["ALL", "BUY", "WITHDRAWAL"] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setLedgerFilter(filter)}
                          className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                            ledgerFilter === filter
                              ? isDark
                                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                                : "bg-[#0B3B24] text-white font-semibold shadow-xs"
                              : isDark
                                ? "text-slate-400 hover:text-white"
                                : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          {filter === "ALL" ? "All" : filter === "BUY" ? "Buys" : "Redemptions"}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadTdsReport}
                      disabled={isDownloadingReport}
                      className={`px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                        isDark
                          ? "bg-[#0B3B24] hover:bg-[#072919] text-emerald-300 border-emerald-500/30"
                          : "bg-[#E8F4EC] hover:bg-[#D9EFE0] text-[#0B3B24] border-transparent"
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingReport ? "Exporting..." : "CSV"}</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                      isDark ? "bg-[#181D22] border-[#22282E] text-slate-400" : "bg-[#F8FAF9] border-[#E8EEEA] text-slate-400"
                    }`}>
                      <tr>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Type</th>
                        <th className="py-3 px-3">Basket Name</th>
                        <th className="py-3 px-3">Gross INR</th>
                        <th className="py-3 px-3 text-rose-500">1% Section 194S TDS</th>
                        <th className="py-3 px-3">Net Settled INR</th>
                        <th className="py-3 px-3">Banking Ref</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-mono text-xs ${
                      isDark ? "divide-[#1E2429] text-slate-300" : "divide-[#F1F5F2]"
                    }`}>
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} className={`transition ${
                          isDark ? "hover:bg-[#1A2026]" : "hover:bg-[#F8FAF9]/80"
                        }`}>
                          <td className="py-3 px-3 text-slate-400">
                            {new Date(tx.timestamp).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>

                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 font-bold ${
                              tx.type === "BUY" ? (isDark ? "text-emerald-400" : "text-[#0B3B24]") : "text-rose-500"
                            }`}>
                              {tx.type === "BUY" ? (
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              )}
                              {tx.type}
                            </span>
                          </td>

                          <td className={`py-3 px-3 font-sans font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>
                            {tx.basketName}
                          </td>

                          <td className={`py-3 px-3 font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            ₹{tx.amountINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>

                          <td className="py-3 px-3 font-semibold text-rose-500">
                            {tx.tdsINR > 0 ? `-₹${tx.tdsINR.toFixed(2)}` : "₹0.00"}
                          </td>

                          <td className={`py-3 px-3 font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>
                            ₹{tx.netAmountINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>

                          <td className="py-3 px-3 text-slate-500 text-[10px] truncate max-w-[130px]" title={tx.bankRef}>
                            {tx.bankRef}
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              tx.status === "SETTLED" || tx.status === "CREDITED_TO_BANK" || tx.status === "COMPLETED"
                                ? isDark
                                  ? "bg-[#0B3B24] text-emerald-300 border border-emerald-500/30"
                                  : "bg-[#E8F4EC] text-[#0B3B24] border border-[#0B3B24]/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {tx.status}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedTxForInvoice(tx)}
                              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] flex items-center gap-1 ml-auto transition cursor-pointer ${
                                isDark
                                  ? "bg-[#22242B] hover:bg-[#2A2C35] text-slate-200"
                                  : "bg-[#F4F7F5] hover:bg-[#E5EBE7] text-slate-700"
                              }`}
                            >
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ========================================================= */}
      {/* MODALS CONTAINER                                          */}
      {/* ========================================================= */}
      
      {/* 1. SIP Mandate Setup Modal */}
      <SIPMandateModal
        isOpen={isSIPModalOpen}
        onClose={() => setIsSIPModalOpen(false)}
        baskets={baskets}
        onCreateMandate={createMandate}
      />

      {/* 2. Quick Buy Modal */}
      <InvestmentModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        baskets={baskets}
        onBuySubmit={(basketId, amount) => {
          buyBasket(basketId, amount);
        }}
      />

      {/* 3. Quick Withdrawal Modal */}
      <RedemptionModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        holdings={portfolio.holdings}
        baskets={baskets}
        userPan={user?.pan || "ABCDE1234F"}
        onWithdrawSubmit={(basketId, amount) => {
          return withdrawBasket(basketId, amount);
        }}
      />

      {/* 4. Tax Settlement Invoice / Receipt Modal */}
      <InvoiceModal
        isOpen={!!selectedTxForInvoice}
        onClose={() => setSelectedTxForInvoice(null)}
        tx={selectedTxForInvoice}
        userName={user?.name || "Investor"}
        userPan={user?.pan || "ABCDE1234F"}
      />

      {/* 5. Settings & Profile Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen && !!user}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        onLogout={handleLogout}
        onOpenAuthModal={() => router.push("/signin")}
      />

      {/* 6. Support & Guides Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* 7. Baskly Prime Membership Modal */}
      <PrimeModal
        isOpen={isPrimeModalOpen}
        onClose={() => setIsPrimeModalOpen(false)}
        isPrimeActive={isPrimeActive}
        onActivatePrime={() => {
          setIsPrimeActive(true);
          alert("Baskly Prime Tier Activated: Algorithmic rebalance drift protection is now active on your account!");
        }}
      />

      {/* 8. Fallback Auth Modal */}
      <AuthModal />

    </div>
  );
}
