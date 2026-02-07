import { Router } from 'express';
import { getAllInvestors, createInvestor } from '../controllers/investorController';
import { validate } from '../middleware/validator';

const router = Router();

const investorTypeEnum = ['Individual', 'Institution', 'Family Office'];

// GET /investors - List all investors
router.get('/', getAllInvestors);

// POST /investors - Create a new investor
router.post(
  '/',
  validate([
    { field: 'name', required: true, type: 'string' },
    { field: 'investor_type', required: true, type: 'string', enum: investorTypeEnum },
    { field: 'email', required: true, type: 'email' }
  ]),
  createInvestor
);

export default router;
