import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Validate NODE_ENV is set
if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV environment variable is not set');
}

const env = process.env.NODE_ENV;
const isTestEnv = env === 'test';
const isProduction = env === 'production';

// Production environment validation
if (isProduction) {
  const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(
      `Production database configuration incomplete. Missing environment variables: ${missing.join(', ')}`
    );
  }

  // Warn if using default ports in production
  if (!process.env.DB_PORT) {
    console.warn('⚠️  Warning: DB_PORT not set, using default port 5432 in production');
  }
}

const config: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: isTestEnv
    ? (process.env.TEST_DB_NAME || 'private_markets_test')
    : (process.env.DB_NAME || 'private_markets'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(config);

// Log database connection info (non-sensitive)
console.log(`Database connection initialized:`);
console.log(`  Environment: ${env}`);
console.log(`  Database: ${config.database}`);
console.log(`  Host: ${config.host}:${config.port}`);
if (isProduction) {
  console.log(`  ⚠️  Connected to PRODUCTION database`);
}

// Test database connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const release = client.release;

  // Set a timeout of 5 seconds for the query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);

  // Override release to clear timeout
  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return release.apply(client);
  };

  return client;
};

export const closePool = async () => {
  await pool.end();
};
