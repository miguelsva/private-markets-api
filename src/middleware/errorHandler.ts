import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Handle PostgreSQL errors
  if ('code' in err) {
    const code = (err as { code: string }).code;

    switch (code) {
      case '23505': // Unique constraint violation
        return res.status(409).json({
          message: 'A record with this value already exists',
        });
      case '23503': // Foreign key constraint violation
        return res.status(400).json({
          message: 'Referenced record does not exist',
        });
      case '23514': // Check constraint violation
        return res.status(400).json({
          message: 'Invalid data provided',
        });
      case '22P02': // Invalid data type
        return res.status(400).json({
          message: 'Invalid data format',
        });
    }
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled error:', err);
  }

  return res.status(500).json({
    message: 'Internal server error',
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
