import { Router } from 'express';
import { getAllFunds, getFundById, createFund, updateFund } from '../controllers/fundController';
import { validate } from '../middleware/validator';

const router = Router();

const fundStatusEnum = ['Fundraising', 'Investing', 'Closed'];

// GET /funds - List all funds
router.get('/', getAllFunds);

// GET /funds/:id - Get a specific fund
router.get(
  '/:id',
  validate([
    { field: 'id', required: true, type: 'uuid' }
  ]),
  getFundById
);

// POST /funds - Create a new fund
router.post(
  '/',
  validate([
    { field: 'name', required: true, type: 'string' },
    { field: 'vintage_year', required: true, type: 'number', min: 1900, max: 2100 },
    { field: 'target_size_usd', required: true, type: 'number', min: 0 },
    { field: 'status', required: true, type: 'string', enum: fundStatusEnum }
  ]),
  createFund
);

// PUT /funds - Update an existing fund
router.put(
  '/',
  validate([
    { field: 'id', required: true, type: 'uuid' },
    { field: 'name', required: true, type: 'string' },
    { field: 'vintage_year', required: true, type: 'number', min: 1900, max: 2100 },
    { field: 'target_size_usd', required: true, type: 'number', min: 0 },
    { field: 'status', required: true, type: 'string', enum: fundStatusEnum }
  ]),
  updateFund
);

export default router;
