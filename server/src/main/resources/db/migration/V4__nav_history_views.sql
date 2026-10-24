-- ==============================================================================
-- Baskly.money - PostgreSQL Database Migration
-- Version: V4__nav_history_views.sql
-- Description: Compatibility views (av_history, nav_history) and time-series index for NAV snapshots
-- ==============================================================================

-- 1. Create optimized composite index for time-series interval queries
CREATE INDEX IF NOT EXISTS idx_nav_snapshots_basket_time ON nav_snapshots(basket_id, recorded_at ASC);

-- 2. Create compatibility view 'av_history' directly mapping to nav_snapshots
CREATE OR REPLACE VIEW av_history AS
SELECT id, basket_id, nav, recorded_at
FROM nav_snapshots;

-- 3. Create compatibility view 'nav_history' directly mapping to nav_snapshots
CREATE OR REPLACE VIEW nav_history AS
SELECT id, basket_id, nav, recorded_at
FROM nav_snapshots;

-- 4. Seed baseline 100.00 snapshots for canonical baskets if not already present
INSERT INTO nav_snapshots (basket_id, nav, recorded_at)
SELECT b.id, COALESCE(b.nav, 100.0000), CURRENT_TIMESTAMP
FROM baskets b
WHERE NOT EXISTS (
    SELECT 1 FROM nav_snapshots s WHERE s.basket_id = b.id
);
