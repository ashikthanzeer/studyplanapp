-- Migration: Add is_verified to users and create otps table

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS otps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  purpose VARCHAR(50) NOT NULL, -- 'email_verification', 'forgot_password', 'change_email'
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_otps_user_id ON otps(user_id);
CREATE INDEX IF NOT EXISTS idx_otps_code ON otps(code);
