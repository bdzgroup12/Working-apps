-- Create properties table based on the listings table structure
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
);

-- Copy data from listings table if it exists and has data
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'listings'
  ) THEN
    INSERT INTO properties (owner_id, title, description, price, address, city, state, zip_code, created_at, updated_at)
    SELECT user_id, title, description, price, address, city, state, zip_code, created_at, updated_at
    FROM listings
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;

-- Create agencies table (if not exists)
CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create leads table (if not exists)
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  agency_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 