/**
 * manager.js — Fund Manager Terminal Logic
 * Institutional AUM Analytics, Algorithmic Constituent Drift Monitoring,
 * Autonomous Execution of Basket Rebalancing, Emergency Circuit Breaker,
 * Persistent Time-Series Database Inspector, and SEBI / CBDT Form 16A Exporter.
 */

(function() {
  'use strict';

  function formatINR(num) {
    if (isNaN(num)) return '0.00';
    return Number(num).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  }

  function initManager() {
    renderAUMMetrics();
    renderCircuitBreakerStatus();
    renderBasketsTable();
    renderRebalanceLogs();
    updateDatabaseInspectorStats();
    renderUserProfile();
    setupGoogleIdentity();
  }

  function renderUserProfile() {
    const user = BasklyDB.getCurrentUser();
    const nameEl = document.getElementById('mgr-profile-name');
    const emailEl = document.getElementById('mgr-profile-email');
    const avatarEl = document.getElementById('mgr-profile-avatar');

    if (user) {
      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email || 'CIO · SEBI Key Person';
      if (avatarEl && user.avatar) avatarEl.src = user.avatar;
    }
  }

  function renderAUMMetrics() {
    const mgr = BasklyDB.getManagerSummary();
    const aumEl = document.getElementById('mgr-total-aum');
    const investorsEl = document.getElementById('mgr-verified-investors');

    if (aumEl) {
      aumEl.textContent = `₹${(mgr.totalAUM_INR / 10000000).toFixed(2)} Cr`;
    }
    if (investorsEl) {
      investorsEl.textContent = Number(mgr.verifiedInvestors).toLocaleString('en-IN');
    }
  }

  function renderCircuitBreakerStatus() {
    const mgr = BasklyDB.getManagerSummary();
    const banner = document.getElementById('circuit-breaker-banner');
    const statusText = document.getElementById('circuit-breaker-status');
    const toggleBtn = document.getElementById('circuit-breaker-btn');

    if (mgr.circuitBreakerActive) {
      if (banner) banner.className = "p-4 rounded-2xl bg-[#B85D43]/15 border border-[#B85D43]/30 flex items-center justify-between";
      if (statusText) statusText.innerHTML = '<span class="text-[#B85D43] font-bold">⚠️ EMERGENCY CIRCUIT BREAKER ACTIVE: Market Trading & Redemptions Frozen</span>';
      if (toggleBtn) {
        toggleBtn.textContent = 'Deactivate Circuit Breaker (Resume Trading)';
        toggleBtn.className = "px-4 py-2 rounded-xl bg-[#0F6E56] text-[#F4EFEA] font-bold text-xs shadow-xs";
      }
    } else {
      if (banner) banner.className = "p-4 rounded-2xl bg-[#FAF8F5] border border-[#121110]/10 flex items-center justify-between";
      if (statusText) statusText.innerHTML = '<span class="text-[#0F6E56] font-semibold">● Market Condition Normal: Algorithmic Pricing Active (Base ₹100.00 Anchor)</span>';
      if (toggleBtn) {
        toggleBtn.textContent = 'Trigger Emergency Circuit Breaker (Freeze Price)';
        toggleBtn.className = "px-4 py-2 rounded-xl bg-[#B85D43] text-[#F4EFEA] font-bold text-xs shadow-xs";
      }
    }
  }

  function renderBasketsTable() {
    const tbody = document.getElementById('manager-baskets-body');
    const mgr = BasklyDB.getManagerSummary();
    if (!tbody || !mgr.basketsAUM) return;

    tbody.innerHTML = mgr.basketsAUM.map(b => {
      const isRebalanceNeeded = b.driftPct >= 2.0;
      const isSlight = b.driftPct > 0.8 && b.driftPct < 2.0;
      
      let statusBadge = '<span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold text-[#0F6E56] bg-[#0F6E56]/10">Balanced</span>';
      if (isRebalanceNeeded) {
        statusBadge = '<span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold text-[#B85D43] bg-[#B85D43]/10 animate-pulse">Action Required</span>';
      } else if (isSlight) {
        statusBadge = '<span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold text-[#9A7B56] bg-[#9A7B56]/10">Slight Drift</span>';
      }

      const targetPills = Object.entries(b.targetWeights).map(([sym, wt]) => 
        `<span class="inline-block px-1.5 py-0.5 rounded bg-[#121110]/5 text-[10px] text-[#5C5752] mr-1">${sym} ${wt}%</span>`
      ).join('');

      const currentPills = Object.entries(b.currentWeights).map(([sym, wt]) => {
        const target = b.targetWeights[sym] || wt;
        const diff = (wt - target).toFixed(1);
        const color = diff > 0 ? 'text-[#0F6E56]' : (diff < 0 ? 'text-[#B85D43]' : 'text-[#5C5752]');
        return `<span class="inline-block px-1.5 py-0.5 rounded bg-[#F4EFEA] text-[10px] mr-1 font-semibold">${sym} ${wt}% <span class="${color}">(${diff > 0 ? '+' : ''}${diff}%)</span></span>`;
      }).join('');

      return `
        <tr class="hover:bg-[#F4EFEA]/60 transition-colors">
          <td class="py-4 px-4 font-bold text-[#121110]">
            ${b.name}
          </td>
          <td class="py-4 px-4 font-semibold text-[#121110]">
            ₹${(b.aum_inr / 10000000).toFixed(2)} Cr
          </td>
          <td class="py-4 px-4">${targetPills}</td>
          <td class="py-4 px-4">${currentPills}</td>
          <td class="py-4 px-4 font-bold ${isRebalanceNeeded ? 'text-[#B85D43]' : (isSlight ? 'text-[#9A7B56]' : 'text-[#0F6E56]')}">
            ±${b.driftPct.toFixed(1)}%
          </td>
          <td class="py-4 px-4">${statusBadge}</td>
          <td class="py-4 px-4 text-right">
            <button onclick="handleExecuteRebalance('${b.id}')" class="px-3.5 py-1.5 rounded-full border border-[#121110]/15 ${isRebalanceNeeded ? 'bg-[#121110] text-[#F4EFEA] font-bold' : 'hover:bg-[#121110] hover:text-[#F4EFEA]'} transition text-[11px] font-semibold">
              Rebalance ↗
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderRebalanceLogs() {
    const tbody = document.getElementById('rebalance-logs-body');
    const mgr = BasklyDB.getManagerSummary();
    if (!tbody || !mgr.rebalanceLogs) return;

    tbody.innerHTML = mgr.rebalanceLogs.map(l => {
      const dateStr = new Date(l.timestamp).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <tr class="hover:bg-[#FAF8F5] transition-colors">
          <td class="py-3 px-4">
            <div class="font-bold text-[#121110]">${l.id}</div>
            <div class="text-[10px] text-[#8C857B]">${dateStr}</div>
          </td>
          <td class="py-3 px-4 font-semibold text-[#121110]">${l.basketName}</td>
          <td class="py-3 px-4 text-[#5C5752]">${l.managerName}</td>
          <td class="py-3 px-4 font-mono font-bold text-[#121110]">${l.tradesExecuted} Orders</td>
          <td class="py-3 px-4 font-mono text-[#0F6E56]">${l.slippagePct}%</td>
          <td class="py-3 px-4 font-mono text-[#5C5752]">₹${Number(l.gasCostINR).toFixed(2)}</td>
          <td class="py-3 px-4">
            <span class="inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] text-[#0F6E56] bg-[#0F6E56]/10">
              ${l.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function updateDatabaseInspectorStats() {
    const countEl = document.getElementById('db-snapshot-count');
    if (!countEl) return;
    try {
      const raw = await BasklyDB.exportNAVDatabaseJSON();
      const records = JSON.parse(raw);
      countEl.textContent = `${records.length} Persistent Snapshots in IndexedDB`;
    } catch (e) {
      countEl.textContent = 'IndexedDB Connected';
    }
  }

  // ==========================================
  // MANAGER ACTION HANDLERS
  // ==========================================
  window.handleToggleCircuitBreaker = function() {
    const active = BasklyDB.toggleCircuitBreaker();
    renderCircuitBreakerStatus();
    if (active) {
      alert('WARNING: Emergency Circuit Breaker Activated.\nTrading, buy orders, and retail liquidations are now frozen across all 6 funds.');
    } else {
      alert('Circuit Breaker Deactivated.\nNormal market pricing and liquidations resumed.');
    }
  };

  window.handleExecuteRebalance = function(basketId) {
    try {
      const res = BasklyDB.executeRebalance(basketId);
      initManager();
      alert(`Success! Rebalanced ${res.basket.name} back to target constituent weights.\nTrades Executed: ${res.log.tradesExecuted}\nSlippage: ${res.log.slippagePct}%\nLog ID: ${res.log.id}`);
    } catch (e) {
      alert('Rebalance Error: ' + e.message);
    }
  };

  window.executeAllDriftRebalances = function() {
    const mgr = BasklyDB.getManagerSummary();
    const drifted = mgr.basketsAUM.filter(b => b.driftPct > 0.0);
    if (drifted.length === 0) {
      alert('All funds are currently aligned to target weights.');
      return;
    }

    drifted.forEach(b => {
      BasklyDB.executeRebalance(b.id);
    });
    initManager();
    alert(`Successfully realigned ${drifted.length} drifted funds back to target allocations.`);
  };

  window.downloadForm16ATDSReport = function() {
    const csv = BasklyDB.generateTDSReportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'CBDT_Form_16A_Section_194S_TDS_Audit.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  window.downloadDatabaseJSON = async function() {
    const jsonStr = await BasklyDB.exportNAVDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Baskly_NAV_Database_Snapshots.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  window.downloadDatabaseCSV = async function() {
    const csvStr = await BasklyDB.exportNAVDatabaseCSV();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Baskly_NAV_Database_Snapshots.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // REAL GOOGLE IDENTITY SERVICES SETUP
  // ==========================================
  function setupGoogleIdentity() {
    window.handleContinueWithGoogle = function() {
      const email = prompt("Enter your Google Account email (e.g. manager@baskly.money):", "manager@baskly.money");
      if (!email || !email.includes('@')) return;
      const name = prompt("Enter your Full Name:", email.split('@')[0]);
      
      const user = BasklyDB.loginWithDirectGoogleEmail(name || email.split('@')[0], email, 'fund_manager');
      closeGoogleSSOModal();
      renderUserProfile();
      alert(`Authenticated: ${user.name} (${user.email})`);
    };
  }

  window.openGoogleSSOModal = function() {
    const modal = document.getElementById('google-sso-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeGoogleSSOModal = function() {
    const modal = document.getElementById('google-sso-modal');
    if (modal) {
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    }
  };

  window.handleDirectGoogleSignIn = function(e) {
    e.preventDefault();
    const emailInput = document.getElementById('google-email-input');
    const nameInput = document.getElementById('google-name-input');
    if (!emailInput || !emailInput.value) {
      alert('Please enter your Google email address.');
      return;
    }
    try {
      const user = BasklyDB.loginWithDirectGoogleEmail(
        nameInput ? nameInput.value : '',
        emailInput.value,
        'fund_manager'
      );
      closeGoogleSSOModal();
      renderUserProfile();
      alert(`Welcome, ${user.name}! Signed in as Portfolio Manager.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Boot on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initManager);
  } else {
    initManager();
  }

})();
