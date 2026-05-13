-- Run this in the Supabase SQL editor to set up the database

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (email is the stable primary key across providers)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,        -- email address
  name TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_a VARCHAR(100) NOT NULL,
  team_b VARCHAR(100) NOT NULL,
  flag_a VARCHAR(10) NOT NULL DEFAULT '',
  flag_b VARCHAR(10) NOT NULL DEFAULT '',
  stage VARCHAR(50) NOT NULL DEFAULT 'group',
  group_name VARCHAR(10),
  scheduled_at TIMESTAMPTZ NOT NULL,
  result_a INTEGER,
  result_b INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  predicted_a INTEGER NOT NULL,
  predicted_b INTEGER NOT NULL,
  points INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_at ON matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;
