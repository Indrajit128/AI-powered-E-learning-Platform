const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function applySchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');

    const schemaPath = path.join(__dirname, 'coding_challenges_system.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📦 Applying schema...');
    await client.query(schemaSql);
    console.log('🚀 Schema applied successfully!');

  } catch (err) {
    console.error('❌ Failed to apply schema:', err.message);
  } finally {
    await client.end();
  }
}

applySchema();
