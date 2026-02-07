-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE fund_status AS ENUM ('Fundraising', 'Investing', 'Closed');
CREATE TYPE investor_type AS ENUM ('Individual', 'Institution', 'Family Office');

-- Create Funds table
CREATE TABLE funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    vintage_year INTEGER NOT NULL,
    target_size_usd DECIMAL(15, 2) NOT NULL CHECK (target_size_usd > 0),
    status fund_status NOT NULL DEFAULT 'Fundraising',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_vintage_year CHECK (vintage_year >= 1900 AND vintage_year <= 2100)
);

-- Create Investors table
CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    investor_type investor_type NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create Investments table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
    amount_usd DECIMAL(15, 2) NOT NULL CHECK (amount_usd > 0),
    investment_date DATE NOT NULL,
    CONSTRAINT valid_investment_date CHECK (investment_date >= '1900-01-01')
);

-- Create indexes for better query performance
CREATE INDEX idx_investments_fund_id ON investments(fund_id);
CREATE INDEX idx_investments_investor_id ON investments(investor_id);
CREATE INDEX idx_funds_status ON funds(status);
CREATE INDEX idx_investors_type ON investors(investor_type);

-- Add comments for documentation
COMMENT ON TABLE funds IS 'Private market funds managed by the platform';
COMMENT ON TABLE investors IS 'Investors who can commit capital to funds';
COMMENT ON TABLE investments IS 'Investment commitments from investors to specific funds';
