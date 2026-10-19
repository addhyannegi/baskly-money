-- ==============================================================================
-- Baskly.money - PostgreSQL Database Migration
-- Version: V2__seed_baskets.sql
-- Description: Seed 6 Thematic Baskets, Constituents, Default Settings, Demo User
-- ==============================================================================

-- 1. Insert 6 Canonical Baskets
INSERT INTO baskets (id, index_num, name, serif_word, tagline, description, risk, risk_color, fee_pct, min_sip, expected_cagr, nav, change_24h)
VALUES 
(
    'top-5-index',
    '01',
    'Top-5 Bluechip Index',
    'Bluechip',
    'The five largest digital assets, market-cap weighted & rebalanced monthly.',
    'The foundational index of institutional crypto. Captures 82% of total market capitalization across Bitcoin, Ethereum, Solana, BNB, and XRP. Engineered for multi-cycle compounding.',
    'Balanced Core',
    '#0F6E56',
    1.25,
    1000.00,
    28.5,
    100.0000,
    0.00
),
(
    'crypto-gold',
    '02',
    'Crypto + Gold Reserve',
    'Reserve',
    'Digital gold meets LBMA physical gold. Dampened volatility for calm stackers.',
    'Pairs 50% tokenised physical gold (PAX Gold) with Bitcoin and Ethereum. Designed specifically for Indian households seeking hard-asset inflation protection with muted drawdowns.',
    'Conservative',
    '#9A7B56',
    0.95,
    1000.00,
    18.2,
    100.0000,
    0.00
),
(
    'bitcoin',
    '03',
    'Pure Bitcoin Sovereign',
    'Sovereign',
    '100% Bitcoin. The purest way to accumulate satoshis every month in Rupees.',
    'Undiluted exposure to the world premier scarce digital monetary asset. Built for long-horizon believers executing a disciplined Rupee-Cost Averaging mandate.',
    'High Conviction',
    '#B45309',
    0.75,
    1000.00,
    32.0,
    100.0000,
    0.00
),
(
    'ethereum',
    '04',
    'Ethereum Settlement Layer',
    'Settlement',
    '100% Ether — the programmable backbone of global tokenised finance.',
    'Direct ownership of Ethereum, powering stablecoins, institutional RWA tokenisation, and decentralised financial rails.',
    'High Conviction',
    '#4338CA',
    0.85,
    1000.00,
    29.0,
    100.0000,
    0.00
),
(
    'defi',
    '05',
    'DeFi Protocol Architects',
    'Architects',
    'Own the cash-flowing protocols replacing traditional financial middleware.',
    'Research-weighted allocation into dominant on-chain liquidity, lending, and oracle infrastructure: Uniswap, Aave, Chainlink, Pendle, and Lido.',
    'Aggressive Growth',
    '#9D174D',
    1.50,
    1000.00,
    38.0,
    100.0000,
    0.00
),
(
    'altcoin-meme',
    '06',
    'High-Beta Cultural Index',
    'Cultural',
    'Equal-weighted Asymmetric frontier. Strictly for <5% satellite allocation.',
    'Systematic momentum exposure to high-liquidity community tokens. Monthly rebalancing automatically harvests spikes and prevents single-token wipeouts.',
    'Asymmetric',
    '#B85D43',
    1.75,
    1000.00,
    45.0,
    100.0000,
    0.00
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Constituents for all 6 Baskets
-- Top-5 Bluechip Index
INSERT INTO basket_constituents (basket_id, symbol, name, weight, color, price_inr) VALUES
('top-5-index', 'BTC', 'Bitcoin', 55.00, '#D97706', 7739249.00),
('top-5-index', 'ETH', 'Ethereum', 20.00, '#4F46E5', 228879.00),
('top-5-index', 'SOL', 'Solana', 10.00, '#0D9488', 9800.00),
('top-5-index', 'BNB', 'BNB', 8.00, '#CA8A04', 68535.00),
('top-5-index', 'XRP', 'XRP', 7.00, '#1E293B', 123.00),

-- Crypto + Gold Reserve
('crypto-gold', 'PAXG', 'PAX Gold (1oz LBMA)', 50.00, '#B4833E', 396642.00),
('crypto-gold', 'BTC', 'Bitcoin', 35.00, '#D97706', 7739249.00),
('crypto-gold', 'ETH', 'Ethereum', 15.00, '#4F46E5', 228879.00),

-- Pure Bitcoin Sovereign
('bitcoin', 'BTC', 'Bitcoin', 100.00, '#D97706', 7739249.00),

-- Ethereum Settlement Layer
('ethereum', 'ETH', 'Ethereum', 100.00, '#4F46E5', 228879.00),

-- DeFi Protocol Architects
('defi', 'UNI', 'Uniswap', 25.00, '#DB2777', 690.00),
('defi', 'AAVE', 'Aave Protocol', 25.00, '#7C3AED', 14793.00),
('defi', 'LINK', 'Chainlink Oracles', 25.00, '#2563EB', 1166.00),
('defi', 'PENDLE', 'Pendle Finance', 15.00, '#0891B2', 198.00),
('defi', 'LDO', 'Lido DAO', 10.00, '#0284C7', 38.00),

-- High-Beta Cultural Index
('altcoin-meme', 'DOGE', 'Dogecoin', 20.00, '#A16207', 7.60),
('altcoin-meme', 'SHIB', 'Shiba Inu', 20.00, '#EA580C', 0.0005),
('altcoin-meme', 'PEPE', 'Pepe', 20.00, '#15803D', 0.0004),
('altcoin-meme', 'BONK', 'Bonk', 20.00, '#C2410C', 0.0003),
('altcoin-meme', 'WIF', 'dogwifhat', 20.00, '#78716C', 18.87)
ON CONFLICT (basket_id, symbol) DO NOTHING;

-- 3. Initial System Settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
('circuit_breaker_active', 'false'),
('oracle_source', 'BINANCE_COINDCX_HYBRID'),
('minimum_sip_amount', '1000')
ON CONFLICT (setting_key) DO NOTHING;

-- 4. Seed Demo Users
INSERT INTO users (id, name, email, avatar, given_name, role, kyc_status, pan, cash_balance_inr) VALUES
(
    'usr_demo_retail',
    'Rohan Verma',
    'rohan@baskly.money',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    'Rohan',
    'retail',
    'VERIFIED',
    'ABCDE1234F',
    25000.00
),
(
    'usr_demo_manager',
    'Vikramaditya Singhania',
    'vikram@baskly.money',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    'Vikramaditya',
    'fund_manager',
    'VERIFIED',
    'XYZPW9876Q',
    500000.00
)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Portfolio Holdings for Demo Retail User
INSERT INTO portfolio_holdings (user_id, basket_id, units, avg_buy_nav, invested_amount_inr) VALUES
('usr_demo_retail', 'top-5-index', 1500.000000, 100.0000, 150000.00),
('usr_demo_retail', 'crypto-gold', 1000.000000, 100.0000, 100000.00),
('usr_demo_retail', 'bitcoin', 500.000000, 100.0000, 50000.00)
ON CONFLICT (user_id, basket_id) DO NOTHING;

-- 6. Seed UPI AutoPay Mandates
INSERT INTO upi_mandates (id, user_id, basket_id, monthly_amount_inr, debit_day, status, vpa, next_debit_date) VALUES
('mandate_auto_1', 'usr_demo_retail', 'top-5-index', 5000.00, 5, 'ACTIVE', 'investor@okhdfcbank', '2026-11-05'),
('mandate_auto_2', 'usr_demo_retail', 'crypto-gold', 3000.00, 10, 'ACTIVE', 'investor@okhdfcbank', '2026-11-10')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Initial Transactions with 1% Section 194S TDS
INSERT INTO transactions (id, user_id, basket_id, type, amount_inr, units, nav, tds_inr, net_amount_inr, status, bank_ref) VALUES
('tx_init_1', 'usr_demo_retail', 'top-5-index', 'BUY', 150000.00, 1500.000000, 100.0000, 0.00, 150000.00, 'SETTLED', 'UPI-9921-X992-01'),
('tx_init_2', 'usr_demo_retail', 'crypto-gold', 'BUY', 100000.00, 1000.000000, 100.0000, 0.00, 100000.00, 'SETTLED', 'UPI-8841-B884-02'),
('tx_init_3', 'usr_demo_retail', 'bitcoin', 'BUY', 50000.00, 500.000000, 100.0000, 0.00, 50000.00, 'SETTLED', 'UPI-7712-A771-03')
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Sample Rebalance Logs for Manager Terminal
INSERT INTO rebalance_logs (id, basket_id, manager_name, trades_executed, slippage_pct, gas_cost_inr, status, reason) VALUES
('reb_log_001', 'top-5-index', 'Automated Quant Engine', 5, 0.0012, 142.50, 'SUCCESS', 'Monthly capitalization drift alignment back to target weights (BTC 55%, ETH 20%, SOL 10%, BNB 8%, XRP 7%)')
ON CONFLICT (id) DO NOTHING;
