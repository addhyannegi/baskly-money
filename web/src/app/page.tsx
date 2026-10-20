import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MarqueeRibbon from "@/components/MarqueeRibbon";
import Philosophy from "@/components/Philosophy";
import BasketsSection from "@/components/BasketsSection";
import CompoundingCalculator from "@/components/CompoundingCalculator";
import RiskQuiz from "@/components/RiskQuiz";
import TrustAndTax from "@/components/TrustAndTax";
import FooterSection from "@/components/FooterSection";
import ModalsContainer from "@/components/modals/ModalsContainer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F4EFEA] text-[#121110] relative">
      <Navbar />
      <Hero />
      <MarqueeRibbon />
      <Philosophy />
      <BasketsSection />
      <CompoundingCalculator />
      <RiskQuiz />
      <TrustAndTax />
      <FooterSection />
      <ModalsContainer />
    </main>
  );
}