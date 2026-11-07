"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  LayoutDashboard, 
  Layers, 
  CalendarClock, 
  Receipt, 
  Download, 
  ShieldCheck,
  ShieldAlert, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  FileText, 
  ArrowRight, 
  Zap, 
  LogOut, 
  User as UserIcon,
  Activity,
  Menu,
  X
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
import { getMandateFrequency, calculateNextMandateDate, formatMandateNextDate } from "@/utils/mandateDate";

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
    logout,
    oracleState,
    openOracleModal,
    manager
  } = useBaskly();

  // Active Menu Navigation tab
  const [activeNav, setActiveNav] = useState<"overview" | "holdings" | "mandates" | "ledger">("overview");

  // Mobile menu drawer toggle state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme state (light / dark) with localStorage persistence matching landing page tokens
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
  const [selectedBasketIdForModal, setSelectedBasketIdForModal] = useState<string | undefined>(undefined);

  const handleOpenBuyModal = (basketId?: string) => {
    if (manager?.maintenanceModeActive) {
      alert("Platform Under Maintenance: New investments are currently locked by administrators.");
      return;
    }
    setSelectedBasketIdForModal(basketId);
    setIsBuyModalOpen(true);
  };

  const handleOpenWithdrawModal = (basketId?: string) => {
    if (manager?.maintenanceModeActive) {
      alert("Platform Under Maintenance: Redemptions and withdrawals are currently locked by administrators.");
      return;
    }
    setSelectedBasketIdForModal(basketId);
    setIsWithdrawModalOpen(true);
  };

  const handleOpenSIPModal = () => {
    if (manager?.maintenanceModeActive) {
      alert("Platform Under Maintenance: SIP AutoPay registration is currently locked by administrators.");
      return;
    }
    setIsSIPModalOpen(true);
  };

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
  const [statusFilter] = useState<string>("ALL");
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  // Calendar date in Indian Standard Time (Asia/Kolkata)
  const decisionDateIST = useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  }, []);

  // Track broken image fallback state
  const [avatarError, setAvatarError] = useState(false);

  // Determine if user has a valid custom photo that is not a placeholder or broken image
  const hasCustomPhoto = Boolean(
    user?.avatar &&
    !avatarError &&
    !user.avatar.includes("dicebear.com") &&
    !user.avatar.includes("api.dicebear") &&
    !user.avatar.includes("unsplash.com")
  );

  // Profile dropdown menu state for the circular profile button
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Handle complete logout and redirection to signin page
  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setIsSettingsModalOpen(false);
    setIsMobileMenuOpen(false);
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

  // Trigger portfolio fetch only after user authentication is confirmed
  useEffect(() => {
    if (user && user.id) {
      refreshPortfolio();
    }
  }, [user?.id]);

  // Calculate live portfolio summary without render-time side effects
  const { holdingsWithLiveNav, totalInvested, totalWealth } = useMemo(() => {
    let invested = 0;
    let wealth = 0;
    for (const h of portfolio.holdings) {
      const liveNav = baskets.find((b) => b.id === h.basketId)?.nav || h.avgBuyNav || 100.0;
      const currentVal = Number((h.units * liveNav).toFixed(2));
      invested += h.investedAmountINR;
      wealth += currentVal;
    }

    const list = portfolio.holdings.map((h) => {
      const liveNav = baskets.find((b) => b.id === h.basketId)?.nav || h.avgBuyNav || 100.0;
      const currentVal = Number((h.units * liveNav).toFixed(2));
      const profit = Number((currentVal - h.investedAmountINR).toFixed(2));
      const retPct = h.investedAmountINR > 0 ? (profit / h.investedAmountINR) * 100 : 0;

      return {
        ...h,
        liveNav,
        currentVal,
        profit,
        retPct,
      };
    });

    return {
      holdingsWithLiveNav: list,
      totalInvested: invested,
      totalWealth: wealth,
    };
  }, [portfolio.holdings, baskets]);

  const totalProfit = totalWealth - totalInvested;
  const totalReturnPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
  
  const activeMandates = portfolio.mandates.filter((m) => m.status === "ACTIVE");

  // Calculate commitments and labels matching each mandate's actual frequency
  const dailyCommitment = activeMandates
    .filter((m, idx) => getMandateFrequency(m, idx) === "Daily")
    .reduce((sum, m) => sum + m.monthlyAmountINR, 0);

  const weeklyCommitment = activeMandates
    .filter((m, idx) => getMandateFrequency(m, idx) === "Weekly")
    .reduce((sum, m) => sum + m.monthlyAmountINR, 0);

  const monthlyCommitment = activeMandates
    .filter((m, idx) => getMandateFrequency(m, idx) === "Monthly")
    .reduce((sum, m) => sum + m.monthlyAmountINR, 0);

  const commitmentParts: string[] = [];
  if (dailyCommitment > 0) commitmentParts.push(`₹${dailyCommitment.toLocaleString("en-IN")}/day`);
  if (weeklyCommitment > 0) commitmentParts.push(`₹${weeklyCommitment.toLocaleString("en-IN")}/wk`);
  if (monthlyCommitment > 0) commitmentParts.push(`₹${monthlyCommitment.toLocaleString("en-IN")}/mo`);

  const sipCommitmentDisplay = commitmentParts.length > 0 ? commitmentParts.join(" + ") : "₹0";

  // Helper to calculate raw Date object for the next execution (strictly in the future)
  const getMandateNextDateObj = (m: Mandate, index: number): Date => {
    return calculateNextMandateDate(m, index);
  };

  const getMandateNextDate = (m: Mandate, index: number): string => {
    return formatMandateNextDate(m, index);
  };

  // Helper to find all active mandates executing on the latest upcoming debit date
  const latestDebitSchedule = activeMandates.length > 0
    ? (() => {
        const list = activeMandates
          .map((m, idx) => {
            const nextDateObj = getMandateNextDateObj(m, idx);
            const dateKey = `${nextDateObj.getFullYear()}-${String(nextDateObj.getMonth() + 1).padStart(2, "0")}-${String(nextDateObj.getDate()).padStart(2, "0")}`;
            return {
              mandate: m,
              nextDateObj,
              dateKey,
              frequency: getMandateFrequency(m, idx),
            };
          })
          .sort((a, b) => a.nextDateObj.getTime() - b.nextDateObj.getTime());

        if (list.length === 0) return null;

        const earliestDateKey = list[0].dateKey;
        const mandatesOnDate = list.filter((item) => item.dateKey === earliestDateKey);
        const totalAmount = mandatesOnDate.reduce((sum, item) => sum + item.mandate.monthlyAmountINR, 0);
        const dateFormatted = list[0].nextDateObj.toLocaleDateString("en-IN", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });

        return {
          dateFormatted,
          totalAmount,
          mandates: mandatesOnDate,
          count: mandatesOnDate.length,
          detailText:
            mandatesOnDate.length === 1
              ? `${mandatesOnDate[0].mandate.basketName} • ${mandatesOnDate[0].frequency}`
              : `${mandatesOnDate.map((item) => item.mandate.basketName).join(", ")}`,
        };
      })()
    : null;

  const earliestMandateDate = latestDebitSchedule
    ? latestDebitSchedule.dateFormatted
    : "No upcoming debits";

  const handleNavigateToAllMandates = () => {
    setActiveNav("mandates");
    setTimeout(() => {
      const el = document.getElementById("all-configured-mandates");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  // Section 194S TDS calculations across all transactions
  const totalTdsDeducted = portfolio.transactions.reduce((sum, tx) => sum + (tx.tdsINR || 0), 0);
  const totalNetSettled = portfolio.transactions
    .filter((tx) => tx.type === "WITHDRAWAL")
    .reduce((sum, tx) => sum + (tx.netAmountINR || 0), 0);

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

  const isFrozen = oracleState?.isNavFrozen;
  const usdtRate = (oracleState?.usdtInr || 100.16).toFixed(2);

  return (
    <div className={`min-h-screen w-full overflow-x-hidden p-3 sm:p-5 lg:p-6 2xl:p-8 font-sans antialiased selection:bg-[#F59E0B] selection:text-[#0B0A09] transition-colors duration-200 ${
      isDark ? "bg-[#0B0A09] text-white" : "bg-[#F4EFEA] text-[#121110]"
    }`}>
      
      {/* Outer Centered Frame */}
      <div className="w-full max-w-[1536px] 2xl:max-w-[1720px] 3xl:max-w-[2048px] 4xl:max-w-[2400px] mx-auto">
        
        {/* ========================================================= */}
        {/* MOBILE TOP BAR (Only visible on screens < 1024px)        */}
        {/* ========================================================= */}
        <header className={`lg:hidden w-full flex items-center justify-between px-4 py-3 rounded-2xl border shadow-xs transition-colors shrink-0 mb-3 sm:mb-4 ${
          isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
        }`}>
          {/* Brand Logo & Identity */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F59E0B] flex items-center justify-center text-[#0B0A09] font-serif-italic font-bold text-base shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              b
            </div>
            <div className="flex flex-col">
              <span className={`text-base font-bold tracking-tight leading-none ${isDark ? "text-white" : "text-[#121110]"}`}>
                baskly<span className="font-serif-italic font-normal text-[#F59E0B]">.money</span>
                <sup className="text-[7px] font-mono ml-0.5 text-[#A39E93]">®</sup>
              </span>
              <span className="text-[8.5px] font-sans font-medium uppercase tracking-[0.14em] text-[#A39E93] mt-0.5 whitespace-nowrap">
                Retail Investor Desk
              </span>
            </div>
          </Link>

          {/* Quick Header Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live USDT rate pill */}
            <button
              type="button"
              onClick={openOracleModal}
              className={`hidden xs:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono transition cursor-pointer ${
                isDark
                  ? isFrozen
                    ? "bg-white/5 border-white/10 text-amber-400"
                    : "bg-white/5 border-white/10 text-emerald-400"
                  : isFrozen
                    ? "bg-[#FAF8F5] border-[#E7E1D8] text-amber-700"
                    : "bg-[#FAF8F5] border-[#E7E1D8] text-emerald-700"
              }`}
              title={isFrozen ? "Pricing Oracle (NAV Frozen)" : "Pricing Oracle (Live Ticks)"}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isFrozen ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
              <span>₹{usdtRate}{isFrozen ? " (Frozen)" : ""}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition cursor-pointer ${
                isDark ? "bg-white/5 border-white/10 text-[#F59E0B]" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#5C5752]"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* User Profile Avatar */}
            {user ? (
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="relative shrink-0 cursor-pointer"
                title="Account Settings & KYC"
              >
                {hasCustomPhoto ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "Investor"}
                    onError={() => setAvatarError(true)}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                      isDark
                        ? "bg-white/10 text-white border-white/10"
                        : "bg-[#FAF8F5] text-[#121110] border-[#E7E1D8]"
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 ${
                  isDark ? "border-[#161412]" : "border-white"
                }`} />
              </button>
            ) : (
              <Link
                href="/signin"
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F59E0B] text-[#0B0A09]"
              >
                Login
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition cursor-pointer ${
                isDark ? "bg-white/5 border-white/10 text-white" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#121110]"
              }`}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* MOBILE SLIDE-DOWN DRAWER (When hamburger is opened)       */}
        {/* ========================================================= */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden w-full rounded-3xl p-5 mb-4 border shadow-lg space-y-5 transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
          }`}>
            
            {/* Navigation Menu Links */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#A39E93] px-3 mb-1 font-medium">
                MENU
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveNav("overview");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  activeNav === "overview"
                    ? isDark ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold" : "bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 font-bold"
                    : isDark ? "text-[#A39E93] hover:bg-white/5 hover:text-white" : "text-[#5C5752] hover:bg-[#FAF8F5] hover:text-[#121110]"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Portfolio Overview</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNav("holdings");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  activeNav === "holdings"
                    ? isDark ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold" : "bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 font-bold"
                    : isDark ? "text-[#A39E93] hover:bg-white/5 hover:text-white" : "text-[#5C5752] hover:bg-[#FAF8F5] hover:text-[#121110]"
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Curated Holdings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNav("mandates");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  activeNav === "mandates"
                    ? isDark ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold" : "bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 font-bold"
                    : isDark ? "text-[#A39E93] hover:bg-white/5 hover:text-white" : "text-[#5C5752] hover:bg-[#FAF8F5] hover:text-[#121110]"
                }`}
              >
                <CalendarClock className="w-4 h-4 shrink-0" />
                <span>SIP Mandates</span>
                {activeMandates.length > 0 && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-[#F59E0B] text-[#0B0A09] text-[10px] font-mono font-bold">
                    {activeMandates.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNav("ledger");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  activeNav === "ledger"
                    ? isDark ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold" : "bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 font-bold"
                    : isDark ? "text-[#A39E93] hover:bg-white/5 hover:text-white" : "text-[#5C5752] hover:bg-[#FAF8F5] hover:text-[#121110]"
                }`}
              >
                <Receipt className="w-4 h-4 shrink-0" />
                <span>Tax & TDS Ledger</span>
              </button>
            </div>

            {/* Curated Baskets Quick Selector */}
            <div className={`space-y-1.5 pt-2 border-t ${isDark ? "border-white/5" : "border-[#E7E1D8]"}`}>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#A39E93] px-3 mb-1 font-medium">
                CURATED BASKETS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {baskets.slice(0, 5).map((b) => {
                  const isSelected = inspectedHoldingId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setInspectedHoldingId(b.id);
                        setActiveNav("holdings");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                        isSelected
                          ? isDark ? "bg-[#F59E0B]/15 text-white font-semibold border border-[#F59E0B]/30" : "bg-[#F59E0B]/10 text-[#121110] font-semibold border border-[#F59E0B]/20"
                          : isDark ? "text-[#A39E93] hover:bg-white/5" : "text-[#5C5752] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <span className="truncate pr-2">{b.name}</span>
                      <span className="text-[10px] font-mono text-[#F59E0B] shrink-0 font-bold">₹{b.nav.toFixed(1)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pricing Oracle Quick Box */}
            <div 
              onClick={() => {
                openOracleModal();
                setIsMobileMenuOpen(false);
              }}
              className={`rounded-2xl p-3 border transition cursor-pointer ${
                isDark ? "bg-[#181512] border-white/10" : "bg-[#FAF8F5] border-[#E7E1D8]"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="uppercase tracking-widest text-[#A39E93]">PRICING ORACLE</span>
                <span className={`font-bold inline-flex items-center gap-1.5 ${isFrozen ? "text-amber-500" : "text-emerald-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isFrozen ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
                  {isFrozen ? "NAV Frozen" : "Live Ticks"}
                </span>
              </div>
              <p className="text-[11px] text-[#A39E93] mt-1">
                Binance & CoinGecko dual-feed. USDT rate ₹{usdtRate}.
              </p>
            </div>

            {/* Prime Intel Card */}
            <div className={`rounded-2xl p-4 text-white border transition ${
              isDark ? "bg-[#1E1B17] border-[#F59E0B]/25" : "bg-[#121110] border-[#121110]"
            }`}>
              <div className="flex items-center gap-1.5 text-[#F59E0B] text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>BASKLY PRIME INTEL</span>
              </div>
              <h4 className="text-xs font-bold text-white tracking-wide mt-1">Algorithmic Rebalancing</h4>
              <p className="text-[11px] text-[#A39E93] mt-1 leading-snug">
                Drift-protected auto compounding across market cycles.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPrimeModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold py-1.5 px-3 rounded-full text-center bg-white text-[#0B0A09] cursor-pointer"
                >
                  Prime
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSupportModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold py-1.5 px-3 rounded-full text-center border border-white/20 text-white cursor-pointer"
                >
                  Support
                </button>
              </div>
            </div>

            {/* Mobile User Profile & Logout */}
            {user && (
              <div className={`pt-2 flex items-center justify-between border-t ${isDark ? "border-white/5" : "border-[#E7E1D8]"}`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 text-left cursor-pointer group"
                >
                  <div className="relative shrink-0">
                    {hasCustomPhoto ? (
                      <img
                        src={user.avatar}
                        alt={user.name || "Investor"}
                        onError={() => setAvatarError(true)}
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                          isDark
                            ? "bg-white/10 text-white border-white/10"
                            : "bg-[#FAF8F5] text-[#121110] border-[#E7E1D8]"
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 ${isDark ? "border-[#161412]" : "border-white"}`} />
                  </div>
                  <div>
                    <div className={`text-xs font-bold leading-tight transition-colors ${isDark ? "text-white group-hover:text-[#F59E0B]" : "text-[#121110] group-hover:text-[#B45309]"}`}>{user.name}</div>
                    <div className={`flex items-center gap-1 mt-0.5 text-[10px] font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>KYC Verified</span>
                      {user.pan && <span className="text-[#A39E93] font-mono text-[9px]">· {user.pan}</span>}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1.5 cursor-pointer py-1.5 px-2.5 rounded-full hover:bg-rose-500/10 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* DESKTOP TWO-COLUMN COCKPIT (SIDEBAR + MAIN CANVAS)       */}
        {/* Both children start at the exact same Y baseline         */}
        {/* ========================================================= */}
        <div className="w-full flex flex-col lg:flex-row gap-5 2xl:gap-7 items-start">

          {/* ========================================================= */}
          {/* 1. SEPARATE LEFT SIDEBAR ISLAND (Desktop Only: lg:flex)  */}
          {/* ========================================================= */}
          <aside className={`hidden lg:flex flex-col w-64 xl:w-72 2xl:w-80 rounded-[28px] p-5 lg:p-6 justify-between shrink-0 transition-all duration-200 border shadow-xs ${
            isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
          }`}>
            <div className="space-y-7">
              
              {/* Brand Logo & Identity */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F59E0B] flex items-center justify-center text-[#0B0A09] font-serif-italic font-bold text-base sm:text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform">
                  b
                </div>
                <div className="flex flex-col">
                  <span className={`text-lg font-bold tracking-tight leading-none ${isDark ? "text-white" : "text-[#121110]"}`}>
                    baskly<span className="font-serif-italic font-normal text-lg text-[#F59E0B]">.money</span>
                    <sup className="text-[8px] font-mono ml-0.5 text-[#A39E93]">®</sup>
                  </span>
                  <span className="text-[9.5px] font-sans font-medium uppercase tracking-[0.16em] text-[#A39E93] mt-0.5 whitespace-nowrap antialiased">
                    Retail Investor Desk
                  </span>
                </div>
              </Link>

              {/* Menu Group: Navigation */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#736E65] dark:text-[#A39E93] px-3 mb-2 font-medium">
                  MENU
                </div>

                {/* 1. Portfolio Overview */}
                <button
                  type="button"
                  onClick={() => setActiveNav("overview")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeNav === "overview"
                      ? isDark
                        ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold shadow-xs"
                        : "bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 font-bold shadow-xs"
                      : isDark
                        ? "text-[#A39E93] hover:bg-white/5 hover:text-white"
                        : "text-[#5C5752] hover:bg-[#FAF8F5] hover:text-[#121110]"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Portfolio Overview</span>
                </button>

                {/* 2. Curated Holdings */}
                <button
                  type="button"
                  onClick={() => setActiveNav("holdings")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeNav === "holdings"
                      ? isDark
                        ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold shadow-xs"
                        : "bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 font-bold shadow-xs"
                      : isDark
                        ? "text-[#A39E93] hover:bg-white/5 hover:text-white"
                        : "text-[#5C5752] hover:bg-[#FAF8F5] hover:text-[#121110]"
                  }`}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Curated Holdings</span>
                </button>

                {/* 3. SIP Mandates */}
                <button
                  type="button"
                  onClick={() => setActiveNav("mandates")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeNav === "mandates"
                      ? isDark
                        ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold shadow-xs"
                        : "bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 font-bold shadow-xs"
                      : isDark
                        ? "text-[#A39E93] hover:bg-white/5 hover:text-white"
                        : "text-[#5C5752] hover:bg-[#FAF8F5] hover:text-[#121110]"
                  }`}
                >
                  <CalendarClock className="w-4 h-4 shrink-0" />
                  <span>SIP Mandates</span>
                  {activeMandates.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-[#F59E0B] text-[#0B0A09] text-[10px] font-mono font-bold">
                      {activeMandates.length}
                    </span>
                  )}
                </button>

                {/* 4. Tax & TDS Ledger */}
                <button
                  type="button"
                  onClick={() => setActiveNav("ledger")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeNav === "ledger"
                      ? isDark
                        ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold shadow-xs"
                        : "bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 font-bold shadow-xs"
                      : isDark
                        ? "text-[#A39E93] hover:bg-white/5 hover:text-white"
                        : "text-[#5C5752] hover:bg-[#FAF8F5] hover:text-[#121110]"
                  }`}
                >
                  <Receipt className="w-4 h-4 shrink-0" />
                  <span>Tax & TDS Ledger</span>
                </button>
              </div>

              {/* Curated Baskets Quick Watchlist */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#736E65] dark:text-[#A39E93] px-3 mb-2 font-medium">
                  CURATED BASKETS
                </div>
                <div className="space-y-1">
                  {baskets.slice(0, 5).map((b) => {
                    const isSelected = inspectedHoldingId === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setInspectedHoldingId(b.id);
                          if (activeNav !== "holdings") {
                            setActiveNav("holdings");
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-full text-xs transition cursor-pointer text-left ${
                          isSelected
                            ? isDark
                              ? "bg-[#F59E0B]/15 text-white font-semibold border border-[#F59E0B]/30"
                              : "bg-[#F59E0B]/10 text-[#121110] font-semibold border border-[#F59E0B]/20"
                            : isDark
                              ? "text-[#A39E93] hover:text-white hover:bg-white/5"
                              : "text-[#5C5752] hover:text-[#121110] hover:bg-[#FAF8F5]"
                        }`}
                      >
                        <span className="truncate pr-2">{b.name}</span>
                        {isSelected ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        ) : (
                          <span className="text-[10px] font-mono text-[#A39E93] shrink-0">₹{b.nav.toFixed(1)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pricing Oracle Live Stream Pill Card */}
              <div 
                onClick={openOracleModal}
                className={`rounded-2xl p-3.5 border transition-all cursor-pointer ${
                  isDark ? "bg-[#181512] border-white/10 hover:border-[#F59E0B]/30" : "bg-[#FAF8F5] border-[#E7E1D8] hover:border-[#F59E0B]/50"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="uppercase tracking-widest text-[#736E65] dark:text-[#A39E93]">PRICING ORACLE</span>
                  <span className={`inline-flex items-center gap-1.5 font-bold ${isFrozen ? "text-amber-500" : "text-emerald-500"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isFrozen ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
                    {isFrozen ? "NAV Frozen" : "Live Ticks"}
                  </span>
                </div>
                <p className="text-[11px] text-[#A39E93] mt-1 leading-snug">
                  Binance & CoinGecko dual-feed. USDT rate ₹{usdtRate}.
                </p>
              </div>

            </div>

            {/* Bottom Card: Baskly Prime */}
            <div className={`mt-6 rounded-[22px] p-4 text-white relative overflow-hidden transition-all border ${
              isDark 
                ? "bg-[#1E1B17] border-[#F59E0B]/25 shadow-lg shadow-black/40" 
                : "bg-[#121110] border-[#121110] shadow-md shadow-[#121110]/15"
            }`}>
              <div className="flex items-center gap-1.5 text-[#F59E0B] text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>BASKLY PRIME INTEL</span>
              </div>
              <h4 className="text-xs font-bold text-white tracking-wide mt-1">Algorithmic Rebalancing</h4>
              <p className="text-[11px] text-[#A39E93] mt-1 leading-snug">
                Drift-protected auto compounding across market cycles.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3.5">
                <button
                  type="button"
                  onClick={() => setIsPrimeModalOpen(true)}
                  className="text-xs font-bold py-1.5 px-3 rounded-full text-center bg-white text-[#0B0A09] hover:bg-[#EAE6DE] transition cursor-pointer shadow-xs"
                >
                  Prime
                </button>
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(true)}
                  className="text-xs font-semibold py-1.5 px-3 rounded-full text-center border border-white/20 text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Support
                </button>
              </div>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* 2. MAIN COCKPIT DASHBOARD AREA                            */}
          {/* Aligned directly on same level as the sidebar             */}
          {/* ========================================================= */}
          <main className="w-full flex-1 min-w-0 space-y-5 sm:space-y-6">
            {manager?.maintenanceModeActive && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs font-mono flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" />
                <div>
                  <strong>SYSTEM UNDER MAINTENANCE:</strong> Retail investor order placement, redemptions, and fresh SIP registrations are temporarily locked by platform operations. Existing portfolios remain secure in 1:1 cold custody.
                </div>
              </div>
            )}
            
            {/* Top Control Bar on Desktop (Search Pill & Floating Status Pills) */}
            <div className="hidden lg:flex items-center justify-between gap-4">
              
              {/* Search Box Pill */}
              <div className={`relative flex-1 max-w-xl rounded-full px-5 py-2.5 flex items-center gap-3 transition-all border shadow-xs ${
                isDark
                  ? "bg-[#161412] border-white/10 text-white"
                  : "bg-white border-[#E7E1D8] text-[#121110]"
              }`}>
                <Search className="w-4 h-4 text-[#A39E93] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search baskets, mandates, transactions, or metrics..."
                  className="w-full bg-transparent text-xs text-[#121110] dark:text-white placeholder-[#A39E93] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-[#A39E93] hover:text-[#121110] dark:hover:text-white text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Top Right Control Pills */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                
                {/* Oracle Live Pill */}
                <button
                  type="button"
                  onClick={openOracleModal}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                    isDark
                      ? isFrozen
                        ? "bg-[#161412] border-white/10 text-amber-400 hover:bg-white/5"
                        : "bg-[#161412] border-white/10 text-emerald-400 hover:bg-white/5"
                      : isFrozen
                        ? "bg-white border-[#E7E1D8] text-amber-700 hover:bg-[#FAF8F5]"
                        : "bg-white border-[#E7E1D8] text-emerald-700 hover:bg-[#FAF8F5]"
                  }`}
                  title={isFrozen ? "Inspect Pricing Oracle (NAV Frozen)" : "Inspect Pricing Oracle (Live)"}
                >
                  <Activity className={`w-3.5 h-3.5 ${isFrozen ? "text-amber-500" : "text-emerald-500"}`} />
                  <span>USDT ₹{usdtRate}{isFrozen ? " (Frozen)" : ""}</span>
                </button>

                {/* Theme Toggle Button Pill */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`w-9.5 h-9.5 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer border ${
                    isDark
                      ? "bg-[#161412] border-white/10 text-[#F59E0B] hover:bg-white/5"
                      : "bg-white border-[#E7E1D8] text-[#5C5752] hover:bg-[#FAF8F5]"
                  }`}
                  title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                  aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-[#F59E0B] transition-transform duration-300 hover:rotate-45" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#5C5752] transition-transform duration-300 hover:-rotate-12" />
                  )}
                </button>

                {/* Notification Bell Button Pill */}
                <button
                  type="button"
                  onClick={() => alert("Notice: Inception NAVs and Section 194S TDS ledger synced with banking rails.")}
                  className={`w-9.5 h-9.5 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer border relative ${
                    isDark
                      ? "bg-[#161412] border-white/10 text-[#A39E93] hover:bg-white/5"
                      : "bg-white border-[#E7E1D8] text-[#5C5752] hover:bg-[#FAF8F5]"
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F59E0B]" />
                </button>

                {/* User Profile Circular Button & Dropdown Menu */}
                {user ? (
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className={`w-9.5 h-9.5 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer border relative group focus:outline-none ${
                        isDark
                          ? "bg-[#161412] border-white/10 hover:border-[#F59E0B]/50 hover:bg-white/5"
                          : "bg-white border-[#E7E1D8] hover:border-[#F59E0B]/50 hover:bg-[#FAF8F5]"
                      } ${isProfileMenuOpen ? (isDark ? "ring-2 ring-[#F59E0B]/40 border-[#F59E0B]" : "ring-2 ring-[#F59E0B]/30 border-[#F59E0B]") : ""}`}
                      title={`${user.name} · KYC Verified`}
                      aria-label="User Account Menu"
                      aria-expanded={isProfileMenuOpen}
                    >
                      {hasCustomPhoto ? (
                        <img
                          src={user.avatar}
                          alt={user.name || "Investor"}
                          onError={() => setAvatarError(true)}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div 
                          className={`w-full h-full rounded-full flex items-center justify-center transition-all ${
                            isDark
                              ? "bg-white/10 text-white group-hover:bg-white/15"
                              : "bg-[#FAF8F5] text-[#121110] group-hover:bg-[#F4EFEA]"
                          }`}
                        >
                          <UserIcon className="w-4 h-4" />
                        </div>
                      )}

                      {/* Active emerald verified indicator pip */}
                      <span 
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 ${
                          isDark ? "border-[#161412]" : "border-white"
                        }`} 
                        title="KYC Verified"
                      />
                    </button>

                    {/* Luxury Floating Dropdown Popover */}
                    {isProfileMenuOpen && (
                      <div 
                        className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 p-2.5 space-y-2 ${
                          isDark 
                            ? "bg-[#141210]/95 border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)]" 
                            : "bg-white/95 border-[#E7E1D8] text-[#121110] shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                        }`}
                      >
                        {/* User Identity Header Card */}
                        <div className={`p-3 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-[#FAF8F5] border-[#E7E1D8]/60"}`}>
                          <div className="flex items-center gap-2.5">
                            <div className="relative shrink-0">
                              {hasCustomPhoto ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name || "Investor"}
                                  onError={() => setAvatarError(true)}
                                  className="w-9 h-9 rounded-full object-cover border border-white/10"
                                />
                              ) : (
                                <div 
                                  className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                                    isDark
                                      ? "bg-white/10 text-white border-white/10"
                                      : "bg-[#F4EFEA] text-[#121110] border-[#E7E1D8]"
                                  }`}
                                >
                                  <UserIcon className="w-4.5 h-4.5" />
                                </div>
                              )}
                              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 ${isDark ? "border-[#161412]" : "border-white"}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold truncate leading-tight">{user.name}</div>
                              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span>KYC Verified</span>
                                {user.pan && <span className="text-[#A39E93] font-mono text-[9px]">· {user.pan}</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Actions */}
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsSettingsModalOpen(true);
                              setIsProfileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                              isDark ? "text-white/90 hover:bg-white/5 hover:text-white" : "text-[#121110] hover:bg-[#FAF8F5]"
                            }`}
                          >
                            <UserIcon className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <span>Profile & KYC Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsSupportModalOpen(true);
                              setIsProfileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                              isDark ? "text-white/90 hover:bg-white/5 hover:text-white" : "text-[#121110] hover:bg-[#FAF8F5]"
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Support & Helpdesk</span>
                          </button>
                        </div>

                        {/* Sign Out Action */}
                        <div className={`pt-1 border-t ${isDark ? "border-white/5" : "border-[#E7E1D8]/60"}`}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer text-left"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/signin"
                    className="w-9.5 h-9.5 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer border bg-[#F59E0B] text-[#0B0A09] hover:bg-[#F0A828]"
                    title="Sign In"
                    aria-label="Sign In"
                  >
                    <UserIcon className="w-4 h-4" />
                  </Link>
                )}

              </div>
            </div>

            {/* Mobile Controls (Search & Quick Tabs - Only on screens < 1024px) */}
            <div className="lg:hidden w-full space-y-2.5">
              {/* Mobile Search Box Bar */}
              <div className={`w-full rounded-full px-4 py-2 flex items-center gap-2.5 border shadow-xs ${
                isDark ? "bg-[#161412] border-white/10 text-white" : "bg-white border-[#E7E1D8] text-[#121110]"
              }`}>
                <Search className="w-3.5 h-3.5 text-[#A39E93] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search baskets, mandates, transactions..."
                  className="w-full bg-transparent text-xs text-[#121110] dark:text-white placeholder-[#A39E93] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-[#A39E93] text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Tab Switcher Pill Bar on Mobile (Horizontal Smooth Scroll) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
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
                    className={`px-3.5 py-1.5 rounded-full font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      activeNav === tab.id
                        ? isDark
                          ? "bg-[#F59E0B] text-[#0B0A09] shadow-xs"
                          : "bg-[#121110] text-white shadow-xs"
                        : isDark
                          ? "bg-[#161412] border border-white/10 text-[#A39E93]"
                          : "bg-white border border-[#E7E1D8] text-[#5C5752]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.id === "mandates" && activeMandates.length > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                        activeNav === tab.id ? "bg-black/20 text-current" : "bg-[#F59E0B] text-[#0B0A09]"
                      }`}>
                        {activeMandates.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Cockpit Title Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pt-1">
              <div>
                <h1 className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#121110]"}`}>
                  {activeNav === "overview" && "Day-Ahead Investor Cockpit"}
                  {activeNav === "holdings" && "Curated Basket Holdings"}
                  {activeNav === "mandates" && "Systematic Auto-SIP Mandates"}
                  {activeNav === "ledger" && "Section 194S Tax & Settlement Ledger"}
                </h1>
                <p className={`text-xs mt-1 max-w-2xl ${isDark ? "text-[#A39E93]" : "text-[#736E65]"}`}>
                  {activeNav === "overview" && "Monitor portfolio valuation, automated rupee SIP compounding, and statutory TDS reconciliation."}
                  {activeNav === "holdings" && "Constituent token distribution, live Binance price feed updates, and rebalance triggers."}
                  {activeNav === "mandates" && "Configure NPCI UPI AutoPay & automated recurring compounding."}
                  {activeNav === "ledger" && "Statutory 1% Section 194S TDS accounting and Form 26AS verification ledger."}
                </p>
              </div>

              {/* Top Right Action Pills */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
                
                {/* Primary Filled Pill Button */}
                <button
                  type="button"
                  onClick={handleOpenSIPModal}
                  className="bg-[#121110] hover:bg-[#2A2826] dark:bg-[#F59E0B] dark:hover:bg-[#F0A828] text-white dark:text-[#0B0A09] px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01]"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>+ Setup SIP Mandate</span>
                </button>

                {/* Secondary Outline Pill Button */}
                <button
                  type="button"
                  onClick={handleDownloadTdsReport}
                  disabled={isDownloadingReport}
                  className={`px-3.5 sm:px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border ${
                    isDark
                      ? "bg-[#161412] hover:bg-white/5 text-white border-white/10"
                      : "bg-white hover:bg-[#FAF8F5] text-[#121110] border-[#E7E1D8]"
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-[#A39E93]" />
                  <span>{isDownloadingReport ? "Exporting..." : "Export Report"}</span>
                </button>

                {/* Quick Buy Pill */}
                <button
                  type="button"
                  onClick={() => handleOpenBuyModal()}
                  className={`px-3.5 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border ${
                    isDark
                      ? "bg-[#161412] hover:bg-white/5 text-[#F59E0B] border-[#F59E0B]/30"
                      : "bg-white hover:bg-[#FAF8F5] text-[#B45309] border-[#F59E0B]/30"
                  }`}
                >
                  <span>+ Buy Basket</span>
                </button>
              </div>
            </div>

            {/* Secondary Sub-Bar (Date & Benchmark Indicator) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1 text-xs font-mono">
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Date Selector Pill */}
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-2xs ${
                  isDark ? "bg-[#161412] border-white/10 text-white" : "bg-white border-[#E7E1D8] text-[#121110]"
                }`}>
                  <ChevronLeft className="w-3.5 h-3.5 text-[#A39E93] cursor-pointer" />
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold">Live T+0 Valuation</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A39E93] cursor-pointer" />
                </div>

                {/* Benchmark Dropdown Pill */}
                <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border shadow-2xs ${
                  isDark ? "bg-[#161412] border-white/10 text-[#A39E93]" : "bg-white border-[#E7E1D8] text-[#5C5752]"
                }`}>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Benchmark: <strong>Top-5 Index (Inception Base ₹100.00)</strong></span>
                </div>
              </div>

              {/* Decision Date / Timestamp */}
              <div className="text-[11px] text-[#A39E93] font-mono">
                Decision Date: <strong>{decisionDateIST} @ 11:00 IST</strong>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TAB VIEW 1: PORTFOLIO OVERVIEW                                            */}
            {/* ========================================================================= */}
            {activeNav === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* 4 COCKPIT SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
                  
                  {/* Card 1: Featured Hero Dark/Accent Card */}
                  <div className={`rounded-[24px] sm:rounded-[26px] p-5 sm:p-6 shadow-md flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all border ${
                    isDark
                      ? "bg-[#1E1B17] border-[#F59E0B]/30 shadow-black/40 text-white"
                      : "bg-[#121110] border-[#121110] shadow-[#121110]/15 text-white"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#A39E93]">
                      <span className="font-medium text-white/90">Total Portfolio Wealth</span>
                      <button 
                        type="button" 
                        onClick={() => handleOpenBuyModal()}
                        className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition cursor-pointer"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="my-2">
                      <div className="text-2xl sm:text-3xl 2xl:text-[32px] font-extrabold font-mono tracking-tight text-white flex items-baseline gap-1.5 truncate">
                        <span>₹{totalWealth.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 text-white/80 font-mono">
                      <span className="truncate">Invested: ₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold border shrink-0 ml-1 ${
                        totalReturnPct >= 0
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      }`}>
                        {totalReturnPct >= 0 ? `+${totalReturnPct.toFixed(1)}%` : `${totalReturnPct.toFixed(1)}%`}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Realized / Active Monthly SIP */}
                  <div className={`rounded-[24px] sm:rounded-[26px] p-5 sm:p-6 shadow-xs border flex flex-col justify-between min-h-[160px] group transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#736E65] dark:text-[#A39E93]">
                      <span className="font-medium">Active Monthly Auto-SIP</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isDark ? "bg-white/5 text-emerald-400" : "bg-[#FAF8F5] text-emerald-600"
                      }`}>
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight truncate ${isDark ? "text-white" : "text-[#121110]"}`}>
                        {sipCommitmentDisplay}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 font-mono">
                      <span className="text-[#A39E93] truncate">{activeMandates.length} Active Mandates</span>
                      <span className={`font-semibold shrink-0 ml-1 ${
                        totalProfit >= 0
                          ? isDark ? "text-emerald-400" : "text-emerald-600"
                          : isDark ? "text-rose-400" : "text-rose-600"
                      }`}>
                        {totalProfit >= 0 ? `+₹${totalProfit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : `-₹${Math.abs(totalProfit).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Return Trajectory & XIRR */}
                  <div className={`rounded-[24px] sm:rounded-[26px] p-5 sm:p-6 shadow-xs border flex flex-col justify-between min-h-[160px] group transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#736E65] dark:text-[#A39E93]">
                      <span className="font-medium">Overall Return Trajectory</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isDark ? "bg-white/5 text-[#F59E0B]" : "bg-[#FAF8F5] text-[#D97706]"
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight truncate ${
                        totalReturnPct >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}>
                        {totalReturnPct >= 0 ? `+${totalReturnPct.toFixed(1)}%` : `${totalReturnPct.toFixed(1)}%`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 font-mono">
                      <span className="text-[#A39E93]">Annualized XIRR</span>
                      <span className="font-bold text-[#F59E0B]">24.8%</span>
                    </div>
                  </div>

                  {/* Card 4: Statutory 194S TDS Ledger */}
                  <div className={`rounded-[24px] sm:rounded-[26px] p-5 sm:p-6 shadow-xs border flex flex-col justify-between min-h-[160px] group transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#736E65] dark:text-[#A39E93]">
                      <span className="font-medium">Section 194S TDS Remitted</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isDark ? "bg-white/5 text-[#A39E93]" : "bg-[#FAF8F5] text-[#5C5752]"
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        STATUTORY: COMPLIANT
                      </div>
                      <div className={`text-xl sm:text-2xl font-extrabold font-mono mt-1 truncate ${isDark ? "text-white" : "text-[#121110]"}`}>
                        ₹{totalTdsDeducted.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 font-mono text-[11px] text-[#A39E93]">
                      <span>TAN BLRB91024D</span>
                      <span className="font-semibold text-emerald-500">26AS Ready</span>
                    </div>
                  </div>

                </div>

                {/* MIDDLE ROW: DONUT ALLOCATION PROGRESS & GROWTH CHART */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Left Card: Portfolio Accuracy & Allocation */}
                  <div className={`lg:col-span-5 xl:col-span-4 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs border flex flex-col justify-between transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    {/* Card Title */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-[#121110]"}`}>
                          Portfolio Allocation Progress
                        </h3>
                        <p className="text-xs text-[#A39E93]">Goal: Systematic ₹10,00,000 Target</p>
                      </div>
                      <span className="text-[11px] font-mono text-[#A39E93]">Nov 2026</span>
                    </div>

                    {/* Circular Donut Gauge Centered */}
                    <div className="flex-1 flex items-center justify-center py-6 my-auto">
                      <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                          <circle
                            cx="80"
                            cy="80"
                            r="62"
                            stroke={isDark ? "rgba(255,255,255,0.08)" : "#EAE5DF"}
                            strokeWidth="14"
                            fill="transparent"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="62"
                            stroke="#10B981"
                            strokeWidth="14"
                            strokeDasharray="390"
                            strokeDashoffset="78"
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-sans leading-none ${isDark ? "text-white" : "text-[#121110]"}`}>
                            89%
                          </span>
                          <span className="text-[10px] font-mono font-bold tracking-widest text-[#A39E93] uppercase mt-1.5">
                            HEALTH SCORE
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Allocation Legend with Formatted Numbers */}
                    <div className="space-y-2.5 pt-4 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className={isDark ? "text-[#A39E93]" : "text-[#5C5752]"}>Top-5 Index (55%)</span>
                        </div>
                        <span className={`font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                          ₹{(totalWealth * 0.55).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                          <span className={isDark ? "text-[#A39E93]" : "text-[#5C5752]"}>Crypto + Gold (30%)</span>
                        </div>
                        <span className={`font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                          ₹{(totalWealth * 0.30).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                          <span className={isDark ? "text-[#A39E93]" : "text-[#5C5752]"}>Bitcoin Sovereign (15%)</span>
                        </div>
                        <span className={`font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                          ₹{(totalWealth * 0.15).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Card: Main Growth Line/Bar Chart */}
                  <div className="lg:col-span-7 xl:col-span-8">
                    <GrowthChart
                      baskets={baskets}
                      portfolioWealth={totalWealth}
                      totalInvested={totalInvested}
                      isDark={isDark}
                    />
                  </div>

                </div>

                {/* BOTTOM SECTION: Smart SIP Mandates Snapshot & Quick Basket Holdings */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Left: Smart Mandates Snapshot */}
                  <div className={`lg:col-span-7 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs border flex flex-col justify-between transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-[#121110]"}`}>
                            Recurring Auto-SIP Mandates
                          </h3>
                          <p className="text-xs text-[#A39E93]">NPCI UPI AutoPay debits directly from your verified Indian bank</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenSIPModal}
                          className="text-xs font-bold text-[#F59E0B] hover:underline cursor-pointer"
                        >
                          + New Mandate
                        </button>
                      </div>

                      {/* Mandates Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {portfolio.mandates.slice(0, 4).map((m, idx) => {
                          const isActive = m.status === "ACTIVE";
                          return (
                            <div key={m.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                              isDark ? "bg-[#1E1B17] border-white/5" : "bg-[#FAF8F5] border-[#EAE5DF]"
                            }`}>
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  isDark ? "bg-white/5 text-[#F59E0B]" : "bg-white border border-[#E7E1D8] text-[#D97706]"
                                }`}>
                                  <CalendarClock className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className={`font-bold text-xs truncate ${isDark ? "text-white" : "text-[#121110]"}`}>
                                    {m.basketName}
                                  </div>
                                  <div className="text-[11px] text-[#A39E93] mt-0.5 font-mono truncate">
                                    ₹{m.monthlyAmountINR.toLocaleString("en-IN")}/{getMandateFrequency(m, idx) === "Weekly" ? "wk" : getMandateFrequency(m, idx) === "Daily" ? "day" : "mo"} • {isActive ? "Active" : "Paused"}
                                  </div>
                                  <div className="text-[10px] text-[#A39E93] font-mono">
                                    Next: {getMandateNextDate(m, idx)}
                                  </div>
                                </div>
                              </div>

                              {/* Toggle Switch */}
                              <button
                                type="button"
                                onClick={() => toggleMandate(m.id)}
                                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                                  isActive ? "bg-[#F59E0B]" : (isDark ? "bg-neutral-700" : "bg-neutral-300")
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

                    <div className="pt-3 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#A39E93]">
                      <span>NPCI e-Mandate Certified · HDFC / ICICI / SBI Supported</span>
                      <button
                        type="button"
                        onClick={handleNavigateToAllMandates}
                        className="font-bold text-[#F59E0B] hover:underline cursor-pointer self-start sm:self-auto"
                      >
                        View All Mandates ({portfolio.mandates.length}) →
                      </button>
                    </div>
                  </div>

                  {/* Right: Section 194S TDS Compliance Snapshot */}
                  <div className={`lg:col-span-5 rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col justify-between transition-all border ${
                    isDark ? "bg-[#1E1B17] border-[#F59E0B]/25 text-white" : "bg-[#121110] border-[#121110] text-white"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          Section 194S TDS Ledger
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#F59E0B]/20 text-[#F59E0B] uppercase tracking-wider border border-[#F59E0B]/30">
                          FORM 26AS COMPLIANT
                        </span>
                      </div>

                      <p className="text-xs text-[#A39E93] mb-3.5">
                        Statutory 1% TDS deducted at redemption & remitted against your PAN.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono">
                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                          <div className="text-[10px] uppercase tracking-wider text-[#A39E93]">TDS REMITTED (1%)</div>
                          <div className="text-lg sm:text-xl font-bold text-[#F59E0B] mt-1 truncate">
                            ₹{totalTdsDeducted.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-[#A39E93] mt-2 pt-1.5">
                            TAN BLRB91024D
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                          <div className="text-[10px] uppercase tracking-wider text-[#A39E93]">NET BANK SETTLED</div>
                          <div className="text-lg sm:text-xl font-bold text-white mt-1 truncate">
                            ₹{totalNetSettled.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-[#A39E93] mt-2 pt-1.5">
                            IMPS Instant T+0
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleDownloadTdsReport}
                        disabled={isDownloadingReport}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/15 py-2.5 px-4 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs truncate"
                      >
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        <span>{isDownloadingReport ? "Exporting..." : "Download 26AS TDS CSV"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveNav("ledger")}
                        className="px-4 py-2.5 rounded-full bg-[#F59E0B] hover:bg-[#F0A828] flex items-center justify-center text-[#0B0A09] text-xs font-bold transition cursor-pointer shrink-0"
                      >
                        <span>Ledger ↗</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Curated Basket Holdings Preview Table */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-[#121110]"}`}>
                        Curated Basket Holdings
                      </h3>
                      <p className="text-xs text-[#A39E93] mt-0.5">
                        Multi-asset thematic indices with live oracle pricing.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveNav("holdings")}
                      className="text-xs font-bold text-[#F59E0B] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <span>View Constituent Breakdown</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-full overflow-x-auto no-scrollbar rounded-xl">
                    <table className="w-full min-w-[700px] text-left text-xs">
                      <thead className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                        isDark ? "bg-white/5 border-white/10 text-[#A39E93]" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#736E65]"
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
                        isDark ? "divide-white/5 text-[#A39E93]" : "divide-[#EAE5DF]"
                      }`}>
                        {holdingsWithLiveNav.map((h) => (
                          <tr key={h.basketId} className={`transition ${
                            isDark ? "hover:bg-white/5" : "hover:bg-[#FAF8F5]"
                          }`}>
                            <td className={`py-3 px-3.5 font-sans font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                              {h.basketName}
                            </td>
                            <td className="py-3 px-3">{h.units.toFixed(2)}</td>
                            <td className="py-3 px-3">₹{h.avgBuyNav.toFixed(2)}</td>
                            <td className="py-3 px-3 font-bold text-[#F59E0B]">₹{h.liveNav.toFixed(2)}</td>
                            <td className="py-3 px-3">₹{h.investedAmountINR.toLocaleString("en-IN")}</td>
                            <td className={`py-3 px-3 font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                              ₹{h.currentVal.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className={`font-bold inline-block px-2 py-0.5 rounded-full border ${
                                h.retPct >= 0
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              }`}>
                                {h.retPct >= 0 ? `+${h.retPct.toFixed(1)}%` : `${h.retPct.toFixed(1)}%`} ({h.profit >= 0 ? `+₹${h.profit.toLocaleString("en-IN")}` : `-₹${Math.abs(h.profit).toLocaleString("en-IN")}`})
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
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Holdings Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div className={`p-5 rounded-[24px] sm:rounded-[26px] shadow-sm flex flex-col justify-between transition-all border ${
                    isDark ? "bg-[#1E1B17] border-[#F59E0B]/30 text-white" : "bg-[#121110] text-white"
                  }`}>
                    <span className="text-xs text-[#A39E93]">Total Basket Valuation</span>
                    <div className="text-2xl sm:text-3xl font-bold font-mono my-1 truncate">
                      ₹{totalWealth.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </div>
                    <span className="text-xs text-[#F59E0B]">Across {holdingsWithLiveNav.length} Thematic Baskets</span>
                  </div>

                  <div className={`p-5 rounded-[24px] sm:rounded-[26px] border shadow-xs flex flex-col justify-between transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <span className="text-xs text-[#A39E93]">Net Invested Principal</span>
                    <div className={`text-2xl sm:text-3xl font-bold font-mono my-1 truncate ${isDark ? "text-white" : "text-[#121110]"}`}>
                      ₹{totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </div>
                    <span className="text-xs text-[#A39E93]">Inception Base ₹100.00 Anchor</span>
                  </div>

                  <div className={`p-5 rounded-[24px] sm:rounded-[26px] border shadow-xs flex flex-col justify-between transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <span className="text-xs text-[#A39E93]">Unrealized Capital Gains</span>
                    <div className={`text-2xl sm:text-3xl font-bold font-mono my-1 truncate ${
                      totalProfit >= 0 ? "text-emerald-500" : "text-rose-500"
                    }`}>
                      {totalProfit >= 0 ? `+₹${totalProfit.toLocaleString("en-IN", { minimumFractionDigits: 0 })}` : `-₹${Math.abs(totalProfit).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`}
                    </div>
                    <span className={`text-xs font-semibold ${
                      totalReturnPct >= 0 ? "text-emerald-500" : "text-rose-500"
                    }`}>
                      {totalReturnPct >= 0 ? `+${totalReturnPct.toFixed(1)}%` : `${totalReturnPct.toFixed(1)}%`} Multi-Asset Compound
                    </span>
                  </div>
                </div>

                {/* Holdings Table */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>Active Basket Holdings</h3>
                      <p className="text-xs text-[#A39E93]">Click any row to inspect underlying constituent token weights and live pricing.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenBuyModal()}
                      className="px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer bg-[#F59E0B] text-[#0B0A09] hover:bg-[#F0A828] self-start sm:self-auto"
                    >
                      + Invest in Basket
                    </button>
                  </div>

                  <div className="w-full overflow-x-auto no-scrollbar rounded-xl">
                    <table className="w-full min-w-[760px] text-left text-xs">
                      <thead className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                        isDark ? "bg-white/5 border-white/10 text-[#A39E93]" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#736E65]"
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
                        isDark ? "divide-white/5 text-[#A39E93]" : "divide-[#EAE5DF]"
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
                                    ? "bg-[#F59E0B]/15 font-semibold"
                                    : "bg-[#F59E0B]/10 font-semibold"
                                  : isDark
                                    ? "hover:bg-white/5"
                                    : "hover:bg-[#FAF8F5]"
                              }`}
                            >
                              <td className={`py-3.5 px-3.5 font-sans font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-[#121110]"}`}>
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                                <span>{h.basketName}</span>
                              </td>
                              <td className="py-3.5 px-3">{h.units.toFixed(2)}</td>
                              <td className="py-3.5 px-3">₹{h.avgBuyNav.toFixed(2)}</td>
                              <td className="py-3.5 px-3 font-bold text-[#F59E0B]">₹{h.liveNav.toFixed(2)}</td>
                              <td className="py-3.5 px-3">₹{h.investedAmountINR.toLocaleString("en-IN")}</td>
                              <td className={`py-3.5 px-3 font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                                ₹{h.currentVal.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-3">
                                <span className={`font-bold inline-block px-2 py-0.5 rounded-full border ${
                                  h.retPct >= 0
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                }`}>
                                  {h.retPct >= 0 ? `+${h.retPct.toFixed(1)}%` : `${h.retPct.toFixed(1)}%`} ({h.profit >= 0 ? `+₹${h.profit.toLocaleString("en-IN")}` : `-₹${Math.abs(h.profit).toLocaleString("en-IN")}`})
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-right space-x-2 font-sans" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenBuyModal(h.basketId)}
                                  className="text-xs font-bold text-[#F59E0B] hover:underline cursor-pointer"
                                >
                                  Buy
                                </button>
                                <span className="text-[#A39E93]">·</span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenWithdrawModal(h.basketId)}
                                  className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
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
                    <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                      isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                              Constituent Weights
                            </span>
                            <span className={`font-bold text-sm ${isDark ? "text-white" : "text-[#121110]"}`}>
                              {currentInspected.name}
                            </span>
                          </div>
                          <p className="text-xs text-[#A39E93] mt-0.5">
                            {currentInspected.tagline || currentInspected.description}
                          </p>
                        </div>
                        <div className="font-mono text-xs text-[#A39E93]">
                          Drift Threshold: <strong>±5.00%</strong> · Rebalancing: <strong>Algorithmic</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5 pt-2">
                        {currentInspected.assets.map((asset) => (
                          <div key={asset.symbol} className={`p-4 rounded-2xl border space-y-2 ${
                            isDark ? "bg-[#1E1B17] border-white/5" : "bg-[#FAF8F5] border-[#EAE5DF]"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color || "#F59E0B" }} />
                              <span className="font-mono text-xs font-bold text-[#F59E0B]">{asset.weight}%</span>
                            </div>
                            <div className={`font-bold text-sm truncate ${isDark ? "text-white" : "text-[#121110]"}`}>{asset.name}</div>
                            <div className="text-[11px] font-mono text-[#A39E93]">
                              Symbol: <strong className={isDark ? "text-white" : "text-[#121110]"}>{asset.symbol}</strong>
                            </div>
                            <div className={`text-xs font-mono font-bold pt-1 ${
                              isDark ? "text-white" : "text-[#121110]"
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
            {/* TAB VIEW 3: SYSTEMATIC SIP MANDATES                                       */}
            {/* ========================================================================= */}
            {activeNav === "mandates" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Mandates Summary Banner */}
                <div className={`p-5 sm:p-6 rounded-[24px] sm:rounded-[28px] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all border ${
                  isDark ? "bg-[#1E1B17] border-[#F59E0B]/30" : "bg-[#121110] border-[#121110]"
                }`}>
                  <div>
                    <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-mono font-bold uppercase">
                      <ShieldCheck className="w-4 h-4" />
                      <span>NPCI UPI AutoPay & e-NACH Engine</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mt-1">Systematic Rupee SIP Compounding</h2>
                    <p className="text-xs text-[#A39E93] mt-1 max-w-xl">
                      Automated monthly, weekly, or daily rupee auto-debits directly from your verified bank account into cold-custodied crypto baskets.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenSIPModal}
                    className="px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition shrink-0 cursor-pointer shadow-sm bg-[#F59E0B] text-[#0B0A09] hover:bg-[#F0A828]"
                  >
                    + Setup New Mandate ↗
                  </button>
                </div>

                {/* Mandates Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div className={`p-5 rounded-[24px] sm:rounded-[26px] border shadow-xs transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div className="text-xs text-[#A39E93] uppercase font-mono font-bold">Total Auto-Debit Commitment</div>
                    <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 truncate ${isDark ? "text-white" : "text-[#121110]"}`}>
                      {sipCommitmentDisplay}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-500 mt-1">100% On-Schedule Execution</div>
                  </div>

                  <div className={`p-5 rounded-[24px] sm:rounded-[26px] border shadow-xs transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div className="text-xs text-[#A39E93] uppercase font-mono font-bold">Active Standing Mandates</div>
                    <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 truncate ${isDark ? "text-white" : "text-[#121110]"}`}>
                      {activeMandates.length} Registered
                    </div>
                    <div className="text-[11px] text-[#A39E93] mt-1">NPCI e-Mandate Certified</div>
                  </div>

                  <div className={`p-5 rounded-[24px] sm:rounded-[26px] border shadow-xs transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div className="text-xs text-[#A39E93] uppercase font-mono font-bold">Next Auto-Debit Execution</div>
                    <div className="text-xl sm:text-2xl font-bold font-mono mt-1 text-[#F59E0B] truncate">
                      {earliestMandateDate}
                    </div>
                    <div className="text-[11px] text-[#A39E93] mt-1">Scheduled at 09:30 AM IST</div>
                  </div>
                </div>

                {/* Detailed Mandates Grid */}
                <div id="all-configured-mandates" className="space-y-4">
                  <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                    All Configured Auto-Debit Mandates
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                    {portfolio.mandates.map((m, idx) => {
                      const isActive = m.status === "ACTIVE";
                      return (
                        <div
                          key={m.id}
                          className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between transition-all ${
                            isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                  isActive
                                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                    : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                }`}>
                                  {m.status}
                                </span>
                                <h4 className={`text-lg font-bold mt-1.5 ${isDark ? "text-white" : "text-[#121110]"}`}>{m.basketName}</h4>
                                <div className="text-xs text-[#A39E93] font-mono">Mandate ID: {m.id}</div>
                              </div>

                              {/* Toggle Switch */}
                              <button
                                type="button"
                                onClick={() => toggleMandate(m.id)}
                                className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                                  isActive ? "bg-[#F59E0B]" : (isDark ? "bg-neutral-700" : "bg-neutral-300")
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

                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-4 text-xs font-mono ${isDark ? "text-[#A39E93]" : "text-[#5C5752]"}`}>
                              <div>Amount: <strong className={isDark ? "text-white" : "text-[#121110]"}>₹{m.monthlyAmountINR.toLocaleString("en-IN")}{getMandateFrequency(m, idx) === "Weekly" ? "/wk" : getMandateFrequency(m, idx) === "Daily" ? "/day" : "/mo"}</strong></div>
                              <div>Next Date: <strong className="text-[#F59E0B] font-bold">{getMandateNextDate(m, idx)}</strong></div>
                              <div>VPA: <strong className={isDark ? "text-white" : "text-[#121110]"}>{m.vpa}</strong></div>
                              <div>Frequency: <strong className={isDark ? "text-white" : "text-[#121110]"}>{getMandateFrequency(m, idx)}</strong></div>
                            </div>
                          </div>

                          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                            <span className="text-[#A39E93] text-[11px]">HDFC Bank · NetBanking Mandate</span>
                            <button
                              type="button"
                              onClick={() => toggleMandate(m.id)}
                              className="font-bold text-[#F59E0B] hover:underline cursor-pointer self-start sm:self-auto"
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
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Statutory Tax Summary Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div className={`p-5 rounded-[24px] sm:rounded-[26px] shadow-sm flex flex-col justify-between transition-all border ${
                    isDark ? "bg-[#1E1B17] border-[#F59E0B]/30 text-white" : "bg-[#121110] text-white"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#F59E0B] uppercase font-mono">Section 194S TDS</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">1% Statutory</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono my-2 truncate">
                      ₹{totalTdsDeducted.toLocaleString("en-IN")}
                    </div>
                    <span className="text-[11px] text-[#A39E93]">Remitted directly under TAN BLRB91024D</span>
                  </div>

                  <div className={`p-5 rounded-[24px] sm:rounded-[26px] border shadow-xs flex flex-col justify-between transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <span className="text-xs text-[#A39E93] uppercase font-mono">Net Bank Settlements</span>
                    <div className={`text-2xl sm:text-3xl font-bold font-mono my-2 truncate ${isDark ? "text-white" : "text-[#121110]"}`}>
                      ₹{totalNetSettled.toLocaleString("en-IN")}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-500">
                      Credited to Verified Bank (IMPS)
                    </span>
                  </div>

                  <div className={`p-5 rounded-[24px] sm:rounded-[26px] border shadow-xs flex flex-col justify-between transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <span className="text-xs text-[#A39E93] uppercase font-mono">Gross Transaction Volume</span>
                    <div className={`text-2xl sm:text-3xl font-bold font-mono my-2 truncate ${isDark ? "text-white" : "text-[#121110]"}`}>
                      ₹{portfolio.transactions.reduce((s, t) => s + t.amountINR, 0).toLocaleString("en-IN")}
                    </div>
                    <span className="text-[11px] text-[#A39E93]">Across {portfolio.transactions.length} Total Transactions</span>
                  </div>
                </div>

                {/* Transactions Ledger Table Card */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                        Statutory Transaction Ledger
                      </h3>
                      <p className="text-xs text-[#A39E93]">
                        Reconciled against Section 194S 1% TDS deduction and NPCI/IMPS banking rails.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Type Filter */}
                      <div className={`flex items-center gap-1 p-1 rounded-full border text-xs ${
                        isDark ? "bg-white/5 border-white/10" : "bg-[#FAF8F5] border-[#E7E1D8]"
                      }`}>
                        {(["ALL", "BUY", "WITHDRAWAL"] as const).map((filter) => (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => setLedgerFilter(filter)}
                            className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                              ledgerFilter === filter
                                ? isDark
                                  ? "bg-[#F59E0B] text-[#0B0A09] font-bold"
                                  : "bg-[#121110] text-white font-bold"
                                : isDark
                                  ? "text-[#A39E93] hover:text-white"
                                  : "text-[#736E65] hover:text-[#121110]"
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
                        className="px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition cursor-pointer bg-[#F59E0B] text-[#0B0A09] hover:bg-[#F0A828]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isDownloadingReport ? "Exporting..." : "CSV"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto no-scrollbar rounded-xl">
                    <table className="w-full min-w-[850px] text-left text-xs">
                      <thead className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                        isDark ? "bg-white/5 border-white/10 text-[#A39E93]" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#736E65]"
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
                        isDark ? "divide-white/5 text-[#A39E93]" : "divide-[#EAE5DF]"
                      }`}>
                        {filteredTransactions.map((tx) => (
                          <tr key={tx.id} className={`transition ${
                            isDark ? "hover:bg-white/5" : "hover:bg-[#FAF8F5]"
                          }`}>
                            <td className="py-3 px-3 text-[#A39E93]">
                              {new Date(tx.timestamp).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>

                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center gap-1 font-bold ${
                                tx.type === "BUY" ? "text-emerald-500" : "text-rose-500"
                              }`}>
                                {tx.type === "BUY" ? (
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                ) : (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                )}
                                {tx.type}
                              </span>
                            </td>

                            <td className={`py-3 px-3 font-sans font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                              {tx.basketName}
                            </td>

                            <td className={`py-3 px-3 font-semibold ${isDark ? "text-white" : "text-[#121110]"}`}>
                              ₹{tx.amountINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>

                            <td className="py-3 px-3 font-semibold text-rose-500">
                              {tx.tdsINR > 0 ? `-₹${tx.tdsINR.toFixed(2)}` : "₹0.00"}
                            </td>

                            <td className={`py-3 px-3 font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                              ₹{tx.netAmountINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>

                            <td className="py-3 px-3 text-[#A39E93] text-[10px] truncate max-w-[130px]" title={tx.bankRef}>
                              {tx.bankRef}
                            </td>

                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                                tx.status === "SETTLED" || tx.status === "CREDITED_TO_BANK" || tx.status === "COMPLETED"
                                  ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              }`}>
                                {tx.status}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedTxForInvoice(tx)}
                                className={`px-2.5 py-1 rounded-full font-semibold text-[11px] flex items-center gap-1 ml-auto transition cursor-pointer border ${
                                  isDark
                                    ? "bg-white/5 hover:bg-white/10 text-white border-white/10"
                                    : "bg-[#FAF8F5] hover:bg-[#F4EFEA] text-[#121110] border-[#E7E1D8]"
                                }`}
                              >
                                <FileText className="w-3 h-3 text-[#A39E93]" />
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
        onClose={() => {
          setIsBuyModalOpen(false);
          setSelectedBasketIdForModal(undefined);
        }}
        baskets={baskets}
        initialBasketId={selectedBasketIdForModal}
        onBuySubmit={(basketId, amount) => {
          buyBasket(basketId, amount);
        }}
      />

      {/* 3. Quick Withdrawal Modal */}
      <RedemptionModal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setSelectedBasketIdForModal(undefined);
        }}
        holdings={portfolio.holdings}
        baskets={baskets}
        userPan={user?.pan || "ABCDE1234F"}
        initialBasketId={selectedBasketIdForModal}
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