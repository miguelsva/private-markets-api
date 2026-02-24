import { Request, Response } from 'express';
import { query } from '../database/db';
import { asyncHandler, AppError } from '../middleware/errorHandler';

/**
 * Allocate management fee proportionally across investors.
 * TODO: Implement this function - currently returns empty array
 */
function allocateManagementFees(
  _totalFeeAmount: number,
  _investments: Array<{ investor_id: string; investor_name: string; amount: number }>
): Array<{ investor_id: string; investor_name: string; fee: number; percentage: number }> {
  return [];
}

export const getFundAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { fund_id } = req.params;

  // Fetch fund data
  const fundResult = await query('SELECT * FROM funds WHERE id = $1', [fund_id]);
  if (fundResult.rows.length === 0) {
    throw new AppError('Fund not found', 404);
  }
  const fund = fundResult.rows[0];

  // Fetch investments for this fund
  const investmentResult = await query(
    'SELECT * FROM investments WHERE fund_id = $1 ORDER BY amount_usd DESC',
    [fund_id]
  );
  const investments = investmentResult.rows;

  // Collect investor details for each investment
  const investorsData: Array<{
    investor_id: string;
    investor_name: string;
    investor_type: string;
    amount: number;
  }> = [];
  for (const investment of investments) {
    const investorResult = await query(
      'SELECT * FROM investors WHERE id = $1',
      [investment.investor_id]
    );
    const investor = investorResult.rows[0];
    investorsData.push({
      investor_id: investor.id,
      investor_name: investor.name,
      investor_type: investor.investor_type,
      amount: parseFloat(investment.amount_usd),
    });
  }

  // Calculate total raised
  let totalRaised = 0;
  for (let i = 0; i < investorsData.length; i++) {
    totalRaised = totalRaised + investorsData[i].amount;
  }

  // Calculate fund metrics
  const utilizationPct = (totalRaised / parseFloat(fund.target_size_usd)) * 100;
  const avgInvestment = totalRaised / investments.length;

  // Group investments by investor type
  const byType: Record<string, { count: number; total: number }> = {};
  investorsData.forEach((inv) => {
    const type = inv.investor_type;
    if (!byType[type]) {
      byType[type] = { count: 0, total: 0 };
    }
    byType[type].count++;
    byType[type].total += inv.amount;
  });
  const byInvestorType: Record<string, { count: number; total: number; percentage: number }> = {};
  Object.keys(byType).forEach((type) => {
    byInvestorType[type] = {
      count: byType[type].count,
      total: byType[type].total,
      percentage: Math.round((byType[type].total / totalRaised) * 10000) / 100,
    };
  });

  // Rank top investors
  const sorted = [...investorsData].sort((a, b) => b.amount - a.amount);
  const topInvestors = sorted.slice(0, 5).map((inv, index) => ({
    investor_id: inv.investor_id,
    investor_name: inv.investor_name,
    total_invested: inv.amount,
    percentage: Math.round((inv.amount / totalRaised) * 10000) / 100,
    rank: index + 1,
  }));

  // Calculate management fees
  const totalManagementFee = totalRaised * 0.02;
  const feeAllocations = allocateManagementFees(totalManagementFee, investorsData);

  // Build response
  res.status(200).json({
    fund_id: fund.id,
    total_raised: totalRaised,
    target_size: parseFloat(fund.target_size_usd),
    utilization_pct: Math.round(utilizationPct * 100) / 100,
    investor_count: investments.length,
    average_investment: Math.round(avgInvestment * 100) / 100,
    top_investors: topInvestors,
    by_investor_type: byInvestorType,
    fee_distribution: {
      total_management_fee: totalManagementFee,
      by_investor: feeAllocations,
    },
  });
});
