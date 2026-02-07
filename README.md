# Private Markets API

A RESTful API for managing private market funds, investors, and their investments. Built with TypeScript, Express, and PostgreSQL.

## Features

- **Fund Management**: Create, read, and update private market funds
- **Investor Management**: Register and manage investors
- **Investment Tracking**: Track investor commitments to funds
- **Data Integrity**: PostgreSQL with proper foreign keys and constraints
- **Input Validation**: Comprehensive validation with detailed error messages
- **Error Handling**: Graceful error handling with appropriate HTTP status codes
- **Testing**: Integration tests for all endpoints with Jest and Supertest
- **Production Safety**: Environment-aware safeguards for destructive operations
- **Connection Pooling**: Optimized PostgreSQL connection management with timeout handling
- **Request Logging**: Development-mode request logging for debugging
- **Graceful Shutdown**: Cleanup of database connections on server shutdown

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with `pg` (node-postgres)
- **Testing**: Jest + Supertest
- **Validation**: Custom middleware
- **Environment**: dotenv for configuration

## Prerequisites

- Node.js (v20 or higher)
- PostgreSQL (v16 or higher)
- npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/miguelsva/private-markets-api.git
cd private-markets-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create an `.env` file and configure with your PostgreSQL credentials:

```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=private_markets
DB_USER=postgres
DB_PASSWORD=your_password

# Test Database Configuration
TEST_DB_NAME=private_markets_test
```

### 4. Create databases

Create the development and test databases in PostgreSQL:

```bash
psql -U postgres
```

```sql
CREATE DATABASE private_markets;
CREATE DATABASE private_markets_test;
\q
```

### 5. Run migrations

```bash
npm run migrate
npm run migrate:test
```

### 6. Seed the database (optional)

```bash
npm run seed
```

### 7. Start the server

For development with auto-reload:

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

## Running Tests

Run the test suite:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

**Note**: Tests use a separate test database (`private_markets_test`).

## API Endpoints

### Health Check

- `GET /health` - Check API health status

### Funds

- `GET /funds` - List all funds
- `GET /funds/:id` - Get a specific fund by ID
- `POST /funds` - Create a new fund
- `PUT /funds` - Update an existing fund

### Investors

- `GET /investors` - List all investors
- `POST /investors` - Create a new investor

### Investments

- `GET /funds/:fund_id/investments` - List all investments for a specific fund
- `POST /funds/:fund_id/investments` - Create a new investment to a fund

### Example Request - Create a Fund

```bash
curl -X POST http://localhost:3000/funds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Growth Fund I",
    "vintage_year": 2024,
    "target_size_usd": 250000000.00,
    "status": "Fundraising"
  }'
```

### Example Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Growth Fund I",
  "vintage_year": 2024,
  "target_size_usd": "250000000.00",
  "status": "Fundraising",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

## Assumptions

- **Authentication**: Not implemented (not required by specifications)
- **Authorization**: Not implemented (not required by specifications)
- **Currency**: All monetary amounts are in USD
- **Decimal Precision**: Monetary values stored with 2 decimal places (DECIMAL(15,2))
- **Pagination**: Not implemented (not required by specifications)
- **Rate Limiting**: Not implemented (not required by specifications)
- **Caching**: Not implemented (not required by specifications)
- **Default Ordering**: Results ordered by creation timestamp (newest first)
- **Linting and Formatting**: Future enhancement
- **Duplicate Investments**: Same investor can make multiple investments in the same fund
- **Investment Validation**: No checks for fund capacity or maximum investment amounts
- **Audit Trail**: No change history tracking - only creation timestamps recorded
- **Time Zones**: All timestamps stored as TIMESTAMP WITH TIME ZONE (UTC)
- **Email Uniqueness**: Each investor must have a unique email address

## Design Decisions

For information about architectural choices and design decisions, see [ARCHITECTURE.md](./ARCHITECTURE.md).

