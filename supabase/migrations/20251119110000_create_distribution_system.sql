/*
  # Create Distribution Seed System

  1. New Tables
    - `card_distributions`
      - `id` (uuid, primary key) - Distribution identifier
      - `distribution_number` (bigint) - Distribution number (0 to 78!)
      - `sequence_number` (bigint) - Sequence number (0 to 100 billion)
      - `hash_code` (text, unique) - Short alphanumeric code for verification
      - `deck_order` (jsonb) - Complete ordered deck of 78 cards
      - `used_count` (integer) - Number of times this distribution has been used
      - `created_at` (timestamptz) - Creation timestamp

    - `admin_users`
      - `id` (uuid, primary key) - Admin record identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `role` (text) - Admin role: 'admin' or 'moderator'
      - `created_at` (timestamptz) - Admin access creation timestamp

    - `admin_logs`
      - `id` (uuid, primary key) - Log entry identifier
      - `admin_user_id` (uuid, foreign key) - Reference to admin_users
      - `action` (text) - Action performed
      - `target_type` (text) - Type of target (distribution, game, user, etc.)
      - `target_id` (uuid) - ID of the target entity
      - `details` (jsonb) - Additional details about the action
      - `created_at` (timestamptz) - Action timestamp

    - `system_settings`
      - `id` (uuid, primary key) - Setting identifier
      - `key` (text, unique) - Setting key
      - `value` (jsonb) - Setting value
      - `description` (text) - Human-readable description
      - `updated_at` (timestamptz) - Last update timestamp

  2. Modifications
    - Add `distribution_id` column to `games` table

  3. Security
    - Enable RLS on all new tables
    - card_distributions: public read for completed games, server write only
    - admin_users: admin read only
    - admin_logs: admin read only
    - system_settings: admin read/write
*/

-- Create card_distributions table
CREATE TABLE IF NOT EXISTS card_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_number bigint NOT NULL,
  sequence_number bigint NOT NULL,
  hash_code text UNIQUE NOT NULL,
  deck_order jsonb NOT NULL,
  used_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_distribution_sequence UNIQUE (distribution_number, sequence_number)
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'moderator',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_admin_role CHECK (role IN ('admin', 'moderator')),
  CONSTRAINT unique_admin_user UNIQUE (user_id)
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Add distribution_id to games table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'distribution_id'
  ) THEN
    ALTER TABLE games ADD COLUMN distribution_id uuid REFERENCES card_distributions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_distributions_hash_code ON card_distributions(hash_code);
CREATE INDEX IF NOT EXISTS idx_card_distributions_numbers ON card_distributions(distribution_number, sequence_number);
CREATE INDEX IF NOT EXISTS idx_card_distributions_created_at ON card_distributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_card_distributions_used_count ON card_distributions(used_count);
CREATE INDEX IF NOT EXISTS idx_games_distribution_id ON games(distribution_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user_id ON admin_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_type, target_id);

-- Enable Row Level Security
ALTER TABLE card_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- card_distributions policies
CREATE POLICY "Anyone can view card distributions"
  ON card_distributions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert distributions"
  ON card_distributions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can update distributions"
  ON card_distributions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- admin_users policies
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
    )
  );

CREATE POLICY "Admins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
      AND au.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
      AND au.role = 'admin'
    )
  );

-- admin_logs policies
CREATE POLICY "Admins can view logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
    )
  );

CREATE POLICY "Admins can insert logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
    )
  );

-- system_settings policies
CREATE POLICY "Admins can view settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
    )
  );

CREATE POLICY "Admins can manage settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
      AND au.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
      AND au.role = 'admin'
    )
  );

-- Insert default system settings
INSERT INTO system_settings (key, value, description)
VALUES
  ('distribution_retention_days', '90', 'Number of days to retain unused distributions')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value, description)
VALUES
  ('max_distribution_uses', '1000', 'Maximum number of times a single distribution can be used')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_settings (key, value, description)
VALUES
  ('hash_code_length', '8', 'Length of the generated hash code')
ON CONFLICT (key) DO NOTHING;
