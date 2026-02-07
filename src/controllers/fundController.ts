import { Request, Response } from 'express';
import { FundService } from '../services/fundService';
import { asyncHandler } from '../middleware/errorHandler';

const fundService = new FundService();

export const getAllFunds = asyncHandler(async (_req: Request, res: Response) => {
  const funds = await fundService.getAllFunds();
  res.status(200).json(funds);
});

export const getFundById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const fund = await fundService.getFundById(id);
  res.status(200).json(fund);
});

export const createFund = asyncHandler(async (req: Request, res: Response) => {
  const fund = await fundService.createFund(req.body);
  res.status(201).json(fund);
});

export const updateFund = asyncHandler(async (req: Request, res: Response) => {
  const fund = await fundService.updateFund(req.body);
  res.status(200).json(fund);
});
