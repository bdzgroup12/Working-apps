-- Add role column to users table if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) CHECK (account_type IN ('admin', 'client', 'agency'));

-- Add is_approved and listings_count columns if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS listings_count INTEGER DEFAULT 0;

-- Insert main master admin account if not exists
INSERT INTO users (first_name, last_name, email, password, account_type, is_approved)
VALUES ('Master', 'Admin', 'dbzgroup09@gmail.com', '$2b$10$7Q6v1v6Q6v1v6Q6v1v6Q6uQ6v1v6Q6v1v6Q6v1v6Q6v1v6Q6v1v6', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
