import { query } from '../database/db';
import { Investor, CreateInvestorInput } from '../types';

export class InvestorService {
  async getAllInvestors(): Promise<Investor[]> {
    const result = await query('SELECT * FROM investors ORDER BY created_at DESC');
    return result.rows;
  }

  async createInvestor(input: CreateInvestorInput): Promise<Investor> {
    const { name, investor_type, email } = input;

    const result = await query(
      `INSERT INTO investors (name, investor_type, email)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, investor_type, email]
    );

    return result.rows[0];
  }
}
