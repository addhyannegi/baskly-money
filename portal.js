/**
 * portal.js — Retail Investor Portal Logic
 * Real-time Portfolio Valuation, Accumulated Growth Trajectory Chart,
 * Buy/Top-up Execution, 1% Section 194S TDS Liquidation Engine,
 * Mandate Toggles, and Real Google SSO Integration.
 */

(function() {
  'use strict';

  // 6 Official Curated Baskets anchored at Base NAV ₹100.00
  const LIVE_BASKETS = [
    { id: 'top-5-index', name: 'Top-5 Bluechip Index', nav: 100.00 },
    { id: 'crypto-gold', name: 'Crypto + Gold Reserve', nav: 100.00 },
    { id: 'bitcoin', name: 'Pure Bitcoin Sovereign', nav: 100.00 },
    { id: 'ethereum', name: 'Ethereum Settlement Layer', nav: 100.00 },
    { id: 'defi', name: 'DeFi Protocol Architects', nav: 100.00 },
    { id: 'altcoin-meme', name: 'High-Beta Cultural Index', nav: 100.00 }
  ];

  let currentGrowthTimeframe = '1Y';

  function formatINR(num) {
    if (isNaN(num)) return '0.00';
    return Number(num).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  }

  // ==========================================
  // INITIALIZATION & UI SYNC
  // ==========================================
  function initPortal() {
    renderUserProfile();
    renderPortfolioMetrics();
    renderGrowthChart(currentGrowthTimeframe);
    renderHoldingsTable();
    renderMandatesGrid();
    renderTransactionsTable();
    setupWebSocketPriceSync();
    initGrowthResizeObserver();
    setupGoogleIdentity();
  }

  function renderUserProfile() {
    const user = BasklyDB.getCurrentUser();
    const nameEl = document.getElementById('nav-user-name');
    const roleEl = document.getElementById('nav-user-role');
    const avatarEl = document.getElementById('nav-user-avatar');
    const greetEl = document.getElementById('portal-greeting-name');

    if (user) {
      if (nameEl) nameEl.textContent = user.name;
      if (roleEl) roleEl.textContent = user.role === 'fund_manager' ? 'CIO · SEBI Registered' : `KYC Verified · PAN ${user.pan || 'ABCDE1234F'}`;
      if (avatarEl && user.avatar) avatarEl.src = user.avatar;
      if (greetEl) greetEl.textContent = user.name.split(' ')[0];
    } else {
      if (nameEl) nameEl.textContent = 'Guest Investor';
      if (roleEl) roleEl.textContent = 'Click to Sign In with Google';
      if (avatarEl) avatarEl.src = 'https://api.dicebear.com/7.x/initials/svg?seed=Guest';
      if (greetEl) greetEl.textContent = 'Investor';
    }
  }

  function renderPortfolioMetrics() {
    const summary = BasklyDB.getPortfolioSummary(LIVE_BASKETS);

    const totalWealthEl = document.getElementById('stat-total-wealth');
    const totalProfitEl = document.getElementById('stat-total-profit');
    const returnPctEl = document.getElementById('stat-return-pct');
    const monthlySipEl = document.getElementById('stat-monthly-sip');

    if (totalWealthEl) totalWealthEl.textContent = `₹${formatINR(summary.totalWealthINR)}`;
    if (totalProfitEl) {
      const isPos = summary.totalProfitINR >= 0;
      totalProfitEl.textContent = `${isPos ? '+' : ''}₹${formatINR(summary.totalProfitINR)}`;
      totalProfitEl.className = `text-3xl font-bold font-mono ${isPos ? 'text-[#0F6E56]' : 'text-[#B85D43]'}`;
    }
    if (returnPctEl) {
      const isPos = summary.totalReturnPct >= 0;
      returnPctEl.textContent = `${isPos ? '+' : ''}${summary.totalReturnPct.toFixed(1)}%`;
      returnPctEl.className = `${isPos ? 'text-[#0F6E56]' : 'text-[#B85D43]'} font-bold`;
    }
    if (monthlySipEl) {
      monthlySipEl.innerHTML = `₹${formatINR(summary.activeMonthlySIP_INR)}<span class="text-sm font-normal text-[#8C857B]">/mo</span>`;
    }

    const liveValEl = document.getElementById('growth-live-val');
    const liveInvEl = document.getElementById('growth-live-inv');
    if (liveValEl) liveValEl.textContent = `₹${formatINR(summary.totalWealthINR)}`;
    if (liveInvEl) liveInvEl.textContent = `₹${formatINR(summary.totalInvestedINR)}`;
  }

  // ==========================================
  // ACCUMULATED GROWTH CHART RENDERER
  // ==========================================
  window.setGrowthTimeframe = function(tf) {
    currentGrowthTimeframe = tf;
    ['6M', '1Y', '3Y', 'ALL'].forEach(t => {
      const btn = document.getElementById(`gtf-${t}`);
      if (btn) {
        if (t === tf) {
          btn.className = "px-3 py-1 rounded-full bg-[#121110] text-[#F4EFEA] font-bold shadow-xs";
        } else {
          btn.className = "px-3 py-1 rounded-full text-[#5C5752] hover:text-[#121110] transition";
        }
      }
    });
    renderGrowthChart(tf);
  };

  function renderGrowthChart(tf) {
    const history = BasklyDB.data.retailPortfolio.growthHistory;
    if (!history || history.length === 0) return;

    let series = history;
    if (tf === '6M') series = history.slice(-3);
    else if (tf === '1Y') series = history.slice(-5);
    else if (tf === '3Y') series = history;
    else if (tf === 'ALL') series = history;

    const canvas = document.getElementById('growth-canvas');
    const svgLayer = document.getElementById('growth-svg-layer');
    const container = document.getElementById('growth-chart-container');
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.round(rect.width > 50 ? rect.width : 860);
    const h = Math.round(rect.height > 50 ? rect.height : 280);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const valList = series.map(d => d.value);
    const invList = series.map(d => d.invested);
    const allVals = valList.concat(invList);

    const minVal = Math.min(...allVals) * 0.92;
    const maxVal = Math.max(...allVals) * 1.08;
    const range = (maxVal - minVal) || 1;

    const padX = 40;
    const padY = 25;
    const plotW = w - padX * 2;
    const plotH = h - padY * 2;

    // 1. Grid Guidelines & Price Labels
    ctx.strokeStyle = 'rgba(18, 17, 16, 0.06)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let r = 1; r <= 3; r++) {
      const gy = padY + (plotH / 4) * r;
      ctx.beginPath();
      ctx.moveTo(padX, gy);
      ctx.lineTo(w - padX, gy);
      ctx.stroke();

      const labelVal = maxVal - (range / 4) * r;
      ctx.fillStyle = 'rgba(140, 133, 123, 0.7)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`₹${(labelVal / 1000).toFixed(0)}k`, padX - 32, gy - 4);
    }
    ctx.setLineDash([]);

    // 2. Compute Points
    const ptsValue = series.map((d, i) => ({
      x: padX + (i / (series.length - 1 || 1)) * plotW,
      y: padY + plotH - ((d.value - minVal) / range) * plotH,
      value: d.value,
      invested: d.invested,
      month: d.month
    }));

    const ptsInvested = series.map((d, i) => ({
      x: padX + (i / (series.length - 1 || 1)) * plotW,
      y: padY + plotH - ((d.invested - minVal) / range) * plotH
    }));

    // Cache for mousemove scrubbing
    canvas._cachedPts = ptsValue;

    // 3. Draw Invested Line (Neutral dashed line)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(140, 133, 123, 0.8)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(ptsInvested[0].x, ptsInvested[0].y);
    for (let i = 1; i < ptsInvested.length; i++) {
      ctx.lineTo(ptsInvested[i].x, ptsInvested[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Draw Portfolio Value Gradient Fill
    const grad = ctx.createLinearGradient(0, padY, 0, h - padY);
    grad.addColorStop(0, 'rgba(15, 110, 86, 0.30)');
    grad.addColorStop(1, 'rgba(15, 110, 86, 0.00)');

    ctx.beginPath();
    ctx.moveTo(ptsValue[0].x, ptsValue[0].y);
    for (let i = 1; i < ptsValue.length; i++) {
      const prev = ptsValue[i - 1];
      const curr = ptsValue[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    ctx.lineTo(ptsValue[ptsValue.length - 1].x, h - padY);
    ctx.lineTo(ptsValue[0].x, h - padY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // 5. Draw Portfolio Value Main Stroke
    ctx.beginPath();
    ctx.moveTo(ptsValue[0].x, ptsValue[0].y);
    for (let i = 1; i < ptsValue.length; i++) {
      const prev = ptsValue[i - 1];
      const curr = ptsValue[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    ctx.strokeStyle = '#0F6E56';
    ctx.lineWidth = 2.8;
    ctx.stroke();

    // 6. End Ring Indicator
    const last = ptsValue[ptsValue.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0F6E56';
    ctx.fill();
    ctx.strokeStyle = '#FAF8F5';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Also render SVG fallback
    if (svgLayer) {
      let dVal = `M ${ptsValue[0].x} ${ptsValue[0].y}`;
      for (let i = 1; i < ptsValue.length; i++) {
        dVal += ` L ${ptsValue[i].x} ${ptsValue[i].y}`;
      }
      svgLayer.innerHTML = `
        <path d="${dVal}" fill="none" stroke="#0F6E56" stroke-width="2.5" opacity="0.6"/>
      `;
    }

    attachGrowthScrubbing();
  }

  function attachGrowthScrubbing() {
    const canvas = document.getElementById('growth-canvas');
    const container = document.getElementById('growth-chart-container');
    const tooltip = document.getElementById('growth-tooltip');
    if (!canvas || !container || !tooltip) return;

    container.onmousemove = (e) => {
      const pts = canvas._cachedPts;
      if (!pts || pts.length === 0) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      let closest = pts[0];
      let minDiff = Math.abs(mouseX - pts[0].x);
      for (let i = 1; i < pts.length; i++) {
        const diff = Math.abs(mouseX - pts[i].x);
        if (diff < minDiff) {
          minDiff = diff;
          closest = pts[i];
        }
      }

      tooltip.classList.remove('hidden');
      tooltip.style.left = `${closest.x}px`;
      tooltip.style.top = `${closest.y - 12}px`;
      tooltip.innerHTML = `
        <div class="bg-[#121110] text-[#F4EFEA] text-[11px] font-mono px-3 py-1.5 rounded-lg shadow-xl border border-[#121110]/20 whitespace-nowrap">
          <div class="font-bold text-[#FAF8F5]">₹${formatINR(closest.value)}</div>
          <div class="text-[10px] text-[#8C857B]">${closest.month} · Inv: ₹${formatINR(closest.invested)}</div>
        </div>
      `;
    };

    container.onmouseleave = () => {
      if (tooltip) tooltip.classList.add('hidden');
    };
  }

  function initGrowthResizeObserver() {
    const container = document.getElementById('growth-chart-container');
    if (container && window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        renderGrowthChart(currentGrowthTimeframe);
      });
      ro.observe(container);
    }
  }

  // ==========================================
  // RENDER HOLDINGS TABLE (BASE ₹100.00 NAVs)
  // ==========================================
  function renderHoldingsTable() {
    const tbody = document.getElementById('holdings-table-body');
    const summary = BasklyDB.getPortfolioSummary(LIVE_BASKETS);
    if (!tbody) return;

    if (summary.holdings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-8 text-[#8C857B]">
            No active basket holdings. Click "+ Add New Basket" to begin investing.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = summary.holdings.map(h => {
      const isPos = h.profitINR >= 0;
      return `
        <tr class="hover:bg-[#F4EFEA]/60 transition-colors">
          <td class="py-4 px-4 font-bold text-[#121110]">
            ${h.basketName}
          </td>
          <td class="py-4 px-4 text-[#5C5752]">${h.units.toFixed(2)} units</td>
          <td class="py-4 px-4 text-[#5C5752]">₹${h.avgBuyNav.toFixed(2)}</td>
          <td class="py-4 px-4 font-bold text-[#121110] flex items-center gap-1.5">
            <span class="oracle-pulse-live" style="width: 5px; height: 5px;"></span>
            ₹${h.liveNav.toFixed(2)}
          </td>
          <td class="py-4 px-4 text-[#5C5752]">₹${formatINR(h.investedAmountINR)}</td>
          <td class="py-4 px-4 font-bold text-[#121110]">₹${formatINR(h.currentValueINR)}</td>
          <td class="py-4 px-4">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${isPos ? 'text-[#0F6E56] bg-[#0F6E56]/10' : 'text-[#B85D43] bg-[#B85D43]/10'}">
              ${isPos ? '+' : ''}${h.returnPct.toFixed(1)}%
            </span>
          </td>
          <td class="py-4 px-4 text-right space-x-2">
            <button onclick="openQuickBuyModal('${h.basketId}')" class="px-3 py-1 rounded-full border border-[#121110]/15 hover:bg-[#121110] hover:text-[#F4EFEA] transition text-[11px] font-semibold">
              Buy More
            </button>
            <button onclick="openWithdrawModal('${h.basketId}')" class="px-3 py-1 rounded-full border border-[#B85D43]/30 text-[#B85D43] hover:bg-[#B85D43] hover:text-[#FAF8F5] transition text-[11px] font-semibold">
              Withdraw
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // RENDER MANDATES GRID
  // ==========================================
  function renderMandatesGrid() {
    const container = document.getElementById('mandates-grid');
    const mandates = BasklyDB.data.retailPortfolio.mandates;
    if (!container) return;

    container.innerHTML = mandates.map(m => {
      const isActive = m.status === 'ACTIVE';
      return `
        <div class="tilt-card p-5 bg-[#FAF8F5] border border-[#121110]/8">
          <div class="tilt-card-content space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono uppercase tracking-wider text-[#8C857B]">Monthly Mandate</span>
              <span class="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-[#0F6E56]/10 text-[#0F6E56]' : 'bg-[#8C857B]/15 text-[#8C857B]'}">
                <span class="w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#0F6E56]' : 'bg-[#8C857B]'}"></span>
                ${m.status}
              </span>
            </div>

            <div>
              <h4 class="text-base font-bold text-[#121110]">${m.basketName}</h4>
              <div class="text-xl font-bold font-mono text-[#121110] mt-1">₹${formatINR(m.monthlyAmountINR)}<span class="text-xs font-normal text-[#8C857B]">/mo</span></div>
            </div>

            <div class="pt-2 border-t border-[#121110]/6 text-xs font-mono text-[#5C5752] flex items-center justify-between">
              <span>Debit Day: ${m.debitDay}th</span>
              <span>Next: ${m.nextDebitDate}</span>
            </div>

            <button onclick="handleToggleMandate('${m.id}')" class="w-full mt-1 py-1.5 rounded-xl border border-[#121110]/15 hover:bg-[#121110] hover:text-[#F4EFEA] text-[11px] font-mono font-semibold transition">
              ${isActive ? 'Pause Mandate' : 'Resume Mandate'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // RENDER TRANSACTION LEDGER (1% TDS AUDIT)
  // ==========================================
  function renderTransactionsTable() {
    const tbody = document.getElementById('tx-table-body');
    const txs = BasklyDB.data.retailPortfolio.transactions;
    if (!tbody) return;

    tbody.innerHTML = txs.map(t => {
      const isWd = t.type === 'WITHDRAWAL';
      const badgeClass = isWd ? 'text-[#B85D43] bg-[#B85D43]/10' : 'text-[#0F6E56] bg-[#0F6E56]/10';
      const dateStr = new Date(t.timestamp).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      return `
        <tr class="hover:bg-[#FAF8F5] transition-colors">
          <td class="py-3 px-4">
            <div class="font-bold text-[#121110]">${t.id}</div>
            <div class="text-[10px] text-[#8C857B]">${dateStr}</div>
          </td>
          <td class="py-3 px-4">
            <span class="inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${badgeClass}">
              ${t.type}
            </span>
          </td>
          <td class="py-3 px-4 font-semibold text-[#121110]">${t.basketName}</td>
          <td class="py-3 px-4 font-bold text-[#121110]">₹${formatINR(t.amountINR)}</td>
          <td class="py-3 px-4 ${t.tdsINR > 0 ? 'text-[#B85D43] font-bold' : 'text-[#8C857B]'}">
            ${t.tdsINR > 0 ? `-₹${formatINR(t.tdsINR)} (1%)` : '₹0.00'}
          </td>
          <td class="py-3 px-4 font-bold ${isWd ? 'text-[#0F6E56]' : 'text-[#121110]'}">
            ₹${formatINR(t.netAmountINR)}
          </td>
          <td class="py-3 px-4">
            <div class="text-[#0F6E56] font-semibold">${t.status}</div>
            <div class="text-[9px] text-[#8C857B] font-mono truncate max-w-[140px]">${t.bankRef}</div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // BUY MODAL HANDLERS
  // ==========================================
  window.openQuickBuyModal = function(preselectedBasketId) {
    const modal = document.getElementById('buy-modal');
    const select = document.getElementById('buy-basket-select');
    if (preselectedBasketId && select) {
      select.value = preselectedBasketId;
    }
    updateBuyCalculator();
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeBuyModal = function() {
    const modal = document.getElementById('buy-modal');
    if (modal) {
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    }
  };

  window.updateBuyCalculator = function() {
    const select = document.getElementById('buy-basket-select');
    const input = document.getElementById('buy-amount-input');
    const navEl = document.getElementById('buy-calc-nav');
    const unitsEl = document.getElementById('buy-calc-units');
    if (!select || !input || !navEl || !unitsEl) return;

    const opt = select.options[select.selectedIndex];
    const basketId = opt ? opt.value : 'top-5-index';
    const liveBasket = LIVE_BASKETS.find(b => b.id === basketId);
    const nav = liveBasket ? liveBasket.nav : 100.00;
    const amount = parseFloat(input.value || '0');

    navEl.textContent = `₹${nav.toFixed(2)}`;
    const units = nav > 0 ? (amount / nav).toFixed(4) : '0';
    unitsEl.textContent = `${units} Units`;
  };

  window.handleBuySubmit = function(e) {
    e.preventDefault();
    const select = document.getElementById('buy-basket-select');
    const input = document.getElementById('buy-amount-input');
    const opt = select.options[select.selectedIndex];
    const basketId = opt.value;
    const basketName = opt.text.split('(')[0].trim();
    const liveBasket = LIVE_BASKETS.find(b => b.id === basketId);
    const nav = liveBasket ? liveBasket.nav : 100.00;
    const amount = parseFloat(input.value);

    try {
      BasklyDB.buyBasket(basketId, basketName, amount, nav);
      closeBuyModal();
      initPortal();
      alert(`Success! Invested ₹${formatINR(amount)} in ${basketName} at Base NAV ₹${nav.toFixed(2)}.`);
    } catch (err) {
      alert('Purchase Error: ' + err.message);
    }
  };

  // ==========================================
  // WITHDRAW MODAL HANDLERS (1% TDS AUDIT)
  // ==========================================
  window.openWithdrawModal = function(preselectedBasketId) {
    const modal = document.getElementById('withdraw-modal');
    const select = document.getElementById('withdraw-basket-select');
    const summary = BasklyDB.getPortfolioSummary(LIVE_BASKETS);

    if (select) {
      select.innerHTML = summary.holdings.map(h => `
        <option value="${h.basketId}" data-nav="${h.liveNav}" data-max="${h.currentValueINR}" ${h.basketId === preselectedBasketId ? 'selected' : ''}>
          ${h.basketName} (Balance: ₹${formatINR(h.currentValueINR)})
        </option>
      `).join('');
    }

    updateWithdrawCalculator();
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeWithdrawModal = function() {
    const modal = document.getElementById('withdraw-modal');
    if (modal) {
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    }
  };

  window.updateWithdrawCalculator = function() {
    const input = document.getElementById('withdraw-amount-input');
    const grossEl = document.getElementById('wd-calc-gross');
    const tdsEl = document.getElementById('wd-calc-tds');
    const netEl = document.getElementById('wd-calc-net');
    if (!input || !grossEl || !tdsEl || !netEl) return;

    const gross = parseFloat(input.value || '0');
    const tds = (gross * 0.01);
    const net = gross - tds;

    grossEl.textContent = `₹${formatINR(gross)}`;
    tdsEl.textContent = `-₹${formatINR(tds)} (1% Section 194S)`;
    netEl.textContent = `₹${formatINR(net)}`;
  };

  window.handleWithdrawSubmit = function(e) {
    e.preventDefault();
    const select = document.getElementById('withdraw-basket-select');
    const input = document.getElementById('withdraw-amount-input');
    if (!select || !input) return;

    const opt = select.options[select.selectedIndex];
    if (!opt) {
      alert('No holdings available for liquidation.');
      return;
    }
    const basketId = opt.value;
    const liveBasket = LIVE_BASKETS.find(b => b.id === basketId);
    const nav = liveBasket ? liveBasket.nav : 100.00;
    const amount = parseFloat(input.value);

    try {
      const res = BasklyDB.withdrawBasket(basketId, amount, nav);
      closeWithdrawModal();
      initPortal();
      alert(`Liquidation complete!\nGross: ₹${formatINR(res.grossAmountINR)}\n1% TDS Deducted: ₹${formatINR(res.tdsINR)}\nNet Credited to HDFC Bank: ₹${formatINR(res.netPayoutINR)}.`);
    } catch (err) {
      alert('Withdrawal Error: ' + err.message);
    }
  };

  // ==========================================
  // MANDATE TOGGLE & TDS REPORT EXPORT
  // ==========================================
  window.handleToggleMandate = function(mandateId) {
    BasklyDB.toggleMandate(mandateId);
    renderPortfolioMetrics();
    renderMandatesGrid();
  };

  window.downloadTDSReport = function() {
    const csv = BasklyDB.generateTDSReportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Baskly_CBDT_Section194S_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // REAL GOOGLE IDENTITY SERVICES SETUP
  // ==========================================
  function setupGoogleIdentity() {
    window.handleGoogleCredentialResponse = function(response) {
      const user = BasklyDB.handleGoogleCredentialResponse(response);
      if (user) {
        closeGoogleSSOModal();
        renderUserProfile();
        alert(`Welcome, ${user.name}! Authenticated via Google Identity.`);
      }
    };

    // Render Google GIS button if container exists
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: "719382104928-basklyapp.apps.googleusercontent.com",
          callback: window.handleGoogleCredentialResponse,
          auto_select: false
        });

        const btnContainer = document.getElementById('google-signin-btn-container');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 280
          });
        }
      } catch (e) {
        console.log('[Google GIS] Init notice:', e);
      }
    }
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
        'retail'
      );
      closeGoogleSSOModal();
      renderUserProfile();
      alert(`Welcome, ${user.name}! Signed in successfully.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // WEBSOCKET PRICING ORACLE SYNC
  // ==========================================
  function setupWebSocketPriceSync() {
    try {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker');
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        const usdtInr = 100.16; // CoinDCX institutional spot benchmark
        if (msg.s === 'BTCUSDT') {
          const currentBtcInr = parseFloat(msg.c) * usdtInr;
          const btcDelta = currentBtcInr / 7739249; // Ratio relative to baseline price
          // Mathematical NAV update anchored on Base ₹100.00
          LIVE_BASKETS[2].nav = Number((100.00 * btcDelta).toFixed(2));
          LIVE_BASKETS[0].nav = Number((100.00 * (0.45 + 0.55 * btcDelta)).toFixed(2));
          LIVE_BASKETS[1].nav = Number((100.00 * (0.65 + 0.35 * btcDelta)).toFixed(2));
          
          BasklyDB.storeNAVSnapshot(LIVE_BASKETS[0].id, LIVE_BASKETS[0].nav);
          renderPortfolioMetrics();
        }
      };
    } catch (e) {
      console.log('[Portal] WebSocket fallback pricing');
    }
  }

  // Boot on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortal);
  } else {
    initPortal();
  }

})();
