"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatINR } from "@/data/baskets";
import { useBaskly } from "@/context/BasklyContext";

export default function CompoundingCalculator() {
  const { openUPIModal } = useBaskly();
  const [amount, setAmount] = useState<number>(5000);
  const [years, setYears] = useState<number>(5);
  const [cagr, setCagr] = useState<number>(28);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Financial Compounding Math
  const months = years * 12;
  const ratePerMonth = cagr / 100 / 12;
  const futureValueCrypto =
    amount * ((Math.pow(1 + ratePerMonth, months) - 1) / ratePerMonth) * (1 + ratePerMonth);
  const totalInvested = amount * months;
  const returnsEarned = Math.max(0, futureValueCrypto - totalInvested);

  const rateNifty = 0.125 / 12;
  const futureValueNifty =
    amount * ((Math.pow(1 + rateNifty, months) - 1) / rateNifty) * (1 + rateNifty);

  const rateFD = 0.07 / 12;
  const futureValueFD =
    amount * ((Math.pow(1 + rateFD, months) - 1) / rateFD) * (1 + rateFD);

  // Draw Interactive Bezier Spline Curves on Canvas
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 560;
      const height = rect.height || 224;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, width, height);

      const padding = { top: 20, right: 30, bottom: 25, left: 20 };
      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;

      const maxVal = Math.max(futureValueCrypto, futureValueNifty, futureValueFD, totalInvested) * 1.08;

      // Grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }

      const steps = months;
      const getPoints = (monthlyRate: number, isFlat = false) => {
        const points: { x: number; y: number }[] = [];
        for (let s = 0; s <= steps; s++) {
          let val = 0;
          if (isFlat) {
            val = amount * s;
          } else {
            val = s === 0 ? 0 : amount * ((Math.pow(1 + monthlyRate, s) - 1) / monthlyRate) * (1 + monthlyRate);
          }
          const x = padding.left + (chartW / steps) * s;
          const y = padding.top + chartH - (val / maxVal) * chartH;
          points.push({ x, y });
        }
        return points;
      };

      const drawCurve = (points: { x: number; y: number }[], color: string, lineWidth: number, isDashed = false) => {
        ctx.beginPath();
        if (isDashed) {
          ctx.setLineDash([4, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const cx = (prev.x + curr.x) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, cx, (prev.y + curr.y) / 2);
        }
        const last = points[points.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
        ctx.setLineDash([]);
      };

      const principalPoints = getPoints(0, true);
      const niftyPoints = getPoints(rateNifty);
      const cryptoPoints = getPoints(ratePerMonth);

      // Gradient fill under Baskly curve
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height);
      gradient.addColorStop(0, "rgba(245, 158, 11, 0.28)");
      gradient.addColorStop(1, "rgba(245, 158, 11, 0.0)");

      ctx.beginPath();
      ctx.moveTo(cryptoPoints[0].x, cryptoPoints[0].y);
      for (let i = 1; i < cryptoPoints.length; i++) {
        ctx.lineTo(cryptoPoints[i].x, cryptoPoints[i].y);
      }
      ctx.lineTo(width - padding.right, padding.top + chartH);
      ctx.lineTo(padding.left, padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Render curves
      drawCurve(principalPoints, "#736E65", 1.5, true);
      drawCurve(niftyPoints, "#94A3B8", 2);
      drawCurve(cryptoPoints, "#F59E0B", 2.5);

      // End pulse dot
      const lastP = cryptoPoints[cryptoPoints.length - 1];
      ctx.beginPath();
      ctx.arc(lastP.x, lastP.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#F59E0B";
      ctx.fill();
      ctx.strokeStyle = "#0B0A09";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [amount, years, cagr, futureValueCrypto, futureValueNifty, futureValueFD, totalInvested, months, rateNifty, ratePerMonth]);

  return (
    <section id="calculator" className="py-16 sm:py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="max-w-3xl mb-10 sm:mb-16">
        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#F59E0B]">
          03 — Mathematical Compounding
        </span>
        <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-editorial mt-3 leading-[1.05]">
          The quiet geometry of <span className="font-serif-italic font-light text-4xl xs:text-5xl sm:text-6xl lg:text-7xl text-[#F59E0B]">time.</span>
        </h2>
        <p className="text-xs sm:text-base text-[#A39E93] mt-3 leading-relaxed">
          Drag the sliders to simulate how systematic monthly Rupee-Cost Averaging performs against traditional Indian asset classes.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        
        {/* Left 5 Cols: Sliders */}
        <div className="lg:col-span-5 tilt-card p-5 sm:p-7 md:p-8 flex flex-col justify-between h-full bg-[#13110F]/90 border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="tilt-card-content space-y-6 sm:space-y-8">
            
            {/* Slider 1: Monthly SIP */}
            <div>
              <div className="flex justify-between items-baseline mb-2.5 sm:mb-3">
                <label className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#A39E93]">
                  Monthly SIP Mandate
                </label>
                <span className="font-serif-italic text-2xl xs:text-3xl sm:text-4xl text-white">
                  ₹{formatINR(amount)}
                </span>
              </div>
              <input 
                type="range" 
                min={1000} 
                max={50000} 
                step={1000} 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#F59E0B]"
              />
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                {[1000, 5000, 10000, 25000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`text-[10px] sm:text-[11px] font-mono px-2.5 sm:px-3 py-1 rounded-full border transition cursor-pointer ${
                      amount === val 
                        ? "bg-white text-[#0B0A09] border-white font-semibold" 
                        : "border-white/15 text-[#A39E93] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    ₹{formatINR(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 2: Horizon */}
            <div>
              <div className="flex justify-between items-baseline mb-2.5 sm:mb-3">
                <label className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#A39E93]">
                  Compounding Horizon
                </label>
                <span className="font-serif-italic text-2xl xs:text-3xl sm:text-4xl text-white">
                  {years} {years > 1 ? "Years" : "Year"}
                </span>
              </div>
              <input 
                type="range" 
                min={1} 
                max={10} 
                step={1} 
                value={years} 
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#F59E0B]"
              />
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                {[3, 5, 7, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setYears(val)}
                    className={`text-[10px] sm:text-[11px] font-mono px-2.5 sm:px-3 py-1 rounded-full border transition cursor-pointer ${
                      years === val 
                        ? "bg-white text-[#0B0A09] border-white font-semibold" 
                        : "border-white/15 text-[#A39E93] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {val} Yrs
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 3: Target CAGR */}
            <div>
              <div className="flex justify-between items-baseline mb-2.5 sm:mb-3">
                <div>
                  <label className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#A39E93]">
                    Basket Target CAGR
                  </label>
                  <div className="text-[10px] sm:text-[11px] text-[#736E65]">
                    Crypto+Gold (18%) · Top-5 (28%) · Alpha (40%)
                  </div>
                </div>
                <span className="font-serif-italic text-2xl xs:text-3xl sm:text-4xl text-[#F59E0B]">
                  {cagr}% p.a.
                </span>
              </div>
              <input 
                type="range" 
                min={12} 
                max={55} 
                step={1} 
                value={cagr} 
                onChange={(e) => setCagr(Number(e.target.value))}
                className="w-full cursor-pointer accent-[#F59E0B]"
              />
            </div>

          </div>

          <div className="tilt-card-content pt-6 mt-6 border-t border-white/10">
            <button 
              type="button"
              onClick={openUPIModal} 
              className="btn-unseen w-full bg-white text-[#0B0A09] hover:bg-[#F59E0B] hover:text-[#0B0A09] py-3.5 sm:py-4 text-xs font-semibold uppercase tracking-widest cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <span>Lock In This Monthly Habit ↗</span>
            </button>
          </div>
        </div>

        {/* Right 7 Cols: Canvas Spline Graph & Multi-Asset Benchmarks */}
        <div className="lg:col-span-7 tilt-card p-5 sm:p-7 md:p-8 flex flex-col justify-between h-full bg-[#13110F]/90 border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="tilt-card-content">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 sm:pb-6 border-b border-white/10 gap-3 sm:gap-4">
              <div>
                <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#736E65]">
                  Projected Portfolio Value
                </div>
                <div className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-editorial font-mono mt-1">
                  ₹{formatINR(futureValueCrypto)}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6 mt-1 sm:mt-0">
                <div>
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#736E65]">
                    Total Principal
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white font-mono">
                    ₹{formatINR(totalInvested)}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-emerald-400">
                    Compounded Gain
                  </div>
                  <div className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
                    +₹{formatINR(returnsEarned)}
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas Curve */}
            <div className="my-5 sm:my-6 relative">
              <div className="flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#736E65] mb-2 gap-2">
                <span>Wealth Trajectory Curve</span>
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Baskly SIP
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" /> Nifty 50 (12.5%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-[#736E65]" /> Principal
                  </span>
                </div>
              </div>
              <canvas 
                ref={canvasRef} 
                className="w-full h-48 sm:h-56 rounded-2xl bg-[#1A1713] border border-white/10 block"
              />
            </div>

            {/* Benchmark Comparison Strip */}
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5 sm:gap-4 pt-2">
              <div className="p-3 sm:p-4 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30">
                <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#F59E0B] font-semibold">
                  Baskly Basket
                </div>
                <div className="text-base sm:text-lg lg:text-xl font-bold text-white font-mono mt-0.5 sm:mt-1 truncate">
                  ₹{formatINR(futureValueCrypto)}
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[#1A1713] border border-white/10">
                <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#A39E93]">
                  Nifty 50 Index
                </div>
                <div className="text-base sm:text-lg lg:text-xl font-bold text-white/90 font-mono mt-0.5 sm:mt-1 truncate">
                  ₹{formatINR(futureValueNifty)}
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[#1A1713] border border-white/10">
                <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#736E65]">
                  Bank FD (7%)
                </div>
                <div className="text-base sm:text-lg lg:text-xl font-bold text-white/70 font-mono mt-0.5 sm:mt-1 truncate">
                  ₹{formatINR(futureValueFD)}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
