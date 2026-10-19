/**
 * Baskly.money - Spring Boot Backend API Client
 * Connects Next.js to http://localhost:8080/api/v1 with graceful offline fallback
 */

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchBasketsFromBackend(): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/baskets`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json: ApiResponse<any> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null; // Graceful fallback to static baskets
  }
}

export async function fetchPortfolioFromBackend(userId: string = "usr_demo_retail"): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/portfolio?userId=${encodeURIComponent(userId)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch(`${BACKEND_BASE_URL}/orders/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ basketId, managerName }),
    });
    if (!res.ok) return null;
    const json: ApiResponse<any> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}
