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
      ctx.strokeStyle = "rgba(18, 17, 16, 0.06)";
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }

      // Helper to calculate curve points
      const getPoints = (monthlyRate: number, isFlat = false) => {
        const points: { x: number; y: number }[] = [];
        const steps = 24;
        for (let s = 0; s <= steps; s++) {
          const m = (months / steps) * s;
          let val = 0;
          if (isFlat) {
            val = amount * m;
          } else if (m > 0 && monthlyRate > 0) {
            val = amount * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
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
      gradient.addColorStop(0, "rgba(15, 110, 86, 0.18)");
      gradient.addColorStop(1, "rgba(15, 110, 86, 0.0)");

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
      drawCurve(principalPoints, "#8C857B", 1.5, true);
      drawCurve(niftyPoints, "#9A7B56", 2);
      drawCurve(cryptoPoints, "#0F6E56", 2.5);

      // End pulse dot
      const lastP = cryptoPoints[cryptoPoints.length - 1];
      ctx.beginPath();
      ctx.arc(lastP.x, lastP.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#0F6E56";
      ctx.fill();
      ctx.strokeStyle = "#FAF8F5";
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
        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#9A7B56]">
          03 — Mathematical Compounding
        </span>
        <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#121110] tracking-editorial mt-3 leading-[1.05]">
          The quiet geometry of <span className="font-serif-italic font-light text-4xl xs:text-5xl sm:text-6xl lg:text-7xl text-[#9A7B56]">time.</span>
        </h2>
        <p className="text-xs sm:text-base text-[#5C5752] mt-3 leading-relaxed">
          Drag the sliders to simulate how systematic monthly Rupee-Cost Averaging performs against traditional Indian asset classes.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        
        {/* Left 5 Cols: Sliders */}
        <div className="lg:col-span-5 tilt-card p-5 sm:p-7 md:p-8 flex flex-col justify-between h-full">
          <div className="tilt-card-content space-y-6 sm:space-y-8">
            
            {/* Slider 1: Monthly SIP */}
            <div>
              <div className="flex justify-between items-baseline mb-2.5 sm:mb-3">
                <label className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#5C5752]">
                  Monthly SIP Mandate
                </label>
                <span className="font-serif-italic text-2xl xs:text-3xl sm:text-4xl text-[#121110]">
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
                className="w-full cursor-pointer"
              />
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                {[1000, 5000, 10000, 25000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`text-[10px] sm:text-[11px] font-mono px-2.5 sm:px-3 py-1 rounded-full border transition cursor-pointer ${
                      amount === val 
                        ? "bg-[#121110] text-[#F4EFEA] border-[#121110]" 
                        : "border-[#121110]/15 hover:bg-[#121110] hover:text-[#F4EFEA]"
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
                <label className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#5C5752]">
                  Compounding Horizon
                </label>
                <span className="font-serif-italic text-2xl xs:text-3xl sm:text-4xl text-[#121110]">
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
                className="w-full cursor-pointer"
              />
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                {[3, 5, 7, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setYears(val)}
                    className={`text-[10px] sm:text-[11px] font-mono px-2.5 sm:px-3 py-1 rounded-full border transition cursor-pointer ${
                      years === val 
                        ? "bg-[#121110] text-[#F4EFEA] border-[#121110]" 
                        : "border-[#121110]/15 hover:bg-[#121110] hover:text-[#F4EFEA]"
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
                  <label className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#5C5752]">
                    Basket Target CAGR
                  </label>
                  <div className="text-[10px] sm:text-[11px] text-[#8C857B]">
                    Crypto+Gold (18%) · Top-5 (28%) · Alpha (40%)
                  </div>
                </div>
                <span className="font-serif-italic text-2xl xs:text-3xl sm:text-4xl text-[#0F6E56]">
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
                className="w-full cursor-pointer"
              />
            </div>

          </div>

          <div className="tilt-card-content pt-6 mt-6 border-t border-[#121110]/10">
            <button 
              type="button"
              onClick={openUPIModal} 
              className="btn-unseen w-full bg-[#121110] text-[#F4EFEA] py-3.5 sm:py-4 text-xs font-semibold uppercase tracking-widest cursor-pointer"
            >
              <span>Lock In This Monthly Habit ↗</span>
            </button>
          </div>
        </div>

        {/* Right 7 Cols: Canvas Spline Graph & Multi-Asset Benchmarks */}
        <div className="lg:col-span-7 tilt-card p-5 sm:p-7 md:p-8 flex flex-col justify-between h-full">
          <div className="tilt-card-content">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 sm:pb-6 border-b border-[#121110]/10 gap-3 sm:gap-4">
              <div>
                <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#8C857B]">
                  Projected Portfolio Value
                </div>
                <div className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#121110] tracking-editorial font-mono mt-1">
                  ₹{formatINR(futureValueCrypto)}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6 mt-1 sm:mt-0">
                <div>
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#8C857B]">
                    Total Principal
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#121110] font-mono">
                    ₹{formatINR(totalInvested)}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#0F6E56]">
                    Compounded Gain
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#0F6E56] font-mono">
                    +₹{formatINR(returnsEarned)}
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas Curve */}
            <div className="my-5 sm:my-6 relative">
              <div className="flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#8C857B] mb-2 gap-2">
                <span>Wealth Trajectory Curve</span>
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0F6E56]" /> Baskly SIP
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9A7B56]" /> Nifty 50 (12.5%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-[#8C857B]" /> Principal
                  </span>
                </div>
              </div>
              <canvas 
                ref={canvasRef} 
                className="w-full h-48 sm:h-56 rounded-2xl bg-[#F4EFEA]/60 border border-[#121110]/5 block"
              />
            </div>

            {/* Benchmark Comparison Strip */}
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5 sm:gap-4 pt-2">
              <div className="p-3 sm:p-4 rounded-2xl bg-[#0F6E56]/8 border border-[#0F6E56]/20">
                <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#0F6E56] font-semibold">
                  Baskly Basket
                </div>
                <div className="text-base sm:text-lg lg:text-xl font-bold text-[#121110] font-mono mt-0.5 sm:mt-1 truncate">
                  ₹{formatINR(futureValueCrypto)}
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[#F4EFEA]/90 border border-[#121110]/10">
                <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#5C5752]">
                  Nifty 50 Index
                </div>
                <div className="text-base sm:text-lg lg:text-xl font-bold text-[#5C5752] font-mono mt-0.5 sm:mt-1 truncate">
                  ₹{formatINR(futureValueNifty)}
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[#F4EFEA]/90 border border-[#121110]/10">
                <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#8C857B]">
                  Bank FD (7%)
                </div>
                <div className="text-base sm:text-lg lg:text-xl font-bold text-[#8C857B] font-mono mt-0.5 sm:mt-1 truncate">
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
