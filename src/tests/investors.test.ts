import request from 'supertest';
import app from '../app';
import { pool } from '../database/db';
import { clearAllTables } from '../database/safeQueries';

describe('Investor Endpoints', () => {
  beforeAll(async () => {
    // Clean up the test database
    await clearAllTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /investors', () => {
    it('should create a new investor with valid data', async () => {
      const investorData = {
        name: 'Test Investment Fund',
        investor_type: 'Institution',
        email: 'test@investmentfund.com'
      };

      const response = await request(app)
        .post('/investors')
        .send(investorData)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: investorData.name,
          investor_type: investorData.investor_type,
          email: investorData.email,
          created_at: expect.any(String)
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/investors')
        .send({
          name: 'Incomplete Investor'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/investors')
        .send({
          name: 'Invalid Email Investor',
          investor_type: 'Individual',
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if investor_type is invalid', async () => {
      const response = await request(app)
        .post('/investors')
        .send({
          name: 'Invalid Type Investor',
          investor_type: 'InvalidType',
          email: 'valid@email.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if email already exists', async () => {
      const response = await request(app)
        .post('/investors')
        .send({
          name: 'Duplicate Email Investor',
          investor_type: 'Individual',
          email: 'test@investmentfund.com' // Same email as first test
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /investors', () => {
    it('should return all investors', async () => {
      const response = await request(app)
        .get('/investors')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          investor_type: expect.any(String),
          email: expect.any(String),
          created_at: expect.any(String)
        })
      );
    });
  });
});
