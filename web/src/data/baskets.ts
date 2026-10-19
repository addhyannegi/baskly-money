import { Basket } from "@/types/baskly";

export const BASKETS_DATA: Basket[] = [
  {
    id: "top-5-index",
    indexNum: "01",
    name: "Top-5 Bluechip Index",
    serifWord: "Bluechip",
    tagline: "The five largest digital assets, market-cap weighted & rebalanced monthly.",
    description: "The foundational index of institutional crypto. Captures 82% of total market capitalization across Bitcoin, Ethereum, Solana, BNB, and XRP. Engineered for multi-cycle compounding.",
    risk: "Balanced Core",
    riskColor: "#0F6E56",
    fee_pct: 1.25,
    min_sip: 1000,
    expected_cagr: 28.5,
    nav: 100.00,
    change_24h: 0.0,
    assets: [
      { symbol: "BTC", name: "Bitcoin", weight: 55, color: "#D97706", price_inr: 7739249 },
      { symbol: "ETH", name: "Ethereum", weight: 20, color: "#4F46E5", price_inr: 228879 },
      { symbol: "SOL", name: "Solana", weight: 10, color: "#0D9488", price_inr: 9800 },
      { symbol: "BNB", name: "BNB", weight: 8, color: "#CA8A04", price_inr: 68535 },
      { symbol: "XRP", name: "XRP", weight: 7, color: "#1E293B", price_inr: 123 }
    ]
  },
  {
    id: "crypto-gold",
    indexNum: "02",
    name: "Crypto + Gold Reserve",
    serifWord: "Reserve",
    tagline: "Digital gold meets LBMA physical gold. Dampened volatility for calm stackers.",
    description: "Pairs 50% tokenised physical gold (PAX Gold) with Bitcoin and Ethereum. Designed specifically for Indian households seeking hard-asset inflation protection with muted drawdowns.",
    risk: "Conservative",
    riskColor: "#9A7B56",
    fee_pct: 0.95,
    min_sip: 1000,
    expected_cagr: 18.2,
    nav: 100.00,
    change_24h: 0.0,
    assets: [
      { symbol: "PAXG", name: "PAX Gold (1oz LBMA)", weight: 50, color: "#B4833E", price_inr: 396642 },
      { symbol: "BTC", name: "Bitcoin", weight: 35, color: "#D97706", price_inr: 7739249 },
      { symbol: "ETH", name: "Ethereum", weight: 15, color: "#4F46E5", price_inr: 228879 }
    ]
  },
  {
    id: "bitcoin",
    indexNum: "03",
    name: "Pure Bitcoin Sovereign",
    serifWord: "Sovereign",
    tagline: "100% Bitcoin. The purest way to accumulate satoshis every month in Rupees.",
    description: "Undiluted exposure to the world's premier scarce digital monetary asset. Built for long-horizon believers executing a disciplined Rupee-Cost Averaging mandate.",
    risk: "High Conviction",
    riskColor: "#B45309",
    fee_pct: 0.75,
    min_sip: 1000,
    expected_cagr: 32.0,
    nav: 100.00,
    change_24h: 0.0,
    assets: [
      { symbol: "BTC", name: "Bitcoin", weight: 100, color: "#D97706", price_inr: 7739249 }
    ]
  },
  {
    id: "ethereum",
    indexNum: "04",
    name: "Ethereum Settlement Layer",
    serifWord: "Settlement",
    tagline: "100% Ether — the programmable backbone of global tokenised finance.",
    description: "Direct ownership of Ethereum, powering stablecoins, institutional RWA tokenisation, and decentralised financial rails.",
    risk: "High Conviction",
    riskColor: "#4338CA",
    fee_pct: 0.85,
    min_sip: 1000,
    expected_cagr: 29.0,
    nav: 100.00,
    change_24h: 0.0,
    assets: [
      { symbol: "ETH", name: "Ethereum", weight: 100, color: "#4F46E5", price_inr: 228879 }
    ]
  },
  {
    id: "defi",
    indexNum: "05",
    name: "DeFi Protocol Architects",
    serifWord: "Architects",
    tagline: "Own the cash-flowing protocols replacing traditional financial middleware.",
    description: "Research-weighted allocation into dominant on-chain liquidity, lending, and oracle infrastructure: Uniswap, Aave, Chainlink, Pendle, and Lido.",
    risk: "Aggressive Growth",
    riskColor: "#9D174D",
    fee_pct: 1.50,
    min_sip: 1000,
    expected_cagr: 38.0,
    nav: 100.00,
    change_24h: 0.0,
    assets: [
      { symbol: "UNI", name: "Uniswap", weight: 25, color: "#DB2777", price_inr: 690 },
      { symbol: "AAVE", name: "Aave Protocol", weight: 25, color: "#7C3AED", price_inr: 14793 },
      { symbol: "LINK", name: "Chainlink Oracles", weight: 25, color: "#2563EB", price_inr: 1166 },
      { symbol: "PENDLE", name: "Pendle Finance", weight: 15, color: "#0891B2", price_inr: 198 },
      { symbol: "LDO", name: "Lido DAO", weight: 10, color: "#0284C7", price_inr: 38 }
    ]
  },
  {
    id: "altcoin-meme",
    indexNum: "06",
    name: "High-Beta Cultural Index",
    serifWord: "Cultural",
    tagline: "Equal-weighted Asymmetric frontier. Strictly for <5% satellite allocation.",
    description: "Systematic momentum exposure to high-liquidity community tokens. Monthly rebalancing automatically harvests spikes and prevents single-token wipeouts.",
    risk: "Asymmetric",
    riskColor: "#B85D43",
    fee_pct: 1.75,
    min_sip: 1000,
    expected_cagr: 45.0,
    nav: 100.00,
    change_24h: 0.0,
    assets: [
      { symbol: "DOGE", name: "Dogecoin", weight: 20, color: "#A16207", price_inr: 7.6 },
      { symbol: "SHIB", name: "Shiba Inu", weight: 20, color: "#EA580C", price_inr: 0.00048 },
      { symbol: "PEPE", name: "Pepe", weight: 20, color: "#15803D", price_inr: 0.00038 },
      { symbol: "BONK", name: "Bonk", weight: 20, color: "#C2410C", price_inr: 0.00029 },
      { symbol: "WIF", name: "dogwifhat", weight: 20, color: "#78716C", price_inr: 18.87 }
    ]
  }
];

export function formatINR(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return "0";
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(Math.round(val));
}

export function formatINRCurrency(val: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(val);
}

export interface HistoricalBasketData {
  baseNav: number;
  color: string;
  high52: string;
  low52: string;
  maxDd: string;
  sharpe: string;
  inceptionDate: string;
  monthlySeries: { date: string; nav: number }[];
}

export const BASKET_HISTORICAL_DATA: Record<string, HistoricalBasketData> = {
  "top-5-index": {
    baseNav: 40.0,
    color: "#0F6E56",
    high52: "₹74.80",
    low52: "₹42.10",
    maxDd: "-21.4%",
    sharpe: "1.92",
    inceptionDate: "Oct 2023",
    monthlySeries: [
      { date: "Oct 23", nav: 40.00 }, { date: "Nov 23", nav: 42.80 }, { date: "Dec 23", nav: 46.10 },
      { date: "Jan 24", nav: 44.50 }, { date: "Feb 24", nav: 51.20 }, { date: "Mar 24", nav: 58.40 },
      { date: "Apr 24", nav: 54.10 }, { date: "May 24", nav: 56.80 }, { date: "Jun 24", nav: 53.20 },
      { date: "Jul 24", nav: 57.50 }, { date: "Aug 24", nav: 52.80 }, { date: "Sep 24", nav: 55.40 },
      { date: "Oct 24", nav: 61.20 }, { date: "Nov 24", nav: 68.50 }, { date: "Dec 24", nav: 72.40 },
      { date: "Jan 25", nav: 69.10 }, { date: "Feb 25", nav: 66.80 }, { date: "Mar 25", nav: 64.50 },
      { date: "Apr 25", nav: 62.10 }, { date: "May 25", nav: 65.40 }, { date: "Jun 25", nav: 61.80 },
      { date: "Jul 25", nav: 63.90 }, { date: "Aug 25", nav: 60.50 }, { date: "Sep 25", nav: 62.40 },
      { date: "Oct 25", nav: 65.80 }, { date: "Nov 25", nav: 67.20 }, { date: "Dec 25", nav: 66.10 },
      { date: "Jan 26", nav: 64.80 }, { date: "Feb 26", nav: 62.90 }, { date: "Mar 26", nav: 63.09 }
    ]
  },
  "crypto-gold": {
    baseNav: 58.0,
    color: "#9A7B56",
    high52: "₹86.20",
    low52: "₹68.40",
    maxDd: "-9.8%",
    sharpe: "2.41",
    inceptionDate: "Oct 2023",
    monthlySeries: [
      { date: "Oct 23", nav: 58.00 }, { date: "Nov 23", nav: 59.40 }, { date: "Dec 23", nav: 61.20 },
      { date: "Jan 24", nav: 60.80 }, { date: "Feb 24", nav: 63.50 }, { date: "Mar 24", nav: 66.80 },
      { date: "Apr 24", nav: 66.10 }, { date: "May 24", nav: 67.40 }, { date: "Jun 24", nav: 66.50 },
      { date: "Jul 24", nav: 69.20 }, { date: "Aug 24", nav: 68.80 }, { date: "Sep 24", nav: 70.40 },
      { date: "Oct 24", nav: 73.10 }, { date: "Nov 24", nav: 76.50 }, { date: "Dec 24", nav: 79.20 },
      { date: "Jan 25", nav: 78.40 }, { date: "Feb 25", nav: 79.80 }, { date: "Mar 25", nav: 80.50 },
      { date: "Apr 25", nav: 81.20 }, { date: "May 25", nav: 82.80 }, { date: "Jun 25", nav: 82.10 },
      { date: "Jul 25", nav: 83.40 }, { date: "Aug 25", nav: 82.90 }, { date: "Sep 25", nav: 84.10 },
      { date: "Oct 25", nav: 85.50 }, { date: "Nov 25", nav: 86.10 }, { date: "Dec 25", nav: 85.00 },
      { date: "Jan 26", nav: 84.20 }, { date: "Feb 26", nav: 83.10 }, { date: "Mar 26", nav: 83.58 }
    ]
  },
  "bitcoin": {
    baseNav: 32.0,
    color: "#B45309",
    high52: "₹82.50",
    low52: "₹34.80",
    maxDd: "-23.5%",
    sharpe: "1.88",
    inceptionDate: "Oct 2023",
    monthlySeries: [
      { date: "Oct 23", nav: 32.00 }, { date: "Nov 23", nav: 35.80 }, { date: "Dec 23", nav: 41.20 },
      { date: "Jan 24", nav: 39.80 }, { date: "Feb 24", nav: 48.50 }, { date: "Mar 24", nav: 58.90 },
      { date: "Apr 24", nav: 53.40 }, { date: "May 24", nav: 57.80 }, { date: "Jun 24", nav: 52.10 },
      { date: "Jul 24", nav: 56.40 }, { date: "Aug 24", nav: 50.80 }, { date: "Sep 24", nav: 54.20 },
      { date: "Oct 24", nav: 62.50 }, { date: "Nov 24", nav: 74.80 }, { date: "Dec 24", nav: 82.10 },
      { date: "Jan 25", nav: 79.50 }, { date: "Feb 25", nav: 76.20 }, { date: "Mar 25", nav: 72.80 },
      { date: "Apr 25", nav: 68.40 }, { date: "May 25", nav: 73.10 }, { date: "Jun 25", nav: 67.50 },
      { date: "Jul 25", nav: 71.20 }, { date: "Aug 25", nav: 66.80 }, { date: "Sep 25", nav: 69.40 },
      { date: "Oct 25", nav: 73.50 }, { date: "Nov 25", nav: 75.20 }, { date: "Dec 25", nav: 73.80 },
      { date: "Jan 26", nav: 72.10 }, { date: "Feb 26", nav: 69.80 }, { date: "Mar 26", nav: 70.66 }
    ]
  },
  "ethereum": {
    baseNav: 35.0,
    color: "#4338CA",
    high52: "₹69.40",
    low52: "₹36.50",
    maxDd: "-28.2%",
    sharpe: "1.74",
    inceptionDate: "Oct 2023",
    monthlySeries: [
      { date: "Oct 23", nav: 35.00 }, { date: "Nov 23", nav: 38.20 }, { date: "Dec 23", nav: 42.50 },
      { date: "Jan 24", nav: 41.00 }, { date: "Feb 24", nav: 49.20 }, { date: "Mar 24", nav: 59.80 },
      { date: "Apr 24", nav: 52.40 }, { date: "May 24", nav: 58.10 }, { date: "Jun 24", nav: 54.80 },
      { date: "Jul 24", nav: 56.20 }, { date: "Aug 24", nav: 48.50 }, { date: "Sep 24", nav: 50.10 },
      { date: "Oct 24", nav: 54.50 }, { date: "Nov 24", nav: 62.40 }, { date: "Dec 24", nav: 68.20 },
      { date: "Jan 25", nav: 64.10 }, { date: "Feb 25", nav: 61.80 }, { date: "Mar 25", nav: 58.50 },
      { date: "Apr 25", nav: 55.20 }, { date: "May 25", nav: 59.40 }, { date: "Jun 25", nav: 54.10 },
      { date: "Jul 25", nav: 57.50 }, { date: "Aug 25", nav: 53.20 }, { date: "Sep 25", nav: 55.80 },
      { date: "Oct 25", nav: 59.20 }, { date: "Nov 25", nav: 61.10 }, { date: "Dec 25", nav: 59.80 },
      { date: "Jan 26", nav: 58.40 }, { date: "Feb 26", nav: 55.90 }, { date: "Mar 26", nav: 56.74 }
    ]
  },
  "defi": {
    baseNav: 42.0,
    color: "#9D174D",
    high52: "₹76.50",
    low52: "₹39.10",
    maxDd: "-32.5%",
    sharpe: "1.65",
    inceptionDate: "Oct 2023",
    monthlySeries: [
      { date: "Oct 23", nav: 42.00 }, { date: "Nov 23", nav: 45.10 }, { date: "Dec 23", nav: 49.80 },
      { date: "Jan 24", nav: 47.20 }, { date: "Feb 24", nav: 56.40 }, { date: "Mar 24", nav: 66.20 },
      { date: "Apr 24", nav: 58.50 }, { date: "May 24", nav: 62.80 }, { date: "Jun 24", nav: 57.40 },
      { date: "Jul 24", nav: 60.10 }, { date: "Aug 24", nav: 52.80 }, { date: "Sep 24", nav: 56.20 },
      { date: "Oct 24", nav: 63.40 }, { date: "Nov 24", nav: 71.80 }, { date: "Dec 24", nav: 75.40 },
      { date: "Jan 25", nav: 72.10 }, { date: "Feb 25", nav: 69.50 }, { date: "Mar 25", nav: 66.20 },
      { date: "Apr 25", nav: 63.80 }, { date: "May 25", nav: 68.20 }, { date: "Jun 25", nav: 62.50 },
      { date: "Jul 25", nav: 66.80 }, { date: "Aug 25", nav: 61.40 }, { date: "Sep 25", nav: 64.90 },
      { date: "Oct 25", nav: 69.20 }, { date: "Nov 25", nav: 72.10 }, { date: "Dec 25", nav: 70.50 },
      { date: "Jan 26", nav: 69.10 }, { date: "Feb 26", nav: 67.20 }, { date: "Mar 26", nav: 68.06 }
    ]
  },
  "altcoin-meme": {
    baseNav: 20.0,
    color: "#B85D43",
    high52: "₹48.90",
    low52: "₹18.40",
    maxDd: "-48.5%",
    sharpe: "1.42",
    inceptionDate: "Oct 2023",
    monthlySeries: [
      { date: "Oct 23", nav: 20.00 }, { date: "Nov 23", nav: 22.50 }, { date: "Dec 23", nav: 26.80 },
      { date: "Jan 24", nav: 24.10 }, { date: "Feb 24", nav: 31.50 }, { date: "Mar 24", nav: 44.20 },
      { date: "Apr 24", nav: 36.80 }, { date: "May 24", nav: 41.50 }, { date: "Jun 24", nav: 33.20 },
      { date: "Jul 24", nav: 37.80 }, { date: "Aug 24", nav: 29.50 }, { date: "Sep 24", nav: 32.10 },
      { date: "Oct 24", nav: 39.40 }, { date: "Nov 24", nav: 47.80 }, { date: "Dec 24", nav: 46.20 },
      { date: "Jan 25", nav: 42.50 }, { date: "Feb 25", nav: 39.80 }, { date: "Mar 25", nav: 36.40 },
      { date: "Apr 25", nav: 33.10 }, { date: "May 25", nav: 38.50 }, { date: "Jun 25", nav: 32.40 },
      { date: "Jul 25", nav: 36.10 }, { date: "Aug 25", nav: 31.80 }, { date: "Sep 25", nav: 34.50 },
      { date: "Oct 25", nav: 38.20 }, { date: "Nov 25", nav: 40.10 }, { date: "Dec 25", nav: 38.40 },
      { date: "Jan 26", nav: 37.50 }, { date: "Feb 26", nav: 35.80 }, { date: "Mar 26", nav: 36.90 }
    ]
  }
};
