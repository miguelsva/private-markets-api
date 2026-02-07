const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  // Validate NODE_ENV is set
  const env = process.env.NODE_ENV;
  if (!env) {
    console.error('✗ ERROR: NODE_ENV environment variable is not set');
    console.error('  Set NODE_ENV to one of: development, test, production');
    process.exit(1);
  }

  const isTestEnv = env === 'test';
  const isProduction = env === 'production';

  const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: isTestEnv
      ? (process.env.TEST_DB_NAME || 'private_markets_test')
      : (process.env.DB_NAME || 'private_markets'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };

  const pool = new Pool(poolConfig);

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Environment: ${env}`);
    console.log(`Database: ${poolConfig.database}`);
    console.log(`Host: ${poolConfig.host}:${poolConfig.port}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Production safety check with delay
    if (isProduction) {
      console.warn('');
      console.warn('⚠️  WARNING: Running migrations in PRODUCTION environment!');
      console.warn('⚠️  This will modify the production database!');
      console.warn('');
      console.warn('   Press Ctrl+C to cancel...');
      console.warn('   Continuing in 5 seconds...');
      console.warn('');

      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('Proceeding with production migration...');
      console.log('');
    }

    console.log('Running migrations...');
    const migrationFile = path.join(__dirname, '../migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    await pool.query(sql);

    console.log('✓ Migrations completed successfully');
  } catch (error) {
    if (error instanceof Error) {
      console.error('✗ Migration failed:', error.message);
    } else {
      console.error('✗ Migration failed:', error);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
