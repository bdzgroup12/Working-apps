const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const fs = require('fs');
const { Pool } = require('pg');

let connectionString = process.env.DATABASE_URL;
console.log('Original DATABASE_URL:', connectionString);

// Update port to 5432 if it is 3306
if (connectionString && connectionString.includes(':3306')) {
  connectionString = connectionString.replace(':3306', ':5432');
  console.log('Updated DATABASE_URL with port 5432:', connectionString);
}

const pool = new Pool({
  connectionString,
  ssl: false
});

const runSqlFile = async (filename) => {
  try {
    const sqlPath = path.join(__dirname, filename);
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    await pool.query(sql);
    console.log(`Database script ${filename} executed successfully.`);
  } catch (error) {
    console.error(`Error executing database script ${filename}:`, error);
  }
};

const runMigrations = async () => {
  await runSqlFile('db-setup.sql');
  await runSqlFile('db-migration-roles-and-content.sql');
  await runSqlFile('db-fix-properties.sql');
  await pool.end();
};

runMigrations();
