# Titanbay Private Markets API

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
- **Graceful Shutdown**: Proper cleanup of database connections on server shutdown

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
git clone <repository-url>
cd private-markets-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the `.env` file and configure with your PostgreSQL credentials:

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

**Note**: The project includes production safety features that prevent destructive operations in production environments.

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

**Note**: Tests use a separate test database (`private_markets_test`) and will clean it before running.

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

## API Documentation

For detailed API documentation including request/response formats, see the [API specification](https://storage.googleapis.com/interview-api-doc-funds.wearebusy.engineering/index.html).

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

## Project Structure

```
.
├── migrations/          # SQL migration files
├── scripts/             # Utility scripts (migrate, seed)
├── src/
│   ├── controllers/     # Request handlers (fund, investor, investment)
│   ├── database/        # Database connection and safe query utilities
│   ├── middleware/      # Express middleware (validation, error handling)
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic (fund, investor, investment)
│   ├── tests/           # Integration tests for all endpoints
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions (environment safety)
│   ├── app.ts           # Express app configuration
│   └── index.ts         # Application entry point
├── .env                 # Environment variables (not in version control)
├── .gitignore
├── jest.config.js
├── package.json
└── tsconfig.json
```

## NPM Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful GET/PUT requests
- `201 Created` - Successful POST requests
- `400 Bad Request` - Validation errors or invalid data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Unexpected server errors

Error responses include descriptive messages:

```json
{
  "message": "Validation failed",
  "errors": [
    "name is required",
    "vintage_year must be at least 1900"
  ]
}
```

## Design Decisions

For information about architectural choices and design decisions, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Production Safety Features

The API includes several production-ready safety mechanisms:

- **Environment Protection**: Destructive database operations (truncate, drop) are protected in production
- **Migration Safety**: 5-second delay warning before running migrations in production
- **Connection Management**: Graceful shutdown with proper cleanup of database connections
- **Query Logging**: Development-mode query logging for debugging (disabled in production/test)
- **Client Timeout Monitoring**: Automatic detection and cleanup of idle database connections
