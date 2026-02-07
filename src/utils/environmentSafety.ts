/**
 * Environment safety utilities to prevent dangerous operations in production
 */

/**
 * Ensures the current environment is NOT production
 * @param operation - Description of the operation being performed
 * @throws {Error} If NODE_ENV is not set or is set to 'production'
 */
export function requireNonProduction(operation: string): void {
  const env = process.env.NODE_ENV;

  if (!env) {
    throw new Error(
      `NODE_ENV is not set. Cannot perform operation: ${operation}`
    );
  }

  if (env === 'production') {
    throw new Error(
      `Operation "${operation}" is not allowed in production environment`
    );
  }
}

/**
 * Ensures the current environment is specifically 'test'
 * @param operation - Description of the operation being performed
 * @throws {Error} If NODE_ENV is not set to 'test'
 */
export function requireTestEnvironment(operation: string): void {
  const env = process.env.NODE_ENV;

  if (env !== 'test') {
    throw new Error(
      `Operation "${operation}" can only be performed in test environment. Current: ${env || 'undefined'}`
    );
  }
}

/**
 * Validates that NODE_ENV is set to a valid value
 * @throws {Error} If NODE_ENV is not set
 */
export function validateEnvironment(): void {
  const env = process.env.NODE_ENV;
  const validEnvironments = ['development', 'test', 'production'];

  if (!env) {
    throw new Error('NODE_ENV environment variable is not set');
  }

  if (!validEnvironments.includes(env)) {
    console.warn(
      `Warning: NODE_ENV is set to '${env}', expected one of: ${validEnvironments.join(', ')}`
    );
  }
}
