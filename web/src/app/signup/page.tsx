"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBaskly } from "@/context/BasklyContext";
import { authApi, AuthApiError, GooglePrefill } from "@/services/authApi";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  X, 
  Edit3 
} from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function SignUpPage() {
  const router = useRouter();
  const { setUserFromBackend } = useBaskly();

  // Current Step: 1 = Personal, 2 = Account, 3 = Contact, 4 = Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Google Prefill state
  const [googlePrefill, setGooglePrefill] = useState<GooglePrefill | null>(null);
  const [googleGrant, setGoogleGrant] = useState<string | null>(null);

  // Step 1: Personal Details
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  // Step 2: Account Security & OTP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationGrant, setVerificationGrant] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [devTestOtp, setDevTestOtp] = useState<string | null>(null);

  // Step 3: Contact & Address
  const [mobileNumber, setMobileNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country] = useState("India");

  // Step 4: Review & Legal
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Global UI State
  const [submitLoading, setSubmitLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAccountExists, setIsAccountExists] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Calculate age for 18+ requirement
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Google Sign-Up: Initiates Google Identity Services registration
  const handleGoogleCredential = async (credential: string) => {
    try {
      setGoogleLoading(true);
      setErrorMessage(null);
      setIsAccountExists(false);

      const res = await authApi.initGoogleSignUp(credential);

      if (res.needsProfileCompletion && res.prefill) {
        setGooglePrefill(res.prefill);
        setGoogleGrant(res.prefill.googleVerificationGrant);
        if (res.prefill.firstName) setFirstName(res.prefill.firstName);
        if (res.prefill.lastName) setLastName(res.prefill.lastName);
        setEmail(res.prefill.email);
        // Ensure email OTP verification and password remain mandatory in Step 2
        setOtpVerified(false);
        setVerificationGrant(null);
        setOtpSent(false);
      }
    } catch (err: unknown) {
      if (err instanceof AuthApiError && (err.code === "ACCOUNT_EXISTS" || err.status === 409)) {
        setErrorMessage("An account already exists for this Google account. Please sign in instead.");
        setIsAccountExists(true);
      } else {
        const msg = err instanceof Error ? err.message : "Unable to initialize Google sign-up. Please try again.";
        setErrorMessage(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Dispatch Email OTP
  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address first.");
      return;
    }

    try {
      setOtpLoading(true);
      setErrorMessage(null);
      const res = await authApi.sendOtp(email);
      setOtpSent(true);
      setCooldownSeconds(res.cooldownRemainingSeconds || 60);
      if (res.testOtp) {
        setDevTestOtp(res.testOtp);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to dispatch verification code.";
      setErrorMessage(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify Email OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setOtpVerifyLoading(true);
      setErrorMessage(null);
      const res = await authApi.verifyOtp(email, otpCode.trim());
      if (res.verified && res.grantToken) {
        setOtpVerified(true);
        setVerificationGrant(res.grantToken);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid or expired OTP code.";
      setErrorMessage(msg);
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  // Step 1 Validation & Next
  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim()) {
      setErrorMessage("First name is required.");
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage("Last name is required.");
      return;
    }
    if (!dateOfBirth) {
      setErrorMessage("Date of birth is required.");
      return;
    }
    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      setErrorMessage("You must be at least 18 years of age to register on Baskly.money.");
      return;
    }
    if (!gender) {
      setErrorMessage("Please select your gender.");
      return;
    }

    setCurrentStep(2);
  };

  // Step 2 Validation & Next
  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("A valid email address is required.");
      return;
    }
    if (!otpVerified || !verificationGrant) {
      setErrorMessage("Please verify your email address with the verification code (OTP).");
      return;
    }

    // Password validation - mandatory for both Google and standard registration
    if (!password) {
      setErrorMessage("Please choose a password.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Password and confirm password do not match.");
      return;
    }

    setCurrentStep(3);
  };

  // Step 3 Validation & Next
  const handleNextStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanMobile = mobileNumber.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }
    if (!addressLine1.trim()) {
      setErrorMessage("Address Line 1 is required.");
      return;
    }
    if (!city.trim()) {
      setErrorMessage("City is required.");
      return;
    }
    if (!state) {
      setErrorMessage("Please select your State or Union Territory.");
      return;
    }

    setCurrentStep(4);
  };

  // Step 4 Final Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!termsAccepted) {
      setErrorMessage("You must accept the Terms and Conditions to create your account.");
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, "");

    try {
      setSubmitLoading(true);

      if (googlePrefill && googleGrant) {
        const res = await authApi.completeGoogleRegistration({
          googleVerificationGrant: googleGrant,
          emailVerificationGrant: verificationGrant!,
          firstName: firstName.trim(),
          middleName: middleName.trim() || undefined,
          lastName: lastName.trim(),
          dateOfBirth,
          email: email.trim(),
          mobileCountryCode: "+91",
          mobileNumber: cleanMobile,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state,
          country,
          gender,
          password,
          confirmPassword,
          termsAccepted: true,
          termsVersion: "v1.0",
        });

        if (res.user) {
          setUserFromBackend(res.user);
          const target = res.user.defaultDashboardPath && res.user.defaultDashboardPath !== "/dashboard/customer"
            ? res.user.defaultDashboardPath
            : "/portal";
          router.push(target);
        }
      } else {
        const res = await authApi.register({
          firstName: firstName.trim(),
          middleName: middleName.trim() || undefined,
          lastName: lastName.trim(),
          dateOfBirth,
          email: email.trim(),
          emailVerificationGrant: verificationGrant!,
          mobileCountryCode: "+91",
          mobileNumber: cleanMobile,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state,
          country,
          gender,
          password,
          confirmPassword,
          termsAccepted: true,
          termsVersion: "v1.0",
        });

        if (res.user) {
          setUserFromBackend(res.user);
          const target = res.user.defaultDashboardPath && res.user.defaultDashboardPath !== "/dashboard/customer"
            ? res.user.defaultDashboardPath
            : "/portal";
          router.push(target);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please check your details and try again.";
      setErrorMessage(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Step titles & descriptions
  const stepMeta = [
    { num: 1, title: "Personal", heading: "Let's get to know you", sub: "Start by sharing a few details about yourself." },
    { num: 2, title: "Account", heading: "Secure your account", sub: "Add your email address and choose a secure password." },
    { num: 3, title: "Contact", heading: "Your contact information", sub: "Add your contact details so we can complete your profile." },
    { num: 4, title: "Review", heading: "Almost there", sub: "Review your information before creating your account." },
  ];

  const currentMeta = stepMeta[currentStep - 1];

  return (
    <div className="min-h-screen bg-[#F4EFEA] py-8 sm:py-16 px-4 sm:px-6">
      <div className="max-w-[560px] mx-auto space-y-5 sm:space-y-6">

        {/* Brand Bar */}
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-[#121110] text-[#F4EFEA] flex items-center justify-center font-serif italic text-lg group-hover:bg-[#9A7B56] transition-colors">
              b
            </div>
            <span className="font-semibold text-base tracking-editorial text-[#121110]">
              baskly<span className="font-serif italic font-normal text-lg text-[#9A7B56]">.money</span>
            </span>
          </Link>
          <Link
            href="/signin"
            className="text-xs sm:text-sm font-medium text-[#66615B] hover:text-[#121110] transition-colors"
          >
            Already a member? <span className="font-semibold text-[#121110] underline">Sign in</span>
          </Link>
        </div>

        {/* Registration Stepper Bar */}
        <div className="bg-white border border-[#121110]/10 rounded-2xl p-3 sm:p-4 shadow-xs">
          {/* Desktop Stepper */}
          <div className="hidden sm:flex items-center justify-between">
            {stepMeta.map((s, idx) => {
              const isCompleted = currentStep > s.num;
              const isActive = currentStep === s.num;

              return (
                <React.Fragment key={s.num}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isCompleted) setCurrentStep(s.num as 1 | 2 | 3 | 4);
                    }}
                    disabled={!isCompleted}
                    className={`flex items-center gap-2.5 text-xs font-medium transition-colors ${
                      isActive 
                        ? "text-[#121110] font-semibold" 
                        : isCompleted 
                        ? "text-[#0F6E56] hover:text-[#121110] cursor-pointer" 
                        : "text-[#8C857B] cursor-default"
                    }`}
                  >
                    <span 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                        isCompleted
                          ? "bg-[#0F6E56] text-white"
                          : isActive
                          ? "bg-[#121110] text-white"
                          : "bg-[#FAF8F5] border border-[#121110]/15 text-[#8C857B]"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : s.num}
                    </span>
                    <span>{s.title}</span>
                  </button>

                  {idx < stepMeta.length - 1 && (
                    <div 
                      className={`flex-1 h-px mx-3 transition-colors ${
                        currentStep > idx + 1 ? "bg-[#0F6E56]" : "bg-[#121110]/10"
                      }`} 
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile Stepper */}
          <div className="sm:hidden space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#121110]">
                Step {currentStep} of 4: <span className="font-normal text-[#66615B]">{currentMeta.title}</span>
              </span>
              <span className="text-[11px] text-[#8C857B]">
                {Math.round((currentStep / 4) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#121110]/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#121110] rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Step Card */}
        <div className="bg-white border border-[#121110]/10 rounded-3xl p-6 sm:p-9 shadow-[0_8px_30px_rgba(18,17,16,0.04)] space-y-6">

          {/* Step Header */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-[26px] font-semibold text-[#121110] tracking-tight">
              {currentMeta.heading}
            </h1>
            <p className="text-sm text-[#66615B] leading-relaxed">
              {currentMeta.sub}
            </p>
          </div>

          {/* Compact Inline Error Alert */}
          {errorMessage && (
            <div
              className={`p-3.5 rounded-xl text-[13px] animate-in fade-in duration-150 ${
                isAccountExists
                  ? "bg-amber-50/90 border border-amber-200/80 text-amber-900"
                  : "bg-red-50/90 border border-red-200/80 text-red-800"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    isAccountExists ? "text-amber-700" : "text-red-600"
                  }`}
                />
                <span className="leading-snug">{errorMessage}</span>
              </div>
              {isAccountExists && (
                <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-xs text-amber-800">Already registered?</span>
                  <Link
                    href="/signin"
                    className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-[#121110] text-[#F4EFEA] text-xs font-medium hover:bg-[#2A2826] transition-colors"
                  >
                    Sign in instead
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              STEP 1: PERSONAL DETAILS
             ======================================================== */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-5">
              
              {/* Optional Quick Start with Google */}
              {!googlePrefill && (
                <div className="space-y-3 pb-2">
                  <GoogleAuthButton
                    mode="signup"
                    onCredential={handleGoogleCredential}
                    loading={googleLoading}
                    text="Fast registration with Google"
                  />

                  <div className="relative flex items-center justify-center pt-1">
                    <div className="border-t border-[#121110]/10 w-full" />
                    <span className="bg-white px-3 text-xs text-[#8C857B]">
                      or enter details manually
                    </span>
                    <div className="border-t border-[#121110]/10 w-full" />
                  </div>
                </div>
              )}

              {googlePrefill && (
                <div className="p-3.5 rounded-xl bg-[#0F6E56]/8 border border-[#0F6E56]/20 flex items-center justify-between text-xs text-[#0F6E56]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authenticated via <strong>{googlePrefill.email}</strong></span>
                  </div>
                  <span className="text-[11px] font-semibold bg-[#0F6E56]/15 px-2 py-0.5 rounded-full">Google Verified</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                    First name <span className="text-[#9A7B56]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Rohan"
                    className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] placeholder:text-[#8C857B] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                    Last name <span className="text-[#9A7B56]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Sharma"
                    className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] placeholder:text-[#8C857B] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                  Middle name <span className="text-[#8C857B] font-normal text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  autoComplete="additional-name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Middle name"
                  className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] placeholder:text-[#8C857B] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                    Date of birth <span className="text-[#9A7B56]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
                  />
                  <span className="text-[11px] text-[#8C857B] mt-1 block">
                    Must be 18+ to invest under Indian regulations.
                  </span>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                    Gender <span className="text-[#9A7B56]">*</span>
                  </label>
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-11 sm:h-12 px-3 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 sm:h-12 rounded-xl bg-[#121110] hover:bg-[#262422] text-[#F4EFEA] text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Continue to Account Security</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              STEP 2: ACCOUNT DETAILS (EMAIL, OTP, PASSWORD)
             ======================================================== */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-5">
              
              {/* Email Address & Send OTP Button */}
              <div>
                <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                  Email address <span className="text-[#9A7B56]">*</span>
                </label>
                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      disabled={otpVerified && !!googlePrefill}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (otpVerified && !googlePrefill) {
                          setOtpVerified(false);
                          setVerificationGrant(null);
                        }
                      }}
                      placeholder="name@example.com"
                      className="w-full h-11 sm:h-12 pl-10 pr-3.5 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] placeholder:text-[#8C857B] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all disabled:opacity-75"
                    />
                    <Mail className="w-4 h-4 text-[#8C857B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {!otpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || cooldownSeconds > 0 || !email}
                      className="h-11 sm:h-12 px-4 rounded-xl border border-[#121110]/20 bg-white hover:bg-[#FAF8F5] text-[#121110] text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                    >
                      {otpLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{cooldownSeconds > 0 ? `Resend (${cooldownSeconds}s)` : otpSent ? "Resend code" : "Send code"}</span>
                    </button>
                  )}
                </div>

                {otpVerified ? (
                  <div className="flex items-center gap-1.5 text-xs text-[#0F6E56] font-medium mt-2">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Email address verified</span>
                  </div>
                ) : otpSent ? (
                  <p className="text-xs text-[#66615B] mt-1.5">
                    We sent a 6-digit verification code to <strong>{email}</strong>.
                  </p>
                ) : null}
              </div>

              {/* OTP Verification Input (shown when code is dispatched and not yet verified) */}
              {otpSent && !otpVerified && (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#121110]/10 space-y-3 animate-in fade-in duration-150">
                  <label className="block text-[13px] font-medium text-[#121110]">
                    Enter 6-digit verification code
                  </label>
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="flex-1 h-11 px-4 rounded-xl border border-[#121110]/15 bg-white text-base tracking-widest font-mono text-center text-[#121110] focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpVerifyLoading || otpCode.length < 6}
                      className="h-11 px-5 rounded-xl bg-[#121110] hover:bg-[#262422] text-[#F4EFEA] text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                    >
                      {otpVerifyLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Verify</span>
                    </button>
                  </div>

                  {devTestOtp && (
                    <div className="text-[11px] text-[#9A7B56] bg-[#9A7B56]/10 px-3 py-1.5 rounded-lg flex items-center justify-between">
                      <span>Dev Mode Test OTP: <strong>{devTestOtp}</strong></span>
                      <button 
                        type="button" 
                        onClick={() => setOtpCode(devTestOtp)}
                        className="underline hover:text-[#121110] font-medium cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Password Fields - Mandatory for both Google and standard registration */}
              <div>
                <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                  Password <span className="text-[#9A7B56]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                  Confirm password <span className="text-[#9A7B56]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full h-11 sm:h-12 pl-10 pr-10 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] placeholder:text-[#8C857B] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
                  />
                  <Lock className="w-4 h-4 text-[#8C857B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C857B] hover:text-[#121110] transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {googlePrefill && (
                  <span className="text-[11px] text-[#66615B] mt-1 block">
                    Creating a password allows you to sign in with either Google or email + password.
                  </span>
                )}
              </div>

              {/* Navigation CTAs */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="h-11 sm:h-12 px-4 rounded-xl border border-[#121110]/15 hover:bg-[#FAF8F5] text-[#121110] text-sm font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={!otpVerified}
                  className="flex-1 h-11 sm:h-12 rounded-xl bg-[#121110] hover:bg-[#262422] text-[#F4EFEA] text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <span>Continue to Contact Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              STEP 3: CONTACT INFORMATION
             ======================================================== */}
          {currentStep === 3 && (
            <form onSubmit={handleNextStep3} className="space-y-5">
              
              {/* Mobile Phone Number */}
              <div>
                <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                  Mobile number <span className="text-[#9A7B56]">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="h-11 sm:h-12 px-3.5 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm font-medium text-[#121110] flex items-center justify-center select-none flex-shrink-0">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    required
                    autoComplete="tel-national"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210"
                    className="flex-1 h-11 sm:h-12 px-3.5 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] placeholder:text-[#8C857B] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
                  />
                </div>
                <span className="text-[11px] text-[#8C857B] mt-1 block">
                  Used for NPCI UPI AutoPay mandate notifications and SMS alerts.
                </span>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                  Address Line 1 <span className="text-[#9A7B56]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoComplete="address-line1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="House / Flat No., Building name, Street"
                  className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] placeholder:text-[#8C857B] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                  Address Line 2 <span className="text-[#8C857B] font-normal text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  autoComplete="address-line2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apartment, suite, landmark"
                  className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] placeholder:text-[#8C857B] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                    City <span className="text-[#9A7B56]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] placeholder:text-[#8C857B] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                    State / UT <span className="text-[#9A7B56]">*</span>
                  </label>
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-11 sm:h-12 px-3 rounded-xl border border-[#121110]/15 bg-[#FAF8F5] text-sm text-[#121110] focus:bg-white focus:outline-none focus:border-[#121110] focus:ring-2 focus:ring-[#121110]/8 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select state</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Country (Fixed India) */}
              <div>
                <label className="block text-[13px] font-medium text-[#121110] mb-1.5">
                  Country
                </label>
                <div className="w-full h-11 sm:h-12 px-3.5 rounded-xl border border-[#121110]/10 bg-[#FAF8F5] text-sm text-[#66615B] flex items-center select-none">
                  India (Indian Tax Residency required under CBDT rules)
                </div>
              </div>

              {/* Navigation CTAs */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="h-11 sm:h-12 px-4 rounded-xl border border-[#121110]/15 hover:bg-[#FAF8F5] text-[#121110] text-sm font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 h-11 sm:h-12 rounded-xl bg-[#121110] hover:bg-[#262422] text-[#F4EFEA] text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Review Application</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              STEP 4: REVIEW & CREATE ACCOUNT
             ======================================================== */}
          {currentStep === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              
              {/* Summary Cards */}
              <div className="space-y-3">
                {/* 1. Personal Details Card */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#121110]/10 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-[#121110]/8">
                    <span className="text-xs font-semibold text-[#121110] uppercase tracking-wider">
                      Personal Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-medium text-[#9A7B56] hover:text-[#7D6242] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#8C857B] block">Legal Name:</span>
                      <span className="font-medium text-[#121110]">{firstName} {middleName ? `${middleName} ` : ""}{lastName}</span>
                    </div>
                    <div>
                      <span className="text-[#8C857B] block">Date of Birth:</span>
                      <span className="font-medium text-[#121110]">{dateOfBirth} (Age {calculateAge(dateOfBirth)})</span>
                    </div>
                    <div>
                      <span className="text-[#8C857B] block">Gender:</span>
                      <span className="font-medium text-[#121110]">{gender}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Account Details Card */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#121110]/10 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-[#121110]/8">
                    <span className="text-xs font-semibold text-[#121110] uppercase tracking-wider">
                      Account & Credentials
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-medium text-[#9A7B56] hover:text-[#7D6242] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#8C857B] block">Email Address:</span>
                      <span className="font-medium text-[#121110]">{email}</span>
                    </div>
                    <div>
                      <span className="text-[#8C857B] block">Status:</span>
                      <span className="inline-flex items-center gap-1 text-[#0F6E56] font-medium">
                        <Check className="w-3.5 h-3.5" /> Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Contact Details Card */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#121110]/10 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-[#121110]/8">
                    <span className="text-xs font-semibold text-[#121110] uppercase tracking-wider">
                      Contact & Address
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-medium text-[#9A7B56] hover:text-[#7D6242] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#8C857B] block">Mobile Number:</span>
                      <span className="font-medium text-[#121110]">+91 {mobileNumber}</span>
                    </div>
                    <div>
                      <span className="text-[#8C857B] block">Location:</span>
                      <span className="font-medium text-[#121110]">{city}, {state}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#8C857B] block">Address:</span>
                      <span className="font-medium text-[#121110]">{addressLine1}{addressLine2 ? `, ${addressLine2}` : ""}, {city}, {state}, India</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regulatory Acceptance Checkbox */}
              <div className="p-4 rounded-2xl border border-[#121110]/12 bg-[#FAF8F5]/60 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-[#121110]/30 text-[#121110] focus:ring-[#121110] cursor-pointer"
                  />
                  <span className="text-xs text-[#5C5752] leading-relaxed">
                    I acknowledge that I am an Indian tax resident aged 18 or above, and I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="text-[#121110] font-semibold underline hover:text-[#9A7B56] cursor-pointer"
                    >
                      Terms of Service, Privacy Policy & 1% TDS Disclosure
                    </button>.
                  </span>
                </label>
              </div>

              {/* Navigation & Submit CTAs */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="h-11 sm:h-12 px-4 rounded-xl border border-[#121110]/15 hover:bg-[#FAF8F5] text-[#121110] text-sm font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={submitLoading || !termsAccepted}
                  className="flex-1 h-11 sm:h-12 rounded-xl bg-[#121110] hover:bg-[#262422] text-[#F4EFEA] text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Complete Registration & Open Account</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Security & Regulatory Footer Note */}
        <div className="text-center text-xs text-[#8C857B] space-y-1">
          <p>
            Secured by AES-256 cold custody · 1% Section 194S TDS compliant
          </p>
        </div>

      </div>

      {/* Legal & Terms Modal */}
      {termsModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          onClick={() => setTermsModalOpen(false)}
        >
          <div 
            className="bg-white max-w-xl w-full max-h-[85vh] flex flex-col rounded-3xl border border-[#121110]/15 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[#121110]/10 flex-shrink-0">
              <div>
                <h3 className="text-xl font-semibold text-[#121110]">Baskly Terms & Disclosures</h3>
                <p className="text-xs text-[#66615B] mt-0.5">Version 1.0 · Regulated Indian VDA Framework</p>
              </div>
              <button 
                type="button"
                onClick={() => setTermsModalOpen(false)} 
                className="w-8 h-8 rounded-full border border-[#121110]/15 flex items-center justify-center text-xs hover:bg-[#121110] hover:text-[#F4EFEA] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#5C5752] leading-relaxed flex-1">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#121110]/8 space-y-1">
                <h4 className="font-semibold text-[#121110]">1. Age & Indian Tax Residency</h4>
                <p>You confirm that you are at least 18 years of age and an Indian tax resident possessing a valid PAN.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#121110]/8 space-y-1">
                <h4 className="font-semibold text-[#121110]">2. Statutory 1% TDS Under Section 194S</h4>
                <p>Tax deduction at source (TDS) of 1% is mandatorily deducted on the gross consideration of every VDA transfer or redemption.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#121110]/8 space-y-1">
                <h4 className="font-semibold text-[#121110]">3. 1:1 Cold Vault Custody</h4>
                <p>All constituent digital assets backing basket units are held 1:1 in segregated institutional multi-signature cold storage vaults.</p>
              </div>
            </div>

            <div className="p-4 border-t border-[#121110]/10 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setTermsAccepted(true);
                  setTermsModalOpen(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#121110] text-[#F4EFEA] text-xs font-semibold hover:bg-[#9A7B56] transition cursor-pointer"
              >
                Acknowledge & Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
