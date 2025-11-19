/*
  # Allow Anonymous Users to View Tables

  1. Changes
    - Add policy for anonymous users to view tables
    - This is needed for the game lobby

  2. Security
    - Read-only access for anonymous users
    - They can only view tables, not modify them
*/

-- Allow anonymous users to view tables
DROP POLICY IF EXISTS "Anyone can view tables" ON tables;

CREATE POLICY "Anyone can view tables"
  ON tables FOR SELECT
  TO anon, authenticated
  USING (true);
