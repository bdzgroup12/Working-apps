const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

module.exports = pool;
