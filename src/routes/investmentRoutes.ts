import { Router } from 'express';
import { getInvestmentsByFundId, createInvestment } from '../controllers/investmentController';
import { validate } from '../middleware/validator';

const router = Router();

// GET /funds/:fund_id/investments - List all investments for a specific fund
router.get(
  '/:fund_id/investments',
  validate([
    { field: 'fund_id', required: true, type: 'uuid' }
  ]),
  getInvestmentsByFundId
);

// POST /funds/:fund_id/investments - Create a new investment to a fund
router.post(
  '/:fund_id/investments',
  validate([
    { field: 'fund_id', required: true, type: 'uuid' },
    { field: 'investor_id', required: true, type: 'uuid' },
    { field: 'amount_usd', required: true, type: 'number', min: 0 },
    { field: 'investment_date', required: true, type: 'date' }
  ]),
  createInvestment
);

export default router;
