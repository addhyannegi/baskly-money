/**
 * manager.js — Fund Manager Terminal Logic
 * Institutional AUM Analytics, Algorithmic Constituent Drift Monitoring,
 * Autonomous Execution of Basket Rebalancing, and Treasury Audit Feeds.
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
    renderBasketsTable();
    renderRebalanceLogs();
  }

  function renderAUMMetrics() {
    const mgr = BasklyDB.getManagerSummary();
    const aumEl = document.getElementById('mgr-total-aum');
    if (aumEl) {
      aumEl.textContent = `₹${(mgr.totalAUM_INR / 10000000).toFixed(2)} Cr`;
    }
  }

  function renderBasketsTable() {
    const tbody = document.getElementById('manager-baskets-body');
    const mgr = BasklyDB.getManagerSummary();
    if (!tbody || !mgr.basketsAUM) return;

    tbody.innerHTML = mgr.basketsAUM.map(b => {
      const isRebalanceNeeded = b.driftPct >= 2.5;
      const isSlight = b.driftPct > 1.2 && b.driftPct < 2.5;
      
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
          <td class="py-3 px-4 font-mono text-[#5C5752]">₹${l.gasCostINR.toFixed(2)}</td>
          <td class="py-3 px-4">
            <span class="inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] text-[#0F6E56] bg-[#0F6E56]/10">
              ${l.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

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

  // Boot on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initManager);
  } else {
    initManager();
  }

})();
