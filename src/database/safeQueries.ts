/**
 * Safe query wrappers that enforce environment checks for dangerous operations
 */

import { pool } from './db';
import { requireNonProduction, requireTestEnvironment } from '../utils/environmentSafety';

/**
 * Safely executes a DELETE query with environment protection
 * Only works in non-production environments
 * @param table - The table name to delete from
 * @param whereClause - The WHERE condition (e.g., "id = $1")
 * @param values - The parameter values for the WHERE clause
 * @returns Query result
 * @throws {Error} If NODE_ENV is production or not set
 */
export async function safeDelete(
  table: string,
  whereClause: string,
  values: any[]
): Promise<any> {
  requireNonProduction(`DELETE FROM ${table}`);

  const query = `DELETE FROM ${table} WHERE ${whereClause}`;
  return pool.query(query, values);
}

/**
 * Safely truncates a table (removes all rows)
 * Only works in test environment
 * @param table - The table name to truncate
 * @returns Query result
 * @throws {Error} If NODE_ENV is not 'test'
 */
export async function safeTruncate(table: string): Promise<any> {
  requireTestEnvironment(`TRUNCATE ${table}`);

  return pool.query(`TRUNCATE TABLE ${table} CASCADE`);
}

/**
 * Safely truncates multiple tables
 * Only works in test environment
 * @param tables - Array of table names to truncate
 * @returns Query result
 * @throws {Error} If NODE_ENV is not 'test'
 */
export async function safeTruncateMultiple(tables: string[]): Promise<any> {
  requireTestEnvironment('TRUNCATE multiple tables');

  const tableList = tables.join(', ');
  return pool.query(`TRUNCATE TABLE ${tableList} CASCADE`);
}

/**
 * Clears all application tables (for test cleanup)
 * Only works in test environment
 * @throws {Error} If NODE_ENV is not 'test'
 */
export async function clearAllTables(): Promise<void> {
  requireTestEnvironment('Clear all tables');

  // Order matters: child tables first due to foreign keys
  await pool.query(`
    TRUNCATE TABLE investments CASCADE;
    TRUNCATE TABLE investors CASCADE;
    TRUNCATE TABLE funds CASCADE;
  `);
}

/**
 * Safely drops a table
 * Only works in test environment
 * @param table - The table name to drop
 * @param ifExists - Whether to use IF EXISTS clause (default: true)
 * @returns Query result
 * @throws {Error} If NODE_ENV is not 'test'
 */
export async function safeDrop(table: string, ifExists: boolean = true): Promise<any> {
  requireTestEnvironment(`DROP TABLE ${table}`);

  const existsClause = ifExists ? 'IF EXISTS' : '';
  return pool.query(`DROP TABLE ${existsClause} ${table} CASCADE`);
}
