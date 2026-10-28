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
    ? "border-amber-600/30 bg-amber-600/10 text-amber-800"
    : "border-[#0F6E56]/30 bg-[#0F6E56]/8 hover:bg-[#0F6E56]/15 text-[#0F6E56]";

  return (
    <header className="sticky top-0 z-40 w-full bg-[#EBE3DA] border-b border-[#121110]/10 shadow-[0_1px_3px_rgba(18,17,16,0.04)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#121110] text-[#F4EFEA] flex items-center justify-center font-serif-italic text-lg group-hover:bg-[#9A7B56] transition-colors flex-shrink-0">
            b
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base sm:text-lg tracking-editorial leading-none text-[#121110]">
              baskly<span className="font-serif-italic font-normal text-lg sm:text-xl text-[#9A7B56]">.money</span>
              <sup className="text-[8px] font-mono ml-0.5">®</sup>
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.2em] text-[#8C857B] mt-0.5">
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
              className="text-sm font-medium text-[#121110] hover:text-[#9A7B56] transition-colors"
            >
              Home
            </Link>

            {/* 2. About us (Dropdown on click) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setAboutOpen((prev) => !prev)}
                aria-expanded={aboutOpen}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5C5752] hover:text-[#121110] transition-colors cursor-pointer select-none"
              >
                <span>About us</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 text-[#8C857B] ${
                    aboutOpen ? "rotate-180 text-[#121110]" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {aboutOpen && (
                <div
                  className="absolute top-full right-0 sm:left-0 mt-2.5 w-48 rounded-2xl bg-[#FAF8F5] border border-[#121110]/10 shadow-xl py-2 px-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  role="menu"
                >
                  <Link
                    href="/about"
                    onClick={() => setAboutOpen(false)}
                    className="w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium text-[#5C5752] hover:text-[#121110] hover:bg-[#EBE3DA]/70 transition-colors cursor-pointer flex items-center justify-between group"
                    role="menuitem"
                  >
                    <span>Our Philosophy</span>
                    <span className="text-[10px] font-mono text-[#9A7B56] opacity-0 group-hover:opacity-100 transition-opacity">
                      Read ↗
                    </span>
                  </Link>
                  <Link
                    href="/#faq"
                    onClick={() => setAboutOpen(false)}
                    className="w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium text-[#5C5752] hover:text-[#121110] hover:bg-[#EBE3DA]/70 transition-colors cursor-pointer flex items-center justify-between group"
                    role="menuitem"
                  >
                    <span>FAQ</span>
                    <span className="text-[10px] font-mono text-[#9A7B56] opacity-0 group-hover:opacity-100 transition-opacity">
                      View ↗
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Contact */}
            <a
              href="mailto:support@baskly.money"
              className="text-sm font-medium text-[#5C5752] hover:text-[#121110] transition-colors cursor-pointer"
            >
              Contact
            </a>
          </nav>

          {/* Subtle Vertical Divider between Nav links and Action controls */}
          <div className="hidden md:block w-px h-5 bg-[#121110]/10" />

          {/* Right Controls: Oracle Live Badge + Authentication + Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
          <button 
            type="button"
            suppressHydrationWarning
            onClick={openOracleModal} 
            title="Inspect Live Pricing Oracle & Feed Health"
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border text-[10px] sm:text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${badgeClasses}`}
          >
            <span className={isFrozen ? "w-2 h-2 rounded-full bg-amber-600 flex-shrink-0" : "oracle-pulse-live flex-shrink-0"} />
            <span id="oracle-nav-badge" className="inline-flex items-center">
              <span className="hidden xs:inline">{oraclePrefix}</span>
              <span>{oracleValue}</span>
            </span>
          </button>

          {/* Dynamic User Status or Login Button */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#FAF8F5] border border-[#121110]/15 rounded-full pl-1.5 sm:pl-2 pr-2.5 sm:pr-3 py-1 shadow-xs">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-[#121110]/10 flex-shrink-0" 
              />
              <span className="text-xs font-bold text-[#121110] max-w-[70px] sm:max-w-none truncate">
                {user.givenName || user.name.split(" ")[0]}
              </span>
              <Link 
                href={user.defaultDashboardPath || (user.role === "FUND_MANAGER" || user.role === "fund_manager" ? "/dashboard/fund-manager" : user.role === "ADMIN" ? "/dashboard/admin" : user.role === "SUPPORT" ? "/dashboard/support" : "/dashboard/customer")} 
                className="text-[10px] font-mono font-bold text-[#0F6E56] hover:underline ml-0.5 sm:ml-1"
              >
                Dashboard ↗
              </Link>
              <button 
                type="button"
                suppressHydrationWarning
                onClick={logout} 
                title="Sign Out" 
                className="text-[11px] text-[#8C857B] hover:text-[#B85D43] ml-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button 
              type="button"
              suppressHydrationWarning
              onClick={openAuthModal} 
              className="btn-unseen bg-[#121110] text-[#F4EFEA] px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider cursor-pointer whitespace-nowrap"
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
            className="md:hidden w-8 h-8 rounded-full border border-[#121110]/15 flex items-center justify-center text-[#121110] hover:bg-[#FAF8F5] transition-colors cursor-pointer flex-shrink-0"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#121110]/10 bg-[#EBE3DA] px-6 py-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-[#121110]"
            >
              Home
            </Link>
          </div>

          <div className="border-t border-[#121110]/8 pt-2">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setMobileAboutOpen((prev) => !prev)}
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-[#5C5752] hover:text-[#121110]"
            >
              <span>About us</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  mobileAboutOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {mobileAboutOpen && (
              <div className="pl-4 py-1 space-y-2 border-l border-[#121110]/10 ml-2 mt-1">
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs font-medium text-[#5C5752] hover:text-[#121110] py-1 text-left w-full cursor-pointer"
                >
                  Our Philosophy
                </Link>
                <Link
                  href="/#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs font-medium text-[#5C5752] hover:text-[#121110] py-1 text-left w-full cursor-pointer"
                >
                  FAQ
                </Link>
              </div>
            )}
          </div>

          <div className="border-t border-[#121110]/8 pt-2">
            <a
              href="mailto:support@baskly.money"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#5C5752] hover:text-[#121110] text-left w-full cursor-pointer"
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
