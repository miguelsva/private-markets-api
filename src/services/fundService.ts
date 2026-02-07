import { query } from '../database/db';
import { Fund, CreateFundInput, UpdateFundInput } from '../types';
import { AppError } from '../middleware/errorHandler';

export class FundService {
  async getAllFunds(): Promise<Fund[]> {
    const result = await query('SELECT * FROM funds ORDER BY created_at DESC');
    return result.rows;
  }

  async getFundById(id: string): Promise<Fund> {
    const result = await query('SELECT * FROM funds WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new AppError('Fund not found', 404);
    }

    return result.rows[0];
  }

  async createFund(input: CreateFundInput): Promise<Fund> {
    const { name, vintage_year, target_size_usd, status } = input;

    const result = await query(
      `INSERT INTO funds (name, vintage_year, target_size_usd, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, vintage_year, target_size_usd, status]
    );

    return result.rows[0];
  }

  async updateFund(input: UpdateFundInput): Promise<Fund> {
    const { id, name, vintage_year, target_size_usd, status } = input;

    // Check if fund exists
    await this.getFundById(id);

    const result = await query(
      `UPDATE funds
       SET name = $1, vintage_year = $2, target_size_usd = $3, status = $4
       WHERE id = $5
       RETURNING *`,
      [name, vintage_year, target_size_usd, status, id]
    );

    return result.rows[0];
  }
}
