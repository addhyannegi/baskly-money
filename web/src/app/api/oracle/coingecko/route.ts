import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,pendle,bonk&vs_currencies=usd";
    const res = await fetch(url, {
      headers: { "User-Agent": "BasklyPricingOracle/1.0", "Accept": "application/json" },
      cache: "no-store",
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, data: {} }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      data,
      timestamp: Date.now()
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      data: {},
      error: err.message,
      timestamp: Date.now()
    });
  }
}
