"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  CreditCard,
  Settings,
  Activity,
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
  Briefcase,
  Layers,
  Database,
  Server,
  Key,
  Filter,
  Check,
  Ban,
  UserCheck,
  UserX,
  FileCheck
} from "lucide-react";
import { useBaskly } from "@/context/BasklyContext";
import { User, Transaction, Mandate } from "@/types/baskly";

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

type AdminTab = "overview" | "users" | "transactions" | "mandates" | "system";

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "FUND_MANAGER" | "ADMIN" | "SUPPORT";
  kycStatus: "VERIFIED" | "PENDING" | "REJECTED";
  pan: string;
  mobile: string;
  accountStatus: "ACTIVE" | "DISABLED" | "PENDING_VERIFICATION";
  registeredDate: string;
  cashBalanceINR: number;
}

const INITIAL_ADMIN_USERS: AdminUserRecord[] = [
  {
    id: "usr_001",
    name: "Rohan Yadav",
    email: "rohan@baskly.money",
    role: "CUSTOMER",
    kycStatus: "VERIFIED",
    pan: "ABCDE4685F",
    mobile: "+91 98765 43210",
    accountStatus: "ACTIVE",
    registeredDate: "2026-10-18T10:00:00Z",
    cashBalanceINR: 25000.0,
  },
  {
    id: "usr_002",
    name: "Aditya Vikram",
    email: "aditya.cio@baskly.money",
    role: "FUND_MANAGER",
    kycStatus: "VERIFIED",
    pan: "BKLYM1920D",
    mobile: "+91 98210 11223",
    accountStatus: "ACTIVE",
    registeredDate: "2026-10-15T09:30:00Z",
    cashBalanceINR: 500000.0,
  },
  {
    id: "usr_003",
    name: "Rajesh Sharma",
    email: "admin@baskly.money",
    role: "ADMIN",
    kycStatus: "VERIFIED",
    pan: "ADMNS9988G",
    mobile: "+91 99000 88776",
    accountStatus: "ACTIVE",
    registeredDate: "2026-10-01T08:00:00Z",
    cashBalanceINR: 100000.0,
  },
  {
    id: "usr_004",
    name: "Priya Nair",
    email: "priya.nair@gmail.com",
    role: "CUSTOMER",
    kycStatus: "PENDING",
    pan: "PRYNR3344K",
    mobile: "+91 97455 22334",
    accountStatus: "PENDING_VERIFICATION",
    registeredDate: "2026-11-04T14:20:00Z",
    cashBalanceINR: 15000.0,
  },
  {
    id: "usr_005",
    name: "Vikram Malhotra",
    email: "vikram.m@outlook.com",
    role: "CUSTOMER",
    kycStatus: "VERIFIED",
    pan: "VKMLT5566L",
    mobile: "+91 91234 56789",
    accountStatus: "ACTIVE",
    registeredDate: "2026-10-22T11:15:00Z",
    cashBalanceINR: 75000.0,
  },
  {
    id: "usr_006",
    name: "Ananya Deshmukh",
    email: "ananya.d@gmail.com",
    role: "CUSTOMER",
    kycStatus: "REJECTED",
    pan: "ANYDS7788M",
    mobile: "+91 98111 22334",
    accountStatus: "DISABLED",
    registeredDate: "2026-10-29T16:45:00Z",
    cashBalanceINR: 0.0,
  },
  {
    id: "usr_007",
    name: "Neha Sundaram",
    email: "support@baskly.money",
    role: "SUPPORT",
    kycStatus: "VERIFIED",
    pan: "SNDRM8899P",
    mobile: "+91 98888 77665",
    accountStatus: "ACTIVE",
    registeredDate: "2026-10-10T10:00:00Z",
    cashBalanceINR: 50000.0,
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    user,
    manager,
    baskets,
    portfolio,
    oracleState,
    toggleCircuitBreaker,
    openOracleModal,
    login,
    logout
  } = useBaskly();

  // Hydration state
  const [mounted, setMounted] = useState(false);

  // Active navigation tab
  const [activeNav, setActiveNav] = useState<AdminTab>("overview");

  // Mobile menu drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile popover menu
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Search query across users, txs, mandates
  const [searchQuery, setSearchQuery] = useState("");

  // User table role/status filter
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [userKycFilter, setUserKycFilter] = useState<string>("ALL");

  // Local state for user accounts directory
  const [usersList, setUsersList] = useState<AdminUserRecord[]>(INITIAL_ADMIN_USERS);

  const pendingKycCount = useMemo(() => {
    return usersList.filter((u) => u.kycStatus === "PENDING").length;
  }, [usersList]);

  // Local state for system settings
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [minSipThreshold, setMinSipThreshold] = useState<number>(1000);
  const [platformExpenseFee, setPlatformExpenseFee] = useState<number>(1.00);

  // Flash notice banner
  const [flashNotice, setFlashNotice] = useState<{ message: string; type: "success" | "warning" | "error" } | null>(null);

  // Dark / Light Theme (synced with localStorage & html.dark)
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("baskly_theme");
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

  // Pricing oracle parameters
  const usdtRate = oracleState?.usdtInr || 100.16;
  const isCircuitBreaker = Boolean(oracleState?.isNavFrozen || manager?.circuitBreakerActive);

  // Fast switch to Admin demo identity
  const handleSwitchToDemoAdmin = () => {
    login("Rajesh Sharma (Super Admin)", "admin@baskly.money", "ADMIN");
    setFlashNotice({
      message: "Authenticated as Super Administrator with full operational governance privileges.",
      type: "success"
    });
    setTimeout(() => setFlashNotice(null), 4000);
  };

  // User management actions
  const handleApproveKyc = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, kycStatus: "VERIFIED", accountStatus: "ACTIVE" } : u))
    );
    setFlashNotice({
      message: `KYC & PAN successfully approved for User #${userId}.`,
      type: "success"
    });
    setTimeout(() => setFlashNotice(null), 4000);
  };

  const handleRejectKyc = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, kycStatus: "REJECTED", accountStatus: "DISABLED" } : u))
    );
    setFlashNotice({
      message: `KYC submission rejected for User #${userId}. Account flagged.`,
      type: "warning"
    });
    setTimeout(() => setFlashNotice(null), 4000);
  };

  const handleToggleAccountStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const next = u.accountStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
          return { ...u, accountStatus: next };
        }
        return u;
      })
    );
    setFlashNotice({
      message: `Account status updated for User #${userId}.`,
      type: "success"
    });
    setTimeout(() => setFlashNotice(null), 4000);
  };

  const handleRoleChange = (userId: string, newRole: "CUSTOMER" | "FUND_MANAGER" | "ADMIN" | "SUPPORT") => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setFlashNotice({
      message: `Role authority updated to ${newRole} for User #${userId}.`,
      type: "success"
    });
    setTimeout(() => setFlashNotice(null), 4000);
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.pan.toLowerCase().includes(q) ||
          u.mobile.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Role filter
      if (userRoleFilter !== "ALL" && u.role !== userRoleFilter) return false;
      // KYC filter
      if (userKycFilter !== "ALL" && u.kycStatus !== userKycFilter) return false;
      return true;
    });
  }, [usersList, searchQuery, userRoleFilter, userKycFilter]);

  // Master Transaction Ledger (derived from portfolio & platform seed)
  const platformTransactions = useMemo(() => {
    return portfolio?.transactions || [];
  }, [portfolio?.transactions]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return platformTransactions;
    const q = searchQuery.toLowerCase();
    return platformTransactions.filter((t) => 
      t.id.toLowerCase().includes(q) ||
      t.basketName.toLowerCase().includes(q) ||
      (t.bankRef && t.bankRef.toLowerCase().includes(q))
    );
  }, [platformTransactions, searchQuery]);

  // Master Mandates List
  const platformMandates = useMemo(() => {
    return portfolio?.mandates || [];
  }, [portfolio?.mandates]);

  const filteredMandates = useMemo(() => {
    if (!searchQuery.trim()) return platformMandates;
    const q = searchQuery.toLowerCase();
    return platformMandates.filter((m) =>
      m.id.toLowerCase().includes(q) ||
      m.basketName.toLowerCase().includes(q) ||
      m.vpa.toLowerCase().includes(q)
    );
  }, [platformMandates, searchQuery]);

  // Export Master Transaction Audit CSV
  const handleExportMasterAuditCSV = () => {
    const headers = [
      "Transaction ID",
      "Timestamp (IST)",
      "Type",
      "Curated Index",
      "Gross Amount (INR)",
      "1% Section 194S TDS (INR)",
      "Net Settled (INR)",
      "Bank UTR",
      "PAN Verified",
      "Settlement Status"
    ];

    const rows = platformTransactions.map((t) => [
      t.id,
      formatKolkataTimestamp(t.timestamp),
      t.type,
      `"${t.basketName}"`,
      t.amountINR.toFixed(2),
      t.tdsINR.toFixed(2),
      t.netAmountINR.toFixed(2),
      t.bankRef || "NPCI/UPI/749204819201",
      "ABCDE4685F",
      t.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Baskly_Master_Financial_Audit_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFlashNotice({
      message: "Master Financial Audit Ledger CSV exported successfully.",
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

      {/* Full-Width Canvas Wrapper (Covers Entire Screen Edge-to-Edge) */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-6 space-y-5 sm:space-y-6">

        {/* ========================================================= */}
        {/* MOBILE STICKY TOP HEADER (Screens < 1024px)               */}
        {/* ========================================================= */}
        <header className="lg:hidden flex items-center justify-between gap-3 py-2 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-[#121110] text-[#F59E0B] border border-[#F59E0B]/30 font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
              b
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#121110] dark:text-white">
                baskly<span className="font-serif italic font-normal text-amber-500">.money</span>
              </span>
              <div className="text-[9px] font-mono uppercase tracking-widest text-[#A39E93] leading-none">
                Platform Admin Console
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            {/* System Status badge */}
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/25">
              SYSTEM: NOMINAL
            </span>

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

            {/* Mobile Menu Toggle */}
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
                ADMINISTRATIVE CONTROL NAVIGATION
              </div>

              {[
                { id: "overview", label: "Operations Overview", icon: BarChart3 },
                { id: "users", label: "User & KYC Governance", icon: Users, badge: pendingKycCount > 0 ? `${pendingKycCount}!` : undefined },
                { id: "transactions", label: "Financial & TDS Ledger", icon: FileText },
                { id: "mandates", label: "NPCI AutoPay Mandates", icon: CreditCard },
                { id: "system", label: "System & Security Controls", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeNav === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveNav(tab.id as AdminTab);
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

            {/* Quick switches to Customer & Fund Manager */}
            <div className={`pt-3 border-t flex flex-col gap-2 text-xs ${isDark ? "border-white/5" : "border-[#E7E1D8]"}`}>
              <Link
                href="/portal"
                className="text-xs font-semibold text-[#F59E0B] hover:underline flex items-center justify-between"
              >
                <span>Switch to Retail Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/fund-manager"
                className="text-xs font-semibold text-emerald-400 hover:underline flex items-center justify-between"
              >
                <span>Switch to CIO Operations Desk</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleSwitchToDemoAdmin}
                className="text-xs font-semibold text-white/80 hover:text-white text-left pt-1"
              >
                Simulate Super Admin Session
              </button>
            </div>
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
        <div className="w-full flex flex-col lg:flex-row gap-5 xl:gap-6 2xl:gap-8 items-start">

          {/* ========================================================= */}
          {/* 1. SEPARATE LEFT SIDEBAR ISLAND (Desktop Only: lg:flex)  */}
          {/* ========================================================= */}
          <aside className={`hidden lg:flex flex-col w-64 xl:w-72 2xl:w-80 rounded-[28px] p-5 lg:p-6 justify-between shrink-0 transition-all duration-200 border shadow-xs ${
            isDark
              ? "bg-[#161412] border-white/10"
              : "bg-white border-[#E7E1D8] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
          }`}>
            <div className="space-y-6">

              {/* Brand Header */}
              <div className="space-y-1">
                <Link href="/" className="inline-flex items-center gap-2.5 group">
                  <div className="w-9 h-9 rounded-full bg-[#121110] text-[#F59E0B] border border-[#F59E0B]/30 font-serif font-bold text-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    b
                  </div>
                  <div>
                    <span className="font-bold text-base tracking-tight text-[#121110] dark:text-white">
                      baskly<span className="font-serif italic font-normal text-amber-500">.money</span>
                    </span>
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#736E65] dark:text-[#A39E93]">
                      Platform Admin Console
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-[#0F6E56] dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Super Admin Privilege Active</span>
                </div>
              </div>

              {/* Administrative Navigation Menu */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#736E65] dark:text-[#A39E93] px-3 mb-2 font-medium">
                  OPERATIONAL GOVERNANCE
                </div>

                {[
                  { id: "overview", label: "Operations Overview", icon: BarChart3 },
                  { id: "users", label: "User & KYC Governance", icon: Users, badge: pendingKycCount > 0 ? `${pendingKycCount}!` : undefined },
                  { id: "transactions", label: "Financial & TDS Ledger", icon: FileText },
                  { id: "mandates", label: "NPCI AutoPay Mandates", icon: CreditCard },
                  { id: "system", label: "System & Security Controls", icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveNav(item.id as AdminTab)}
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

              {/* Infrastructure Real-Time Health Card */}
              <div className={`rounded-[20px] p-3.5 border transition space-y-2.5 ${
                isDark ? "bg-[#181512] border-white/10" : "bg-[#FAF8F5] border-[#E7E1D8]"
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="uppercase tracking-widest text-[#736E65] dark:text-[#A39E93]">SYSTEM HEALTH</span>
                  <span className="text-emerald-500 font-bold inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    99.98% Uptime
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-[#A39E93]">
                    <span className="flex items-center gap-1.5">
                      <Server className="w-3 h-3" />
                      <span>Spring Boot API:</span>
                    </span>
                    <span className="text-emerald-400 font-bold">LIVE (14ms)</span>
                  </div>

                  <div className="flex items-center justify-between text-[#A39E93]">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3 h-3" />
                      <span>PostgreSQL Pool:</span>
                    </span>
                    <span className="text-emerald-400 font-bold">ACTIVE (100%)</span>
                  </div>

                  <div className="flex items-center justify-between text-[#A39E93]">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3 h-3" />
                      <span>Binance WSS Feed:</span>
                    </span>
                    <span className="text-emerald-400 font-bold">HEALTHY</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Card: Maintenance & Global Switch */}
            <div className={`mt-6 rounded-[22px] p-4 text-white relative overflow-hidden transition-all border ${
              maintenanceMode
                ? "bg-amber-950/40 border-amber-500/40"
                : isDark
                ? "bg-[#1E1B17] border-[#F59E0B]/25"
                : "bg-[#121110] border-[#121110]"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#F59E0B] text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5" />
                  <span>SYSTEM OVERRIDE</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${maintenanceMode ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
              </div>

              <h4 className="text-xs font-bold text-white tracking-wide mt-1.5">
                {maintenanceMode ? "Maintenance Mode Active" : "Operational Mode Active"}
              </h4>
              <p className="text-[11px] text-[#A39E93] mt-1 leading-snug">
                {maintenanceMode
                  ? "Retail investor portal in read-only maintenance window."
                  : "All customer endpoints and payment rails accepting requests."}
              </p>

              <button
                type="button"
                onClick={() => {
                  const next = !maintenanceMode;
                  setMaintenanceMode(next);
                  setFlashNotice({
                    message: next
                      ? "WARNING: Maintenance mode activated. Retail investor portal locked."
                      : "Maintenance mode deactivated. Full retail traffic restored.",
                    type: next ? "warning" : "success"
                  });
                  setTimeout(() => setFlashNotice(null), 5000);
                }}
                className={`w-full mt-3 text-xs font-bold py-1.5 px-3 rounded-full text-center cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5 ${
                  maintenanceMode
                    ? "bg-amber-500 hover:bg-amber-400 text-[#0B0A09]"
                    : "bg-white hover:bg-[#EAE6DE] text-[#0B0A09]"
                }`}
              >
                {maintenanceMode ? (
                  <>
                    <Unlock className="w-3 h-3" />
                    <span>Disable Maintenance</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>Toggle Maintenance Mode</span>
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
                  placeholder="Search user accounts, emails, PAN numbers, transactions, or bank UTRs..."
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
                
                {/* Global Status Pill */}
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-mono font-bold ${
                  maintenanceMode
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                    : isDark
                    ? "bg-[#161412] border-white/10 text-emerald-400"
                    : "bg-white border-[#E7E1D8] text-emerald-700"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${maintenanceMode ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                  <span>{maintenanceMode ? "MAINTENANCE" : "SYSTEM: NOMINAL"}</span>
                </div>

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
                  title="Inspect Pricing Oracle"
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

                {/* Administrator Profile Dropdown */}
                <div className="relative" data-profile-menu-container>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={`relative w-9.5 h-9.5 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-xs ${
                      isDark
                        ? "bg-[#161412] border-white/10 text-white hover:border-[#F59E0B]/50"
                        : "bg-white border-[#E7E1D8] text-[#121110] hover:border-[#F59E0B]/50"
                    }`}
                    title="Platform Administrator Menu"
                  >
                    <Key className="w-4 h-4 text-[#F59E0B]" />
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
                          <div className="w-9 h-9 rounded-full bg-[#121110] text-[#F59E0B] border border-[#F59E0B]/40 flex items-center justify-center shrink-0 font-bold text-xs">
                            ADM
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate leading-tight">
                              {user?.name || "Rajesh Sharma (Super Admin)"}
                            </div>
                            <div className="text-[10px] font-mono text-[#F59E0B] font-semibold mt-0.5">
                              ROLE: ADMIN (SUPERUSER)
                            </div>
                            <div className="text-[10px] text-emerald-400 font-medium">
                              Full Administrative Scope
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
                            <span>Switch to Customer Portal</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#A39E93]">/portal</span>
                        </Link>

                        <Link
                          href="/dashboard/fund-manager"
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition hover:bg-white/5"
                        >
                          <div className="flex items-center gap-2 text-[#A39E93] hover:text-white">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>Switch to CIO Operations Desk</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#A39E93]">/manager</span>
                        </Link>

                        <button
                          type="button"
                          onClick={handleSwitchToDemoAdmin}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition hover:bg-white/5 text-left cursor-pointer"
                        >
                          <span className="text-emerald-400 font-semibold">Reload Super Admin Session</span>
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
                          <span>Sign Out Console</span>
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
                  <span className="font-semibold">Baskly Platform Governance & Auditing</span>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border shadow-2xs ${
                  isDark ? "bg-[#161412] border-white/10 text-[#A39E93]" : "bg-white border-[#E7E1D8] text-[#5C5752]"
                }`}>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>SEBI & CBDT Section 194S Vault: <strong>TAN BLRB91024D</strong></span>
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
                { id: "overview", label: "Operations Overview" },
                { id: "users", label: pendingKycCount > 0 ? `User & KYC (${pendingKycCount}!)` : "User & KYC Governance" },
                { id: "transactions", label: "Financial & TDS Ledger" },
                { id: "mandates", label: "NPCI AutoPay Mandates" },
                { id: "system", label: "System & Security Controls" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveNav(tab.id as AdminTab)}
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
            {/* TAB VIEW 1: OPERATIONS OVERVIEW                                          */}
            {/* ========================================================================= */}
            {activeNav === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* 4 COCKPIT SUMMARY METRIC CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
                  
                  {/* Card 1: Total Registered Users */}
                  <div className={`rounded-[24px] sm:rounded-[26px] p-5 sm:p-6 shadow-md flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all border ${
                    isDark
                      ? "bg-[#1E1B17] border-[#F59E0B]/30 shadow-black/40 text-white"
                      : "bg-[#121110] border-[#121110] shadow-[#121110]/15 text-white"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#A39E93]">
                      <span className="font-medium text-white/90">Total Registered Users</span>
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                        <Users className="w-3.5 h-3.5 text-[#F59E0B]" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className="text-xl sm:text-2xl xl:text-3xl font-extrabold font-mono tracking-tight text-white flex items-baseline gap-1.5">
                        <span>3,842</span>
                        <span className="text-xs font-sans font-normal text-white/70">Accounts</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 text-white/80 font-mono gap-1">
                      <span className="whitespace-nowrap">Active Investors</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 shrink-0">
                        +18% MoM
                      </span>
                    </div>
                  </div>

                  {/* Card 2: 24h Platform Volume */}
                  <div className={`rounded-[24px] sm:rounded-[26px] p-5 sm:p-6 shadow-xs border flex flex-col justify-between min-h-[160px] group transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#736E65] dark:text-[#A39E93]">
                      <span className="font-medium">24h Gross Volume</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isDark ? "bg-white/5 text-emerald-400" : "bg-[#FAF8F5] text-emerald-600"
                      }`}>
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className="text-xl sm:text-2xl xl:text-3xl font-extrabold font-mono tracking-tight text-emerald-500 flex items-baseline gap-1.5">
                        <span>₹42.80</span>
                        <span className="text-xs font-sans font-normal text-emerald-400/80">Lakhs</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 font-mono">
                      <span className="text-[#A39E93]">Deposits & Redemptions</span>
                      <span className="font-bold text-[#F59E0B]">100% Settled</span>
                    </div>
                  </div>

                  {/* Card 3: Mandates In Force */}
                  <div className={`rounded-[24px] sm:rounded-[26px] p-5 sm:p-6 shadow-xs border flex flex-col justify-between min-h-[160px] group transition-all ${
                    isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#736E65] dark:text-[#A39E93]">
                      <span className="font-medium">NPCI AutoPay In Force</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isDark ? "bg-white/5 text-[#F59E0B]" : "bg-[#FAF8F5] text-[#D97706]"
                      }`}>
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className={`text-xl sm:text-2xl xl:text-3xl font-extrabold font-mono tracking-tight flex items-baseline gap-1.5 ${
                        isDark ? "text-white" : "text-[#121110]"
                      }`}>
                        <span>1,290</span>
                        <span className="text-xs font-sans font-normal text-[#736E65] dark:text-[#A39E93]">Mandates</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 font-mono">
                      <span className="text-[#A39E93]">Recurring Inflow</span>
                      <span className="font-bold text-emerald-500">₹64.5 L / mo</span>
                    </div>
                  </div>

                  {/* Card 4: Platform Health */}
                  <div className={`rounded-[24px] sm:rounded-[26px] p-5 sm:p-6 shadow-xs border flex flex-col justify-between min-h-[160px] group transition-all ${
                    maintenanceMode
                      ? "bg-amber-500/10 border-amber-500/40"
                      : isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#736E65] dark:text-[#A39E93]">
                      <span className="font-medium">Infrastructure State</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        maintenanceMode
                          ? "bg-amber-500/20 text-amber-500"
                          : isDark ? "bg-white/5 text-emerald-400" : "bg-[#FAF8F5] text-emerald-600"
                      }`}>
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="my-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          maintenanceMode ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                        }`} />
                        <span className={`text-base sm:text-lg xl:text-xl font-extrabold font-sans tracking-tight ${
                          maintenanceMode ? "text-amber-500" : "text-emerald-500"
                        }`}>
                          {maintenanceMode ? "MAINTENANCE" : "ALL SYSTEMS LIVE"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 font-mono">
                      <span className="text-[#A39E93]">API & DB Uptime</span>
                      <span className="font-bold text-emerald-500">99.98%</span>
                    </div>
                  </div>

                </div>

                {/* Capital Flow Velocity Matrix */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                        24h Capital Flow Velocity & Liquidity Stream
                      </h3>
                      <p className="text-xs text-[#A39E93]">
                        Real-time netting of retail UPI debits, redemption payouts, and Section 194S TDS deductions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportMasterAuditCSV}
                      className="px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border flex items-center gap-2 self-start sm:self-auto hover:bg-white/5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Financial Ledger (CSV)</span>
                    </button>
                  </div>

                  {/* Flow breakdown progress */}
                  <div className="space-y-2 pt-2">
                    <div className="h-4 w-full rounded-full overflow-hidden flex bg-white/5">
                      <div style={{ width: "74%" }} className="bg-emerald-500" title="Gross Deposits & SIPs (74%)" />
                      <div style={{ width: "24%" }} className="bg-rose-500" title="Gross Redemptions (24%)" />
                      <div style={{ width: "2%" }} className="bg-[#F59E0B]" title="1% Statutory TDS (2%)" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[#A39E93]">24h Gross Inflows:</span>
                        <strong className="text-emerald-400">+₹31,67,200</strong>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[#A39E93]">24h Gross Outflows:</span>
                        <strong className="text-rose-400">-₹10,26,400</strong>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-[#A39E93]">24h 1% TDS Remitted:</span>
                        <strong className="text-amber-400">₹86,400</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent High-Priority Governance Activity */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                        Platform Governance & Recent Investor Actions
                      </h3>
                      <p className="text-xs text-[#A39E93]">
                        Verified investor transactions, KYC pipeline submissions, and security audits.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">
                      ✓ Audit Trail Synced
                    </span>
                  </div>

                  <div className="w-full overflow-x-auto no-scrollbar rounded-xl">
                    <table className="w-full min-w-[760px] text-left text-xs font-mono">
                      <thead className={`border-b text-[10px] uppercase tracking-wider ${
                        isDark ? "bg-[#181512] border-white/10 text-[#A39E93]" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#736E65]"
                      }`}>
                        <tr>
                          <th className="py-3 px-3.5">Investor</th>
                          <th className="py-3 px-3">Role</th>
                          <th className="py-3 px-3">KYC Status</th>
                          <th className="py-3 px-3">PAN Number</th>
                          <th className="py-3 px-3">Registered (IST)</th>
                          <th className="py-3 px-3 text-right">Account State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {usersList.slice(0, 5).map((u) => (
                          <tr key={u.id} className={`transition ${
                            isDark ? "hover:bg-white/5" : "hover:bg-[#FAF8F5]"
                          }`}>
                            <td className="py-3.5 px-3.5 font-sans font-bold text-[#121110] dark:text-white">
                              <div>{u.name}</div>
                              <div className="text-[10px] text-[#736E65] dark:text-[#A39E93] font-mono">{u.email}</div>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-bold text-[10px] text-[#121110] dark:text-white">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                u.kycStatus === "VERIFIED"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                                  : u.kycStatus === "PENDING"
                                  ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                                  : "bg-rose-500/15 text-rose-400 border-rose-500/25"
                              }`}>
                                {u.kycStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-[#F59E0B] font-bold">{u.pan}</td>
                            <td className="py-3.5 px-3 text-[#A39E93]">{formatKolkataTimestamp(u.registeredDate)}</td>
                            <td className="py-3.5 px-3 text-right">
                              <span className={`font-bold ${u.accountStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {u.accountStatus}
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
            {/* TAB VIEW 2: USER & KYC GOVERNANCE CENTER                                 */}
            {/* ========================================================================= */}
            {activeNav === "users" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* User Directory Toolbar */}
                <div className={`p-5 rounded-[24px] sm:rounded-[26px] border shadow-xs transition-all space-y-4 ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F59E0B] uppercase">
                        <Users className="w-4 h-4" />
                        <span>Master User Directory & Identity Verification</span>
                      </div>
                      <h2 className="text-xl font-bold mt-1 text-[#121110] dark:text-white">
                        User Accounts, Role Authority & KYC Governance
                      </h2>
                      <p className="text-xs text-[#A39E93] mt-1">
                        Inspect identity documents, verify Section 194S PAN compliance, grant role privileges, or lock accounts.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-[#A39E93]">
                        Showing {filteredUsers.length} of {usersList.length} Accounts
                      </span>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
                    <span className="text-[#A39E93] text-[11px] font-mono pr-1">Filter by Role:</span>
                    {["ALL", "CUSTOMER", "FUND_MANAGER", "ADMIN", "SUPPORT"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setUserRoleFilter(role)}
                        className={`px-3 py-1 rounded-full font-mono font-bold text-[11px] transition cursor-pointer border ${
                          userRoleFilter === role
                            ? isDark
                              ? "bg-[#F59E0B] text-[#0B0A09] border-[#F59E0B]"
                              : "bg-[#121110] text-white border-[#121110]"
                            : isDark
                              ? "bg-[#1E1B17] text-[#A39E93] border-white/10 hover:text-white"
                              : "bg-white text-[#5C5752] border-[#E7E1D8] hover:text-[#121110]"
                        }`}
                      >
                        {role}
                      </button>
                    ))}

                    <span className="text-[#A39E93] text-[11px] font-mono pl-3 pr-1">KYC Status:</span>
                    {["ALL", "VERIFIED", "PENDING", "REJECTED"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setUserKycFilter(status)}
                        className={`px-3 py-1 rounded-full font-mono font-bold text-[11px] transition cursor-pointer border ${
                          userKycFilter === status
                            ? isDark
                              ? "bg-white text-[#0B0A09] border-white"
                              : "bg-[#121110] text-white border-[#121110]"
                            : isDark
                              ? "bg-[#1E1B17] text-[#A39E93] border-white/10 hover:text-white"
                              : "bg-white text-[#5C5752] border-[#E7E1D8] hover:text-[#121110]"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Master User Table */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="w-full overflow-x-auto no-scrollbar rounded-xl">
                    <table className="w-full min-w-[900px] text-left text-xs font-mono">
                      <thead className={`border-b text-[10px] uppercase tracking-wider ${
                        isDark ? "bg-[#181512] border-white/10 text-[#A39E93]" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#736E65]"
                      }`}>
                        <tr>
                          <th className="py-3 px-3.5">User Details</th>
                          <th className="py-3 px-3">Role Authority</th>
                          <th className="py-3 px-3">PAN</th>
                          <th className="py-3 px-3">KYC Status</th>
                          <th className="py-3 px-3">Cash Balance</th>
                          <th className="py-3 px-3">Account State</th>
                          <th className="py-3 px-3 text-right">Administrative Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className={`transition ${
                            isDark ? "hover:bg-white/5" : "hover:bg-[#FAF8F5]"
                          }`}>
                            <td className="py-3.5 px-3.5 font-sans font-bold text-[#121110] dark:text-white">
                              <div>{u.name}</div>
                              <div className="text-[10px] text-[#736E65] dark:text-[#A39E93] font-mono">{u.email} · {u.mobile}</div>
                            </td>

                            <td className="py-3.5 px-3">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                                className={`px-2 py-1 rounded-lg border text-[11px] font-mono font-bold focus:outline-none cursor-pointer ${
                                  isDark ? "bg-[#181512] border-white/15 text-white" : "bg-white border-[#E7E1D8] text-[#121110]"
                                }`}
                              >
                                <option value="CUSTOMER">CUSTOMER</option>
                                <option value="FUND_MANAGER">FUND_MANAGER</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="SUPPORT">SUPPORT</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-3 font-mono text-[#F59E0B] font-bold">{u.pan}</td>

                            <td className="py-3.5 px-3">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                                u.kycStatus === "VERIFIED"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                                  : u.kycStatus === "PENDING"
                                  ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                                  : "bg-rose-500/15 text-rose-400 border-rose-500/25"
                              }`}>
                                {u.kycStatus}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-[#121110] dark:text-white font-bold">
                              ₹{u.cashBalanceINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>

                            <td className="py-3.5 px-3">
                              <button
                                type="button"
                                onClick={() => handleToggleAccountStatus(u.id)}
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] border cursor-pointer ${
                                  u.accountStatus === "ACTIVE"
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                                    : "bg-rose-500/15 text-rose-400 border-rose-500/25"
                                }`}
                                title="Click to toggle account state"
                              >
                                {u.accountStatus}
                              </button>
                            </td>

                            <td className="py-3.5 px-3 text-right font-sans space-x-2">
                              {u.kycStatus === "PENDING" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveKyc(u.id)}
                                    className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                                  >
                                    Approve KYC
                                  </button>
                                  <span className="text-[#A39E93]">·</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectKyc(u.id)}
                                    className="text-xs font-bold text-rose-400 hover:underline cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleAccountStatus(u.id)}
                                  className="text-xs font-bold text-[#F59E0B] hover:underline cursor-pointer"
                                >
                                  {u.accountStatus === "ACTIVE" ? "Suspend Account" : "Activate"}
                                </button>
                              )}
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
            {/* TAB VIEW 3: FINANCIAL & STATUTORY TDS LEDGER                             */}
            {/* ========================================================================= */}
            {activeNav === "transactions" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Remittance Vault Header Banner */}
                <div className={`p-6 rounded-[26px] border shadow-xs transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider">
                        CBDT SECTION 194S STATUTORY REMITTANCE
                      </div>
                      <h2 className="text-xl font-bold mt-1 text-[#121110] dark:text-white">
                        Master Financial & Statutory TDS Audit Ledger
                      </h2>
                      <p className="text-xs text-[#A39E93] mt-1 max-w-xl">
                        Comprehensive ledger of all buys, auto-SIP executions, and customer redemptions with 1% TDS deducted under TAN <strong>BLRB91024D</strong>.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportMasterAuditCSV}
                      className="px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer bg-[#F59E0B] text-[#0B0A09] hover:bg-[#F0A828] shadow-sm flex items-center gap-2 self-start sm:self-auto"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Master Ledger (CSV)</span>
                    </button>
                  </div>
                </div>

                {/* Master Transactions Table */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="w-full overflow-x-auto no-scrollbar rounded-xl">
                    <table className="w-full min-w-[850px] text-left text-xs font-mono">
                      <thead className={`border-b text-[10px] uppercase tracking-wider ${
                        isDark ? "bg-[#181512] border-white/10 text-[#A39E93]" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#736E65]"
                      }`}>
                        <tr>
                          <th className="py-3 px-3.5">Transaction ID</th>
                          <th className="py-3 px-3">Timestamp (IST)</th>
                          <th className="py-3 px-3">Type</th>
                          <th className="py-3 px-3">Curated Index</th>
                          <th className="py-3 px-3">Gross (INR)</th>
                          <th className="py-3 px-3">1% TDS (INR)</th>
                          <th className="py-3 px-3">Net Settled</th>
                          <th className="py-3 px-3">Bank Reference / UTR</th>
                          <th className="py-3 px-3 text-right">Settlement State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {filteredTransactions.map((t) => (
                          <tr key={t.id} className={`transition ${
                            isDark ? "hover:bg-white/5" : "hover:bg-[#FAF8F5]"
                          }`}>
                            <td className="py-3.5 px-3.5 text-[#F59E0B] font-bold">{t.id}</td>
                            <td className="py-3.5 px-3 text-[#736E65] dark:text-[#A39E93]">{formatKolkataTimestamp(t.timestamp)}</td>
                            <td className="py-3.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                t.type === "BUY"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                                  : "bg-rose-500/15 text-rose-400 border-rose-500/25"
                              }`}>
                                {t.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-sans font-bold text-[#121110] dark:text-white">{t.basketName}</td>
                            <td className="py-3.5 px-3 font-bold text-[#121110] dark:text-white">
                              ₹{t.amountINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-3 text-rose-400 font-bold">
                              ₹{t.tdsINR.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-3 font-bold text-emerald-400">
                              ₹{t.netAmountINR.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-3 text-[#A39E93]">{t.bankRef || "NPCI/UPI/749204819201"}</td>
                            <td className="py-3.5 px-3 text-right">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold">
                                {t.status}
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
            {/* TAB VIEW 4: NPCI AUTOPAY & MANDATES MASTER LEDGER                        */}
            {/* ========================================================================= */}
            {activeNav === "mandates" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Mandates Summary Banner */}
                <div className={`p-6 rounded-[26px] border shadow-xs transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono text-[#F59E0B] font-bold uppercase tracking-wider">
                        NPCI AUTOPAY & RECURRING MANDATES
                      </div>
                      <h2 className="text-xl font-bold mt-1 text-[#121110] dark:text-white">
                        UPI AutoPay e-Mandate Pipeline & Execution Engine
                      </h2>
                      <p className="text-xs text-[#A39E93] mt-1 max-w-xl">
                        Real-time status of systematic investor rupee mandates, next scheduled debit dates, and bank VPA handles.
                      </p>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <div className="text-emerald-400 font-bold text-base">99.2% Debit Success</div>
                      <span className="text-[#A39E93]">Zero Failed NPCI Webhooks</span>
                    </div>
                  </div>
                </div>

                {/* Mandates Master Table */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="w-full overflow-x-auto no-scrollbar rounded-xl">
                    <table className="w-full min-w-[800px] text-left text-xs font-mono">
                      <thead className={`border-b text-[10px] uppercase tracking-wider ${
                        isDark ? "bg-[#181512] border-white/10 text-[#A39E93]" : "bg-[#FAF8F5] border-[#E7E1D8] text-[#736E65]"
                      }`}>
                        <tr>
                          <th className="py-3 px-3.5">Mandate ID</th>
                          <th className="py-3 px-3">Curated Index</th>
                          <th className="py-3 px-3">Monthly Ticket</th>
                          <th className="py-3 px-3">Debit Day</th>
                          <th className="py-3 px-3">Next Scheduled Debit</th>
                          <th className="py-3 px-3">VPA Handle</th>
                          <th className="py-3 px-3 text-right">Mandate Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {filteredMandates.map((m) => (
                          <tr key={m.id} className={`transition ${
                            isDark ? "hover:bg-white/5" : "hover:bg-[#FAF8F5]"
                          }`}>
                            <td className="py-3.5 px-3.5 text-[#F59E0B] font-bold">{m.id}</td>
                            <td className="py-3.5 px-3 font-sans font-bold text-[#121110] dark:text-white">{m.basketName}</td>
                            <td className="py-3.5 px-3 font-bold text-emerald-400">
                              ₹{m.monthlyAmountINR.toLocaleString("en-IN")}/mo
                            </td>
                            <td className="py-3.5 px-3 text-[#121110] dark:text-white font-bold">{m.debitDay}th of month</td>
                            <td className="py-3.5 px-3 text-[#736E65] dark:text-[#A39E93]">{m.nextDebitDate}</td>
                            <td className="py-3.5 px-3 text-[#736E65] dark:text-[#A39E93]">{m.vpa}</td>
                            <td className="py-3.5 px-3 text-right">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                m.status === "ACTIVE"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                                  : "bg-amber-500/15 text-amber-400 border-amber-500/25"
                              }`}>
                                {m.status}
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
            {/* TAB VIEW 5: SYSTEM & SECURITY CONTROLS                                   */}
            {/* ========================================================================= */}
            {activeNav === "system" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Platform Policy Configuration Cards */}
                <div className={`p-6 rounded-[26px] border shadow-xs transition-all space-y-5 ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div>
                    <h2 className="text-xl font-bold text-[#121110] dark:text-white">
                      Platform Policy & Operational Thresholds
                    </h2>
                    <p className="text-xs text-[#736E65] dark:text-[#A39E93] mt-1">
                      Configure baseline financial parameters, statutory drift limits, and global maintenance controls.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? "bg-[#1E1B17] border-white/5" : "bg-[#FAF8F5] border-[#E7E1D8]"}`}>
                      <span className="text-[11px] font-mono text-[#736E65] dark:text-[#A39E93] uppercase">Minimum Monthly SIP Ticket</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-mono font-bold text-[#121110] dark:text-white">₹</span>
                        <input
                          type="number"
                          value={minSipThreshold}
                          onChange={(e) => setMinSipThreshold(Number(e.target.value))}
                          className="w-24 bg-transparent border-b border-[#F59E0B] font-mono font-bold text-xl text-[#F59E0B] focus:outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-[#A39E93] block">Enforces minimum habit threshold</span>
                    </div>

                    <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? "bg-[#1E1B17] border-white/5" : "bg-[#FAF8F5] border-[#E7E1D8]"}`}>
                      <span className="text-[11px] font-mono text-[#A39E93] uppercase">Platform Management Fee</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.05"
                          value={platformExpenseFee}
                          onChange={(e) => setPlatformExpenseFee(Number(e.target.value))}
                          className="w-20 bg-transparent border-b border-emerald-500 font-mono font-bold text-xl text-emerald-400 focus:outline-none"
                        />
                        <span className="text-xl font-mono font-bold text-emerald-400">% p.a.</span>
                      </div>
                      <span className="text-[10px] text-[#A39E93] block">Statutory expense ratio cap</span>
                    </div>

                    <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? "bg-[#1E1B17] border-white/5" : "bg-[#FAF8F5] border-[#E7E1D8]"}`}>
                      <span className="text-[11px] font-mono text-[#A39E93] uppercase">Circuit Breaker Override</span>
                      <div className="text-xl font-mono font-bold text-[#F59E0B]">
                        {isCircuitBreaker ? "TRIPPED" : "ARMED"}
                      </div>
                      <button
                        type="button"
                        onClick={toggleCircuitBreaker}
                        className="text-[10px] font-mono font-bold text-rose-400 hover:underline cursor-pointer block"
                      >
                        Toggle Circuit Breaker Override ↗
                      </button>
                    </div>
                  </div>
                </div>

                {/* Administrative Audit Event Log */}
                <div className={`border rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                  isDark ? "bg-[#161412] border-white/10" : "bg-white border-[#E7E1D8]"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#121110]"}`}>
                        Administrative Security Audit Trail
                      </h3>
                      <p className="text-xs text-[#A39E93]">
                        Immutable event stream capturing administrative role delegations, KYC reviews, and system overrides.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">
                      SEC-256 Validated
                    </span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {[
                      { action: "ROLE_DELEGATION", detail: "Granted FUND_MANAGER authority to aditya.cio@baskly.money", user: "Rajesh Sharma (Admin)", time: "10 mins ago" },
                      { action: "KYC_VERIFICATION", detail: "Approved Section 194S PAN verification for usr_001 (Rohan Yadav)", user: "Automated CBDT Engine", time: "25 mins ago" },
                      { action: "CIRCUIT_BREAKER_SYNC", detail: "Synchronized dual-feed Binance WSS ticker health (0 stale tickers)", user: "System Watchdog", time: "1 hour ago" },
                      { action: "TDS_REMITTANCE_SYNC", detail: "Reconciled Q3 Form 16A ledger against TAN BLRB91024D", user: "Finance Admin", time: "3 hours ago" },
                    ].map((evt, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          isDark ? "bg-[#181512] border-white/5" : "bg-[#FAF8F5] border-[#E7E1D8]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] font-bold text-[#F59E0B]">
                            {evt.action}
                          </span>
                          <span className="text-[#121110] dark:text-white font-sans text-xs">{evt.detail}</span>
                        </div>
                        <div className="text-right text-[11px] text-[#A39E93]">
                          <div>{evt.user}</div>
                          <div className="text-[10px]">{evt.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>

      </div>

    </div>
  );
}
