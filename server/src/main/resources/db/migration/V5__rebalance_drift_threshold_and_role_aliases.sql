-- ==============================================================================
-- Baskly.money - PostgreSQL Database Migration
-- Version: V5__rebalance_drift_threshold_and_role_aliases.sql
-- Description: Add rebalance_drift_threshold to baskets & basket_constituents,
--              status to portfolio_holdings, RETAIL_USER role support, and
--              fund/nav compatibility aliases on nav_history view.
-- ==============================================================================

-- 1. Add rebalance_drift_threshold to baskets (curated thematic funds)
ALTER TABLE baskets ADD COLUMN IF NOT EXISTS rebalance_drift_threshold NUMERIC(6, 2) NOT NULL DEFAULT 5.00;

-- 2. Add rebalance_drift_threshold to basket constituents
ALTER TABLE basket_constituents ADD COLUMN IF NOT EXISTS rebalance_drift_threshold NUMERIC(6, 2) NOT NULL DEFAULT 5.00;

-- 3. Add status column to portfolio_holdings
ALTER TABLE portfolio_holdings ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE';

-- 4. Update auth_accounts role CHECK constraint to support RETAIL_USER
ALTER TABLE auth_accounts DROP CONSTRAINT IF EXISTS auth_accounts_role_check;
ALTER TABLE auth_accounts ADD CONSTRAINT auth_accounts_role_check 
    CHECK (role IN ('ADMIN', 'FUND_MANAGER', 'CUSTOMER', 'SUPPORT', 'RETAIL_USER'));

-- 5. Extend compatibility view 'nav_history' with fund_id, nav_inr, and timestamp aliases
DROP VIEW IF EXISTS nav_history;
CREATE VIEW nav_history AS
SELECT 
    id, 
    basket_id, 
    basket_id AS fund_id, 
    nav, 
    nav AS nav_inr, 
    recorded_at, 
    recorded_at AS timestamp
FROM nav_snapshots;
