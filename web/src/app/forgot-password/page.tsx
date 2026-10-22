"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authApi } from "@/services/authApi";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit recovery request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-[420px] bg-white border border-[#121110]/10 rounded-3xl p-7 sm:p-9 shadow-[0_10px_35px_rgba(18,17,16,0.05)] space-y-6">
        
        <div>
          <Link
            href="/signin"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#66615B] hover:text-[#121110] transition mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign in</span>
          </Link>
          <h1 className="text-2xl sm:text-[26px] font-semibold text-[#121110] tracking-tight">
            Password Recovery
          </h1>
          <p className="text-sm text-[#66615B] mt-1 leading-relaxed">
            Enter your registered email address and we'll send you instructions to securely reset your password.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200/80 text-red-800 text-[13px] flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-5 rounded-2xl bg-[#0F6E56]/10 border border-[#0F6E56]/20 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#0F6E56]/15 text-[#0F6E56] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#121110]">Check Your Inbox</h3>
              <p className="text-xs text-[#5C5752] leading-relaxed">
                If an account exists for <span className="font-semibold text-[#121110]">{email}</span>, we have dispatched a secure password reset link valid for 15 minutes.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/signin"
                className="inline-block text-xs font-semibold text-[#0F6E56] hover:underline"
              >
                Return to Sign in ↗
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="recovery-email" className="block text-[13px] font-medium text-[#121110] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <input
                  id="recovery-email"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12 rounded-xl bg-[#121110] hover:bg-[#262422] text-[#F4EFEA] text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Send recovery link</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
