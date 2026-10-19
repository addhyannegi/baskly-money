-- ==============================================================================
-- Baskly.money - PostgreSQL Database Migration
-- Version: V1__init_schema.sql
-- Description: Core Schema for Baskets, Constituents, NAV, Users, Portfolios,
--              NPCI Mandates, Section 194S TDS Transactions, Rebalance Logs
-- ==============================================================================

-- 1. Users Table (Retail Investors & Fund Managers)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar VARCHAR(512),
    given_name VARCHAR(128),
    role VARCHAR(32) NOT NULL DEFAULT 'retail' CHECK (role IN ('retail', 'fund_manager')),
    kyc_status VARCHAR(32) NOT NULL DEFAULT 'VERIFIED' CHECK (kyc_status IN ('VERIFIED', 'PENDING', 'REJECTED')),
    pan VARCHAR(16),
    cash_balance_inr NUMERIC(18, 2) NOT NULL DEFAULT 25000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Baskets Table (The 6 Curated Thematic Indices)
CREATE TABLE IF NOT EXISTS baskets (
    id VARCHAR(64) PRIMARY KEY,
    index_num VARCHAR(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    serif_word VARCHAR(64) NOT NULL,
    tagline VARCHAR(512) NOT NULL,
    description TEXT NOT NULL,
    risk VARCHAR(64) NOT NULL,
    risk_color VARCHAR(32) NOT NULL,
    fee_pct NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
    min_sip NUMERIC(15, 2) NOT NULL DEFAULT 1000.00,
    expected_cagr NUMERIC(6, 2) NOT NULL,
    nav NUMERIC(15, 4) NOT NULL DEFAULT 100.0000,
    change_24h NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Basket Constituents (Constituent Tokens and Weights)
CREATE TABLE IF NOT EXISTS basket_constituents (
    id BIGSERIAL PRIMARY KEY,
    basket_id VARCHAR(64) NOT NULL REFERENCES baskets(id) ON DELETE CASCADE,
    symbol VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    weight NUMERIC(6, 2) NOT NULL,
    color VARCHAR(32),
    price_inr NUMERIC(18, 4) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_basket_symbol UNIQUE (basket_id, symbol)
);

-- 4. NAV Snapshots (Historical Time-Series for Charting)
CREATE TABLE IF NOT EXISTS nav_snapshots (
    id BIGSERIAL PRIMARY KEY,
    basket_id VARCHAR(64) NOT NULL REFERENCES baskets(id) ON DELETE CASCADE,
    nav NUMERIC(15, 4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Portfolio Holdings (Units per user per basket)
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    basket_id VARCHAR(64) NOT NULL REFERENCES baskets(id) ON DELETE CASCADE,
    units NUMERIC(18, 6) NOT NULL DEFAULT 0,
    avg_buy_nav NUMERIC(15, 4) NOT NULL DEFAULT 100.0000,
    invested_amount_inr NUMERIC(18, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_basket UNIQUE (user_id, basket_id)
);

-- 6. UPI AutoPay e-Mandates (NPCI Recurring Debits)
CREATE TABLE IF NOT EXISTS upi_mandates (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    basket_id VARCHAR(64) NOT NULL REFERENCES baskets(id) ON DELETE CASCADE,
    monthly_amount_inr NUMERIC(15, 2) NOT NULL,
    debit_day INT NOT NULL CHECK (debit_day >= 1 AND debit_day <= 31),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELLED')),
    vpa VARCHAR(255) NOT NULL,
    next_debit_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Transactions Ledger (Buys and Withdrawals with 1% Section 194S TDS)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    basket_id VARCHAR(64) NOT NULL REFERENCES baskets(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('BUY', 'WITHDRAWAL')),
    amount_inr NUMERIC(18, 2) NOT NULL,
    units NUMERIC(18, 6) NOT NULL,
    nav NUMERIC(15, 4) NOT NULL,
    tds_inr NUMERIC(18, 2) NOT NULL DEFAULT 0,
    net_amount_inr NUMERIC(18, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SETTLED' CHECK (status IN ('SETTLED', 'CREDITED_TO_BANK', 'PENDING')),
    bank_ref VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Rebalance Logs (Fund Manager Operations)
CREATE TABLE IF NOT EXISTS rebalance_logs (
    id VARCHAR(64) PRIMARY KEY,
    basket_id VARCHAR(64) NOT NULL REFERENCES baskets(id) ON DELETE CASCADE,
    manager_name VARCHAR(128) NOT NULL,
    trades_executed INT NOT NULL DEFAULT 0,
    slippage_pct NUMERIC(6, 4) NOT NULL DEFAULT 0,
    gas_cost_inr NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED')),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. System Settings (Circuit Breaker & Global Switches)
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_nav_snapshots_basket ON nav_snapshots(basket_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_holdings_user ON portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_mandates_user ON upi_mandates(user_id, status);
