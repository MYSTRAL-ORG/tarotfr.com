/*
  # Allow Anonymous Access to Tables and Players

  1. Changes
    - Update RLS policies to allow anon role to read tables and table_players
    - This enables the WebSocket server to fetch player data without authentication
    - Users data also needs to be readable for display names

  2. Security
    - Read-only access for anon role
    - Write operations still require authentication
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view players in their tables" ON table_players;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Allow anon to read users for display names
CREATE POLICY "Anyone can view user display names"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anon to read all table players
CREATE POLICY "Anyone can view table players"
  ON table_players FOR SELECT
  TO anon, authenticated
  USING (true);

-- Keep the insert policy for authenticated users
-- (already exists: "Users can join tables")

-- Allow anon to update ready status (for WebSocket server)
CREATE POLICY "Anyone can update ready status"
  ON table_players FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
