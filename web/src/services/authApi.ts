/**
 * Baskly.money Authentication API Service
 * Interacts with Spring Boot backend endpoints under /api/auth/*
 */

export interface UserSummary {
  id: string;
  name: string;
  givenName: string;
  email: string;
  avatar: string;
  role: 'CUSTOMER' | 'ADMIN' | 'FUND_MANAGER' | 'SUPPORT';
  legacyRole: 'retail' | 'fund_manager';
  defaultDashboardPath: string;
  kycStatus: string;
  pan: string;
  signedInAt: string;
}

export interface GooglePrefill {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  googleVerificationGrant: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  errorCode?: "ACCOUNT_NOT_FOUND" | "ACCOUNT_EXISTS" | string;
  user?: UserSummary;
  token?: string;
  needsProfileCompletion?: boolean;
  prefill?: GooglePrefill;
}

export interface SendOtpResult {
  success: boolean;
  message: string;
  cooldownRemainingSeconds: number;
  testOtp?: string | null;
}

export interface VerifyOtpResult {
  verified: boolean;
  message: string;
  grantToken?: string;
}

export type AuthErrorCode =
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "ACCOUNT_NOT_FOUND"
  | "ACCOUNT_EXISTS"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

export class AuthApiError extends Error {
  public readonly code: AuthErrorCode;
  public readonly status?: number;
  public readonly details?: Record<string, string>;
  public readonly isNetworkError: boolean;

  constructor(params: {
    message: string;
    code: AuthErrorCode;
    status?: number;
    details?: Record<string, string>;
    isNetworkError?: boolean;
  }) {
    super(params.message);
    this.name = "AuthApiError";
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
    this.isNetworkError = params.isNetworkError ?? false;
  }
}

function getAuthBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return envUrl.replace(/\/api(\/v1)?\/?$/, "").replace(/\/+$/, "");
}

const API_BASE_URL = getAuthBaseUrl();

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || "GET";
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include", // Ensures HttpOnly baskly_session cookie is sent/received
    });
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[Baskly Auth Service] Network connection failed on ${method} ${API_BASE_URL}${path}. The backend server appears to be offline or unreachable.`,
        { endpoint: path, method, baseUrl: API_BASE_URL }
      );
    }
    throw new AuthApiError({
      code: "NETWORK_ERROR",
      status: 0,
      isNetworkError: true,
      message:
        "Unable to connect to the Baskly authentication service. Please ensure the backend server is running on port 8080 or check your connection.",
    });
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const rawError =
      data.message ||
      data.error ||
      (data.errors ? Object.values(data.errors).join(", ") : undefined);

    let code: AuthErrorCode = "UNKNOWN_ERROR";
    let message = rawError;

    switch (res.status) {
      case 400:
        code = "VALIDATION_ERROR";
        message = rawError || "Invalid submission. Please check the entered information.";
        break;
      case 401:
        code = "UNAUTHORIZED";
        message = rawError || "Invalid email address or password. Please verify your credentials and try again.";
        break;
      case 403:
        code = "FORBIDDEN";
        message = rawError || "Access is restricted. Your account may be locked or pending verification.";
        break;
      case 404:
        code = data.errorCode === "ACCOUNT_NOT_FOUND" ? "ACCOUNT_NOT_FOUND" : "NOT_FOUND";
        message = rawError || "The requested authentication service could not be found.";
        break;
      case 409:
        code = "ACCOUNT_EXISTS";
        message = rawError || "An account already exists for this Google account. Please sign in instead.";
        break;
      case 429:
        code = "RATE_LIMITED";
        message = rawError || "Too many attempts. Please wait a few moments before trying again.";
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        code = "SERVER_ERROR";
        // Never leak raw stack traces or internal server error strings
        message = "The authentication service is temporarily unavailable. Please try again later.";
        break;
      default:
        code = "UNKNOWN_ERROR";
        message = rawError || "An unexpected error occurred during authentication. Please try again.";
        break;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[Baskly Auth Service] HTTP ${res.status} on ${method} ${path}: ${message}`,
        { status: res.status, code, endpoint: path }
      );
    }

    throw new AuthApiError({
      code,
      status: res.status,
      message,
      details: data.errors && typeof data.errors === "object" ? data.errors : undefined,
    });
  }

  return data as T;
}

export const authApi = {
  async register(payload: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
    email: string;
    emailVerificationGrant: string;
    mobileCountryCode?: string;
    mobileNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    gender: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
    termsVersion?: string;
  }): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async googleAuth(idToken: string, intent: "SIGN_IN" | "SIGN_UP" = "SIGN_IN"): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken, intent }),
    });
  },

  async googleSignIn(idToken: string): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/google/signin", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  },

  async initGoogleSignUp(idToken: string): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/google/signup-init", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  },

  async completeGoogleRegistration(payload: {
    googleVerificationGrant: string;
    emailVerificationGrant: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    mobileCountryCode?: string;
    mobileNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    gender: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
    termsVersion?: string;
  }): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/google/complete-registration", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMe(): Promise<UserSummary> {
    return request<UserSummary>("/api/auth/me", {
      method: "GET",
    });
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>("/api/auth/logout", {
      method: "POST",
    });
  },

  async sendOtp(email: string): Promise<SendOtpResult> {
    return request<SendOtpResult>("/api/auth/email-otp/send", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResult> {
    return request<VerifyOtpResult>("/api/auth/email-otp/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>("/api/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>("/api/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
  },
};
