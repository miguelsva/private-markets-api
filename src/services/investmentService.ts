import { query } from '../database/db';
import { Investment, CreateInvestmentInput } from '../types';

export class InvestmentService {
  async getInvestmentsByFundId(fundId: string): Promise<Investment[]> {
    const result = await query(
      'SELECT * FROM investments WHERE fund_id = $1 ORDER BY investment_date DESC',
      [fundId]
    );
    return result.rows;
  }

  async createInvestment(fundId: string, input: CreateInvestmentInput): Promise<Investment> {
    const { investor_id, amount_usd, investment_date } = input;

    const result = await query(
      `INSERT INTO investments (investor_id, fund_id, amount_usd, investment_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [investor_id, fundId, amount_usd, investment_date]
    );

    return result.rows[0];
  }
}
