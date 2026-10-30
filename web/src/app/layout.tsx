import type { Metadata } from "next";
import { Inter, DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import "./legacy.css";
import { BasklyProvider } from "@/context/BasklyContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "baskly.money® — Quietly Compounding Crypto Wealth in Rupees",
  description:
    "Curated crypto index baskets priced in Rupees. Automated via NPCI UPI AutoPay from ₹1,000/month with 1:1 cold custody and automated 1% TDS.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2248%22 fill=%22%23121110%22/><text y=%2266%22 font-size=%2256%22 font-family=%22Georgia,serif%22 font-style=%22italic%22 text-anchor=%22middle%22 x=%2248%22 fill=%22%23F4EFEA%22>b</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${dmSans.variable} ${dmSerif.variable}`}>
      <body className="min-h-screen bg-[#0B0A09] text-[#FFFFFF] antialiased selection:bg-[#F59E0B] selection:text-[#0B0A09] font-sans relative">
        <div className="ambient-glow-top" />
        <div className="tech-grid-overlay" />
        <div className="noise-overlay" />
        <BasklyProvider>
          {children}
        </BasklyProvider>
      </body>
    </html>
  );
}
