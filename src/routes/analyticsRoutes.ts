import { Router } from 'express';
import { getFundAnalytics } from '../controllers/analyticsController';
import { validate } from '../middleware/validator';

const router = Router();

// GET /funds/:fund_id/analytics - Get analytics for a specific fund
router.get(
  '/:fund_id/analytics',
  validate([
    { field: 'fund_id', required: true, type: 'uuid' }
  ]),
  getFundAnalytics
);

export default router;
