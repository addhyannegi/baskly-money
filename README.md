# Baskly.money — Disciplined Crypto Basket SIPs in Rupees

[![CI Pipeline](https://github.com/addhyannegi/baskly-money/actions/workflows/ci.yml/badge.svg)](https://github.com/addhyannegi/baskly-money/actions/workflows/ci.yml)

> A minimalist, Apple-inspired landing page and investment interface for systematic crypto accumulation in India. Built to replace loud, scammy crypto aesthetics with institutional calm, trust, and simplicity.

---

## What was redesigned from scratch?

| Aspect | The Old Experience | Baskly.money Rebuild |
| :--- | :--- | :--- |
| Aesthetic & Vibe | Dark mode with neon saffron, loud colors, crypto-bro jargon, 19vw giant text | Apple-minimalist cream/alabaster palette (`#FBFBFC`, `#FFFFFF`), subtle typography, high-trust fintech feel |
| Trust & Compliance | Speculative and opaque | Clear Indian regulatory compliance: Section 194S 1% TDS automation, Form 26AS reports, 1:1 audited custody |
| Baskets & NAV | Confusing tables | 6 Curated Institutional Baskets with visual allocation bars, live INR prices, and 1-click breakdown inspector |
| SIP Compounding | Clunky calculator | Apple-grade Real-Time Compounding Calculator comparing Baskly SIP vs Nifty 50 vs Fixed Deposit |
| Investor Fit | None | Interactive 3-Step Risk Profiler Quiz matching users to their ideal basket ratio (Preservation, Balanced, Alpha) |
| Payment Flow | Unclear crypto-wallet friction | NPCI UPI AutoPay Simulation: Direct bank debit, 0% lock-in, 1-click cancellation guarantee |

---

## Full-Stack Architecture

Baskly.money is built as a modern decoupled full-stack platform:

- Frontend (`web/`): Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, and Three.js hero visuals.
- Backend (`server/`): Spring Boot 3.3.4, Java 21, Spring Security 6 (JWT, RBAC), Spring Data JPA, and Hibernate.
- Database & Migrations: PostgreSQL with Flyway automated migrations (V1 to V5).
- Real-Time Pricing Oracle: Hybrid multi-source ticker engine integrating Binance WebSocket miniTickers, CoinDCX USDT/INR exchange rates, and CoinGecko fallbacks.

---

## Project Structure

```
baskly-money/
├── web/                             # Next.js 16 frontend application
│   ├── src/
│   │   ├── app/                     # App Router pages (Home, Auth, Customer/Manager/Admin Dashboards)
│   │   ├── components/              # Reusable UI components (Basket cards, Modals, SIP calculator)
│   │   ├── context/                 # BasklyContext state provider
│   │   ├── services/                # API client (api.ts, authApi.ts) & Pricing Oracle (WebSocket/REST)
│   │   └── types/                   # TypeScript domain models and interfaces
│   ├── public/                      # Static assets and legacy interactive fallback
│   ├── .env.example                 # Frontend environment variables template
│   ├── .env.local                   # Local frontend configuration
│   └── package.json                 # Node dependencies and build scripts
│
├── server/                          # Spring Boot 3.3.4 REST API backend
│   ├── src/main/java/money/baskly/
│   │   ├── auth/                    # JWT authentication, BCrypt hashing, OTP grant service, RBAC filters
│   │   ├── controller/              # REST controllers (Basket, Portfolio, Order, Mandate, Report, Manager)
│   │   ├── dto/                     # Request and response Data Transfer Objects
│   │   ├── entity/                  # JPA entities (Baskets, Users, Holdings, Mandates, Transactions)
│   │   ├── repository/              # Spring Data JPA repositories
│   │   └── service/                 # Business logic (NavEngine, PortfolioService, ManagerService, PricingOracle)
│   ├── src/main/resources/
│   │   ├── application.yml          # Spring datasource, Flyway, mail, and scheduler properties
│   │   └── db/migration/            # Flyway SQL migrations (V1 to V5 PostgreSQL schema & seed data)
│   ├── pom.xml                      # Maven project configuration
│   └── mvnw / mvnw.cmd              # Maven wrapper executables
│
├── run-backend.ps1                  # 1-click backend launcher for PowerShell (auto-detects JDK 21)
├── run-backend.cmd                  # 1-click backend launcher for Windows Command Prompt
├── .env.example                     # Unified environment configuration template
└── README.md                        # Project documentation and setup guide
```

---

## Prerequisites

Before running the project locally, ensure you have installed:

- Node.js: v18.18+ or v20+ (Node 20 LTS recommended)
- Java: JDK 21 (Eclipse Temurin, Oracle JDK, or Microsoft OpenJDK)
- Apache Maven: 3.8+ (optional if using the included `mvnw` wrapper)
- PostgreSQL: 15+ (local instance running on port 5432, or configured in application.yml)

---

## Environment Setup

1. Backend Database and Configuration

Create a local PostgreSQL database named `baskly_money`:

```sql
CREATE DATABASE baskly_money;
```

The backend configuration is managed via `server/src/main/resources/application.yml` or environment variables defined in `.env.example`.
Default credentials used by the backend if not overridden:
- Database URL: `jdbc:postgresql://localhost:5432/baskly_money`
- Database Username: `postgres`
- Database Password: (empty by default)
- Server Port: `8080`

Flyway automatically applies all database migrations (`V1` to `V5`) and seeds initial fund baskets and demo accounts on application startup.

2. Frontend Environment (`web/.env.local`)

In the `web/` directory, create or verify `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## How to Run the Backend (Spring Boot)

You can launch the backend using any of the following methods:

Method 1: One-click launcher (PowerShell on Windows)

```powershell
.\run-backend.ps1
```

Method 2: One-click launcher (CMD on Windows)

```cmd
run-backend.cmd
```

Method 3: Direct Maven Wrapper command

```bash
cd server
./mvnw spring-boot:run
```

On Windows CMD/PowerShell:

```powershell
cd server
.\mvnw.cmd spring-boot:run
```

The Spring Boot backend will start on: `http://localhost:8080`
API base path: `http://localhost:8080/api/v1`

---

## How to Run the Frontend (Next.js)

1. Open a new terminal and navigate to the `web/` directory:

```bash
cd web
```

2. Install dependencies:

```bash
npm install
```

3. Start the Next.js development server:

```bash
npm run dev
```

The application will be accessible at: `http://localhost:3000`

---

## Running Automated Tests

Run backend unit and integration tests (77 tests covering auth, RBAC, orders, and NAV math):

```bash
cd server
./mvnw test
```

On Windows:

```powershell
cd server
.\mvnw.cmd test
```

Run frontend pricing oracle unit tests:

```bash
cd web
npm test
```

Run frontend TypeScript and linting checks:

```bash
cd web
npx tsc --noEmit
npm run lint
```

---

## Key REST API Endpoints

Public Endpoints (No authentication required):
- `GET /api/v1/funds` — Retrieve the catalogue of 6 curated crypto baskets
- `GET /api/v1/funds/{id}` — Fetch detailed basket composition and weights
- `GET /api/v1/funds/{id}/nav?interval=1w|1m|1y` — Retrieve historical NAV chart data
- `POST /api/v1/auth/register` — Public customer registration
- `POST /api/v1/auth/login` — Email and password authentication
- `POST /api/v1/auth/google` — Google OAuth credential exchange
- `POST /api/v1/auth/otp/send` — Request email verification OTP
- `POST /api/v1/auth/otp/verify` — Verify OTP and obtain registration verification grant
- `GET /api/v1/reports/tds` — Download Section 194S TDS ledger (CSV export)

Authenticated Customer Endpoints (Bearer JWT or baskly_session cookie):
- `GET /api/v1/portfolio` — Fetch user portfolio valuation, holdings, and transaction history
- `POST /api/v1/orders/buy` — Place a basket buy order
- `POST /api/v1/orders/redeem` — Place a redemption order with automated 1% Section 194S TDS deduction
- `POST /api/v1/orders/sip` — Register a new NPCI UPI AutoPay recurring mandate
- `POST /api/v1/mandates/{id}/toggle` — Pause or resume an active UPI mandate

Fund Manager & Admin Operations (Requires FUND_MANAGER or ADMIN role):
- `POST /api/v1/funds/{id}/nav` — Update live fund NAV snapshot
- `GET /api/v1/manager/summary` — Aggregate AUM, active SIP counts, and slippage telemetry
- `POST /api/v1/manager/circuit-breaker` — Emergency circuit breaker toggle (freezes withdrawals and trading)
- `POST /api/v1/manager/rebalance` — Execute portfolio constituent rebalance and record audit log

---

## Design Tokens

- Cream Background: `#FBFBFC`
- Subtle Surface: `#F5F5F7`
- Card Background: `#FFFFFF`
- Hairline Border: `rgba(0, 0, 0, 0.06)`
- Primary Text: `#0A0D14`
- Secondary Text: `#525866`
- Positive Returns: `#059669`
- Font Stack: `-apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "SF Pro Display", sans-serif`
