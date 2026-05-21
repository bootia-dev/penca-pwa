-- Run this in the Supabase SQL editor

CREATE TABLE groups (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT    NOT NULL,
  invite_code  TEXT    NOT NULL UNIQUE,
  password_hash TEXT   NOT NULL,
  created_by   TEXT    NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE group_members (
  group_id  UUID  NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   TEXT  NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE groups       DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
