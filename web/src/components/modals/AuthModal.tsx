"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBaskly } from "@/context/BasklyContext";
import { authApi, AuthApiError } from "@/services/authApi";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, X } from "lucide-react";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, setUserFromBackend } = useBaskly();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAccountNotFound, setIsAccountNotFound] = useState<boolean>(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleCredential = async (credential: string) => {
    try {
      setGoogleLoading(true);
      setErrorMessage(null);
      setIsAccountNotFound(false);

      const res = await authApi.googleSignIn(credential);

      if (res.user) {
        setUserFromBackend(res.user);
        closeAuthModal();
        router.push(res.user.defaultDashboardPath || "/dashboard/customer");
      }
    } catch (err: unknown) {
      if (err instanceof AuthApiError && (err.code === "ACCOUNT_NOT_FOUND" || err.status === 404)) {
        setErrorMessage("No account found for this Google account. Please create an account first.");
        setIsAccountNotFound(true);
      } else {
        const msg = err instanceof Error ? err.message : "Unable to complete Google sign-in. Please try again.";
        setErrorMessage(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsAccountNotFound(false);

    if (!email || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login(email, password);
      if (res.user) {
        setUserFromBackend(res.user);
        closeAuthModal();
        router.push(res.user.defaultDashboardPath || "/dashboard/customer");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password. Please try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccountClick = () => {
    closeAuthModal();
    router.push("/signup");
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={closeAuthModal}
    >
      <div 
        className="bg-[#13110F]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(245,158,11,0.12)] max-w-[420px] w-full space-y-6 relative animate-in fade-in zoom-in-95 duration-150 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={closeAuthModal} 
          aria-label="Close sign in modal"
          className="absolute right-5 top-5 w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-[#A39E93] hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand & Heading */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-10 h-10 rounded-full bg-white/10 text-white border border-white/10 flex items-center justify-center font-serif italic text-lg mx-auto">
            b
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-[#A39E93] leading-relaxed">
            Sign in to continue to your Baskly.money account.
          </p>
        </div>

        {/* Compact, accessible error / account-not-found alert */}
        {errorMessage && (
          <div
            className={`p-3.5 rounded-xl text-[13px] animate-in fade-in duration-150 ${
              isAccountNotFound
                ? "bg-amber-950/60 border border-amber-500/30 text-amber-200"
                : "bg-red-950/60 border border-red-500/30 text-red-200"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  isAccountNotFound ? "text-amber-400" : "text-red-400"
                }`}
              />
              <span className="leading-snug">{errorMessage}</span>
            </div>
            {isAccountNotFound && (
              <div className="mt-2.5 pt-2 border-t border-amber-500/30 flex items-center justify-between">
                <span className="text-xs text-amber-300">New to Baskly.money?</span>
                <button
                  type="button"
                  onClick={handleCreateAccountClick}
                  className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-white text-[#0B0A09] text-xs font-semibold hover:bg-[#F59E0B] transition-colors cursor-pointer"
                >
                  Create an account
                </button>
              </div>
            )}
          </div>
        )}

        {/* Google Sign-in */}
        <GoogleAuthButton
          mode="signin"
          onCredential={handleGoogleCredential}
          loading={googleLoading}
        />

        {/* Subtle Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#13110F] px-3 text-xs text-[#A39E93]">
            or continue with email
          </span>
          <div className="border-t border-white/10 w-full" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handlePasswordSignIn} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#D4CFC7] mb-1.5">
              Email address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl border border-white/10 bg-[#1A1713] text-sm text-white placeholder:text-[#A39E93]/60 focus:bg-[#1A1713] focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/15 transition-all"
              />
              <Mail className="w-4 h-4 text-[#A39E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[13px] font-medium text-[#D4CFC7]">
                Password
              </label>
              <Link
                href="/forgot-password"
                onClick={closeAuthModal}
                className="text-xs font-medium text-[#F59E0B] hover:text-amber-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-11 sm:h-12 pl-10 pr-10 rounded-xl border border-white/10 bg-[#1A1713] text-sm text-white placeholder:text-[#A39E93]/60 focus:bg-[#1A1713] focus:outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/15 transition-all"
              />
              <Lock className="w-4 h-4 text-[#A39E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39E93] hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 sm:h-12 rounded-xl bg-white hover:bg-[#F59E0B] text-[#0B0A09] text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Sign in</span>
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-[#A39E93] pt-1">
          New to Baskly.money?{" "}
          <Link
            href="/signup"
            onClick={closeAuthModal}
            className="font-semibold text-white hover:text-[#F59E0B] transition-colors"
          >
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}
