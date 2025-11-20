/*
  # Add Bot Support to Users Table
  
  1. Purpose
    - Add is_bot column to users table to distinguish bot users
    - Allow the WebSocket server to create bot users
    - Bot users are system-generated and do not have email addresses
  
  2. Changes
    - Add is_bot column (boolean, default false)
    - Create policy to allow anon role to insert bot users
    - Update existing guest user policy for clarity
  
  3. Security
    - Maintains data integrity by validating bot user structure
    - Bot users must have is_bot = true and email = NULL
    - Guest users must have is_guest = true and is_bot = false
    - RLS remains enabled
*/

-- ============================================================================
-- Add is_bot column to users table
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_bot'
  ) THEN
    ALTER TABLE users ADD COLUMN is_bot BOOLEAN DEFAULT false NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- Create policy to allow bot user creation
-- ============================================================================

DROP POLICY IF EXISTS "Anon can insert bot users" ON users;

CREATE POLICY "Anon can insert bot users"
  ON users FOR INSERT
  TO anon
  WITH CHECK (
    is_bot = true
    AND email IS NULL
  );

-- ============================================================================
-- Update guest user policy for clarity
-- ============================================================================

DROP POLICY IF EXISTS "Anon can insert guest users" ON users;

CREATE POLICY "Anon can insert guest users"
  ON users FOR INSERT
  TO anon
  WITH CHECK (
    is_guest = true
    AND is_bot = false
    AND email IS NULL
  );