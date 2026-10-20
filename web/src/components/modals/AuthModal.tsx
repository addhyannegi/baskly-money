"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useBaskly } from "@/context/BasklyContext";
import { UserRole } from "@/types/baskly";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useBaskly();
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<UserRole>("retail");

  if (!isAuthModalOpen) return null;

  const handleContinueWithGoogle = () => {
    const defaultEmail = "investor@gmail.com";
    const defaultName = "Rohan Investor";
    const loggedUser = login(defaultName, defaultEmail, "retail");
    closeAuthModal();
    router.push(loggedUser.role === "fund_manager" ? "/manager" : "/portal");
  };

  const handleDirectSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      alert("Please enter a valid Google email.");
      return;
    }

    const loggedUser = login(name || email.split("@")[0], email, role);
    closeAuthModal();
    router.push(loggedUser.role === "fund_manager" ? "/manager" : "/portal");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="tilt-card bg-[#FAF8F5] max-w-md w-full p-5 sm:p-8 space-y-5 sm:space-y-6">
        <div className="tilt-card-content space-y-4 sm:space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#121110]/10 gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span className="font-bold text-xs sm:text-sm text-[#121110]">Google Authentication</span>
            </div>
            <button 
              type="button"
              onClick={closeAuthModal} 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#121110]/15 flex items-center justify-center text-xs hover:bg-[#121110] hover:text-[#F4EFEA] transition cursor-pointer flex-shrink-0"
            >
              ✕
            </button>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#121110]">Sign in to Baskly.money</h3>
            <p className="text-xs text-[#5C5752] mt-0.5 sm:mt-1">Authenticate directly with your Google account.</p>
          </div>

          {/* 1. Official Google Button */}
          <button 
            type="button" 
            onClick={handleContinueWithGoogle} 
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border border-[#121110]/20 bg-white hover:bg-gray-50 text-[#121110] font-semibold text-sm shadow-xs hover:border-[#121110] transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-[#121110]/10 w-full" />
            <span className="bg-[#FAF8F5] px-3 text-[10px] uppercase font-mono text-[#8C857B] whitespace-nowrap">
              Or enter Google email directly
            </span>
            <div className="border-t border-[#121110]/10 w-full" />
          </div>

          {/* 2. Direct Email Sign-In */}
          <form onSubmit={handleDirectSignIn} className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-[#5C5752] mb-1">Your Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Addhyan Negi" 
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#121110]/15 bg-[#F4EFEA] text-xs font-semibold focus:outline-none focus:border-[#121110]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#5C5752] mb-1">Google Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com" 
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#121110]/15 bg-[#F4EFEA] text-xs font-semibold focus:outline-none focus:border-[#121110]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#5C5752] mb-1">Destination Desk</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#121110]/15 bg-[#F4EFEA] text-xs font-semibold focus:outline-none focus:border-[#121110]"
              >
                <option value="retail">Retail Investor Portal (₹3.24L Portfolio)</option>
                <option value="fund_manager">Fund Manager Terminal (₹48.6Cr AUM Desk)</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full py-2.5 rounded-xl bg-[#121110] text-[#F4EFEA] text-xs font-semibold hover:bg-[#9A7B56] transition cursor-pointer"
            >
              Sign In & Enter Dashboard ↗
            </button>
          </form>

          <div className="text-center text-[10px] text-[#8C857B] font-mono">
            Instant SHA-256 JWT sessions · Persistent PostgreSQL Ready
          </div>
        </div>
      </div>
    </div>
  );
}
