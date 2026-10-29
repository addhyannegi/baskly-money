/**
 * Baskly.money - Spring Boot Backend API Client
 * Connects Next.js to http://localhost:8080/api/v1 with graceful offline fallback
 * Provides seamless JWT Bearer auth and cookie credentials for Retail Investor Portal
 */

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

let cachedAuthToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  cachedAuthToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("baskly_jwt_token", token);
    } else {
      localStorage.removeItem("baskly_jwt_token");
    }
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};

  let token = cachedAuthToken || localStorage.getItem("baskly_jwt_token");
  if (!token) {
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "rohan@baskly.money",
          password: "CustomerPassword@123",
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.token) {
          token = json.token;
          cachedAuthToken = token;
          localStorage.setItem("baskly_jwt_token", token!);
        }
      }
    } catch {
      // Graceful offline fallback
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchBasketsFromBackend(): Promise<any[] | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/baskets`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json: ApiResponse<any[]> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null; // Graceful fallback
  }
}

export async function fetchBasketNavHistory(
  basketId: string,
  interval: "1W" | "1M" | "1Y" | "5Y" | "1D" = "1M"
): Promise<any[] | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/baskets/${encodeURIComponent(basketId)}/history?interval=${interval}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json: ApiResponse<any[]> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function fetchPortfolioFromBackend(userId: string = "usr_demo_retail"): Promise<any | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_BASE_URL}/portfolio?userId=${encodeURIComponent(userId)}`, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json: ApiResponse<any> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function buyBasketApi(
  userId: string,
  basketId: string,
  amountInr: number
): Promise<any | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_BASE_URL}/orders/buy`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ userId, basketId, amountInr }),
    });
    if (!res.ok) return null;
    const json: ApiResponse<any> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function withdrawBasketApi(
  userId: string,
  basketId: string,
  amountInr: number
): Promise<any | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_BASE_URL}/orders/withdraw`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ userId, basketId, amountInr }),
    });
    if (!res.ok) return null;
    const json: ApiResponse<any> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function createMandateApi(payload: {
  userId: string;
  basketId: string;
  monthlyAmountInr: number;
  debitDay: number;
  vpa: string;
}): Promise<any | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_BASE_URL}/mandates`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const json: ApiResponse<any> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function toggleMandateApi(mandateId: string): Promise<any | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_BASE_URL}/mandates/${encodeURIComponent(mandateId)}/toggle`, {
      method: "POST",
      headers,
      credentials: "include",
    });
    if (!res.ok) return null;
    const json: ApiResponse<any> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function downloadTdsReportBlob(userId?: string): Promise<Blob | null> {
  try {
    const headers = await getAuthHeaders();
    delete headers["Content-Type"]; // Allow browser / server to negotiate text/csv
    const url = userId
      ? `${BACKEND_BASE_URL}/reports/tds?userId=${encodeURIComponent(userId)}`
      : `${BACKEND_BASE_URL}/reports/tds`;
    const res = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

export async function fetchManagerSummaryApi(): Promise<any | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND_BASE_URL}/manager/summary`, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json: ApiResponse<any> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}
