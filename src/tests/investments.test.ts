import request from 'supertest';
import app from '../../app';
import { pool, query } from '../../database/db';
import { clearAllTables } from '../../database/safeQueries';

describe('Investment Endpoints', () => {
  let testFundId: string;
  let testInvestorId: string;

  beforeAll(async () => {
    // Clean up the test database
    await clearAllTables();

    // Create a test fund
    const fundResult = await query(
      `INSERT INTO funds (name, vintage_year, target_size_usd, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['Test Fund for Investments', 2024, 100000000, 'Fundraising']
    );
    testFundId = fundResult.rows[0].id;

    // Create a test investor
    const investorResult = await query(
      `INSERT INTO investors (name, investor_type, email)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ['Test Investor', 'Institution', 'testinvestor@test.com']
    );
    testInvestorId = investorResult.rows[0].id;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /funds/:fund_id/investments', () => {
    it('should create a new investment with valid data', async () => {
      const investmentData = {
        investor_id: testInvestorId,
        amount_usd: 25000000.00,
        investment_date: '2024-06-15'
      };

      const response = await request(app)
        .post(`/funds/${testFundId}/investments`)
        .send(investmentData)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          investor_id: testInvestorId,
          fund_id: testFundId,
          amount_usd: String(investmentData.amount_usd),
          investment_date: expect.stringContaining('2024-06-15')
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post(`/funds/${testFundId}/investments`)
        .send({
          investor_id: testInvestorId
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 if amount_usd is negative', async () => {
      const response = await request(app)
        .post(`/funds/${testFundId}/investments`)
        .send({
          investor_id: testInvestorId,
          amount_usd: -1000,
          investment_date: '2024-06-15'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if investment_date is invalid', async () => {
      const response = await request(app)
        .post(`/funds/${testFundId}/investments`)
        .send({
          investor_id: testInvestorId,
          amount_usd: 25000000,
          investment_date: 'invalid-date'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if fund_id does not exist', async () => {
      const nonExistentFundId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/funds/${nonExistentFundId}/investments`)
        .send({
          investor_id: testInvestorId,
          amount_usd: 25000000,
          investment_date: '2024-06-15'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if investor_id does not exist', async () => {
      const nonExistentInvestorId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/funds/${testFundId}/investments`)
        .send({
          investor_id: nonExistentInvestorId,
          amount_usd: 25000000,
          investment_date: '2024-06-15'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if fund_id is not a valid UUID', async () => {
      const response = await request(app)
        .post('/funds/invalid-uuid/investments')
        .send({
          investor_id: testInvestorId,
          amount_usd: 25000000,
          investment_date: '2024-06-15'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /funds/:fund_id/investments', () => {
    it('should return all investments for a specific fund', async () => {
      const response = await request(app)
        .get(`/funds/${testFundId}/investments`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          investor_id: expect.any(String),
          fund_id: testFundId,
          amount_usd: expect.any(String),
          investment_date: expect.any(String)
        })
      );
    });

    it('should return empty array if fund has no investments', async () => {
      // Create a new fund with no investments
      const newFundResult = await query(
        `INSERT INTO funds (name, vintage_year, target_size_usd, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        ['Empty Fund', 2024, 50000000, 'Fundraising']
      );
      const emptyFundId = newFundResult.rows[0].id;

      const response = await request(app)
        .get(`/funds/${emptyFundId}/investments`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return 400 if fund_id is not a valid UUID', async () => {
      const response = await request(app)
        .get('/funds/invalid-uuid/investments')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});
