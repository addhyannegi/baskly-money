export type UserRole = 'CUSTOMER' | 'ADMIN' | 'FUND_MANAGER' | 'SUPPORT' | 'retail' | 'fund_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  givenName: string;
  role: UserRole;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  pan: string;
  signedInAt: string;
  defaultDashboardPath?: string;
}

export interface BasketAsset {
  symbol: string;
  name: string;
  weight: number; // percentage (e.g. 55 for 55%)
  color?: string;
  basePrice?: number;
  price_inr?: number;
}

export interface Basket {
  id: string;
  indexNum: string;
  name: string;
  serifWord: string;
  tagline: string;
  description: string;
  risk: string;
  riskColor: string;
  fee_pct: number;
  min_sip: number;
  expected_cagr: number;
  nav: number; // Inception base is 100.00
  change_24h: number;
  assets: BasketAsset[];
  initialBaseSum?: number;
}

export interface Holding {
  basketId: string;
  basketName: string;
  units: number;
  avgBuyNav: number;
  investedAmountINR: number;
  purchasedDate: string;
  liveNav?: number;
  currentValueINR?: number;
  profitINR?: number;
  returnPct?: number;
}

export interface Mandate {
  id: string;
  basketId: string;
  basketName: string;
  monthlyAmountINR: number;
  debitDay: number | string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  vpa: string;
  nextDebitDate: string;
  frequency?: 'Daily' | 'Weekly' | 'Monthly';
  weeklyDay?: string;
  paymentRail?: 'UPI_AUTOPAY' | 'ENACH';
}

export interface Transaction {
  id: string;
  timestamp: string;
  type: 'BUY' | 'WITHDRAWAL';
  basketId: string;
  basketName: string;
  amountINR: number;
  units: number;
  nav: number;
  tdsINR: number; // Statutory 1% Section 194S TDS
  netAmountINR: number;
  status: 'SETTLED' | 'CREDITED_TO_BANK' | 'PENDING' | 'COMPLETED';
  bankRef: string;
}

export interface GrowthPoint {
  month: string;
  invested: number;
  value: number;
}

export interface Portfolio {
  cashBalanceINR: number;
  holdings: Holding[];
  mandates: Mandate[];
  transactions: Transaction[];
  growthHistory: GrowthPoint[];
}

export interface RebalanceLog {
  id: string;
  basketId: string;
  basketName: string;
  timestamp: string;
  managerName: string;
  tradesExecuted: number;
  slippagePct: number;
  gasCostINR: number;
  status: 'SUCCESS' | 'FAILED';
  reason: string;
}

export interface ManagerSummary {
  totalAUM_INR: number;
  verifiedInvestors: number;
  circuitBreakerActive: boolean;
  rebalanceLogs: RebalanceLog[];
}

export interface NavDataPoint {
  date: string;
  timestamp: number;
  nav: number;
}
