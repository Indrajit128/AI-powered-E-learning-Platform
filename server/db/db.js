const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: async (text, params) => {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('Database Query Error:', err.message);
      throw err;
    }
  },
};

console.log('✅ Supabase Postgres DB initialized');
