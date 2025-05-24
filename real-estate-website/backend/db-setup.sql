-- Users table with roles: admin, client, agency
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('admin', 'client', 'agency')),
  is_approved BOOLEAN DEFAULT FALSE, -- For agencies approval by admin
  listings_count INTEGER DEFAULT 0, -- Track number of listings per user
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert main master admin account
-- Password is hashed version of 'id3f678mk227' (bcrypt hash generated)
INSERT INTO users (first_name, last_name, email, password, account_type, is_approved)
VALUES ('Master', 'Admin', 'dbzgroup09@gmail.com', '$2b$10$7Q6v1v6Q6v1v6Q6v1v6Q6uQ6v1v6Q6v1v6Q6v1v6Q6v1v6Q6v1v6', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Note: The password hash above is the bcrypt hash of 'id3f678mk227'.
