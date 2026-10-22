"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  loadGoogleIdentityScript,
  getGoogleClientId,
  isPlaceholderGoogleClientId,
} from "@/utils/googleIdentity";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  mode: "signin" | "signup";
  onCredential: (credential: string) => Promise<void> | void;
  loading?: boolean;
  disabled?: boolean;
  text?: string;
  className?: string;
}

export default function GoogleAuthButton({
  mode,
  onCredential,
  loading = false,
  disabled = false,
  text,
  className = "",
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  const [showDevModal, setShowDevModal] = useState(false);
  const [customDevEmail, setCustomDevEmail] = useState("");

  const clientId = getGoogleClientId();
  const isPlaceholder = isPlaceholderGoogleClientId(clientId);

  const defaultText =
    text || (mode === "signup" ? "Fast registration with Google" : "Continue with Google");

  useEffect(() => {
    let isMounted = true;

    if (!isPlaceholder) {
      loadGoogleIdentityScript()
        .then(() => {
          if (!isMounted || !window.google?.accounts?.id || !containerRef.current) return;

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response && response.credential) {
                onCredentialRef.current(response.credential);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render official GIS button into the hidden/styled container
          window.google.accounts.id.renderButton(containerRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: mode === "signup" ? "signup_with" : "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: 380,
          });
        })
        .catch((err) => {
          console.warn("[Baskly Google Auth] Could not load Google Identity Services:", err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [clientId, isPlaceholder, mode]);

  const handleClick = () => {
    if (disabled || loading) return;

    if (isPlaceholder) {
      // Show dev account selector when client ID is not configured with real Google Cloud credentials
      setShowDevModal(true);
      return;
    }

    if (window.google?.accounts?.id) {
      // Trigger Google One Tap or Account Chooser prompt
      window.google.accounts.id.prompt();
      // Also simulate click on the rendered button if container has an iframe
      const btn = containerRef.current?.querySelector("div[role=button], iframe") as HTMLElement;
      if (btn) {
        btn.click();
      }
    }
  };

  const handleDevSelect = (email: string) => {
    setShowDevModal(false);
    onCredential(`dev_google_${email.trim().toLowerCase()}`);
  };

  return (
    <>
      <div className="relative w-full">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || loading}
          className={`w-full h-11 sm:h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-[#121110]/15 bg-white hover:bg-[#FAF8F5] text-[#121110] font-medium text-sm transition-all cursor-pointer shadow-xs disabled:opacity-60 ${className}`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#66615B]" />
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{defaultText}</span>
        </button>

        {/* Hidden container where GIS renders the official iframe button */}
        {!isPlaceholder && (
          <div
            ref={containerRef}
            className="absolute inset-0 opacity-0 pointer-events-auto overflow-hidden cursor-pointer flex items-center justify-center"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Dev-Mode Account Chooser Modal (Shown when NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured) */}
      {showDevModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowDevModal(false)}
        >
          <div
            className="bg-white border border-[#121110]/10 rounded-2xl p-6 shadow-2xl max-w-[380px] w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-amber-100 text-amber-800">
                  Dev Mode
                </span>
                <span className="text-xs text-[#8C857B]">Google Account Chooser</span>
              </div>
              <h3 className="text-base font-semibold text-[#121110]">
                Choose an account for testing
              </h3>
              <p className="text-xs text-[#66615B] leading-relaxed">
                Configure <code className="bg-[#FAF8F5] px-1 py-0.5 rounded text-[11px]">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in <code className="bg-[#FAF8F5] px-1 py-0.5 rounded text-[11px]">web/.env.local</code> to activate live Google Cloud Identity.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleDevSelect("customer@baskly.money")}
                className="w-full text-left p-3 rounded-xl border border-[#121110]/10 hover:border-[#121110]/30 hover:bg-[#FAF8F5] transition text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-[#121110]">customer@baskly.money</div>
                  <div className="text-[11px] text-[#8C857B]">Pre-seeded active customer account</div>
                </div>
                <span className="text-xs font-semibold text-[#9A7B56]">Select</span>
              </button>

              <button
                type="button"
                onClick={() => handleDevSelect("new.investor@gmail.com")}
                className="w-full text-left p-3 rounded-xl border border-[#121110]/10 hover:border-[#121110]/30 hover:bg-[#FAF8F5] transition text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-[#121110]">new.investor@gmail.com</div>
                  <div className="text-[11px] text-[#8C857B]">New unregistered Google user</div>
                </div>
                <span className="text-xs font-semibold text-[#9A7B56]">Select</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#121110]/10">
              <label className="block text-[11px] font-medium text-[#66615B] mb-1">
                Or enter custom test email:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customDevEmail}
                  onChange={(e) => setCustomDevEmail(e.target.value)}
                  placeholder="custom@example.com"
                  className="flex-1 h-9 px-3 rounded-lg border border-[#121110]/15 text-xs focus:outline-none focus:border-[#121110]"
                />
                <button
                  type="button"
                  disabled={!customDevEmail.includes("@")}
                  onClick={() => handleDevSelect(customDevEmail)}
                  className="px-3 h-9 rounded-lg bg-[#121110] text-[#F4EFEA] text-xs font-medium hover:bg-[#2A2826] transition disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowDevModal(false)}
                className="text-xs text-[#8C857B] hover:text-[#121110]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
