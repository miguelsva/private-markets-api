import { Request, Response } from 'express';
import { InvestmentService } from '../services/investmentService';
import { asyncHandler } from '../middleware/errorHandler';

const investmentService = new InvestmentService();

export const getInvestmentsByFundId = asyncHandler(async (req: Request, res: Response) => {
  const { fund_id } = req.params;
  const investments = await investmentService.getInvestmentsByFundId(fund_id);
  res.status(200).json(investments);
});

export const createInvestment = asyncHandler(async (req: Request, res: Response) => {
  const { fund_id } = req.params;
  const investment = await investmentService.createInvestment(fund_id, req.body);
  res.status(201).json(investment);
});
