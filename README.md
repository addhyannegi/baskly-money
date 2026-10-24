# Baskly.money — Disciplined Crypto Basket SIPs in Rupees

[![CI Pipeline](https://github.com/addhyannegi/baskly-money/actions/workflows/ci.yml/badge.svg)](https://github.com/addhyannegi/baskly-money/actions/workflows/ci.yml)

> A minimalist, Apple-inspired landing page and investment interface for systematic crypto accumulation in India. Built to replace loud, scammy crypto aesthetics with institutional calm, trust, and simplicity.

---

## 🌟 What was redesigned from scratch?

| Aspect | The Old "Beta" Experience | Baskly.money Rebuild |
| :--- | :--- | :--- |
| **Aesthetic & Vibe** | Dark mode with neon saffron / loud colors, crypto-bro jargon, 19vw giant text | **Apple-minimalist cream/alabaster** palette (`#FBFBFC`, `#FFFFFF`), subtle typography, high-trust fintech feel |
| **Trust & Compliance** | Felt speculative and opaque | **Clear Indian regulatory compliance**: Section 194S 1% TDS automation, Form 26AS reports, 1:1 audited custody |
| **Baskets & NAV** | Confusing tables | **6 Curated Institutional Baskets** with visual allocation bars, live INR prices, and 1-click breakdown inspector |
| **SIP Compounding** | Clunky calculator | **Apple-grade Real-Time Compounding Calculator** comparing Baskly SIP vs Nifty 50 vs Fixed Deposit |
| **Investor Fit** | None | **Interactive 3-Step Risk Profiler Quiz** matching users to their ideal basket ratio (Preservation, Balanced, Alpha) |
| **Payment Flow** | Unclear crypto-wallet friction | **NPCI UPI AutoPay Simulation**: Direct bank debit, 0% lock-in, 1-click cancellation guarantee |

---

## 📁 Project Structure

```
baskly-money/
├── index.html        # Clean, accessible semantic HTML5 structure with Tailwind CSS & Lucide icons
├── styles.css        # Apple-grade design system (subtle typography, frosted glass, custom range sliders)
├── app.js            # Reactive state management (Baskets store, SIP compound math, Risk quiz, UPI simulation)
├── serve.ps1         # 1-click local development HTTP server in PowerShell
└── README.md         # Documentation & deployment guide
```

---

## 🚀 How to Run Locally

### Option 1: Double-click or open directly in your browser
You can simply open `index.html` in any modern browser (Chrome, Edge, Safari, Arc, Brave) directly:
```powershell
Start-Process "C:\Users\sanidhya negi\.gemini\antigravity\scratch\baskly-money\index.html"
```

### Option 2: Run the built-in local server
Run the PowerShell script from your terminal:
```powershell
cd "C:\Users\sanidhya negi\.gemini\antigravity\scratch\baskly-money"
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
Then visit: **`http://localhost:3000`**

---

## 🌐 Deploy to Production

This project is 100% static and zero-dependency, so you can host it anywhere in seconds:
- **Vercel**: Run `vercel` or link your GitHub repo.
- **Netlify**: Drag-and-drop the `baskly-money` folder.
- **Cloudflare Pages**: Connect repo, set build output directory to `.`.
- **GitHub Pages**: Push to repository and enable GitHub Pages in settings.

---

## 🎨 Design Tokens

- **Cream Background**: `#FBFBFC`
- **Subtle Surface**: `#F5F5F7`
- **Card Background**: `#FFFFFF`
- **Hairline Border**: `rgba(0, 0, 0, 0.06)`
- **Primary Text**: `#0A0D14`
- **Secondary Text**: `#525866`
- **Positive Returns**: `#059669`
- **Font Stack**: `-apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "SF Pro Display", sans-serif`
