"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { authApi } from "@/services/authApi";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage("Reset token is missing. Please check your reset link.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
      setTimeout(() => {
        router.push("/signin");
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-white border border-[#121110]/10 rounded-3xl p-7 sm:p-9 shadow-[0_10px_35px_rgba(18,17,16,0.05)] space-y-6">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-semibold text-[#121110] tracking-tight">
          Set New Password
        </h1>
        <p className="text-sm text-[#66615B] mt-1 leading-relaxed">
          Create a secure new password for your Baskly.money account.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200/80 text-red-800 text-[13px] flex items-start gap-2.5 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {success ? (
        <div className="p-5 rounded-2xl bg-[#0F6E56]/10 border border-[#0F6E56]/20 text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#0F6E56]/15 text-[#0F6E56] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#121110]">Password Reset Complete</h3>
            <p className="text-xs text-[#5C5752] leading-relaxed">
              Your password has been successfully updated. Redirecting to sign in...
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/signin"
              className="inline-block text-xs font-semibold text-[#0F6E56] hover:underline"
            >
              Sign in now ↗
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
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
            <p className="text-[11px] text-[#8C857B] mt-1.5">Must be at least 8 characters long.</p>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
              Confirm new password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full h-11 sm:h-12 pl-10 pr-3.5 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] placeholder:text-[#8C857B] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
              />
              <Lock className="w-4 h-4 text-[#8C857B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 sm:h-12 rounded-xl bg-[#121110] hover:bg-[#262422] text-[#F4EFEA] text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Update password</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <Suspense fallback={<div className="text-sm text-[#8C857B]">Loading form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
