"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useBaskly } from "@/context/BasklyContext";
import { ChevronDown, Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, logout, openOracleModal, openAuthModal, oracleState } = useBaskly();
  
  // Navigation dropdown states
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAboutOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isFrozen = oracleState?.isNavFrozen;
  const oraclePrefix = isFrozen ? "DELAYED · " : "ORACLE LIVE · ";
  const oracleValue = isFrozen ? "NAV FROZEN" : `USDT: ₹${(oracleState?.usdtInr || 100.16).toFixed(2)}`;
  const badgeClasses = isFrozen
    ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
    : "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400";

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0A09]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#F59E0B] text-[#0B0A09] flex items-center justify-center font-serif-italic text-lg font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-transform group-hover:scale-105 flex-shrink-0">
            b
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base sm:text-lg tracking-editorial leading-none text-white">
              baskly<span className="font-serif-italic font-normal text-lg sm:text-xl text-[#F59E0B]">.money</span>
              <sup className="text-[8px] font-mono ml-0.5 text-[#A39E93]">®</sup>
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.2em] text-[#736E65] mt-0.5">
              Rupee Crypto SIPs
            </span>
          </div>
        </Link>

        {/* Right Corner Group: Navigation Options + Controls */}
        <div className="flex items-center gap-5 sm:gap-6 lg:gap-7">
          {/* Desktop Navigation Links (Home, About us [Dropdown], Contact) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7">
            {/* 1. Home */}
            <Link
              href="/"
              className="text-sm font-medium text-white hover:text-[#F59E0B] transition-colors"
            >
              Home
            </Link>

            {/* 2. About us (Dropdown on click) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setAboutOpen((prev) => !prev)}
                aria-expanded={aboutOpen}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#A39E93] hover:text-white transition-colors cursor-pointer select-none"
              >
                <span>About us</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 text-[#736E65] ${
                    aboutOpen ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {aboutOpen && (
                <div
                  className="absolute top-full right-0 sm:left-0 mt-2.5 w-44 rounded-2xl bg-[#161412] border border-white/10 shadow-2xl py-2 px-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 backdrop-blur-xl"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setAboutOpen(false);
                      // Placeholder: Route not created yet
                    }}
                    className="w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium text-[#A39E93] hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                    role="menuitem"
                  >
                    <span>Our story</span>
                    <span className="text-[10px] font-mono text-[#F59E0B] opacity-0 group-hover:opacity-100 transition-opacity">
                      Soon
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAboutOpen(false);
                      // Placeholder: Route not created yet
                    }}
                    className="w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium text-[#A39E93] hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                    role="menuitem"
                  >
                    <span>FAQ</span>
                    <span className="text-[10px] font-mono text-[#F59E0B] opacity-0 group-hover:opacity-100 transition-opacity">
                      Soon
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Contact */}
            <button
              type="button"
              onClick={() => {
                // Placeholder: Route not created yet
              }}
              className="text-sm font-medium text-[#A39E93] hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Subtle Vertical Divider between Nav links and Action controls */}
          <div className="hidden md:block w-px h-5 bg-white/10" />

          {/* Right Controls: Oracle Live Badge + Authentication + Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
          <button 
            type="button"
            onClick={openOracleModal} 
            title="Inspect Live Pricing Oracle & Feed Health"
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border text-[10px] sm:text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${badgeClasses}`}
          >
            <span className={isFrozen ? "w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" : "oracle-pulse-live flex-shrink-0"} />
            <span id="oracle-nav-badge" className="inline-flex items-center">
              <span className="hidden xs:inline">{oraclePrefix}</span>
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
              <span className="text-xs font-bold text-white max-w-[70px] sm:max-w-none truncate">
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
                onClick={logout} 
                title="Sign Out" 
                className="text-[11px] text-[#A39E93] hover:text-rose-400 ml-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={openAuthModal} 
              className="btn-unseen bg-white text-[#0B0A09] hover:bg-[#F59E0B] hover:text-[#0B0A09] px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider cursor-pointer whitespace-nowrap shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <span>Login ↗</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
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
        <div className="md:hidden border-t border-white/10 bg-[#0E0C0A] px-6 py-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-white"
            >
              Home
            </Link>
          </div>

          <div className="border-t border-white/10 pt-2">
            <button
              type="button"
              onClick={() => setMobileAboutOpen((prev) => !prev)}
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-[#A39E93] hover:text-white"
            >
              <span>About us</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  mobileAboutOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>
            {mobileAboutOpen && (
              <div className="pl-4 py-1 space-y-2 border-l border-white/10 ml-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    // Placeholder: Route not created yet
                  }}
                  className="block text-xs font-medium text-[#A39E93] hover:text-white py-1 text-left w-full cursor-pointer"
                >
                  Our story (Coming Soon)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    // Placeholder: Route not created yet
                  }}
                  className="block text-xs font-medium text-[#A39E93] hover:text-white py-1 text-left w-full cursor-pointer"
                >
                  FAQ (Coming Soon)
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                // Placeholder: Route not created yet
              }}
              className="block py-2 text-sm font-medium text-[#A39E93] hover:text-white text-left w-full cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
