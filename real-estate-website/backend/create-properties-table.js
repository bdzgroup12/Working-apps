const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { Pool } = require('pg');

// Extract connection details from DATABASE_URL
const connectionString = process.env.DATABASE_URL || 'postgres://spainundiscovered:id3f678mk227@localhost:5432/spainundiscovered';
console.log('Using DATABASE_URL:', connectionString);

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

async function createTables() {
  try {
    // Create properties table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        agency_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(12, 2),
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Properties table created successfully');

    // Create agencies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agencies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Agencies table created successfully');

    // Create leads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        property_id INTEGER,
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        agency_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Leads table created successfully');
    
    // Add a constraint if properties table exists
    try {
      await pool.query(`
        ALTER TABLE leads 
        ADD CONSTRAINT fk_property 
        FOREIGN KEY (property_id) 
        REFERENCES properties(id) 
        ON DELETE SET NULL
      `);
      console.log('Foreign key constraint added successfully');
    } catch (fkError) {
      console.log('Note: Foreign key may already exist or properties table not found yet');
    }
    
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables(); 