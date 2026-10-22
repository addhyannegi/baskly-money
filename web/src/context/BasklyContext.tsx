"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User, 
  UserRole, 
  Basket, 
  Portfolio, 
  ManagerSummary, 
  Transaction, 
  RebalanceLog 
} from "@/types/baskly";
import { BASKETS_DATA } from "@/data/baskets";
import { pricingOracle, ClientOracleState } from "@/services/pricingOracle";
import { authApi } from "@/services/authApi";

interface BasklyContextType {
  user: User | null;
  baskets: Basket[];
  portfolio: Portfolio;
  manager: ManagerSummary;
  oracleState: ClientOracleState;
  lastUpdatedSymbol: string | null;
  inspectedBasketId: string | null;
  isUPIModalOpen: boolean;
  isOracleModalOpen: boolean;
  isAuthModalOpen: boolean;
  setUserFromBackend: (user: any) => void;
  login: (name: string, email: string, role?: UserRole) => User;
  logout: () => void;
  buyBasket: (basketId: string, amountINR: number) => Transaction;
  withdrawBasket: (basketId: string, amountINR: number) => { gross: number; tds: number; net: number; tx: Transaction };
  toggleMandate: (mandateId: string) => void;
  toggleCircuitBreaker: () => boolean;
  executeRebalance: (basketId: string, managerName?: string) => RebalanceLog;
  openBasketInspector: (id: string) => void;
  closeBasketInspector: () => void;
  openUPIModal: () => void;
  closeUPIModal: () => void;
  openOracleModal: () => void;
  closeOracleModal: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const BasklyContext = createContext<BasklyContextType | undefined>(undefined);

const INITIAL_PORTFOLIO: Portfolio = {
  cashBalanceINR: 25000.0,
  holdings: [
    {
      basketId: "top-5-index",
      basketName: "Top-5 Bluechip Index",
      units: 1500.0,
      avgBuyNav: 100.0,
      investedAmountINR: 150000.0,
      purchasedDate: "2026-10-18T10:00:00.000Z",
    },
    {
      basketId: "crypto-gold",
      basketName: "Crypto + Gold Reserve",
      units: 1000.0,
      avgBuyNav: 100.0,
      investedAmountINR: 100000.0,
      purchasedDate: "2026-10-19T10:00:00.000Z",
    },
    {
      basketId: "bitcoin",
      basketName: "Pure Bitcoin Sovereign",
      units: 500.0,
      avgBuyNav: 100.0,
      investedAmountINR: 50000.0,
      purchasedDate: "2026-10-20T10:00:00.000Z",
    },
  ],
  mandates: [
    {
      id: "mandate_auto_1",
      basketId: "top-5-index",
      basketName: "Top-5 Bluechip Index",
      monthlyAmountINR: 5000,
      debitDay: 5,
      status: "ACTIVE",
      vpa: "investor@okhdfcbank",
      nextDebitDate: "2026-11-05",
    },
    {
      id: "mandate_auto_2",
      basketId: "crypto-gold",
      basketName: "Crypto + Gold Reserve",
      monthlyAmountINR: 3000,
      debitDay: 10,
      status: "ACTIVE",
      vpa: "investor@okhdfcbank",
      nextDebitDate: "2026-11-10",
    },
  ],
  transactions: [
    {
      id: "tx_init_1",
      timestamp: "2026-10-18T10:00:00.000Z",
      type: "BUY",
      basketId: "top-5-index",
      basketName: "Top-5 Bluechip Index",
      amountINR: 150000.0,
      units: 1500.0,
      nav: 100.0,
      tdsINR: 0.0,
      netAmountINR: 150000.0,
      status: "SETTLED",
      bankRef: "NPCI/UPI/729104819201",
    },
    {
      id: "tx_init_2",
      timestamp: "2026-10-19T10:00:00.000Z",
      type: "BUY",
      basketId: "crypto-gold",
      basketName: "Crypto + Gold Reserve",
      amountINR: 100000.0,
      units: 1000.0,
      nav: 100.0,
      tdsINR: 0.0,
      netAmountINR: 100000.0,
      status: "SETTLED",
      bankRef: "NPCI/UPI/819203948172",
    },
  ],
  growthHistory: [
    { month: "May", invested: 100000, value: 100000 },
    { month: "Jun", invested: 150000, value: 154200 },
    { month: "Jul", invested: 200000, value: 211500 },
    { month: "Aug", invested: 250000, value: 268900 },
    { month: "Sep", invested: 300000, value: 319400 },
    { month: "Oct (Today)", invested: 300000, value: 324850 },
  ],
};

const INITIAL_MANAGER: ManagerSummary = {
  totalAUM_INR: 48620000.0,
  verifiedInvestors: 2418,
  circuitBreakerActive: false,
  rebalanceLogs: [
    {
      id: "reb_init_01",
      basketId: "top-5-index",
      basketName: "Top-5 Bluechip Index",
      timestamp: "2026-10-17T17:30:00.000Z",
      managerName: "CIO Algorithmic Engine",
      tradesExecuted: 5,
      slippagePct: 0.02,
      gasCostINR: 124.5,
      status: "SUCCESS",
      reason: "Scheduled Monthly Realignment to Base Target Weights",
    },
  ],
};

export function BasklyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [baskets, setBaskets] = useState<Basket[]>(BASKETS_DATA);
  const [portfolio, setPortfolio] = useState<Portfolio>(INITIAL_PORTFOLIO);
  const [manager, setManager] = useState<ManagerSummary>(INITIAL_MANAGER);

  // Modals state
  const [inspectedBasketId, setInspectedBasketId] = useState<string | null>(null);
  const [isUPIModalOpen, setIsUPIModalOpen] = useState(false);
  const [isOracleModalOpen, setIsOracleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Live Pricing Oracle State
  const [oracleState, setOracleState] = useState<ClientOracleState>(pricingOracle.getState());
  const [lastUpdatedSymbol, setLastUpdatedSymbol] = useState<string | null>(null);

  // Restore state from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("baskly_user_session");
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedPortfolio = localStorage.getItem("baskly_portfolio_state");
      if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));

      const savedManager = localStorage.getItem("baskly_manager_state");
      if (savedManager) setManager(JSON.parse(savedManager));
    } catch {}
  }, []);

  // Start Real-Time Multi-Source Pricing Oracle Engine
  useEffect(() => {
    pricingOracle.start();

    const unsubscribe = pricingOracle.subscribe((newOracleState, updatedSym) => {
      setOracleState({ ...newOracleState });
      setLastUpdatedSymbol(updatedSym || null);

      // Recalculate dynamic NAV for all baskets
      setBaskets((prevBaskets) => {
        const nextBaskets = prevBaskets.map((basket) => {
          const { nav, change24h } = pricingOracle.calculateBasketNav(basket);
          const updatedAssets = basket.assets.map((a) => {
            const tokenState = newOracleState.tokens[a.symbol];
            const isLive = tokenState && tokenState.source !== "Reference Anchor";
            return isLive ? { ...a, price_inr: tokenState.inr } : a;
          });
          return {
            ...basket,
            nav,
            change_24h: change24h,
            assets: updatedAssets,
          };
        });

        // Sync portfolio holdings live NAV and valuations
        setPortfolio((prevPortfolio) => {
          const updatedHoldings = prevPortfolio.holdings.map((h) => {
            const basket = nextBaskets.find((b) => b.id === h.basketId);
            const liveNav = basket?.nav || h.avgBuyNav || 100.0;
            const currentVal = Number((h.units * liveNav).toFixed(2));
            const profit = Number((currentVal - h.investedAmountINR).toFixed(2));
            const retPct = h.investedAmountINR > 0
              ? Number((((currentVal - h.investedAmountINR) / h.investedAmountINR) * 100).toFixed(2))
              : 0;
            return {
              ...h,
              liveNav,
              currentValueINR: currentVal,
              profitINR: profit,
              returnPct: retPct,
            };
          });
          return {
            ...prevPortfolio,
            holdings: updatedHoldings,
          };
        });

        return nextBaskets;
      });
    });

    return () => {
      unsubscribe();
      pricingOracle.stop();
    };
  }, []);

  const setUserFromBackend = (backendUser: any) => {
    const formattedUser: User = {
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      avatar: backendUser.avatar,
      givenName: backendUser.givenName || backendUser.name.split(" ")[0],
      role: backendUser.role as UserRole,
      kycStatus: "VERIFIED",
      pan: backendUser.pan || "ABCDE1234F",
      signedInAt: backendUser.signedInAt || new Date().toISOString(),
      defaultDashboardPath: backendUser.defaultDashboardPath,
    };
    setUser(formattedUser);
    try {
      localStorage.setItem("baskly_user_session", JSON.stringify(formattedUser));
    } catch {}
  };

  const login = (name: string, email: string, role: UserRole = "retail"): User => {
    const trimmedName = name.trim() || email.split("@")[0];
    const newUser: User = {
      id: "usr_" + Math.abs(email.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
      name: trimmedName,
      email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmedName)}`,
      givenName: trimmedName.split(" ")[0],
      role,
      kycStatus: "VERIFIED",
      pan: "ABCDE" + Math.floor(1000 + Math.random() * 9000) + "F",
      signedInAt: new Date().toISOString(),
    };
    setUser(newUser);
    try {
      localStorage.setItem("baskly_user_session", JSON.stringify(newUser));
    } catch {}
    return newUser;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("baskly_user_session");
    } catch {}
  };

  const buyBasket = (basketId: string, amountINR: number): Transaction => {
    if (manager.circuitBreakerActive) {
      throw new Error("Circuit Breaker is Active. Market purchases are temporarily halted for volatility protection.");
    }

    const basket = baskets.find((b) => b.id === basketId) || baskets[0];
    const liveNav = basket.nav || 100.0;
    const units = Number((amountINR / liveNav).toFixed(4));

    const newHoldings = [...portfolio.holdings];
    const existingIndex = newHoldings.findIndex((h) => h.basketId === basketId);

    if (existingIndex >= 0) {
      const h = newHoldings[existingIndex];
      const totalUnits = Number((h.units + units).toFixed(4));
      const totalInv = Number((h.investedAmountINR + amountINR).toFixed(2));
      newHoldings[existingIndex] = {
        ...h,
        units: totalUnits,
        investedAmountINR: totalInv,
        avgBuyNav: Number((totalInv / totalUnits).toFixed(2)),
      };
    } else {
      newHoldings.push({
        basketId,
        basketName: basket.name,
        units,
        avgBuyNav: liveNav,
        investedAmountINR: amountINR,
        purchasedDate: new Date().toISOString(),
      });
    }

    const newTx: Transaction = {
      id: "tx_" + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      type: "BUY",
      basketId,
      basketName: basket.name,
      amountINR,
      units,
      nav: liveNav,
      tdsINR: 0.0,
      netAmountINR: amountINR,
      status: "SETTLED",
      bankRef: "NPCI/UPI/" + Math.floor(100000000000 + Math.random() * 900000000000),
    };

    const updatedPortfolio: Portfolio = {
      ...portfolio,
      holdings: newHoldings,
      transactions: [newTx, ...portfolio.transactions],
    };

    setPortfolio(updatedPortfolio);
    try {
      localStorage.setItem("baskly_portfolio_state", JSON.stringify(updatedPortfolio));
    } catch {}

    return newTx;
  };

  const withdrawBasket = (basketId: string, amountINR: number) => {
    if (manager.circuitBreakerActive) {
      throw new Error("Circuit Breaker is Active. Redemptions are temporarily paused to protect liquidity.");
    }

    const holding = portfolio.holdings.find((h) => h.basketId === basketId);
    if (!holding) throw new Error("Holding not found in portfolio");

    const basket = baskets.find((b) => b.id === basketId) || baskets[0];
    const liveNav = basket.nav || 100.0;

    // Statutory 1% TDS under Section 194S
    const tdsINR = Number((amountINR * 0.01).toFixed(2));
    const netPayoutINR = Number((amountINR - tdsINR).toFixed(2));
    const unitsRedeemed = Number((amountINR / liveNav).toFixed(4));

    let updatedHoldings = portfolio.holdings.map((h) => {
      if (h.basketId !== basketId) return h;
      const remainingUnits = Math.max(0, Number((h.units - unitsRedeemed).toFixed(4)));
      const proportion = amountINR / (h.units * liveNav + amountINR);
      const remainingInv = Math.max(0, Number((h.investedAmountINR * (1 - proportion)).toFixed(2)));
      return {
        ...h,
        units: remainingUnits,
        investedAmountINR: remainingInv,
      };
    }).filter((h) => h.units > 0.001);

    const newTx: Transaction = {
      id: "tx_wd_" + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      type: "WITHDRAWAL",
      basketId,
      basketName: holding.basketName,
      amountINR,
      units: unitsRedeemed,
      nav: liveNav,
      tdsINR,
      netAmountINR: netPayoutINR,
      status: "CREDITED_TO_BANK",
      bankRef: "IMPS/HDFC/" + Math.floor(100000000000 + Math.random() * 900000000000),
    };

    const updatedPortfolio: Portfolio = {
      ...portfolio,
      holdings: updatedHoldings,
      transactions: [newTx, ...portfolio.transactions],
    };

    setPortfolio(updatedPortfolio);
    try {
      localStorage.setItem("baskly_portfolio_state", JSON.stringify(updatedPortfolio));
    } catch {}

    return { gross: amountINR, tds: tdsINR, net: netPayoutINR, tx: newTx };
  };

  const toggleMandate = (mandateId: string) => {
    const updatedMandates = portfolio.mandates.map((m) => {
      if (m.id !== mandateId) return m;
      return {
        ...m,
        status: m.status === "ACTIVE" ? ("PAUSED" as const) : ("ACTIVE" as const),
      };
    });

    const updatedPortfolio = { ...portfolio, mandates: updatedMandates };
    setPortfolio(updatedPortfolio);
    try {
      localStorage.setItem("baskly_portfolio_state", JSON.stringify(updatedPortfolio));
    } catch {}
  };

  const toggleCircuitBreaker = (): boolean => {
    const nextVal = !manager.circuitBreakerActive;
    const updated = { ...manager, circuitBreakerActive: nextVal };
    setManager(updated);
    try {
      localStorage.setItem("baskly_manager_state", JSON.stringify(updated));
    } catch {}
    return nextVal;
  };

  const executeRebalance = (basketId: string, managerName = "CIO Algorithmic Engine"): RebalanceLog => {
    const basket = baskets.find((b) => b.id === basketId) || baskets[0];
    const log: RebalanceLog = {
      id: "reb_" + Date.now().toString(36),
      basketId,
      basketName: basket.name,
      timestamp: new Date().toISOString(),
      managerName,
      tradesExecuted: basket.assets.length,
      slippagePct: 0.02,
      gasCostINR: Number((115 + Math.random() * 45).toFixed(2)),
      status: "SUCCESS",
      reason: "Algorithmic Drift Realignment to Target Weights",
    };

    const updatedManager = {
      ...manager,
      rebalanceLogs: [log, ...manager.rebalanceLogs],
    };
    setManager(updatedManager);
    try {
      localStorage.setItem("baskly_manager_state", JSON.stringify(updatedManager));
    } catch {}

    return log;
  };

  return (
    <BasklyContext.Provider
      value={{
        user,
        baskets,
        portfolio,
        manager,
        oracleState,
        lastUpdatedSymbol,
        inspectedBasketId,
        isUPIModalOpen,
        isOracleModalOpen,
        isAuthModalOpen,
        setUserFromBackend,
        login,
        logout,
        buyBasket,
        withdrawBasket,
        toggleMandate,
        toggleCircuitBreaker,
        executeRebalance,
        openBasketInspector: (id) => setInspectedBasketId(id),
        closeBasketInspector: () => setInspectedBasketId(null),
        openUPIModal: () => setIsUPIModalOpen(true),
        closeUPIModal: () => setIsUPIModalOpen(false),
        openOracleModal: () => setIsOracleModalOpen(true),
        closeOracleModal: () => setIsOracleModalOpen(false),
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </BasklyContext.Provider>
  );
}

export function useBaskly() {
  const context = useContext(BasklyContext);
  if (!context) {
    throw new Error("useBaskly must be used within a BasklyProvider");
  }
  return context;
}
