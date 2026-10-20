"use client";

import React, { useMemo } from "react";
import { BASKET_HISTORICAL_DATA } from "@/data/baskets";

interface CardSparklineProps {
  basketId: string;
  liveNav?: number;
}

export default function CardSparkline({ basketId, liveNav }: CardSparklineProps) {
  const { pathD, areaD, last, color, gradId } = useMemo(() => {
    const hist = BASKET_HISTORICAL_DATA[basketId];
    if (!hist || !hist.monthlySeries || hist.monthlySeries.length === 0) {
      return { pathD: "", areaD: "", last: { x: 0, y: 0 }, color: "#0F6E56", gradId: "" };
    }

    const data = hist.monthlySeries.slice(-14);
    const vals = data.map((d) => d.nav);
    if (liveNav && liveNav > 0) vals[vals.length - 1] = liveNav;

    const minVal = Math.min(...vals) * 0.98;
    const maxVal = Math.max(...vals) * 1.02;
    const range = maxVal - minVal || 1;

    const w = 300;
    const h = 56;
    const padX = 6;
    const padY = 6;
    const plotW = w - padX * 2;
    const plotH = h - padY * 2;

    const pts = vals.map((v, i) => {
      const x = padX + (i / (vals.length - 1)) * plotW;
      const y = padY + plotH - ((v - minVal) / range) * plotH;
      return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
    });

    let pD = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const midX = ((prev.x + curr.x) / 2).toFixed(1);
      const midY = ((prev.y + curr.y) / 2).toFixed(1);
      pD += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
    }
    const lastPt = pts[pts.length - 1];
    pD += ` T ${lastPt.x} ${lastPt.y}`;

    const aD = `${pD} L ${lastPt.x} ${h} L ${pts[0].x} ${h} Z`;
    const gId = `card-grad-${basketId.replace(/[^a-zA-Z0-9]/g, "-")}`;

    return { pathD: pD, areaD: aD, last: lastPt, color: hist.color, gradId: gId };
  }, [basketId, liveNav]);

  if (!pathD) return null;

  return (
    <svg viewBox="0 0 300 56" className="w-full h-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="6" fill={color} opacity="0.25" className="animate-ping" />
      <circle cx={last.x} cy={last.y} r="3.5" fill={color} stroke="#FAF8F5" strokeWidth="1.5" />
    </svg>
  );
}
