import express, { Application } from 'express';
import fundRoutes from './routes/fundRoutes';
import investorRoutes from './routes/investorRoutes';
import investmentRoutes from './routes/investmentRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger for development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/funds', fundRoutes);
app.use('/funds', investmentRoutes); // Investment routes are nested under /funds/:fund_id/investments
app.use('/investors', investorRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
