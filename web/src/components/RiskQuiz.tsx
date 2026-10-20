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
        badgeClass: "bg-[#9A7B56]/15 text-[#9A7B56]",
        title: "Hard Asset",
        serifWord: "Conservator",
        desc: "You prioritize wealth preservation, capital defense against rupee depreciation, and minimal volatility.",
        basket: "Crypto + Gold Reserve",
        split: "70% Crypto+Gold · 30% Pure Bitcoin",
      };
    } else if (totalScore <= 7) {
      return {
        badge: "Balanced Core",
        badgeClass: "bg-[#0F6E56]/15 text-[#0F6E56]",
        title: "Balanced Index",
        serifWord: "Collector",
        desc: "You understand market cycles and want institutional exposure to blue-chip digital assets without emotional day-trading.",
        basket: "Top-5 Bluechip Index + Pure Bitcoin",
        split: "70% Top-5 Index · 30% Pure Bitcoin",
      };
    } else {
      return {
        badge: "Alpha & High Conviction",
        badgeClass: "bg-[#B85D43]/15 text-[#B85D43]",
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
    <section id="quiz" className="py-16 sm:py-20 md:py-28 bg-[#EBE3DA]/45 border-y border-[#121110]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left 5 Cols: Live Archetype Output Card */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#9A7B56]">
              04 — Risk Calibration
            </span>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl font-semibold text-[#121110] tracking-editorial leading-[1.06]">
              Discover your <span className="font-serif-italic font-light text-4xl xs:text-5xl sm:text-6xl text-[#9A7B56]">allocation</span> archetype.
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5752] leading-relaxed">
              Answer the three questions on the right to calibrate your ideal mix of Gold-backed stability, Bitcoin sovereignty, and DeFi growth.
            </p>

            <div className="tilt-card p-5 sm:p-7 space-y-4 sm:space-y-5 bg-[#FAF8F5]">
              <div className="tilt-card-content space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full ${profile.badgeClass}`}>
                    {profile.badge}
                  </span>
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#8C857B]">
                    Live Calibration
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-[#121110] tracking-editorial">
                  {profile.title}{" "}
                  <span className="font-serif-italic font-normal text-2xl sm:text-3xl">
                    {profile.serifWord}
                  </span>
                </h3>
                <p className="text-xs text-[#5C5752] leading-relaxed">
                  {profile.desc}
                </p>

                <div className="p-3.5 sm:p-4 bg-[#F4EFEA] rounded-2xl border border-[#121110]/10 space-y-1 sm:space-y-1.5">
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#8C857B]">
                    Recommended Mandate Split
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#121110]">
                    {profile.basket}
                  </div>
                  <div className="font-mono text-[11px] sm:text-xs text-[#0F6E56] font-medium">
                    {profile.split}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={openUPIModal} 
                  className="btn-unseen w-full bg-[#121110] text-[#F4EFEA] py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  <span>Activate Recommended Split ↗</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: 3-Step Questionnaire */}
          <div className="lg:col-span-7 tilt-card p-5 sm:p-8 md:p-10">
            <div className="tilt-card-content space-y-6 sm:space-y-8">
              {QUIZ_QUESTIONS.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3 pb-6 border-b border-[#121110]/10 last:border-b-0 last:pb-0">
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#9A7B56]">
                    {q.title}
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-[#121110] tracking-editorial">
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
                              ? "bg-[#121110] text-[#F4EFEA] border-[#121110]"
                              : "bg-[#F4EFEA] text-[#121110] border-[#121110]/10 hover:border-[#121110]/30"
                          }`}
                        >
                          <span className="leading-relaxed">{opt.text}</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 ${
                            isSelected ? "border-[#F4EFEA] bg-[#F4EFEA]" : "border-[#121110]/30"
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#121110]" />}
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
