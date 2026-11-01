"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useBaskly } from "@/context/BasklyContext";
import { Menu, X, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout, openOracleModal, openAuthModal, oracleState } = useBaskly();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track window scroll for seamless header blending
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isFrozen = oracleState?.isNavFrozen;
  const oraclePrefix = isFrozen ? "DELAYED · " : "";
  const oracleValue = isFrozen ? "NAV FROZEN" : `USDT ₹${(oracleState?.usdtInr || 100.16).toFixed(2)}`;
  const badgeClasses = isFrozen
    ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
    : "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400";

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? "bg-black/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1536px] 2xl:max-w-[1720px] 3xl:max-w-[1920px] 4xl:max-w-[2200px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 3xl:px-20 h-14 sm:h-16 2xl:h-20 flex items-center justify-between">
        
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F59E0B] text-[#0B0A09] flex items-center justify-center font-serif-italic text-base sm:text-lg font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-transform group-hover:scale-105 flex-shrink-0">
            b
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm sm:text-base lg:text-lg tracking-editorial leading-none text-white whitespace-nowrap">
              baskly<span className="font-serif-italic font-normal text-base sm:text-lg lg:text-xl text-[#F59E0B]">.money</span>
              <sup className="text-[8px] font-mono ml-0.5 text-[#A39E93]">®</sup>
            </span>
            <span className="text-[9.5px] sm:text-[10.5px] font-sans font-medium uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#A39E93] mt-0.5 whitespace-nowrap antialiased">
              Rupee Crypto SIPs
            </span>
          </div>
        </Link>

        {/* Right Corner Group: Navigation Options + Action Controls */}
        <div className="flex items-center gap-6 sm:gap-7 lg:gap-8 flex-shrink-0">
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 font-sans">
            {/* 1. Home */}
            <Link
              href="/"
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#D8D2C5] hover:text-white transition-colors duration-150"
            >
              Home
            </Link>

            {/* 2. About us */}
            <Link
              href="/about"
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#D8D2C5] hover:text-white transition-colors duration-150"
            >
              About us
            </Link>

            {/* 3. FAQ */}
            <Link
              href="/faq"
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#D8D2C5] hover:text-white transition-colors duration-150"
            >
              FAQ
            </Link>

            {/* 4. Contact */}
            <a
              href="mailto:support@baskly.money"
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#D8D2C5] hover:text-white transition-colors duration-150 cursor-pointer"
            >
              Contact
            </a>
          </nav>

          {/* Right Controls: Oracle Live Badge + Authentication + Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button 
              type="button"
              suppressHydrationWarning
              onClick={openOracleModal} 
              title="Inspect Live Pricing Oracle & Feed Health"
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border text-[10px] sm:text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${badgeClasses}`}
            >
              <span className={isFrozen ? "w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" : "oracle-pulse-live flex-shrink-0"} />
              <span id="oracle-nav-badge" className="inline-flex items-center">
                {oraclePrefix && <span>{oraclePrefix}</span>}
                <span>{oracleValue}</span>
              </span>
            </button>

            {/* Dynamic User Status or Login Button */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-[#161412] border border-white/10 rounded-full pl-1.5 sm:pl-2 pr-2.5 sm:pr-3 py-1 shadow-xs">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-white/10 flex-shrink-0" 
                />
                <span className="text-[11px] sm:text-xs font-bold text-white max-w-[60px] sm:max-w-none truncate">
                  {user.givenName || user.name.split(" ")[0]}
                </span>
                <Link 
                  href={user.defaultDashboardPath || (user.role === "FUND_MANAGER" || user.role === "fund_manager" ? "/dashboard/fund-manager" : user.role === "ADMIN" ? "/dashboard/admin" : user.role === "SUPPORT" ? "/dashboard/support" : "/dashboard/customer")} 
                  className="text-[10px] font-mono font-bold text-emerald-400 hover:underline ml-0.5 sm:ml-1"
                >
                  Dashboard ↗
                </Link>
                <button 
                  type="button"
                  suppressHydrationWarning
                  onClick={logout} 
                  title="Sign Out" 
                  className="p-1 rounded-md text-[#A39E93] hover:text-rose-400 ml-1 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                type="button"
                suppressHydrationWarning
                onClick={openAuthModal} 
                className="btn-unseen bg-white text-[#0B0A09] hover:bg-[#EAE6DE] px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider cursor-pointer whitespace-nowrap shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-200"
              >
                <span>Login ↗</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl px-5 py-4 space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Live Pricing Oracle in Mobile Menu */}
          <div className="pb-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C857B]">Pricing Oracle</span>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => {
                setMobileMenuOpen(false);
                openOracleModal();
              }}
              title="Inspect Live Pricing Oracle & Feed Health"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap ${badgeClasses}`}
            >
              <span className={isFrozen ? "w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" : "oracle-pulse-live flex-shrink-0"} />
              <span>{oraclePrefix}{oracleValue}</span>
            </button>
          </div>

          <div>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white"
            >
              Home
            </Link>
          </div>

          <div className="border-t border-white/10 pt-2">
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#D8D2C5] hover:text-white text-left w-full cursor-pointer"
            >
              About us
            </Link>
          </div>

          <div className="border-t border-white/10 pt-2">
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#D8D2C5] hover:text-white text-left w-full cursor-pointer"
            >
              FAQ
            </Link>
          </div>

          <div className="border-t border-white/10 pt-2">
            <a
              href="mailto:support@baskly.money"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#D8D2C5] hover:text-white text-left w-full cursor-pointer"
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
