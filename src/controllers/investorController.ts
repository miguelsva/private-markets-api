import { Request, Response } from 'express';
import { InvestorService } from '../services/investorService';
import { asyncHandler } from '../middleware/errorHandler';

const investorService = new InvestorService();

export const getAllInvestors = asyncHandler(async (_req: Request, res: Response) => {
  const investors = await investorService.getAllInvestors();
  res.status(200).json(investors);
});

export const createInvestor = asyncHandler(async (req: Request, res: Response) => {
  const investor = await investorService.createInvestor(req.body);
  res.status(201).json(investor);
});
