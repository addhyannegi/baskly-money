"use client";

import React, { useState } from "react";
import { useBaskly } from "@/context/BasklyContext";

interface QuizOption {
  text: string;
  points: number;
}

interface QuizQuestion {
  title: string;
  subtitle: string;
  options: QuizOption[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    title: "Question 01 of 03",
    subtitle: "How do you react when crypto markets experience a 30% drawdown?",
    options: [
      { text: "I lose sleep. I want downside safety and capital preservation first.", points: 1 },
      { text: "I view it as an accumulation opportunity and stick to my systematic SIP.", points: 2 },
      { text: "I actively hunt for asymmetric upside and high-beta momentum.", points: 3 },
    ],
  },
  {
    title: "Question 02 of 03",
    subtitle: "What is your primary investment goal with digital assets?",
    options: [
      { text: "Preserve capital against Indian inflation and rupee depreciation.", points: 1 },
      { text: "Build multi-year wealth through disciplined systematic rupee-cost averaging.", points: 2 },
      { text: "Maximize multi-cycle compounding through cutting-edge on-chain protocols.", points: 3 },
    ],
  },
  {
    title: "Question 03 of 03",
    subtitle: "What is your intended investment compounding horizon?",
    options: [
      { text: "1 to 2 Years (Conservative capital accumulation)", points: 1 },
      { text: "3 to 5 Years (Full Bitcoin and halving cycle compounding)", points: 2 },
      { text: "5+ Years (Decade-long sovereign wealth building)", points: 3 },
    ],
  },
];

export default function RiskQuiz() {
  const { openUPIModal } = useBaskly();
  const [answers, setAnswers] = useState<number[]>([1, 1, 1]); // default options selected

  const totalScore = answers.reduce((sum, optIdx, qIdx) => {
    return sum + QUIZ_QUESTIONS[qIdx].options[optIdx].points;
  }, 0);

  const getProfile = () => {
    if (totalScore <= 4) {
      return {
        badge: "Conservative / Capital Preservation",
        badgeClass: "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30",
        title: "Hard Asset",
        serifWord: "Conservator",
        desc: "You prioritize wealth preservation, capital defense against rupee depreciation, and minimal volatility.",
        basket: "Crypto + Gold Reserve",
        split: "70% Crypto+Gold · 30% Pure Bitcoin",
      };
    } else if (totalScore <= 7) {
      return {
        badge: "Balanced Core",
        badgeClass: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
        title: "Balanced Index",
        serifWord: "Collector",
        desc: "You understand market cycles and want institutional exposure to blue-chip digital assets without emotional day-trading.",
        basket: "Top-5 Bluechip Index + Pure Bitcoin",
        split: "70% Top-5 Index · 30% Pure Bitcoin",
      };
    } else {
      return {
        badge: "Alpha & High Conviction",
        badgeClass: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
        title: "Sovereign Alpha",
        serifWord: "Stacker",
        desc: "You have multi-year conviction in decentralized computing, Web3 infrastructure, and scarce monetary assets.",
        basket: "Pure Bitcoin + DeFi Architects",
        split: "60% Pure Bitcoin · 40% DeFi Protocols",
      };
    }
  };

  const profile = getProfile();

  const handleSelect = (qIdx: number, optIdx: number) => {
    const updated = [...answers];
    updated[qIdx] = optIdx;
    setAnswers(updated);
  };

  return (
    <section id="quiz" className="py-16 sm:py-20 md:py-28 bg-[#0E0C0A]/80 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left 5 Cols: Live Archetype Output Card */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#F59E0B]">
              04 — Risk Calibration
            </span>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl font-semibold text-white tracking-editorial leading-[1.06]">
              Discover your <span className="font-serif-italic font-light text-4xl xs:text-5xl sm:text-6xl text-[#F59E0B]">allocation</span> archetype.
            </h2>
            <p className="text-xs sm:text-sm text-[#A39E93] leading-relaxed">
              Answer the three questions on the right to calibrate your ideal mix of Gold-backed stability, Bitcoin sovereignty, and DeFi growth.
            </p>

            <div className="tilt-card p-5 sm:p-7 space-y-4 sm:space-y-5 bg-[#13110F]/90 border border-white/10 shadow-xl backdrop-blur-xl">
              <div className="tilt-card-content space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full ${profile.badgeClass}`}>
                    {profile.badge}
                  </span>
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#736E65]">
                    Live Calibration
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-editorial">
                  {profile.title}{" "}
                  <span className="font-serif-italic font-normal text-2xl sm:text-3xl text-[#F59E0B]">
                    {profile.serifWord}
                  </span>
                </h3>
                <p className="text-xs text-[#A39E93] leading-relaxed">
                  {profile.desc}
                </p>

                <div className="p-3.5 sm:p-4 bg-[#1A1713] rounded-2xl border border-white/10 space-y-1 sm:space-y-1.5">
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#736E65]">
                    Recommended Mandate Split
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white">
                    {profile.basket}
                  </div>
                  <div className="font-mono text-[11px] sm:text-xs text-emerald-400 font-medium">
                    {profile.split}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={openUPIModal} 
                  className="btn-unseen w-full bg-white text-[#0B0A09] hover:bg-[#F59E0B] hover:text-[#0B0A09] py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  <span>Activate Recommended Split ↗</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: 3-Step Questionnaire */}
          <div className="lg:col-span-7 tilt-card p-5 sm:p-8 md:p-10 bg-[#13110F]/90 border border-white/10 shadow-xl backdrop-blur-xl">
            <div className="tilt-card-content space-y-6 sm:space-y-8">
              {QUIZ_QUESTIONS.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3 pb-6 border-b border-white/10 last:border-b-0 last:pb-0">
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#F59E0B]">
                    {q.title}
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-white tracking-editorial">
                    {q.subtitle}
                  </h4>
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelect(qIdx, optIdx)}
                          className={`w-full text-left p-3 sm:p-3.5 rounded-xl border text-[11px] sm:text-xs font-medium transition cursor-pointer flex items-start sm:items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-white text-[#0B0A09] border-white font-semibold shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                              : "bg-[#1A1713] text-[#A39E93] border-white/10 hover:border-[#F59E0B]/40 hover:text-white"
                          }`}
                        >
                          <span className="leading-relaxed">{opt.text}</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 ${
                            isSelected ? "border-[#0B0A09] bg-[#0B0A09]" : "border-white/30"
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
