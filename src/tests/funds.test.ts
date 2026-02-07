import request from 'supertest';
import app from '../app';
import { pool } from '../database/db';
import { clearAllTables } from '../database/safeQueries';

describe('Fund Endpoints', () => {
  let createdFundId: string;

  beforeAll(async () => {
    // Clean up the test database
    await clearAllTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /funds', () => {
    it('should create a new fund with valid data', async () => {
      const fundData = {
        name: 'Test Growth Fund I',
        vintage_year: 2024,
        target_size_usd: 100000000.00,
        status: 'Fundraising'
      };

      const response = await request(app)
        .post('/funds')
        .send(fundData)
        .expect(201);

      // Use a single deep comparison for all properties except id and created_at
      expect(response.body).toEqual(
        expect.objectContaining({
          name: fundData.name,
          vintage_year: fundData.vintage_year,
          target_size_usd: String(fundData.target_size_usd),
          status: fundData.status,
          id: expect.any(String),
          created_at: expect.any(String)
        })
      );

      createdFundId = response.body.id;
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/funds')
        .send({
          name: 'Incomplete Fund'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 if vintage_year is invalid', async () => {
      const response = await request(app)
        .post('/funds')
        .send({
          name: 'Invalid Year Fund',
          vintage_year: 1800,
          target_size_usd: 100000000,
          status: 'Fundraising'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if status is invalid', async () => {
      const response = await request(app)
        .post('/funds')
        .send({
          name: 'Invalid Status Fund',
          vintage_year: 2024,
          target_size_usd: 100000000,
          status: 'InvalidStatus'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if target_size_usd is negative', async () => {
      const response = await request(app)
        .post('/funds')
        .send({
          name: 'Negative Size Fund',
          vintage_year: 2024,
          target_size_usd: -100,
          status: 'Fundraising'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /funds', () => {
    it('should return all funds', async () => {
      const response = await request(app)
        .get('/funds')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          vintage_year: expect.any(Number),
          target_size_usd: expect.any(String),
          status: expect.any(String),
          created_at: expect.any(String)
        })
      );
    });
  });

  describe('GET /funds/:id', () => {
    it('should return a specific fund by id', async () => {
      const response = await request(app)
        .get(`/funds/${createdFundId}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdFundId,
          name: expect.any(String),
          vintage_year: expect.any(Number),
          target_size_usd: expect.any(String),
          status: expect.any(String)
        })
      );
    });

    it('should return 404 if fund does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/funds/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Fund not found');
    });

    it('should return 400 if id is not a valid UUID', async () => {
      const response = await request(app)
        .get('/funds/invalid-uuid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /funds', () => {
    it('should update an existing fund', async () => {
      const updateData = {
        id: createdFundId,
        name: 'Updated Test Growth Fund I',
        vintage_year: 2024,
        target_size_usd: 200000000.00,
        status: 'Investing'
      };

      const response = await request(app)
        .put('/funds')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: createdFundId,
          name: updateData.name,
          vintage_year: updateData.vintage_year,
          target_size_usd: String(updateData.target_size_usd),
          status: updateData.status
        })
      );
    });

    it('should return 404 if fund to update does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put('/funds')
        .send({
          id: nonExistentId,
          name: 'Non-existent Fund',
          vintage_year: 2024,
          target_size_usd: 100000000,
          status: 'Fundraising'
        })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Fund not found');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .put('/funds')
        .send({
          id: createdFundId,
          name: 'Incomplete Update'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});
