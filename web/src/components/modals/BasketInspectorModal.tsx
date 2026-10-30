"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useBaskly } from "@/context/BasklyContext";
import { formatINR, BASKET_HISTORICAL_DATA } from "@/data/baskets";

type Timeframe = "1D" | "1W" | "1M" | "1Y" | "5Y";

interface ChartPoint {
  date: string;
  nav: number;
  timestamp: number;
  x: number;
  y: number;
}

/**
 * Historical time-series generator ported directly from baskly-db.js (lines 115-183)
 * Anchored at ₹100.00 Base NAV with the final node matched to the live ticking NAV.
 */
function generateHistoricalSeriesFrom100(timeframe: Timeframe, liveNav: number) {
  const today = new Date();
  const rawPoints: { date: string; nav: number; timestamp: number }[] = [];
  const BASE_NAV = 100.00;

  if (timeframe === "1D") {
    // Intraday today starting from 09:00 AM at ₹100.00 base (baskly-db.js lines 119-134)
    const count = 16;
    for (let i = 0; i <= count; i++) {
      const hour = 9 + Math.floor(i * 0.55);
      const mins = (i * 25) % 60;
      const timeLabel = `${String(hour).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
      const factor = Math.sin(i * 0.75) * 0.85 + i * 0.12;
      const nav = Number((BASE_NAV + factor).toFixed(2));
      rawPoints.push({
        date: timeLabel,
        timestamp: today.getTime() - (count - i) * 1200000,
        nav,
      });
    }
  } else if (timeframe === "1W") {
    // 7 Days starting at ₹100.00 (baskly-db.js lines 135-145)
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
    days.forEach((day, i) => {
      const delta = Math.sin(i * 0.95) * 1.6 + i * 0.35;
      rawPoints.push({
        date: day,
        timestamp: today.getTime() - (6 - i) * 86400000,
        nav: Number((BASE_NAV + delta).toFixed(2)),
      });
    });
  } else if (timeframe === "1M") {
    // 30 Days normalized from 100.00 base (baskly-db.js lines 146-157)
    for (let i = 0; i <= 30; i += 3) {
      const d = new Date(today.getTime() - (30 - i) * 86400000);
      const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const delta = Math.sin(i * 0.5) * 3.2 + i * 0.28;
      rawPoints.push({
        date: label,
        timestamp: d.getTime(),
        nav: Number((BASE_NAV + delta).toFixed(2)),
      });
    }
  } else if (timeframe === "1Y") {
    // 12 Months starting at 100.00 base (baskly-db.js lines 158-168)
    const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    months.forEach((m, i) => {
      const delta = i * 2.7 + Math.sin(i * 0.85) * 3.8;
      rawPoints.push({
        date: `${m} '26`,
        timestamp: today.getTime() - (11 - i) * 2592000000,
        nav: Number((BASE_NAV + delta).toFixed(2)),
      });
    });
  } else {
    // 5Y compounding from 100.00 base (baskly-db.js lines 169-180)
    const years = ["2021", "2022", "2023", "2024", "2025", "2026"];
    years.forEach((yr, i) => {
      const delta = i * 18.2 + Math.sin(i * 1.1) * 7.5;
      rawPoints.push({
        date: yr,
        timestamp: today.getTime() - (5 - i) * 31536000000,
        nav: Number((BASE_NAV + delta).toFixed(2)),
      });
    });
  }

  // Live NAV anchoring matching app.js line 1071
  if (rawPoints.length > 0 && liveNav && liveNav > 0) {
    rawPoints[rawPoints.length - 1].nav = Number(liveNav.toFixed(2));
  }

  return rawPoints;
}

export default function BasketInspectorModal() {
  // 1. All hooks called unconditionally at the top level
  const { inspectedBasketId, closeBasketInspector, baskets, openUPIModal } = useBaskly();
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  const handleClose = () => {
    setHoveredPoint(null);
    setTimeframe("1D");
    closeBasketInspector();
  };

  // Lock body scroll on modal open & handle Escape key
  useEffect(() => {
    if (!inspectedBasketId) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHoveredPoint(null);
        setTimeframe("1D");
        closeBasketInspector();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inspectedBasketId, closeBasketInspector]);

  // Safely resolve the active basket or fallback to baskets[0] unconditionally
  const basket = useMemo(() => {
    return (inspectedBasketId ? baskets.find((b) => b.id === inspectedBasketId) : null) || baskets[0];
  }, [baskets, inspectedBasketId]);

  const hist = useMemo(() => {
    return (basket && BASKET_HISTORICAL_DATA[basket.id]) || BASKET_HISTORICAL_DATA["top-5-index"];
  }, [basket]);

  // Generate historical series using the original baskly-db.js engine
  const series = useMemo(() => {
    const liveNav = basket?.nav ?? 100.00;
    return generateHistoricalSeriesFrom100(timeframe, liveNav);
  }, [timeframe, basket?.nav]);

  // Chart Curve Math (Exact matching app.js drawModalProChart / generateModalChartSVG)
  const { pathD, areaD, pts, gridLines } = useMemo(() => {
    const vals = series.map((d) => d.nav);
    const min = Math.min(...vals) * 0.98;
    const max = Math.max(...vals) * 1.02;
    const r = max - min || 1;

    const w = 600;
    const h = 224;
    const padX = 24;
    const padY = 20;
    const plotW = w - padX * 2;
    const plotH = h - padY * 2;

    const points: ChartPoint[] = vals.map((v, i) => {
      const x = padX + (i / (vals.length - 1)) * plotW;
      const y = padY + plotH - ((v - min) / r) * plotH;
      return {
        date: series[i].date,
        timestamp: series[i].timestamp,
        nav: v,
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
      };
    });

    let pD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = ((prev.x + curr.x) / 2).toFixed(1);
      const midY = ((prev.y + curr.y) / 2).toFixed(1);
      pD += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
    }
    const last = points[points.length - 1];
    pD += ` T ${last.x} ${last.y}`;

    const aD = `${pD} L ${last.x} ${h - padY} L ${points[0].x} ${h - padY} Z`;

    const grids = [1, 2, 3].map((step) => {
      const gy = Number((padY + (plotH / 4) * step).toFixed(1));
      const valAt = (max - (r / 4) * step).toFixed(1);
      return { y: gy, label: `₹${valAt}` };
    });

    return { pathD: pD, areaD: aD, pts: points, gridLines: grids };
  }, [series]);

  // Scrubbing handler (matching attachModalChartScrubbing in app.js lines 1169-1218)
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!chartSvgRef.current || pts.length === 0) return;
    const rect = chartSvgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 600;

    let nearest = pts[0];
    let minDist = 9999;
    pts.forEach((p) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    });
    setHoveredPoint(nearest);
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
  };

  // 2. Conditional return placed strictly AFTER all unconditional hooks
  if (!inspectedBasketId || !basket) return null;

  const startNav = series[0]?.nav || 100.00;
  const currentNav = hoveredPoint ? hoveredPoint.nav : basket.nav;
  const currentReturn = (((currentNav - startNav) / startNav) * 100).toFixed(2);
  const isPos = Number(currentReturn) >= 0;
  const returnLabel = hoveredPoint
    ? `${isPos ? "+" : ""}${currentReturn}% (${hoveredPoint.date})`
    : `${isPos ? "+" : ""}${currentReturn}% (${timeframe})`;

  const modalGradId = `modal-grad-${basket.id.replace(/[^a-zA-Z0-9]/g, "-")}`;
  const strokeColor = basket.riskColor || "#0F6E56";

  return (
    <div
      id="basket-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={handleClose}
    >
      {/* Dialog Card Container - strict flex column with max-h-[92vh] to guarantee full scrollability */}
      <div
        className="tilt-card bg-[#13110F]/95 backdrop-blur-2xl max-w-2xl w-full max-h-[92vh] flex flex-col rounded-3xl border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(245,158,11,0.12)] overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header (index.html lines 722-731) */}
        <div className="flex items-start justify-between p-5 sm:p-8 pb-4 border-b border-white/10 bg-[#13110F]/90 flex-shrink-0 z-10 gap-3">
          <div>
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#F59E0B]">
              Basket Specification
            </span>
            <h3 id="modal-basket-name" className="text-xl sm:text-3xl font-semibold text-white tracking-editorial mt-1">
              {basket.name.includes(basket.serifWord) ? (
                <>
                  {basket.name.split(basket.serifWord)[0]}
                  <span className="font-serif-italic font-normal text-2xl sm:text-4xl text-[#F59E0B]">
                    {basket.serifWord}
                  </span>
                  {basket.name.split(basket.serifWord)[1]}
                </>
              ) : (
                basket.name
              )}
            </h3>
            <p id="modal-basket-tagline" className="text-xs text-[#A39E93] mt-0.5 sm:mt-1">{basket.tagline}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/15 flex items-center justify-center text-sm text-white/80 hover:bg-white hover:text-[#0B0A09] transition cursor-pointer flex-shrink-0"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body Content (index.html lines 733-809) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8 pt-4 space-y-5 sm:space-y-6">
          {/* Executive Overview */}
          <p id="modal-basket-desc" className="text-xs text-[#D4CFC7] leading-relaxed bg-[#1A1713]/80 p-3.5 sm:p-4 rounded-2xl border border-white/5">
            {basket.description}
          </p>

          {/* Key Metrics Strip (index.html lines 736-753) */}
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 text-center">
            <div className="bg-[#1A1713]/80 p-2.5 sm:p-3 rounded-xl border border-white/5">
              <div className="font-mono text-[9px] uppercase text-[#A39E93]">Unit NAV</div>
              <div id="modal-basket-nav" className="text-xs font-bold text-white font-mono mt-0.5">
                ₹{basket.nav.toFixed(2)}
              </div>
            </div>
            <div className="bg-[#1A1713]/80 p-2.5 sm:p-3 rounded-xl border border-white/5">
              <div className="font-mono text-[9px] uppercase text-[#A39E93]">Rebalance</div>
              <div className="text-xs font-bold text-white mt-0.5">Monthly</div>
            </div>
            <div className="bg-[#1A1713]/80 p-2.5 sm:p-3 rounded-xl border border-white/5">
              <div className="font-mono text-[9px] uppercase text-[#A39E93]">Expense</div>
              <div id="modal-basket-fee" className="text-xs font-bold text-white font-mono mt-0.5">
                {basket.fee_pct}% p.a.
              </div>
            </div>
            <div className="bg-[#1A1713]/80 p-2.5 sm:p-3 rounded-xl border border-white/5">
              <div className="font-mono text-[9px] uppercase text-[#A39E93]">Hist. CAGR</div>
              <div id="modal-basket-cagr" className="text-xs font-bold text-[#10B981] font-mono mt-0.5">
                {basket.expected_cagr}%
              </div>
            </div>
          </div>

          {/* ==================== FUND PRO PERFORMANCE CHART (index.html lines 756-804) ==================== */}
          <div className="p-4 rounded-2xl bg-[#1A1713]/80 border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#A39E93]">
                  Interactive Fund Trajectory
                </div>
                <div id="chart-hover-display" className="font-mono text-xs font-semibold text-white mt-0.5">
                  Current NAV: <span id="chart-hover-nav" className="text-[#10B981] font-bold">₹{currentNav.toFixed(2)}</span>{" "}
                  <span
                    id="chart-hover-return"
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded ml-1 border ${
                      isPos ? "text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30" : "text-rose-400 bg-rose-500/15 border-rose-500/30"
                    }`}
                  >
                    {returnLabel}
                  </span>
                </div>
              </div>

              {/* Timeframe Controls (1D, 1W, 1M, 1Y, 5Y) */}
              <div className="flex items-center gap-1 bg-[#100E0C] p-1 rounded-full border border-white/10 font-mono text-[10px]">
                {(["1D", "1W", "1M", "1Y", "5Y"] as const).map((tf) => (
                  <button
                    key={tf}
                    id={`tf-${tf}`}
                    type="button"
                    onClick={() => {
                      setTimeframe(tf);
                      setHoveredPoint(null);
                    }}
                    className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                      timeframe === tf
                        ? "bg-white text-[#0B0A09] font-bold shadow-xs"
                        : "text-[#A39E93] hover:text-white"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Vector Trajectory Chart Container (index.html lines 777-783) */}
            <div
              id="modal-chart-container"
              className="relative w-full h-56 rounded-xl bg-[#0B0A09] border border-white/10 overflow-hidden select-none"
            >
              <svg
                ref={chartSvgRef}
                viewBox="0 0 600 224"
                className="w-full h-full cursor-crosshair overflow-visible"
                preserveAspectRatio="none"
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
              >
                <defs>
                  <linearGradient id={modalGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {gridLines.map((gl, idx) => (
                  <g key={idx}>
                    <line
                      x1="24"
                      y1={gl.y}
                      x2="576"
                      y2={gl.y}
                      stroke="#FFFFFF"
                      strokeOpacity="0.08"
                      strokeDasharray="3 3"
                    />
                    <text
                      x="24"
                      y={gl.y - 4}
                      fill="#A39E93"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {gl.label}
                    </text>
                  </g>
                ))}

                {/* Fill and Curve */}
                <path d={areaD} fill={`url(#${modalGradId})`} />
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Static End Point */}
                {!hoveredPoint && pts.length > 0 && (
                  <g>
                    <circle
                      cx={pts[pts.length - 1].x}
                      cy={pts[pts.length - 1].y}
                      r="8"
                      fill={strokeColor}
                      opacity="0.25"
                      className="animate-ping"
                    />
                    <circle
                      cx={pts[pts.length - 1].x}
                      cy={pts[pts.length - 1].y}
                      r="4.5"
                      fill={strokeColor}
                      stroke="#0B0A09"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Interactive Crosshair & Hover Node */}
                {hoveredPoint && (
                  <g>
                    <line
                      x1={hoveredPoint.x}
                      y1="20"
                      x2={hoveredPoint.x}
                      y2="204"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      strokeOpacity="0.3"
                    />
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="5"
                      fill={strokeColor}
                      stroke="#0B0A09"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>

              {/* Dynamic Floating Tooltip Badge (index.html lines 780-782) */}
              {hoveredPoint && (
                <div
                  id="chart-tooltip-badge"
                  className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-[#1A1713] text-white border border-white/15 font-mono text-[10px] py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap z-20"
                  style={{
                    left: `${(hoveredPoint.x / 600) * 100}%`,
                    top: `${Math.max(14, (hoveredPoint.y / 224) * 100 - 8)}%`,
                  }}
                >
                  {hoveredPoint.date}: ₹{hoveredPoint.nav.toFixed(2)} ({isPos ? "+" : ""}{currentReturn}%)
                </div>
              )}
            </div>

            {/* Key Statistics Grid (index.html lines 786-803 & app.js lines 974-977) */}
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5 sm:gap-2 pt-1 text-center font-mono text-[9px] sm:text-[10px]">
              <div className="bg-[#100E0C] p-2 rounded-lg border border-white/5">
                <div className="text-[#A39E93] text-[8px] sm:text-[9px] uppercase">52W High</div>
                <div id="modal-stat-52h" className="font-bold text-white mt-0.5">₹{(basket.nav * 1.08).toFixed(2)}</div>
              </div>
              <div className="bg-[#100E0C] p-2 rounded-lg border border-white/5">
                <div className="text-[#A39E93] text-[8px] sm:text-[9px] uppercase">52W Low</div>
                <div id="modal-stat-52l" className="font-bold text-white mt-0.5">₹{(basket.nav * 0.96).toFixed(2)}</div>
              </div>
              <div className="bg-[#100E0C] p-2 rounded-lg border border-white/5">
                <div className="text-[#A39E93] text-[8px] sm:text-[9px] uppercase">Max Drawdown</div>
                <div id="modal-stat-dd" className="font-bold text-rose-400 mt-0.5">-3.4%</div>
              </div>
              <div className="bg-[#100E0C] p-2 rounded-lg border border-white/5">
                <div className="text-[#A39E93] text-[8px] sm:text-[9px] uppercase">Sharpe Ratio</div>
                <div id="modal-stat-sharpe" className="font-bold text-[#10B981] mt-0.5">2.14</div>
              </div>
            </div>
          </div>

          {/* Constituent Weights & Live Spot INR (index.html lines 806-809 & app.js lines 1224-1241) */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#A39E93] mb-2">
              Constituent Weights & Live Spot INR
            </div>
            <div id="modal-asset-breakdown" className="divide-y divide-white/10 border border-white/10 rounded-2xl px-4 bg-[#1A1713]/80">
              {basket.assets.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: asset.color || "#F59E0B" }}
                    />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {asset.name} <span className="text-xs font-mono text-[#A39E93]">({asset.symbol})</span>
                      </div>
                      <div className="text-xs text-[#A39E93] font-mono">
                        Spot Price:{" "}
                        <span id={`modal-spot-${asset.symbol}`} className="font-bold text-white px-1 rounded transition-colors">
                          ₹{formatINR(asset.price_inr)}
                        </span>
                        <span className="text-[10px] text-[#10B981] ml-1">● Live Feed</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white font-mono">{asset.weight}%</div>
                    <div className="text-[10px] uppercase tracking-wider text-[#A39E93]">Target Weight</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Action Footer (index.html lines 811-814) */}
        <div className="p-6 sm:p-8 pt-4 border-t border-white/10 bg-[#13110F]/90 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              handleClose();
              openUPIModal();
            }}
            className="btn-unseen w-full bg-white text-[#0B0A09] hover:bg-[#F59E0B] py-4 text-xs font-semibold uppercase tracking-widest cursor-pointer"
          >
            <span>
              Start SIP in This Basket (<span id="modal-basket-min">₹{formatINR(basket.min_sip)}/mo</span>) ↗
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
