const { Pool } = require('pg');

async function seedData() {
  const isTestEnv = process.env.NODE_ENV === 'test';

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: isTestEnv
      ? (process.env.TEST_DB_NAME || 'private_markets_test')
      : (process.env.DB_NAME || 'private_markets'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log(`Seeding data to database: ${pool.options.database}`);

    // Insert sample funds
    const fund1Result = await pool.query(`
      INSERT INTO funds (name, vintage_year, target_size_usd, status)
      VALUES ('Growth Fund I', 2024, 250000000.00, 'Fundraising')
      RETURNING id
    `);
    const fund1Id = fund1Result.rows[0].id;

    const fund2Result = await pool.query(`
      INSERT INTO funds (name, vintage_year, target_size_usd, status)
      VALUES ('Venture Fund II', 2023, 150000000.00, 'Investing')
      RETURNING id
    `);
    const fund2Id = fund2Result.rows[0].id;

    await pool.query(`
      INSERT INTO funds (name, vintage_year, target_size_usd, status)
      VALUES ('Innovation Fund', 2025, 500000000.00, 'Fundraising')
    `);

    console.log('✓ Inserted 3 funds');

    // Insert sample investors
    const investor1Result = await pool.query(`
      INSERT INTO investors (name, investor_type, email)
      VALUES ('Goldman Sachs Asset Management', 'Institution', 'investments@gsam.com')
      RETURNING id
    `);
    const investor1Id = investor1Result.rows[0].id;

    const investor2Result = await pool.query(`
      INSERT INTO investors (name, investor_type, email)
      VALUES ('CalPERS', 'Institution', 'privateequity@calpers.ca.gov')
      RETURNING id
    `);
    const investor2Id = investor2Result.rows[0].id;

    await pool.query(`
      INSERT INTO investors (name, investor_type, email)
      VALUES ('John Smith Family Office', 'Family Office', 'investments@smithfamily.com')
    `);

    await pool.query(`
      INSERT INTO investors (name, investor_type, email)
      VALUES ('Jane Doe', 'Individual', 'jane.doe@email.com')
    `);

    console.log('✓ Inserted 4 investors');

    // Insert sample investments
    await pool.query(`
      INSERT INTO investments (investor_id, fund_id, amount_usd, investment_date)
      VALUES ($1, $2, 50000000.00, '2024-03-15')
    `, [investor1Id, fund1Id]);

    await pool.query(`
      INSERT INTO investments (investor_id, fund_id, amount_usd, investment_date)
      VALUES ($1, $2, 75000000.00, '2024-04-20')
    `, [investor2Id, fund1Id]);

    await pool.query(`
      INSERT INTO investments (investor_id, fund_id, amount_usd, investment_date)
      VALUES ($1, $2, 30000000.00, '2023-08-10')
    `, [investor1Id, fund2Id]);

    console.log('✓ Inserted 3 investments');
    console.log('\n✓ Seed data inserted successfully');
  } catch (error) {
    console.error('✗ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedData();
