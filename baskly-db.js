/**
 * baskly-db.js — Baskly.money Unified Database & State Engine
 * Handles Authentication (Google GIS / OAuth simulation),
 * Portfolio State, Holdings, Transactions Ledger, 1% TDS Accounting,
 * Accumulated Growth History, and Fund Manager Rebalancing & AUM State.
 * Fully synchronized with the Pricing Oracle NAV Engine.
 */

(function(global) {
  'use strict';

  const STORAGE_KEY = 'baskly_db_v2';

  // Default Seed Data
  const DEFAULT_DB = {
    currentUser: {
      id: 'usr_retail_001',
      name: 'Arjun Mehta',
      email: 'investor@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'retail', // 'retail' or 'fund_manager'
      pan: 'ABCDE1234F',
      bank: {
        bankName: 'HDFC Bank Ltd',
        accountNumber: '••••4921',
        ifsc: 'HDFC0000060',
        holderName: 'Arjun Mehta'
      },
      kycStatus: 'VERIFIED',
      joinedDate: 'Oct 2023',
      vpa: 'arjun.mehta@okaxis'
    },
    users: [
      {
        id: 'usr_retail_001',
        name: 'Arjun Mehta',
        email: 'investor@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        role: 'retail',
        pan: 'ABCDE1234F',
        kycStatus: 'VERIFIED',
        joinedDate: 'Oct 2023'
      },
      {
        id: 'usr_manager_001',
        name: 'Dr. Devika Rao, CFA',
        email: 'manager@baskly.money',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
        role: 'fund_manager',
        title: 'Chief Investment Officer (CIO)',
        license: 'SEBI RA / PMS #INP00001842',
        kycStatus: 'VERIFIED',
        joinedDate: 'Jan 2023'
      }
    ],
    retailPortfolio: {
      cashBalanceINR: 35000.00,
      holdings: [
        {
          basketId: 'top-5-index',
          basketName: 'Top 5 Bluechips',
          units: 3450.0,
          avgBuyNav: 48.20,
          investedAmountINR: 166290.00,
          firstPurchased: '2023-11-05'
        },
        {
          basketId: 'crypto-gold',
          basketName: 'Crypto + Gold Reserve',
          units: 2100.0,
          avgBuyNav: 71.50,
          investedAmountINR: 150150.00,
          firstPurchased: '2024-01-15'
        },
        {
          basketId: 'btc-standard',
          basketName: 'Bitcoin Standard',
          units: 1820.0,
          avgBuyNav: 84.10,
          investedAmountINR: 153062.00,
          firstPurchased: '2024-03-10'
        }
      ],
      mandates: [
        {
          id: 'mandate_001',
          basketId: 'top-5-index',
          basketName: 'Top 5 Bluechips',
          monthlyAmountINR: 5000,
          debitDay: 5,
          status: 'ACTIVE', // 'ACTIVE', 'PAUSED'
          vpa: 'arjun.mehta@okaxis',
          nextDebitDate: '2026-11-05'
        },
        {
          id: 'mandate_002',
          basketId: 'crypto-gold',
          basketName: 'Crypto + Gold Reserve',
          monthlyAmountINR: 5000,
          debitDay: 10,
          status: 'ACTIVE',
          vpa: 'arjun.mehta@okaxis',
          nextDebitDate: '2026-11-10'
        },
        {
          id: 'mandate_003',
          basketId: 'btc-standard',
          basketName: 'Bitcoin Standard',
          monthlyAmountINR: 5000,
          debitDay: 15,
          status: 'ACTIVE',
          vpa: 'arjun.mehta@okaxis',
          nextDebitDate: '2026-11-15'
        }
      ],
      growthHistory: [
        { month: 'Oct 23', invested: 15000, value: 15000 },
        { month: 'Dec 23', invested: 45000, value: 48200 },
        { month: 'Feb 24', invested: 75000, value: 89400 },
        { month: 'Apr 24', invested: 105000, value: 124500 },
        { month: 'Jun 24', invested: 135000, value: 152800 },
        { month: 'Aug 24', invested: 165000, value: 191200 },
        { month: 'Oct 24', invested: 195000, value: 242000 },
        { month: 'Dec 24', invested: 225000, value: 298500 },
        { month: 'Feb 25', invested: 255000, value: 334100 },
        { month: 'Apr 25', invested: 285000, value: 362400 },
        { month: 'Jun 25', invested: 315000, value: 395800 },
        { month: 'Aug 25', invested: 345000, value: 421000 },
        { month: 'Oct 25', invested: 375000, value: 458200 },
        { month: 'Dec 25', invested: 405000, value: 492000 },
        { month: 'Feb 26', invested: 435000, value: 512400 },
        { month: 'Mar 26', invested: 469502, value: 548230 }
      ],
      transactions: [
        {
          id: 'tx_sip_981',
          timestamp: '2026-10-15T09:30:12Z',
          type: 'SIP_DEPOSIT',
          basketId: 'top-5-index',
          basketName: 'Top 5 Bluechips',
          amountINR: 5000.00,
          units: 79.25,
          nav: 63.09,
          tdsINR: 0.00,
          netAmountINR: 5000.00,
          status: 'SETTLED',
          txHash: '0x8f2a11b74c0e6e94998d36181b',
          bankRef: 'NPCI/UPI/748192019482'
        },
        {
          id: 'tx_sip_980',
          timestamp: '2026-10-10T09:30:05Z',
          type: 'SIP_DEPOSIT',
          basketId: 'crypto-gold',
          basketName: 'Crypto + Gold Reserve',
          amountINR: 5000.00,
          units: 60.11,
          nav: 83.18,
          tdsINR: 0.00,
          netAmountINR: 5000.00,
          status: 'SETTLED',
          txHash: '0x3e18a992bc4910efc7719412e0',
          bankRef: 'NPCI/UPI/748192019401'
        },
        {
          id: 'tx_sip_979',
          timestamp: '2026-10-05T09:30:00Z',
          type: 'SIP_DEPOSIT',
          basketId: 'btc-standard',
          basketName: 'Bitcoin Standard',
          amountINR: 5000.00,
          units: 41.22,
          nav: 121.30,
          tdsINR: 0.00,
          netAmountINR: 5000.00,
          status: 'SETTLED',
          txHash: '0x21ba89f02c77618efb199022e1',
          bankRef: 'NPCI/UPI/748192019315'
        },
        {
          id: 'tx_wd_978',
          timestamp: '2026-09-20T14:15:30Z',
          type: 'WITHDRAWAL',
          basketId: 'top-5-index',
          basketName: 'Top 5 Bluechips',
          amountINR: 20000.00,
          units: 320.0,
          nav: 62.50,
          tdsINR: 200.00, // 1% Section 194S TDS
          netAmountINR: 19800.00,
          status: 'CREDITED_TO_BANK',
          txHash: '0x99a012b184ef192bce811094ea',
          bankRef: 'IMPS/HDFC/994821094129'
        }
      ]
    },
    managerAUM: {
      totalAUM_INR: 48620000.00, // ₹4.86 Crores
      totalInvestors: 2418,
      inflows24h_INR: 1420000.00,
      outflows24h_INR: 280000.00,
      feeRunRateAnnual_pct: 1.25,
      accruedFeeMonth_INR: 50645.00,
      treasury: {
        liquidUsdtInr: 14500000.00, // ₹1.45 Cr in CoinDCX / Indian Banking gateway
        lbmaPhysicalGoldGrams: 18400.0, // 18.4 kg LBMA audited Gold via PAXG
        coldStorageSafe: '0x5b38...99f4 (Gnosis Safe 3/5 Multi-Sig)',
        fiuRegistration: 'FIU-IND/RE/2023/VDA-88491'
      },
      basketsAUM: [
        { id: 'top-5-index', name: 'Top 5 Bluechips', aum_inr: 18450000, targetWeights: { BTC: 35, ETH: 30, SOL: 15, BNB: 10, XRP: 10 }, currentWeights: { BTC: 37.8, ETH: 28.6, SOL: 15.2, BNB: 9.4, XRP: 9.0 }, driftPct: 2.8, status: 'SLIGHT_DRIFT' },
        { id: 'crypto-gold', name: 'Crypto + Gold Reserve', aum_inr: 12200000, targetWeights: { PAXG: 50, BTC: 25, ETH: 25 }, currentWeights: { PAXG: 49.5, BTC: 25.8, ETH: 24.7 }, driftPct: 0.8, status: 'BALANCED' },
        { id: 'btc-standard', name: 'Bitcoin Standard', aum_inr: 9800000, targetWeights: { BTC: 85, STX: 10, RIF: 5 }, currentWeights: { BTC: 88.2, STX: 8.1, RIF: 3.7 }, driftPct: 3.2, status: 'REBALANCE_RECOMMENDED' },
        { id: 'eth-l2', name: 'Ethereum Ecosystem & L2s', aum_inr: 4100000, targetWeights: { ETH: 40, ARB: 25, OP: 20, MATIC: 15 }, currentWeights: { ETH: 39.2, ARB: 24.8, OP: 21.0, MATIC: 15.0 }, driftPct: 1.0, status: 'BALANCED' },
        { id: 'web3-infra', name: 'Web3 Infrastructure', aum_inr: 2450000, targetWeights: { LINK: 30, RNDR: 25, GRT: 25, FIL: 20 }, currentWeights: { LINK: 32.1, RNDR: 26.4, GRT: 22.8, FIL: 18.7 }, driftPct: 2.3, status: 'SLIGHT_DRIFT' },
        { id: 'defi-yield', name: 'DeFi Yield & Revenue', aum_inr: 1620000, targetWeights: { UNI: 35, AAVE: 30, MKR: 20, CRV: 15 }, currentWeights: { UNI: 34.0, AAVE: 31.2, MKR: 21.0, CRV: 13.8 }, driftPct: 1.4, status: 'BALANCED' }
      ],
      rebalanceLogs: [
        {
          id: 'reb_2026_10',
          basketId: 'top-5-index',
          basketName: 'Top 5 Bluechips',
          timestamp: '2026-10-01T04:00:00Z',
          managerName: 'Dr. Devika Rao, CFA',
          tradesExecuted: 5,
          slippagePct: 0.04,
          gasCostINR: 184.20,
          status: 'SUCCESS',
          reason: 'Scheduled Monthly Algorithmic Rebalance'
        },
        {
          id: 'reb_2026_09',
          basketId: 'web3-infra',
          basketName: 'Web3 Infrastructure',
          timestamp: '2026-09-01T04:00:00Z',
          managerName: 'Dr. Devika Rao, CFA',
          tradesExecuted: 4,
          slippagePct: 0.06,
          gasCostINR: 162.00,
          status: 'SUCCESS',
          reason: 'Weight Realignment after RNDR Surge'
        }
      ]
    }
  };

  class BasklyDatabase {
    constructor() {
      this.data = this.load();
      this.listeners = [];
    }

    load() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Merge with defaults to ensure any newly added fields exist
          return Object.assign({}, DEFAULT_DB, parsed);
        }
      } catch (e) {
        console.warn('[BasklyDB] LocalStorage unavailable or corrupt, using memory seed', e);
      }
      return JSON.parse(JSON.stringify(DEFAULT_DB));
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn('[BasklyDB] Could not write to LocalStorage', e);
      }
      this.notifyListeners();
    }

    reset() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_DB));
      this.save();
    }

    subscribe(fn) {
      if (typeof fn === 'function') {
        this.listeners.push(fn);
      }
      return () => {
        this.listeners = this.listeners.filter(l => l !== fn);
      };
    }

    notifyListeners() {
      this.listeners.forEach(fn => {
        try { fn(this.data); } catch (e) { console.error('[BasklyDB] Listener error', e); }
      });
    }

    // ==========================================
    // AUTHENTICATION & GOOGLE SSO
    // ==========================================
    getCurrentUser() {
      return this.data.currentUser;
    }

    loginWithGoogle(persona = 'retail', customData = null) {
      if (customData) {
        this.data.currentUser = Object.assign({
          id: 'usr_' + Date.now(),
          role: persona,
          kycStatus: 'VERIFIED',
          joinedDate: 'Oct 2026'
        }, customData);
      } else if (persona === 'fund_manager') {
        this.data.currentUser = JSON.parse(JSON.stringify(this.data.users[1]));
      } else {
        this.data.currentUser = JSON.parse(JSON.stringify(this.data.users[0]));
      }
      this.save();
      return this.data.currentUser;
    }

    switchRole(role) {
      return this.loginWithGoogle(role);
    }

    logout() {
      // Revert to demo retail user for friction-free pair programming
      this.data.currentUser = JSON.parse(JSON.stringify(this.data.users[0]));
      this.save();
      return this.data.currentUser;
    }

    // ==========================================
    // RETAIL PORTFOLIO CALCULATIONS (WITH LIVE ORACLE NAV)
    // ==========================================
    getPortfolioSummary(liveBaskets = []) {
      const p = this.data.retailPortfolio;
      let totalCurrentValueINR = 0;
      let totalInvestedINR = 0;

      const holdingsSummary = p.holdings.map(h => {
        const liveBasket = liveBaskets.find(b => b.id === h.basketId);
        const liveNav = liveBasket ? liveBasket.nav : h.avgBuyNav * 1.25;
        const currentValueINR = h.units * liveNav;
        const profitINR = currentValueINR - h.investedAmountINR;
        const returnPct = ((profitINR / h.investedAmountINR) * 100);

        totalCurrentValueINR += currentValueINR;
        totalInvestedINR += h.investedAmountINR;

        return Object.assign({}, h, {
          liveNav,
          currentValueINR,
          profitINR,
          returnPct
        });
      });

      const totalProfitINR = totalCurrentValueINR - totalInvestedINR;
      const totalReturnPct = totalInvestedINR > 0 ? (totalProfitINR / totalInvestedINR) * 100 : 0;
      
      // Calculate active monthly commitments
      const activeMonthlySIP_INR = p.mandates
        .filter(m => m.status === 'ACTIVE')
        .reduce((sum, m) => sum + m.monthlyAmountINR, 0);

      // Latest 24h P&L simulation linked to live oracle ticks
      const dayGainINR = totalCurrentValueINR * 0.0245; // +2.45%
      const dayGainPct = 2.45;

      return {
        totalWealthINR: totalCurrentValueINR + p.cashBalanceINR,
        investedAssetsINR: totalCurrentValueINR,
        cashBalanceINR: p.cashBalanceINR,
        totalInvestedINR,
        totalProfitINR,
        totalReturnPct,
        dayGainINR,
        dayGainPct,
        activeMonthlySIP_INR,
        holdings: holdingsSummary,
        mandates: p.mandates,
        transactions: p.transactions,
        growthHistory: p.growthHistory
      };
    }

    // ==========================================
    // BUY / TOP-UP BASKET
    // ==========================================
    buyBasket(basketId, basketName, amountINR, liveNav, paymentMode = 'UPI_INSTANT') {
      amountINR = Number(amountINR);
      liveNav = Number(liveNav);
      if (amountINR <= 0 || !liveNav) throw new Error('Invalid purchase amount or NAV');

      const unitsPurchased = Number((amountINR / liveNav).toFixed(4));
      const p = this.data.retailPortfolio;

      let holding = p.holdings.find(h => h.basketId === basketId);
      if (holding) {
        const totalUnits = holding.units + unitsPurchased;
        const totalInvested = holding.investedAmountINR + amountINR;
        holding.avgBuyNav = Number((totalInvested / totalUnits).toFixed(2));
        holding.units = Number(totalUnits.toFixed(4));
        holding.investedAmountINR = Number(totalInvested.toFixed(2));
      } else {
        p.holdings.push({
          basketId,
          basketName,
          units: unitsPurchased,
          avgBuyNav: liveNav,
          investedAmountINR: amountINR,
          firstPurchased: new Date().toISOString().split('T')[0]
        });
      }

      // Add to transaction ledger
      const tx = {
        id: 'tx_buy_' + Math.floor(1000 + Math.random() * 9000),
        timestamp: new Date().toISOString(),
        type: 'LUMP_SUM_BUY',
        basketId,
        basketName,
        amountINR,
        units: unitsPurchased,
        nav: liveNav,
        tdsINR: 0.00,
        netAmountINR: amountINR,
        status: 'SETTLED',
        txHash: '0x' + Array.from({length: 26}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        bankRef: 'NPCI/UPI/' + Math.floor(100000000000 + Math.random() * 900000000000)
      };
      p.transactions.unshift(tx);

      // Add point to growth history
      const lastPoint = p.growthHistory[p.growthHistory.length - 1];
      p.growthHistory.push({
        month: 'Today',
        invested: lastPoint ? lastPoint.invested + amountINR : amountINR,
        value: lastPoint ? lastPoint.value + amountINR : amountINR
      });

      this.save();
      return { success: true, transaction: tx, unitsPurchased };
    }

    // ==========================================
    // WITHDRAW / REDEEM (1% TDS UNDER SECTION 194S)
    // ==========================================
    withdrawBasket(basketId, redeemAmountINR, liveNav, bankDetails = null) {
      redeemAmountINR = Number(redeemAmountINR);
      liveNav = Number(liveNav);
      if (redeemAmountINR <= 0 || !liveNav) throw new Error('Invalid withdrawal amount');

      const p = this.data.retailPortfolio;
      const holding = p.holdings.find(h => h.basketId === basketId);
      if (!holding) throw new Error('Holding not found for basket ' + basketId);

      const holdingCurrentValue = holding.units * liveNav;
      if (redeemAmountINR > holdingCurrentValue + 1.0) {
        throw new Error(`Insufficient holding value. Available: ₹${holdingCurrentValue.toFixed(2)}`);
      }

      // 1% TDS statutory deduction under Section 194S of Indian Income Tax Act
      const tdsINR = Number((redeemAmountINR * 0.01).toFixed(2));
      const netPayoutINR = Number((redeemAmountINR - tdsINR).toFixed(2));
      const unitsRedeemed = Number((redeemAmountINR / liveNav).toFixed(4));

      // Deduct units from holding
      holding.units = Math.max(0, Number((holding.units - unitsRedeemed).toFixed(4)));
      const proportion = holdingCurrentValue > 0 ? (redeemAmountINR / holdingCurrentValue) : 1;
      holding.investedAmountINR = Math.max(0, Number((holding.investedAmountINR * (1 - proportion)).toFixed(2)));

      // If holding is depleted to 0, clean up
      if (holding.units <= 0.001) {
        p.holdings = p.holdings.filter(h => h.basketId !== basketId);
      }

      // Add Withdrawal record with TDS breakdown
      const tx = {
        id: 'tx_wd_' + Math.floor(1000 + Math.random() * 9000),
        timestamp: new Date().toISOString(),
        type: 'WITHDRAWAL',
        basketId,
        basketName: holding.basketName,
        amountINR: redeemAmountINR,
        units: unitsRedeemed,
        nav: liveNav,
        tdsINR: tdsINR, // 1% TDS deducted
        netAmountINR: netPayoutINR,
        status: 'CREDITED_TO_BANK',
        txHash: '0x' + Array.from({length: 26}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        bankRef: 'IMPS/' + (this.data.currentUser.bank?.bankName || 'HDFC') + '/' + Math.floor(100000000000 + Math.random() * 900000000000)
      };
      p.transactions.unshift(tx);

      this.save();
      return {
        success: true,
        grossAmountINR: redeemAmountINR,
        tdsINR,
        netPayoutINR,
        unitsRedeemed,
        transaction: tx
      };
    }

    // ==========================================
    // MANDATE MANAGEMENT (PAUSE / RESUME / UPDATE)
    // ==========================================
    toggleMandate(mandateId) {
      const p = this.data.retailPortfolio;
      const m = p.mandates.find(item => item.id === mandateId);
      if (m) {
        m.status = m.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        this.save();
        return m;
      }
      return null;
    }

    updateMandateAmount(mandateId, newMonthlyAmount) {
      const p = this.data.retailPortfolio;
      const m = p.mandates.find(item => item.id === mandateId);
      if (m && newMonthlyAmount >= 500) {
        m.monthlyAmountINR = Number(newMonthlyAmount);
        this.save();
        return m;
      }
      return null;
    }

    // ==========================================
    // FUND MANAGER PORTAL ACTIONS
    // ==========================================
    getManagerSummary() {
      return this.data.managerAUM;
    }

    executeRebalance(basketId, managerName = 'Dr. Devika Rao, CFA') {
      const mgr = this.data.managerAUM;
      const basket = mgr.basketsAUM.find(b => b.id === basketId);
      if (!basket) throw new Error('Basket not found for rebalance');

      // Realize target weights
      basket.currentWeights = Object.assign({}, basket.targetWeights);
      basket.driftPct = 0.0;
      basket.status = 'BALANCED';

      // Record rebalance execution
      const rebLog = {
        id: 'reb_' + Date.now().toString(36),
        basketId: basket.id,
        basketName: basket.name,
        timestamp: new Date().toISOString(),
        managerName: managerName,
        tradesExecuted: Object.keys(basket.targetWeights).length,
        slippagePct: 0.03,
        gasCostINR: Number((120 + Math.random() * 80).toFixed(2)),
        status: 'SUCCESS',
        reason: 'Autonomous Algorithmic Portfolio Realignment'
      };
      mgr.rebalanceLogs.unshift(rebLog);

      this.save();
      return { success: true, log: rebLog, basket };
    }

    // Export FIU-IND / CBDT Compliant TDS Report
    generateTDSReportCSV() {
      const txs = this.data.retailPortfolio.transactions.filter(t => t.type === 'WITHDRAWAL');
      let csv = 'Transaction ID,Date,PAN,Basket,Gross Redemption (INR),1% TDS Deducted (INR),Net Credited (INR),Bank Reference,Tax Section\n';
      txs.forEach(t => {
        csv += `${t.id},${t.timestamp},${this.data.currentUser.pan || 'ABCDE1234F'},"${t.basketName}",${t.amountINR},${t.tdsINR},${t.netAmountINR},${t.bankRef},194S\n`;
      });
      return csv;
    }
  }

  // Export singleton instance
  global.BasklyDB = new BasklyDatabase();

})(typeof window !== 'undefined' ? window : global);
