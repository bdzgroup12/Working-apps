const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

async function applySchema() {
  try {
    console.log('Connecting to PostgreSQL database...');
    const client = await pool.connect();
    
    console.log('Reading schema file...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    console.log('Applying schema...');
    await client.query(schemaSQL);
    
    // Check if we need to add columns to existing users table
    console.log('Checking if verification columns need to be added...');
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'verification_token'
    `);
    
    if (columnsResult.rows.length === 0) {
      console.log('Adding verification columns to users table...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
        ADD COLUMN IF NOT EXISTS token_expiry TIMESTAMP
      `);
    }
    
    // Check for admin_approved column
    console.log('Checking if admin_approved column needs to be added...');
    const adminApprovedResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'admin_approved'
    `);
    
    if (adminApprovedResult.rows.length === 0) {
      console.log('Adding admin_approved column to users table...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT false
      `);
    }

    console.log('Schema applied successfully!');
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error applying schema:', err);
    process.exit(1);
  }
}

applySchema(); 