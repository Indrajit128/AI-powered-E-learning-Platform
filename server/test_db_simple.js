const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('Testing connection with URL:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@'));
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Success: Connected to database');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
