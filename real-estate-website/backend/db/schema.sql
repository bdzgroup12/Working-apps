-- Users table with email verification
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- 'admin', 'client', or 'agency'
  agency_id INT,  -- Will be updated with foreign key after agencies table is created
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  token_expiry TIMESTAMP,
  admin_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  address VARCHAR(255),
  website VARCHAR(255),
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to users.agency_id after agencies table exists
ALTER TABLE users 
ADD CONSTRAINT fk_user_agency 
FOREIGN KEY (agency_id) 
REFERENCES agencies(id) 
ON DELETE SET NULL;

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  bedrooms SMALLINT,
  bathrooms SMALLINT,
  area_sqm DECIMAL(10, 2),
  property_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'available', -- 'available', 'sold', 'pending'
  location_id INT,
  agency_id INT REFERENCES agencies(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table for tracking client inquiries
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  property_id INT,
  agency_id INT REFERENCES agencies(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Spain',
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 