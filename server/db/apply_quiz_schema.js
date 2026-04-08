const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function applyQuizSchema() {
  const connectionString = process.env.DATABASE_URL.replace('%40', '@');
  const client = new Client({
    connectionString: connectionString
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');

    const schemaPath = path.join(__dirname, 'quiz_system.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📦 Applying Quiz System schema...');
    await client.query(schemaSql);
    console.log('🚀 Quiz System tables created successfully!');

  } catch (err) {
    console.error('❌ Failed to apply quiz schema:', err.message);
  } finally {
    await client.end();
  }
}

applyQuizSchema();
