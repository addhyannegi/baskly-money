"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBaskly } from "@/context/BasklyContext";
import { authApi, AuthApiError } from "@/services/authApi";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const { setUserFromBackend } = useBaskly();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAccountNotFound, setIsAccountNotFound] = useState(false);

  // 1. Password-based Login
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
        router.push(res.user.defaultDashboardPath || "/dashboard/customer");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password. Please try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Identity Services Sign-In
  const handleGoogleCredential = async (credential: string) => {
    try {
      setGoogleLoading(true);
      setErrorMessage(null);
      setIsAccountNotFound(false);

      const res = await authApi.googleSignIn(credential);

      if (res.user) {
        setUserFromBackend(res.user);
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-[420px] bg-white border border-[#121110]/10 rounded-3xl p-7 sm:p-9 shadow-[0_10px_35px_rgba(18,17,16,0.05)] space-y-6">
        
        {/* Brand & Heading */}
        <div className="text-center space-y-2.5">
          <Link href="/" className="inline-flex items-center justify-center group mb-1">
            <div className="w-11 h-11 rounded-full bg-[#121110] text-[#F4EFEA] flex items-center justify-center font-serif italic text-xl group-hover:bg-[#9A7B56] transition-colors">
              b
            </div>
          </Link>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-[#121110] tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-[#66615B] leading-relaxed">
            Sign in to continue to your Baskly.money account.
          </p>
        </div>

        {/* Compact, accessible error / account-not-found alert */}
        {errorMessage && (
          <div
            className={`p-3.5 rounded-xl text-[13px] animate-in fade-in duration-150 ${
              isAccountNotFound
                ? "bg-amber-50/90 border border-amber-200/80 text-amber-900"
                : "bg-red-50/90 border border-red-200/80 text-red-800"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  isAccountNotFound ? "text-amber-700" : "text-red-600"
                }`}
              />
              <span className="leading-snug">{errorMessage}</span>
            </div>
            {isAccountNotFound && (
              <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                <span className="text-xs text-amber-800">New to Baskly.money?</span>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-[#121110] text-[#F4EFEA] text-xs font-medium hover:bg-[#2A2826] transition-colors"
                >
                  Create an account
                </Link>
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
          <div className="border-t border-[#121110]/10 w-full" />
          <span className="bg-white px-3 text-xs text-[#8C857B]">
            or continue with email
          </span>
          <div className="border-t border-[#121110]/10 w-full" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handlePasswordSignIn} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
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
                className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] placeholder:text-[#8C857B] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
              />
              <Mail className="w-4 h-4 text-[#8C857B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[13px] font-medium text-[#121110]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#9A7B56] hover:text-[#7D6242] transition-colors"
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
                className="w-full h-11 sm:h-12 pl-10 pr-10 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] placeholder:text-[#8C857B] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
              />
              <Lock className="w-4 h-4 text-[#8C857B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C857B] hover:text-[#121110] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 sm:h-12 rounded-xl bg-[#121110] hover:bg-[#262422] text-[#F4EFEA] text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Sign in</span>
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-[#66615B] pt-1">
          New to Baskly.money?{" "}
          <Link href="/signup" className="font-semibold text-[#121110] hover:text-[#9A7B56] transition-colors">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}
