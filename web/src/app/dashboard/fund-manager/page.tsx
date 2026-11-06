"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  FileText,
  Download,
  RotateCw,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Sliders,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Briefcase
} from "lucide-react";
import { useBaskly } from "@/context/BasklyContext";
import { Basket, RebalanceLog } from "@/types/baskly";

/**
 * Deterministic timestamp formatter for Baskly.money in IST.
 */
function formatKolkataTimestamp(timestamp?: string | null): string {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "—";

  try {
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

type NavTab = "overview" | "drift" | "circuit" | "compliance" | "methodology";

export default function FundManagerOperationsTerminal() {
  const router = useRouter();
  const {
    user,
    manager,
    baskets,
    portfolio,
    oracleState,
    toggleCircuitBreaker,
    executeRebalance,
    openOracleModal,
    login,
    logout
  } = useBaskly();

  // Hydration state
  const [mounted, setMounted] = useState(false);

  // Active navigation tab
  const [activeNav, setActiveNav] = useState<NavTab>("overview");

  // Mobile menu drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile popover menu
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Search query across funds & logs
  const [searchQuery, setSearchQuery] = useState("");

  // Selected basket for drift inspection
  const [inspectedBasketId, setInspectedBasketId] = useState<string>("top-5-index");

  // Rebalance execution confirmation modal
  const [rebalanceTargetBasket, setRebalanceTargetBasket] = useState<Basket | null>(null);
  const [rebalanceReason, setRebalanceReason] = useState("Algorithmic Drift Realignment to Target Weights");
  const [isRebalancing, setIsRebalancing] = useState(false);

  // Flash notice banner
  const [flashNotice, setFlashNotice] = useState<{ message: string; type: "success" | "warning" | "error" } | null>(null);

  // Dark / Light Theme (synced with localStorage & html.dark)
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("baskly_theme");
    const rootDark = document.documentElement.classList.contains("dark");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("baskly_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("baskly_theme", "light");
    }
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-profile-menu-container]")) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      window.addEventListener("click", handleOutsideClick);
    }
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isProfileMenuOpen]);

  // Calendar date in Indian Standard Time (Asia/Kolkata)
  const decisionDateIST = useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  }, []);

  // Currently inspected basket
  const currentBasket = useMemo(() => {
    return baskets.find((b) => b.id === inspectedBasketId) || baskets[0];
  }, [baskets, inspectedBasketId]);

  // Pricing oracle parameters
  const usdtRate = oracleState?.usdtInr || 100.16;
  const isCircuitBreaker = Boolean(oracleState?.isNavFrozen || manager?.circuitBreakerActive);

  // Compute live constituent weights and simulated drift for all baskets
  const basketDriftAnalysis = useMemo(() => {
    return baskets.map((b) => {
      // Calculate constituent live market values
      const constituents = b.assets.map((asset, idx) => {
        const symbol = asset.symbol.toUpperCase();
        const tick = oracleState?.tokens?.[symbol];
        const livePriceUSD = tick?.usd || asset.basePrice || (symbol === "BTC" ? 82500 : symbol === "ETH" ? 2840 : symbol === "SOL" ? 178 : 100);
        const livePriceINR = tick?.inr || (livePriceUSD * usdtRate);

        // Simulate natural market price divergence drift from baseline
        // Seed an intentional drift delta based on token symbol
        let driftDelta = 0;
        if (symbol === "BTC") driftDelta = +4.8;
        else if (symbol === "ETH") driftDelta = -3.2;
        else if (symbol === "SOL") driftDelta = +6.1;
        else if (symbol === "BNB") driftDelta = -1.4;
        else if (symbol === "XRP") driftDelta = -2.1;
        else if (symbol === "PAXG") driftDelta = +1.1;
        else driftDelta = (idx % 2 === 0 ? 1 : -1) * (1.2 + idx * 0.7);

        const currentWeight = Math.max(1, Number((asset.weight + driftDelta).toFixed(2)));
        const netDrift = Number((currentWeight - asset.weight).toFixed(2));
        const absDrift = Math.abs(netDrift);
        const isExceeded = absDrift >= 5.0; // 5% statutory drift threshold

        return {
          symbol: asset.symbol,
          name: asset.name,
          targetWeight: asset.weight,
          currentWeight,
          netDrift,
          absDrift,
          isExceeded,
          livePriceUSD,
          livePriceINR,
          color: asset.color || (idx === 0 ? "#F59E0B" : idx === 1 ? "#3B82F6" : idx === 2 ? "#10B981" : "#8B5CF6")
        };
      });

      const maxDrift = constituents.reduce((max, c) => Math.max(max, c.absDrift), 0);
      const requiresRebalance = maxDrift >= 5.0;

      return {
        basket: b,
        constituents,
        maxDrift,
        requiresRebalance
      };
    });
  }, [baskets, oracleState, usdtRate]);

  // Selected basket analysis
  const selectedAnalysis = useMemo(() => {
    return basketDriftAnalysis.find((a) => a.basket.id === inspectedBasketId) || basketDriftAnalysis[0];
  }, [basketDriftAnalysis, inspectedBasketId]);

  // Count of funds exceeding drift threshold
  const driftedFundsCount = useMemo(() => {
    return basketDriftAnalysis.filter((a) => a.requiresRebalance).length;
  }, [basketDriftAnalysis]);

  // Filtered baskets for search query
  const filteredAnalysis = useMemo(() => {
    if (!searchQuery.trim()) return basketDriftAnalysis;
    const q = searchQuery.toLowerCase();
    return basketDriftAnalysis.filter((a) => 
      a.basket.name.toLowerCase().includes(q) ||
      a.basket.tagline.toLowerCase().includes(q) ||
      a.constituents.some((c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    );
  }, [basketDriftAnalysis, searchQuery]);

  // Filtered rebalance logs
  const filteredLogs = useMemo(() => {
    const logs = manager?.rebalanceLogs || [];
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter((l) => 
      l.basketName.toLowerCase().includes(q) ||
      l.managerName.toLowerCase().includes(q) ||
      l.reason.toLowerCase().includes(q)
    );
  }, [manager?.rebalanceLogs, searchQuery]);

  // Handle rebalance execution
  const handleConfirmRebalance = () => {
    if (!rebalanceTargetBasket) return;
    setIsRebalancing(true);

    try {
      const managerLabel = user?.name ? `${user.name} (CIO)` : "Chief Investment Officer";
      const log = executeRebalance(rebalanceTargetBasket.id, managerLabel);
      
      setFlashNotice({
        message: `Successfully executed algorithmic rebalance for ${log.basketName}. Trades executed: ${log.tradesExecuted}, Gas: ₹${log.gasCostINR}`,
        type: "success"
      });
      setTimeout(() => setFlashNotice(null), 6000);
      setRebalanceTargetBasket(null);
    } catch (err: any) {
      setFlashNotice({
        message: err.message || "Rebalance execution failed",
        type: "error"
      });
      setTimeout(() => setFlashNotice(null), 5000);
    } finally {
      setIsRebalancing(false);
    }
  };

  // Handle Emergency Circuit Breaker toggle
  const handleCircuitBreakerToggle = () => {
    const nextState = toggleCircuitBreaker();
    if (nextState) {
      setFlashNotice({
        message: "EMERGENCY: Circuit Breaker Activated. All retail orders, redemptions, and rebalances are immediately halted.",
        type: "warning"
      });
    } else {
      setFlashNotice({
        message: "Circuit Breaker Deactivated. Multi-asset order routing and automated compounding resumed.",
        type: "success"
      });
    }
    setTimeout(() => setFlashNotice(null), 6000);
  };

  // Fast switch to CIO demo identity if not logged in as manager
  const handleSwitchToDemoCIO = () => {
    login("Aditya Vikram (CIO)", "aditya.cio@baskly.money", "FUND_MANAGER");
    setFlashNotice({
      message: "Authenticated as Chief Investment Officer (SEBI Institutional Desk).",
      type: "success"
    });
    setTimeout(() => setFlashNotice(null), 4000);
  };

  // Compliance exports
  const handleExportForm16A = () => {
    const headers = [
      "Transaction ID",
      "Timestamp (IST)",
      "Type",
      "Curated Basket",
      "Gross Amount (INR)",
      "1% Section 194S TDS (INR)",
      "Net Settled (INR)",
      "Bank UTR / Reference",
      "Investor PAN",
      "Statutory Status"
    ];

    const rows = (portfolio?.transactions || []).map((t) => [
      t.id,
      formatKolkataTimestamp(t.timestamp),
      t.type,
      `"${t.basketName}"`,
      t.amountINR.toFixed(2),
      t.tdsINR.toFixed(2),
      t.netAmountINR.toFixed(2),
      t.bankRef || "NPCI/UPI/749204819201",
      user?.pan || "ABCDE4685F",
      "MATCHED_FORM_26AS"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Baskly_CBDT_Section194S_Form16A_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFlashNotice({
      message: "Form 16A Statutory TDS CSV exported successfully.",
      type: "success"
    });
    setTimeout(() => setFlashNotice(null), 4000);
  };

  const handleExportNavTimeSeries = () => {
    const data = baskets.map((b) => ({
      fundId: b.id,
      fundName: b.name,
      indexBaselineNav: 100.0,
      liveNavINR: b.nav,
      expectedCAGR: `${b.expected_cagr}%`,
      managementFeePct: `${b.fee_pct}%`,
      driftThresholdPct: "5.00%",
      constituents: b.assets.map((a) => ({
        token: a.symbol,
        name: a.name,
        targetWeightPct: a.weight,
        referencePriceUSD: a.basePrice || 100.0
      })),
      complianceStandard: "SEBI PMS / VDA Audited Inception Base"
    }));

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `Baskly_Official_NAV_Audit_Series_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFlashNotice({
      message: "Official NAV Time-Series JSON exported for compliance audit.",
      type: "success"
    });
    setTimeout(() => setFlashNotice(null), 4000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0B0A09] flex items-center justify-center font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-[#F59E0B] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full overflow-x-hidden font-sans antialiased selection:bg-[#F59E0B] selection:text-[#0B0A09] transition-colors duration-200 ${
      isDark ? "bg-[#0B0A09] text-white" : "bg-[#F4EFEA] text-[#121110]"
    }`}>

      {/* Full-Width Canvas Wrapper (Covers Entire Screen) */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-6 space-y-5 sm:space-y-6">

        {/* ========================================================= */}
        {/* MOBILE STICKY TOP HEADER (Screens < 1024px)               */}
        {/* ========================================================= */}
        <header className="lg:hidden flex items-center justify-between gap-3 py-2 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-[#F59E0B] text-[#0B0A09] font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
              b
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#121110] dark:text-white">
                baskly<span className="font-serif italic font-normal text-amber-500">.money</span>
              </span>
              <div className="text-[9px] font-mono uppercase tracking-widest text-[#A39E93] leading-none">
                CIO Operations Desk
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            {/* Oracle pill */}
            <button
              type="button"
              onClick={openOracleModal}
              className={`hidden xs:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono transition cursor-pointer ${
                isDark
                  ? isCircuitBreaker
                    ? "bg-white/5 border-white/10 text-amber-400"
                    : "bg-white/5 border-white/10 text-emerald-400"
                  : isCircuitBreaker
                    ? "bg-[#FAF8F5] border-[#E7E1D8] text-amber-700"
                    : "bg-[#FAF8F5] border-[#E7E1D8] text-emerald-700"
              }`}
              title={isCircuitBreaker ? "Pricing Oracle (NAV Frozen)" : "Pricing Oracle (Live)"}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isCircuitBreaker ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
              <span>₹{usdtRate}{isCircuitBreaker ? " (Frozen)" : ""}</span>
            </button>

            {/* Circuit breaker mini button on mobile */}
            <button
              type="button"
              onClick={handleCircuitBreakerToggle}
              className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold border transition cursor-pointer flex items-center gap-1 ${
                isCircuitBreaker
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  : "bg-emerald-500/15 text-emerald-500 border-emerald-500/25"
              }`}
              title="Emergency Circuit Breaker"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>{isCircuitBreaker ? "HALTED" : "ACTIVE"}</span>
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

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition cursor-pointer ${
                isDark ? "bg-white/5 border-white/10 text-white" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#121110]"
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* MOBILE SLIDE-DOWN DRAWER (Screens < 1024px)               */}
        {/* ========================================================= */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden w-full rounded-3xl p-5 mb-4 border shadow-lg space-y-5 transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
          }`}>
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#A39E93] px-3 mb-1 font-medium">
                INSTITUTIONAL DESK NAVIGATION
              </div>

              {[
                { id: "overview", label: "AUM & Fund Overview", icon: BarChart3 },
                { id: "drift", label: "Drift & Rebalancing", icon: TrendingUp, badge: driftedFundsCount > 0 ? `${driftedFundsCount}!` : undefined },
                { id: "circuit", label: "Emergency Circuit Breaker", icon: ShieldAlert },
                { id: "compliance", label: "Regulatory & TDS Vault", icon: ReceiptIcon },
                { id: "methodology", label: "Index Methodology", icon: Layers }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeNav === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveNav(tab.id as NavTab);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? isDark ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold" : "bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 font-bold"
                        : isDark ? "text-[#A39E93] hover:bg-white/5 hover:text-white" : "text-[#5C5752] hover:bg-[#FAF8F5] hover:text-[#121110]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-mono font-bold shrink-0 whitespace-nowrap">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick links to Customer Portal */}
            <div className={`pt-3 border-t flex items-center justify-between text-xs ${isDark ? "border-white/5" : "border-[#E7E1D8]"}`}>
              <Link
                href="/portal"
                className="text-xs font-semibold text-[#F59E0B] hover:underline flex items-center gap-1.5"
              >
                <span>Switch to Retail Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleSwitchToDemoCIO}
                className="text-xs font-semibold text-emerald-400 hover:underline"
              >
                Simulate CIO
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* EMERGENCY CIRCUIT BREAKER ALERT BANNER                    */}
        {/* ========================================================= */}
        {isCircuitBreaker && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-mono flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
              <span>
                <strong>CIRCUIT BREAKER ACTIVE:</strong> Platform automated order execution, user withdrawals, and compounding rebalances are halted. Multi-sig cold vaults are locked.
              </span>
            </div>
            <button
              type="button"
              onClick={handleCircuitBreakerToggle}
              className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
            >
              Deactivate
            </button>
          </div>
        )}

        {/* FLASH NOTICE BANNER */}
        {flashNotice && (
          <div className={`p-4 rounded-2xl border text-xs font-mono flex items-center gap-2.5 transition animate-in fade-in ${
            flashNotice.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : flashNotice.type === "warning"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}>
            {flashNotice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{flashNotice.message}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* DESKTOP TWO-COLUMN COCKPIT (SIDEBAR + MAIN CANVAS)       */}
        {/* ========================================================= */}
        <div className="w-full flex flex-col lg:flex-row gap-5 2xl:gap-7 items-start">

          {/* ========================================================= */}
          {/* 1. SEPARATE LEFT SIDEBAR ISLAND (Desktop Only: lg:flex)  */}
          {/* ========================================================= */}
          <aside className={`hidden lg:flex flex-col w-64 xl:w-72 2xl:w-80 rounded-[28px] p-5 lg:p-6 justify-between shrink-0 transition-all duration-200 border shadow-xs ${
            isDark
              ? "bg-[#161412] border-white/10"
              : "bg-white border-[#E7E1D8] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
          }`}>
            <div className="space-y-6">

              {/* Institutional Brand Header */}
              <div className="space-y-1">
                <Link href="/" className="inline-flex items-center gap-2.5 group">
                  <div className="w-9 h-9 rounded-full bg-[#F59E0B] text-[#0B0A09] font-serif font-bold text-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    b
                  </div>
                  <div>
                    <span className="font-bold text-base tracking-tight text-[#121110] dark:text-white">
                      baskly<span className="font-serif italic font-normal text-amber-500">.money</span>
                    </span>
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#736E65] dark:text-[#A39E93]">
                      CIO Operations Desk
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-[#0F6E56] dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SEBI & CBDT Regulated Terminal</span>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#736E65] dark:text-[#A39E93] px-3 mb-2 font-medium">
                  OPERATIONS MENU
                </div>

                {[
                  { id: "overview", label: "AUM & Overview", icon: BarChart3 },
                  { id: "drift", label: "Drift & Rebalancing", icon: TrendingUp, badge: driftedFundsCount > 0 ? `${driftedFundsCount}!` : undefined },
                  { id: "circuit", label: "Emergency Circuit Breaker", icon: ShieldAlert },
                  { id: "compliance", label: "Statutory TDS Vault", icon: ReceiptIcon },
                  { id: "methodology", label: "Index Methodology", icon: Layers }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveNav(item.id as NavTab)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold shadow-xs"
                            : "bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 font-bold shadow-xs"
                          : isDark
                            ? "text-[#A39E93] hover:bg-white/5 hover:text-white"
                            : "text-[#5C5752] hover:bg-[#FAF8F5] hover:text-[#121110]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-mono font-bold shrink-0 whitespace-nowrap">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Curated Baskets Quick Watchlist */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#736E65] dark:text-[#A39E93] px-3 mb-2 font-medium">
                  CURATED INDICES
                </div>
                <div className="space-y-1">
                  {baskets.slice(0, 5).map((b) => {
                    const isSelected = inspectedBasketId === b.id;
                    const analysis = basketDriftAnalysis.find((a) => a.basket.id === b.id);
                    const isDrifted = analysis?.requiresRebalance;

                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setInspectedBasketId(b.id);
                          setActiveNav("drift");
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-full text-xs transition cursor-pointer text-left ${
                          isSelected
                            ? isDark
                              ? "bg-[#F59E0B]/15 text-white font-semibold border border-[#F59E0B]/30"
                              : "bg-[#F59E0B]/10 text-[#121110] font-semibold border border-[#F59E0B]/20"
                            : isDark
                              ? "text-[#A39E93] hover:bg-white/5"
                              : "text-[#5C5752] hover:bg-[#FAF8F5]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isDrifted ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                          }`} />
                          <span className="truncate">{b.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#F59E0B] shrink-0 font-bold">
                          ₹{b.nav.toFixed(1)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pricing Oracle Box */}
              <div 
                onClick={openOracleModal}
                className={`rounded-[20px] p-3.5 border transition cursor-pointer ${
                  isDark
                    ? "bg-[#181512] border-white/10 hover:border-white/20"
                    : "bg-[#FAF8F5] border-[#E7E1D8] hover:border-[#D5CDC2]"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="uppercase tracking-widest text-[#736E65] dark:text-[#A39E93]">PRICING ORACLE</span>
                  <span className={`font-bold inline-flex items-center gap-1.5 ${isCircuitBreaker ? "text-amber-500" : "text-emerald-500"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isCircuitBreaker ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
                    {isCircuitBreaker ? "NAV Frozen" : "Live Ticks"}
                  </span>
                </div>
                <p className="text-[11px] text-[#A39E93] mt-1 leading-snug">
                  Binance & CoinGecko dual-feed. USDT rate ₹{usdtRate}.
                </p>
              </div>

            </div>

            {/* Bottom Card: Emergency Circuit Breaker Switch */}
            <div className={`mt-6 rounded-[22px] p-4 relative overflow-hidden transition-all border ${
              isCircuitBreaker
                ? "bg-rose-950/40 border-rose-500/40 text-white"
                : isDark
                ? "bg-[#1E1B17] border-[#F59E0B]/25 text-white"
                : "bg-[#121110] border-[#121110] text-white"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#F59E0B] text-[10px] font-mono font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>EMERGENCY CONTROLS</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${isCircuitBreaker ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
              </div>
              <h4 className="text-xs font-bold text-white tracking-wide mt-1.5">
                {isCircuitBreaker ? "Market Execution Halted" : "Circuit Breaker Armed"}
              </h4>
              <p className="text-[11px] text-[#A39E93] mt-1 leading-snug">
                {isCircuitBreaker
                  ? "Trading and withdrawals locked across all indices."
                  : "Instant multi-sig fail-safe during severe volatility."}
              </p>
              <button
                type="button"
                onClick={handleCircuitBreakerToggle}
                className={`w-full mt-3 text-xs font-bold py-1.5 px-3 rounded-full text-center cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5 ${
                  isCircuitBreaker
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : "bg-white hover:bg-[#EAE6DE] text-[#0B0A09]"
                }`}
              >
                {isCircuitBreaker ? (
                  <>
                    <Unlock className="w-3 h-3" />
                    <span>Deactivate Circuit Breaker</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>Trip Circuit Breaker</span>
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* 2. MAIN COCKPIT DASHBOARD AREA                            */}
          {/* ========================================================= */}
          <main className="w-full flex-1 min-w-0 space-y-5 sm:space-y-6">

            {/* Top Control Bar on Desktop */}
            <div className="hidden lg:flex items-center justify-between gap-4">
              
              {/* Search Box Pill */}
              <div className={`relative flex-1 max-w-2xl rounded-full px-5 py-2.5 flex items-center gap-3 transition-all border shadow-xs ${
                isDark
                  ? "bg-[#161412] border-white/10 text-white"
                  : "bg-white border-[#E7E1D8] text-[#121110]"
              }`}>
                <Search className="w-4 h-4 text-[#A39E93] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search indices, constituent tokens, drift metrics, or rebalance logs..."
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
                
                {/* Circuit Breaker Status Pill */}
                <button
                  type="button"
                  onClick={handleCircuitBreakerToggle}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer ${
                    isCircuitBreaker
                      ? "bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25"
                      : isDark
                      ? "bg-[#161412] border-white/10 text-emerald-400 hover:bg-white/5"
                      : "bg-white border-[#E7E1D8] text-emerald-700 hover:bg-[#FAF8F5]"
                  }`}
                  title="Toggle Emergency Circuit Breaker"
                >
                  <ShieldAlert className={`w-3.5 h-3.5 ${isCircuitBreaker ? "text-rose-500" : "text-emerald-500"}`} />
                  <span>{isCircuitBreaker ? "HALTED" : "CIRCUIT: NORMAL"}</span>
                </button>

                {/* Oracle USDT Live Pill */}
                <button
                  type="button"
                  onClick={openOracleModal}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                    isDark
                      ? isCircuitBreaker
                        ? "bg-[#161412] border-white/10 text-amber-400 hover:bg-white/5"
                        : "bg-[#161412] border-white/10 text-emerald-400 hover:bg-white/5"
                      : isCircuitBreaker
                        ? "bg-white border-[#E7E1D8] text-amber-700 hover:bg-[#FAF8F5]"
                        : "bg-white border-[#E7E1D8] text-emerald-700 hover:bg-[#FAF8F5]"
                  }`}
                  title={isCircuitBreaker ? "Inspect Pricing Oracle (NAV Frozen)" : "Inspect Pricing Oracle (Live)"}
                >
                  <Activity className={`w-3.5 h-3.5 ${isCircuitBreaker ? "text-amber-500" : "text-emerald-500"}`} />
                  <span>USDT ₹{usdtRate}{isCircuitBreaker ? " (Frozen)" : ""}</span>
                </button>

                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`w-9.5 h-9.5 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer border ${
                    isDark
                      ? "bg-[#161412] border-white/10 text-[#F59E0B] hover:bg-white/5"
                      : "bg-white border-[#E7E1D8] text-[#5C5752] hover:bg-[#FAF8F5]"
                  }`}
                  title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                >
                  {isDark ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#5C5752]" />}
                </button>

                {/* Institutional CIO Profile Dropdown */}
                <div className="relative" data-profile-menu-container>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={`relative w-9.5 h-9.5 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-xs ${
                      isDark
                        ? "bg-[#161412] border-white/10 text-white hover:border-[#F59E0B]/50"
                        : "bg-white border-[#E7E1D8] text-[#121110] hover:border-[#F59E0B]/50"
                    }`}
                    title="Chief Investment Officer Terminal Menu"
                  >
                    <Briefcase className="w-4 h-4 text-[#F59E0B]" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#161412]" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 p-3 space-y-2.5 ${
                      isDark
                        ? "bg-[#141210]/95 border-white/10 text-white shadow-black/80"
                        : "bg-white/95 border-[#E7E1D8] text-[#121110] shadow-black/10"
                    }`}>
                      <div className={`p-3 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-[#FAF8F5] border-[#E7E1D8]/60"}`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center shrink-0 border border-[#F59E0B]/30 font-bold text-xs">
                            CIO
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate leading-tight">
                              {user?.name || "Chief Investment Officer"}
                            </div>
                            <div className="text-[10px] font-mono text-[#F59E0B] font-semibold mt-0.5">
                              ROLE: FUND_MANAGER
                            </div>
                            <div className="text-[10px] text-emerald-400 font-medium">
                              SEBI Regulated · AUM Desk
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <Link
                          href="/portal"
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition hover:bg-white/5"
                        >
                          <div className="flex items-center gap-2 text-[#A39E93] hover:text-white">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Switch to Retail Portal</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#A39E93]">/portal</span>
                        </Link>

                        <button
                          type="button"
                          onClick={handleSwitchToDemoCIO}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition hover:bg-white/5 text-left cursor-pointer"
                        >
                          <span className="text-emerald-400 font-semibold">Reload Demo CIO Session</span>
                          <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      </div>

                      <div className="pt-1 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logout();
                            router.push("/signin");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out Terminal</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Sub-header baseline bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1 text-xs font-mono">
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-2xs ${
                  isDark ? "bg-[#161412] border-white/10 text-white" : "bg-white border-[#E7E1D8] text-[#121110]"
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold">Institutional Portfolio Governance</span>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border shadow-2xs ${
                  isDark ? "bg-[#161412] border-white/10 text-[#A39E93]" : "bg-white border-[#E7E1D8] text-[#5C5752]"
                }`}>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Drift Threshold: <strong>±5.00% Statutory Max</strong></span>
                </div>
              </div>

              {/* Decision Date / Timestamp in IST */}
              <div className="text-[11px] text-[#A39E93] font-mono">
                Decision Date: <strong>{decisionDateIST} @ 11:00 IST</strong>
              </div>
            </div>

            {/* Quick Horizontal Tab Switcher on Desktop & Mobile */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              {[
                { id: "overview", label: "AUM & Overview" },
                { id: "drift", label: driftedFundsCount > 0 ? `Drift & Rebalance (${driftedFundsCount}!)` : "Drift & Rebalancing" },
                { id: "circuit", label: "Emergency Circuit Breaker" },
                { id: "compliance", label: "Statutory TDS Vault" },
                { id: "methodology", label: "Index Methodology" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveNav(tab.id as NavTab)}
                  className={`px-4 py-2 rounded-full font-bold transition shrink-0 cursor-pointer flex items-center gap-2 ${
                    activeNav === tab.id
                      ? isDark
                        ? "bg-[#F59E0B] text-[#0B0A09] shadow-xs"
                        : "bg-[#121110] text-white shadow-xs"
                      : isDark
                        ? "bg-[#161412] text-[#A39E93] hover:text-white border border-white/10"
                        : "bg-white text-[#5C5752] hover:text-[#121110] border border-[#E7E1D8]"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ========================================================================= */}
            {/* TAB VIEW 1: INSTITUTIONAL AUM & INFLOW OVERVIEW                           */}
            {/* ========================================================================= */}
            {activeNav === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* 4 COCKPIT SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
                  
                  {/* Card 1: Total Institutional AUM */}
                  <div className={`rounded-[24px] sm:rounded-[26px] p-5 sm:p-6 shadow-md flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all border ${
                    isDark
                      ? "bg-[#1E1B17] border-[#F59E0B]/30 shadow-black/40 text-white"
                      : "bg-[#121110] border-[#121110] shadow-[#121110]/15 text-white"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#A39E93]">
                      <span className="font-medium text-white/90">Institutional AUM (INR)</span>
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                        <DollarSign className="w-3.5 h-3.5 text-[#F59E0B]" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className="text-xl sm:text-2xl xl:text-3xl font-extrabold font-mono tracking-tight text-white flex items-baseline gap-1.5">
                        <span>₹{(manager.totalAUM_INR / 10000000).toFixed(2)} Cr</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 text-white/80 font-mono gap-1">
                      <span className="whitespace-nowrap">Across 6 Indices</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 shrink-0">
                        +14.2% YTD
                      </span>
                    </div>
                  </div>

                  {/* Card 2: 24h Net Inflow & Velocity */}
                  <div className={`rounded-[24px] sm:rounded-[26px] p-5 sm:p-6 shadow-xs border flex flex-col justify-between min-h-[160px] group transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#736E65] dark:text-[#A39E93]">
                      <span className="font-medium">24h Net Liquidity Velocity</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isDark ? "bg-white/5 text-emerald-400" : "bg-[#FAF8F5] text-emerald-600"
                      }`}>
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className="text-xl sm:text-2xl xl:text-3xl font-extrabold font-mono tracking-tight text-emerald-500 flex items-baseline gap-1.5">
                        <span>+₹12.45</span>
                        <span className="text-xs font-sans font-normal text-emerald-400/80">Lakhs</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 font-mono">
                      <span className="text-[#A39E93]">AutoPay Inflow Rate</span>
                      <span className="font-bold text-[#F59E0B]">98.8% Success</span>
                    </div>
                  </div>

                  {/* Card 3: Verified Indian Investors */}
                  <div className={`rounded-[24px] sm:rounded-[26px] p-5 sm:p-6 shadow-xs border flex flex-col justify-between min-h-[160px] group transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#736E65] dark:text-[#A39E93]">
                      <span className="font-medium">Verified Active Investors</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isDark ? "bg-white/5 text-[#F59E0B]" : "bg-[#FAF8F5] text-[#D97706]"
                      }`}>
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className={`text-xl sm:text-2xl xl:text-3xl font-extrabold font-mono tracking-tight ${
                        isDark ? "text-white" : "text-[#121110]"
                      }`}>
                        {manager.verifiedInvestors.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 font-mono">
                      <span className="text-[#A39E93]">KYC & PAN Match</span>
                      <span className="font-bold text-emerald-500">100% Compliant</span>
                    </div>
                  </div>

                  {/* Card 4: Emergency Circuit Breaker */}
                  <div className={`rounded-[24px] sm:rounded-[26px] p-5 sm:p-6 shadow-xs border flex flex-col justify-between min-h-[160px] group transition-all ${
                    isCircuitBreaker
                      ? "bg-rose-500/10 border-rose-500/40"
                      : isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#736E65] dark:text-[#A39E93]">
                      <span className="font-medium">Market Execution Status</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isCircuitBreaker
                          ? "bg-rose-500/20 text-rose-500"
                          : isDark ? "bg-white/5 text-emerald-400" : "bg-[#FAF8F5] text-emerald-600"
                      }`}>
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isCircuitBreaker ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                        }`} />
                        <span className={`text-base sm:text-lg xl:text-xl font-extrabold font-sans tracking-tight ${
                          isCircuitBreaker ? "text-rose-500" : "text-emerald-500"
                        }`}>
                          {isCircuitBreaker ? "HALTED" : "LIVE & HEALTHY"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 font-mono">
                      <span className="text-[#A39E93]">Custody Standard</span>
                      <span className="font-bold text-[#F59E0B]">1:1 Cold Multi-Sig</span>
                    </div>
                  </div>

                </div>

                {/* AUM Weight Allocation Bar */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                        Institutional AUM Distribution by Thematic Index
                      </h3>
                      <p className="text-xs text-[#A39E93]">
                        Dynamic pool weight composition across all active retail & institutional investor holdings.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportNavTimeSeries}
                      className="px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border flex items-center gap-2 self-start sm:self-auto hover:bg-white/5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export NAV Series (JSON)</span>
                    </button>
                  </div>

                  {/* Multi-segment progress bar */}
                  <div className="space-y-2 pt-2">
                    <div className="h-4 w-full rounded-full overflow-hidden flex bg-white/5">
                      <div style={{ width: "42%" }} className="bg-[#F59E0B]" title="Top-5 Bluechip (42%)" />
                      <div style={{ width: "24%" }} className="bg-[#3B82F6]" title="Crypto + Gold (24%)" />
                      <div style={{ width: "15%" }} className="bg-[#10B981]" title="Pure Bitcoin (15%)" />
                      <div style={{ width: "9%" }} className="bg-[#8B5CF6]" title="Ethereum Layer (9%)" />
                      <div style={{ width: "6%" }} className="bg-[#EC4899]" title="DeFi Architects (6%)" />
                      <div style={{ width: "4%" }} className="bg-[#6366F1]" title="Alpha Momentum (4%)" />
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 text-[11px] font-mono">
                      {[
                        { name: "Top-5 Bluechip", pct: "42%", color: "#F59E0B" },
                        { name: "Crypto + Gold", pct: "24%", color: "#3B82F6" },
                        { name: "Pure Bitcoin", pct: "15%", color: "#10B981" },
                        { name: "Ethereum Layer", pct: "9%", color: "#8B5CF6" },
                        { name: "DeFi Architects", pct: "6%", color: "#EC4899" },
                        { name: "Alpha Momentum", pct: "4%", color: "#6366F1" },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="truncate text-[#736E65] dark:text-[#A39E93]">{item.name}</span>
                          <span className="font-bold text-[#121110] dark:text-white shrink-0">{item.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 6 Curated Indices Operational Table */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                        Curated Indices Operational Metrics
                      </h3>
                      <p className="text-xs text-[#A39E93]">
                        Real-time NAV tracking, expected CAGR targets, and constituent drift monitoring.
                      </p>
                    </div>
                    <div className="text-xs font-mono text-[#F59E0B]">
                      {driftedFundsCount > 0 ? `⚠ ${driftedFundsCount} Fund(s) Exceed Drift Limit` : "✓ All Indices Within Limit"}
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto no-scrollbar rounded-xl">
                    <table className="w-full min-w-[760px] text-left text-xs font-mono">
                      <thead className={`border-b text-[10px] uppercase tracking-wider ${
                        isDark ? "bg-[#181512] border-white/10 text-[#A39E93]" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#736E65]"
                      }`}>
                        <tr>
                          <th className="py-3 px-3.5">Curated Index</th>
                          <th className="py-3 px-3">Live Unit NAV</th>
                          <th className="py-3 px-3">Inception Base</th>
                          <th className="py-3 px-3">Target CAGR</th>
                          <th className="py-3 px-3">Expense Fee</th>
                          <th className="py-3 px-3">Max Drift %</th>
                          <th className="py-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredAnalysis.map((item) => {
                          const b = item.basket;
                          return (
                            <tr key={b.id} className={`transition ${
                              isDark ? "hover:bg-white/5" : "hover:bg-[#FAF8F5]"
                            }`}>
                              <td className={`py-3.5 px-3.5 font-sans font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-[#121110]"}`}>
                                <span className={`w-2 h-2 rounded-full shrink-0 ${
                                  item.requiresRebalance ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                                }`} />
                                <div>
                                  <div>{b.name}</div>
                                  <div className="text-[10px] text-[#A39E93] font-normal">{b.tagline}</div>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 font-bold text-[#F59E0B]">₹{b.nav.toFixed(2)}</td>
                              <td className="py-3.5 px-3 text-[#A39E93]">₹100.00</td>
                              <td className="py-3.5 px-3 font-bold text-emerald-500">{b.expected_cagr}% p.a.</td>
                              <td className="py-3.5 px-3 text-[#A39E93]">{b.fee_pct}%</td>
                              <td className="py-3.5 px-3">
                                <span className={`font-bold inline-block px-2 py-0.5 rounded-full border text-[11px] ${
                                  item.requiresRebalance
                                    ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
                                    : "bg-emerald-500/15 text-emerald-500 border-emerald-500/25"
                                }`}>
                                  {item.maxDrift.toFixed(2)}% {item.requiresRebalance ? "⚠ Rebalance Due" : "✓ Balanced"}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-right font-sans space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInspectedBasketId(b.id);
                                    setActiveNav("drift");
                                  }}
                                  className="text-xs font-bold text-[#F59E0B] hover:underline cursor-pointer"
                                >
                                  Inspect Drift
                                </button>
                                <span className="text-[#A39E93]">·</span>
                                <button
                                  type="button"
                                  onClick={() => setRebalanceTargetBasket(b)}
                                  className="text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
                                >
                                  Rebalance
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB VIEW 2: CONSTITUENT DRIFT & REBALANCING ATELIER                       */}
            {/* ========================================================================= */}
            {activeNav === "drift" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Drift Explainer Banner */}
                <div className={`p-5 rounded-[24px] sm:rounded-[26px] border shadow-xs transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F59E0B] uppercase">
                        <TrendingUp className="w-4 h-4" />
                        <span>Algorithmic Drift Detection Atelier</span>
                      </div>
                      <h2 className={`text-xl font-bold mt-1 ${isDark ? "text-white" : "text-[#121110]"}`}>
                        Index Constituent Alignment & Multi-Asset Rebalancing
                      </h2>
                      <p className="text-xs text-[#A39E93] mt-1 max-w-2xl leading-relaxed">
                        Crypto constituent prices diverge continuously on Binance. Statutory Indian VDA mandate requires re-anchoring whenever any single constituent drifts by more than <strong>±5.00%</strong> from baseline target weights.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setRebalanceTargetBasket(currentBasket)}
                        className="px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer bg-[#F59E0B] text-[#0B0A09] hover:bg-[#F0A828] shadow-sm flex items-center gap-2"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Rebalance {currentBasket.name}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Index Selector Bar */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
                  {baskets.map((b) => {
                    const isSelected = inspectedBasketId === b.id;
                    const analysis = basketDriftAnalysis.find((a) => a.basket.id === b.id);
                    const isDrifted = analysis?.requiresRebalance;

                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setInspectedBasketId(b.id)}
                        className={`px-4 py-2 rounded-full font-bold transition shrink-0 cursor-pointer flex items-center gap-2 border ${
                          isSelected
                            ? isDark
                              ? "bg-[#F59E0B] text-[#0B0A09] border-[#F59E0B]"
                              : "bg-[#121110] text-white border-[#121110]"
                            : isDark
                              ? "bg-[#161412] text-[#A39E93] border-white/10 hover:text-white"
                              : "bg-white text-[#5C5752] border-[#E7E1D8] hover:text-[#121110]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isDrifted ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`} />
                        <span>{b.name}</span>
                        {isDrifted && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500">
                            ±{analysis.maxDrift.toFixed(1)}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Detailed Constituent Matrix for Inspected Fund */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-5 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-white/5">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B]">
                        <span>CURRENTLY INSPECTING:</span>
                        <strong className="text-[#121110] dark:text-white">{currentBasket.name}</strong>
                      </div>
                      <p className="text-xs text-[#A39E93] mt-0.5">
                        Base Target NAV: ₹100.00 · Live NAV: <strong className="text-[#F59E0B]">₹{currentBasket.nav.toFixed(2)}</strong> · Drift Limit: <strong>±5.00%</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                        selectedAnalysis.requiresRebalance
                          ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-500 border-emerald-500/25"
                      }`}>
                        Max Constituent Drift: {selectedAnalysis.maxDrift.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Token breakdown cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAnalysis.constituents.map((token) => (
                      <div
                        key={token.symbol}
                        className={`p-4 rounded-2xl border transition-all ${
                          token.isExceeded
                            ? "bg-amber-500/5 border-amber-500/30"
                            : isDark ? "bg-[#1E1B17] border-white/5" : "bg-[#FAF8F5] border-[#E7E1D8]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span 
                              className="w-3.5 h-3.5 rounded-full shrink-0" 
                              style={{ backgroundColor: token.color }} 
                            />
                            <div>
                              <div className="font-bold text-sm leading-tight text-[#121110] dark:text-white">
                                {token.symbol} · {token.name}
                              </div>
                              <div className="text-[11px] font-mono text-[#736E65] dark:text-[#A39E93]">
                                ${token.livePriceUSD.toLocaleString("en-US", { maximumFractionDigits: 2 })} (₹{token.livePriceINR.toLocaleString("en-IN", { maximumFractionDigits: 0 })})
                              </div>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <div className={`text-xs font-bold ${
                              token.netDrift > 0 ? "text-emerald-500" : token.netDrift < 0 ? "text-rose-400" : "text-[#736E65] dark:text-[#A39E93]"
                            }`}>
                              {token.netDrift > 0 ? `+${token.netDrift}% Over` : `${token.netDrift}% Under`}
                            </div>
                            <span className="text-[10px] text-[#736E65] dark:text-[#A39E93]">
                              {token.isExceeded ? "⚠ Drift Exceeded" : "✓ Within Limit"}
                            </span>
                          </div>
                        </div>

                        {/* Dual bar comparison */}
                        <div className="space-y-1.5 mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-[10px] font-mono">
                          <div className="flex justify-between text-[#736E65] dark:text-[#A39E93]">
                            <span>Target: {token.targetWeight}%</span>
                            <span className="text-[#121110] dark:text-white font-bold">Current: {token.currentWeight}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden flex">
                            <div 
                              style={{ width: `${Math.min(100, token.currentWeight)}%`, backgroundColor: token.color }} 
                              className="h-full rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setRebalanceTargetBasket(currentBasket)}
                      className="px-6 py-2.5 rounded-full text-xs font-bold transition cursor-pointer bg-[#F59E0B] text-[#0B0A09] hover:bg-[#F0A828] shadow-sm flex items-center gap-2"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Execute Full Rebalance for {currentBasket.name}</span>
                    </button>
                  </div>
                </div>

                {/* Historical Rebalance Audit Ledger */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                        Rebalance Operations Audit Ledger
                      </h3>
                      <p className="text-xs text-[#A39E93]">
                        Immutable on-chain execution logs, batch gas consumption, and slippage records.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-[#A39E93]">
                      Total Executions: {manager?.rebalanceLogs?.length || 0}
                    </span>
                  </div>

                  <div className="w-full overflow-x-auto no-scrollbar rounded-xl">
                    <table className="w-full min-w-[760px] text-left text-xs font-mono">
                      <thead className={`border-b text-[10px] uppercase tracking-wider ${
                        isDark ? "bg-[#181512] border-white/10 text-[#A39E93]" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#736E65]"
                      }`}>
                        <tr>
                          <th className="py-3 px-3.5">Rebalance ID</th>
                          <th className="py-3 px-3">Timestamp (IST)</th>
                          <th className="py-3 px-3">Curated Index</th>
                          <th className="py-3 px-3">Executed By</th>
                          <th className="py-3 px-3">Trades</th>
                          <th className="py-3 px-3">Slippage %</th>
                          <th className="py-3 px-3">Gas (INR)</th>
                          <th className="py-3 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredLogs.map((log) => (
                          <tr key={log.id} className={`transition ${
                            isDark ? "hover:bg-white/5" : "hover:bg-[#FAF8F5]"
                          }`}>
                            <td className="py-3 px-3.5 text-[#F59E0B] font-bold">{log.id}</td>
                            <td className="py-3 px-3 text-[#A39E93]">{formatKolkataTimestamp(log.timestamp)}</td>
                            <td className={`py-3 px-3 font-sans font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>{log.basketName}</td>
                            <td className="py-3 px-3 text-[#A39E93]">{log.managerName}</td>
                            <td className="py-3 px-3 font-bold">{log.tradesExecuted} batch</td>
                            <td className="py-3 px-3 text-emerald-500">{log.slippagePct}%</td>
                            <td className="py-3 px-3 text-[#A39E93]">₹{log.gasCostINR.toFixed(2)}</td>
                            <td className="py-3 px-3 text-right">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 font-bold">
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
            )}

            {/* ========================================================================= */}
            {/* TAB VIEW 3: EMERGENCY CIRCUIT BREAKER & RISK ENGINE                       */}
            {/* ========================================================================= */}
            {activeNav === "circuit" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Circuit Breaker Console Card */}
                <div className={`p-6 rounded-[26px] border shadow-md transition-all ${
                  isCircuitBreaker
                    ? "bg-rose-950/30 border-rose-500/40"
                    : isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B]">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Institutional Market Fail-Safe Console</span>
                      </div>
                      <h2 className="text-2xl font-bold text-[#121110] dark:text-white">
                        Emergency Circuit Breaker Status:{" "}
                        <span className={isCircuitBreaker ? "text-rose-500" : "text-emerald-500"}>
                          {isCircuitBreaker ? "ACTIVE (TRIPPED)" : "ARMED (NORMAL TRADING)"}
                        </span>
                      </h2>
                      <p className="text-xs text-[#A39E93] max-w-2xl leading-relaxed">
                        When tripped, all retail buy orders, withdrawals, and automated UPI AutoPay debits are locked across all 6 indices. Multi-sig cold vaults are sealed against unauthorized fund movement.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCircuitBreakerToggle}
                      className={`px-6 py-3.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer shadow-md flex items-center gap-2 shrink-0 ${
                        isCircuitBreaker
                          ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                          : "bg-white hover:bg-[#EAE6DE] text-[#0B0A09]"
                      }`}
                    >
                      {isCircuitBreaker ? (
                        <>
                          <Unlock className="w-4 h-4" />
                          <span>Deactivate Circuit Breaker</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Trip Emergency Circuit Breaker</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Multi-Source Oracle Health Monitor Table */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                        Multi-Source Pricing Oracle Feed Monitor
                      </h3>
                      <p className="text-xs text-[#A39E93]">
                        Real-time inspection of Binance WebSocket miniTickers, CoinGecko fallback polls, and stale-feed detection.
                      </p>
                    </div>
                    <div className="text-xs font-mono text-emerald-500">
                      ✓ Primary Feed Active: Binance Combined Stream
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto no-scrollbar rounded-xl">
                    <table className="w-full min-w-[760px] text-left text-xs font-mono">
                      <thead className={`border-b text-[10px] uppercase tracking-wider ${
                        isDark ? "bg-[#181512] border-white/10 text-[#A39E93]" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#736E65]"
                      }`}>
                        <tr>
                          <th className="py-3 px-3.5">Asset Pair</th>
                          <th className="py-3 px-3">Primary Source</th>
                          <th className="py-3 px-3">Fallback Source</th>
                          <th className="py-3 px-3">Reference (USD)</th>
                          <th className="py-3 px-3">Reference (INR)</th>
                          <th className="py-3 px-3">Latency</th>
                          <th className="py-3 px-3 text-right">Feed Health</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {[
                          { symbol: "BTC", pair: "BTCUSDT", usd: 82540.20, latency: "14ms" },
                          { symbol: "ETH", pair: "ETHUSDT", usd: 2842.10, latency: "18ms" },
                          { symbol: "SOL", pair: "SOLUSDT", usd: 178.60, latency: "22ms" },
                          { symbol: "BNB", pair: "BNBUSDT", usd: 592.40, latency: "19ms" },
                          { symbol: "XRP", pair: "XRPUSDT", usd: 0.54, latency: "25ms" },
                          { symbol: "PAXG", pair: "PAXGUSDT", usd: 2740.00, latency: "31ms" },
                        ].map((feed) => (
                          <tr key={feed.symbol} className={`transition ${
                            isDark ? "hover:bg-white/5" : "hover:bg-[#FAF8F5]"
                          }`}>
                            <td className="py-3 px-3.5 font-bold text-[#121110] dark:text-white flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>{feed.pair}</span>
                            </td>
                            <td className="py-3 px-3 text-[#736E65] dark:text-[#A39E93]">Binance WebSocket</td>
                            <td className="py-3 px-3 text-[#736E65] dark:text-[#A39E93]">CoinGecko v3</td>
                            <td className="py-3 px-3 font-bold text-[#F59E0B]">${feed.usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                            <td className="py-3 px-3 text-[#121110] dark:text-white font-bold">₹{(feed.usd * usdtRate).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                            <td className="py-3 px-3 text-emerald-500 font-bold">{feed.latency}</td>
                            <td className="py-3 px-3 text-right">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 font-bold">
                                HEALTHY
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 1:1 Cold Vault Custody Standard */}
                <div className={`p-6 rounded-[26px] border shadow-xs transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-[#121110] dark:text-white">Institutional 1:1 Cold Vault Proof-of-Reserves</h4>
                      <p className="text-xs text-[#A39E93] mt-0.5">
                        Multi-signature threshold vaults physically separated from internet connectivity. Fully collateralized at 101.4% reserve ratio.
                      </p>
                    </div>
                    <div className="text-xs font-mono text-[#F59E0B] font-bold">
                      Audit Hash: 0x9b4e...31fa (Clean)
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB VIEW 4: STATUTORY TDS & REGULATORY COMPLIANCE VAULT                   */}
            {/* ========================================================================= */}
            {activeNav === "compliance" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Section 194S TDS Compliance Banner */}
                <div className={`p-6 rounded-[26px] border shadow-xs transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider">
                        CBDT STATUTORY TAX COMPLIANCE
                      </div>
                      <h2 className="text-xl font-bold mt-1 text-[#121110] dark:text-white">
                        Section 194S 1% TDS Remittance Vault & Form 16A Audit
                      </h2>
                      <p className="text-xs text-[#A39E93] mt-1 max-w-xl">
                        Statutory 1% TDS deducted at source for all retail customer redemptions, reconciled against Indian PAN numbers, and remitted quarterly under TAN <strong>BLRB91024D</strong>.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleExportForm16A}
                        className="px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer bg-[#F59E0B] text-[#0B0A09] hover:bg-[#F0A828] shadow-sm flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Form 16A CSV</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* TDS Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#1E1B17] border-white/10" : "bg-[#FAF8F5] border-[#E7E1D8]"}`}>
                    <span className="text-xs text-[#A39E93]">Total 1% TDS Withheld</span>
                    <div className="text-2xl font-bold font-mono text-emerald-500 my-1">
                      ₹4,12,850.00
                    </div>
                    <span className="text-[11px] text-[#A39E93]">Across 842 Redemptions</span>
                  </div>

                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#1E1B17] border-white/10" : "bg-[#FAF8F5] border-[#E7E1D8]"}`}>
                    <span className="text-xs text-[#736E65] dark:text-[#A39E93]">TAN Remittance Status</span>
                    <div className="text-2xl font-bold font-mono text-[#121110] dark:text-white my-1">
                      BLRB91024D
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium">✓ Q3 Filing Up to Date</span>
                  </div>

                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#1E1B17] border-white/10" : "bg-[#FAF8F5] border-[#E7E1D8]"}`}>
                    <span className="text-xs text-[#A39E93]">PAN 26AS Match Rate</span>
                    <div className="text-2xl font-bold font-mono text-[#F59E0B] my-1">
                      100.0%
                    </div>
                    <span className="text-[11px] text-[#A39E93]">Zero Rejection Records</span>
                  </div>
                </div>

                {/* Recent TDS Transactions */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                    Recent Redemptions & Statutory TDS Records
                  </h3>

                  <div className="w-full overflow-x-auto no-scrollbar rounded-xl">
                    <table className="w-full min-w-[760px] text-left text-xs font-mono">
                      <thead className={`border-b text-[10px] uppercase tracking-wider ${
                        isDark ? "bg-[#181512] border-white/10 text-[#A39E93]" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#736E65]"
                      }`}>
                        <tr>
                          <th className="py-3 px-3.5">Transaction ID</th>
                          <th className="py-3 px-3">Timestamp (IST)</th>
                          <th className="py-3 px-3">Index</th>
                          <th className="py-3 px-3">Gross (INR)</th>
                          <th className="py-3 px-3">1% TDS (INR)</th>
                          <th className="py-3 px-3">Net Settled</th>
                          <th className="py-3 px-3 text-right">Form 26AS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {(portfolio?.transactions || []).map((t) => (
                          <tr key={t.id} className={`transition ${
                            isDark ? "hover:bg-white/5" : "hover:bg-[#FAF8F5]"
                          }`}>
                            <td className="py-3 px-3.5 text-[#F59E0B] font-bold">{t.id}</td>
                            <td className="py-3 px-3 text-[#736E65] dark:text-[#A39E93]">{formatKolkataTimestamp(t.timestamp)}</td>
                            <td className="py-3 px-3 font-sans font-bold text-[#121110] dark:text-white">{t.basketName}</td>
                            <td className="py-3 px-3 font-bold text-[#121110] dark:text-white">₹{t.amountINR.toLocaleString("en-IN")}</td>
                            <td className="py-3 px-3 text-rose-400 font-bold">₹{t.tdsINR.toFixed(2)}</td>
                            <td className="py-3 px-3 font-bold text-emerald-500">₹{t.netAmountINR.toLocaleString("en-IN")}</td>
                            <td className="py-3 px-3 text-right">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 font-bold">
                                MATCHED
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
            {/* TAB VIEW 5: INDEX METHODOLOGY & UNIVERSE                                  */}
            {/* ========================================================================= */}
            {activeNav === "methodology" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className={`p-6 rounded-[26px] border shadow-xs transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <h2 className="text-xl font-bold text-[#121110] dark:text-white">
                    Official Index Methodology & Constituent Governance
                  </h2>
                  <p className="text-xs text-[#A39E93] mt-1 max-w-2xl leading-relaxed">
                    Baskly.money curated indices are re-anchored algorithmically to eliminate speculation and emotions. All indices feature a strict <strong>1.00% expense fee</strong>, a <strong>₹1,000/mo minimum ticket</strong>, and multi-sig cold custody.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {baskets.map((b) => (
                    <div
                      key={b.id}
                      className={`p-6 rounded-[24px] border space-y-4 transition ${
                        isDark ? "bg-[#1E1B17] border-white/10" : "bg-white border-[#E7E1D8]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-[#F59E0B] font-bold uppercase">{b.indexNum}</span>
                          <h3 className="text-lg font-bold text-[#121110] dark:text-white mt-0.5">{b.name}</h3>
                          <p className="text-xs text-[#736E65] dark:text-[#A39E93] mt-0.5">{b.tagline}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#F59E0B] px-2.5 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                          {b.risk} Risk
                        </span>
                      </div>

                      <p className="text-xs text-[#736E65] dark:text-[#A39E93] leading-relaxed">
                        {b.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#736E65] dark:text-[#A39E93]">
                          Target Constituent Weights
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {b.assets.map((a) => (
                            <span 
                              key={a.symbol}
                              className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#121110] dark:text-white"
                            >
                              {a.symbol} ({a.weight}%)
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-black/5 dark:border-white/5 text-[#736E65] dark:text-[#A39E93]">
                        <span>Expected CAGR: <strong className="text-emerald-500">{b.expected_cagr}% p.a.</strong></span>
                        <span>Fee: <strong className="text-[#121110] dark:text-white">{b.fee_pct}%</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>

      </div>

      {/* ========================================================= */}
      {/* REBALANCE EXECUTION MODAL                                 */}
      {/* ========================================================= */}
      {rebalanceTargetBasket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`max-w-lg w-full rounded-[28px] p-6 sm:p-7 border shadow-2xl space-y-5 ${
            isDark ? "bg-[#161412] border-white/10 text-white" : "bg-white border-[#E7E1D8] text-[#121110]"
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-white/10">
              <div className="flex items-center gap-2 text-[#F59E0B]">
                <RotateCw className="w-5 h-5" />
                <h3 className="font-bold text-base">Algorithmic Rebalance Authorization</h3>
              </div>
              <button
                type="button"
                onClick={() => setRebalanceTargetBasket(null)}
                className="text-[#A39E93] hover:text-white text-xs px-2 py-1 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-lg font-bold">{rebalanceTargetBasket.name}</h4>
              <p className="text-xs text-[#A39E93] mt-0.5">
                Constituent weights will be realigned to base targets on-chain.
              </p>
            </div>

            <div className="space-y-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#A39E93]">Estimated Batch Trades:</span>
                <span className="font-bold">{rebalanceTargetBasket.assets.length} on-chain orders</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A39E93]">Max Estimated Slippage:</span>
                <span className="font-bold text-emerald-500">0.02%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A39E93]">Estimated Gas Fee:</span>
                <span className="font-bold text-[#F59E0B]">~₹124.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#736E65] dark:text-[#A39E93]">Execution Rationale:</span>
                <span className="font-bold text-[#121110] dark:text-white truncate max-w-[200px]">{rebalanceReason}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRebalanceTargetBasket(null)}
                className="flex-1 py-2.5 rounded-full text-xs font-semibold border border-black/10 dark:border-white/20 text-[#736E65] dark:text-[#A39E93] hover:text-[#121110] dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRebalancing}
                onClick={handleConfirmRebalance}
                className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#F59E0B] text-[#0B0A09] hover:bg-[#F0A828] cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                {isRebalancing ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Trades...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm & Rebalance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Reusable Receipt icon
function ReceiptIcon(props: React.SVGProps<SVGSVGElement>) {
  return <FileText {...props} />;
}
