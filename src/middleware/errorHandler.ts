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
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // PostgreSQL unique constraint violation
  if ((err as any).code === '23505') {
    return res.status(400).json({
      message: 'A record with this value already exists',
    });
  }

  // PostgreSQL foreign key constraint violation
  if ((err as any).code === '23503') {
    return res.status(400).json({
      message: 'Referenced record does not exist',
    });
  }

  // PostgreSQL check constraint violation
  if ((err as any).code === '23514') {
    return res.status(400).json({
      message: 'Invalid data provided',
    });
  }

  // PostgreSQL invalid data type
  if ((err as any).code === '22P02') {
    return res.status(400).json({
      message: 'Invalid data format',
    });
  }

  console.error('Unhandled error:', err);

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
