-- ==============================================================================
-- Baskly.money - PostgreSQL Database Migration
-- Version: V3__auth_accounts.sql
-- Description: Core Schema for Production-Ready Authentication System
--              Accounts, Roles, Verification Grants, and Audit Timestamps
-- ==============================================================================

CREATE TABLE IF NOT EXISTS auth_accounts (
    id VARCHAR(64) PRIMARY KEY,
    first_name VARCHAR(128) NOT NULL,
    middle_name VARCHAR(128),
    last_name VARCHAR(128) NOT NULL,
    date_of_birth DATE,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    mobile_country_code VARCHAR(8) NOT NULL DEFAULT '+91',
    mobile_number VARCHAR(32),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(128),
    state VARCHAR(128),
    country VARCHAR(128),
    gender VARCHAR(64),
    terms_version VARCHAR(32),
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    password_hash VARCHAR(255),
    account_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'PENDING_VERIFICATION', 'DISABLED')),
    role VARCHAR(32) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('ADMIN', 'FUND_MANAGER', 'CUSTOMER', 'SUPPORT')),
    google_id VARCHAR(128),
    avatar VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_auth_accounts_email ON auth_accounts(email);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_google_id ON auth_accounts(google_id);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_role ON auth_accounts(role);
