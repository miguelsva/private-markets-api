-- This file can be used to rollback the initial migration
-- Drop tables in reverse order (to handle foreign key constraints)

DROP TABLE IF EXISTS investments;
DROP TABLE IF EXISTS investors;
DROP TABLE IF EXISTS funds;

-- Drop ENUM types
DROP TYPE IF EXISTS investor_type;
DROP TYPE IF EXISTS fund_status;

-- Drop UUID extension if needed
-- DROP EXTENSION IF EXISTS "uuid-ossp";
