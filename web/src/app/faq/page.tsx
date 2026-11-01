import React from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ModalsContainer from "@/components/modals/ModalsContainer";
import FAQContent from "@/components/FAQContent";
import { HelpCircle } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions · Baskly.money",
  description:
    "Everything you need to know about Indian VDA taxation, 1% TDS, NPCI UPI AutoPay, 1:1 custody, and systematic crypto basket compounding in Rupees.",
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#0B0A09] text-white relative selection:bg-[#F59E0B] selection:text-[#0B0A09]">
      <Navbar />

      {/* Hero Header Section */}
      <section className="pt-16 sm:pt-24 md:pt-32 2xl:pt-40 pb-12 sm:pb-16 2xl:pb-24 max-w-7xl 2xl:max-w-[1520px] 3xl:max-w-[1780px] 4xl:max-w-[1980px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 3xl:px-16">
        <div className="max-w-4xl 2xl:max-w-5xl mx-auto text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#1A1713] border border-white/10 text-[#F59E0B] text-xs 2xl:text-sm font-mono uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <HelpCircle className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
            <span>Clarity First · Knowledge Base</span>
          </div>

          <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl font-semibold tracking-editorial text-white leading-[1.04]">
            Questions Indian <span className="font-serif-italic font-normal text-[#F59E0B]">investors</span> ask.
          </h1>

          <p className="text-sm sm:text-base lg:text-lg 2xl:text-xl text-[#A39E93] leading-relaxed max-w-2xl 2xl:max-w-3xl mx-auto">
            Everything you need to know about Indian Virtual Digital Asset (VDA) taxation, 1% statutory TDS, NPCI UPI AutoPay mandates, and 1:1 cold vault custody.
          </p>
        </div>
      </section>

      {/* FAQ Interactive Content Section */}
      <section className="pb-24 sm:pb-32 2xl:pb-40 max-w-7xl 2xl:max-w-[1520px] 3xl:max-w-[1780px] 4xl:max-w-[1980px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 3xl:px-16">
        <FAQContent />
      </section>

      <FooterSection />
      <ModalsContainer />
    </main>
  );
}
