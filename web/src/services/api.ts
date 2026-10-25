/**
 * Baskly.money - Spring Boot Backend API Client
 * Connects Next.js to http://localhost:8080/api/v1 with graceful offline fallback
 */

function getApiV1BaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const cleaned = envUrl.replace(/\/+$/, "");
  if (cleaned.endsWith("/api/v1")) {
    return cleaned;
  }
  if (cleaned.endsWith("/api")) {
    return `${cleaned}/v1`;
  }
  return `${cleaned}/api/v1`;
}

const BACKEND_BASE_URL = getApiV1BaseUrl();

function getRequestHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (typeof window !== "undefined") {
    const directToken = localStorage.getItem("baskly_token") || sessionStorage.getItem("baskly_token");
    if (directToken) {
      headers["Authorization"] = `Bearer ${directToken}`;
    } else {
      try {
        const session = localStorage.getItem("baskly_user_session");
        if (session) {
          const parsed = JSON.parse(session);
          if (parsed?.token) {
            headers["Authorization"] = `Bearer ${parsed.token}`;
          }
        }
      } catch {
        // Ignore session parse failure
      }
    }
  }

  return headers;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchBasketsFromBackend(): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/funds`, {
      method: "GET",
      headers: getRequestHeaders(),
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json: ApiResponse<any> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null; // Graceful fallback to static baskets
  }
}

export async function fetchFundNavHistoryFromBackend(fundId: string, interval: string = "1D"): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/funds/${encodeURIComponent(fundId)}/nav?interval=${encodeURIComponent(interval)}`, {
      method: "GET",
      headers: getRequestHeaders(),
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

export async function fetchPortfolioFromBackend(userId: string = "usr_demo_retail"): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/portfolio?userId=${encodeURIComponent(userId)}`, {
      method: "GET",
      headers: getRequestHeaders(),
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

export async function buyBasketApi(userId: string, basketId: string, amountInr: number): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/orders/buy`, {
      method: "POST",
      headers: getRequestHeaders(),
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

export async function withdrawBasketApi(userId: string, basketId: string, amountInr: number): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/orders/redeem`, {
      method: "POST",
      headers: getRequestHeaders(),
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

export async function toggleMandateApi(mandateId: string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/mandates/${encodeURIComponent(mandateId)}/toggle`, {
      method: "POST",
      headers: getRequestHeaders(),
      credentials: "include",
    });
    if (!res.ok) return null;
    const json: ApiResponse<any> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function fetchManagerSummaryApi(): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/manager/summary`, {
      method: "GET",
      headers: getRequestHeaders(),
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

export async function toggleCircuitBreakerApi(): Promise<boolean | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/manager/circuit-breaker`, {
      method: "POST",
      headers: getRequestHeaders(),
      credentials: "include",
    });
    if (!res.ok) return null;
    const json: ApiResponse<boolean> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function executeRebalanceApi(basketId: string, managerName?: string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/manager/rebalance`, {
      method: "POST",
      headers: getRequestHeaders(),
      credentials: "include",
      body: JSON.stringify({ basketId, managerName }),
    });
    if (!res.ok) return null;
    const json: ApiResponse<any> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}
