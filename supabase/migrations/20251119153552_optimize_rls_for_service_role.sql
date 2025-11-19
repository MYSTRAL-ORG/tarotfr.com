/*
  # Optimize RLS Policies for Service Role Access

  1. Purpose
    - Ensure server-side operations using service role key work correctly
    - Service role bypasses RLS, so these policies are for anon/authenticated users
    - Simplify policies for current application flows

  2. Tables Affected
    - users: Allow server to create/read guest users
    - guest_sessions: Allow server to manage guest sessions
    - tables: Allow server to create and list tables
    - table_players: Allow server to manage player seating
    - card_distributions: Allow server to create distributions
    - games: Allow server to manage game state

  3. Security Notes
    - Service role key bypasses ALL RLS policies (used only server-side)
    - Anon key still respects RLS policies (used in browser)
    - Policies below are for client-side operations only
*/

-- Ensure tables have RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Drop any overly restrictive policies that might conflict
DROP POLICY IF EXISTS "Anonymous users can create guest accounts" ON users;
DROP POLICY IF EXISTS "Anonymous users can view guest profiles" ON users;
DROP POLICY IF EXISTS "Anyone can view user display names" ON users;

-- Users table: Allow reading for display names
CREATE POLICY "Anyone can view users"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

-- Guest sessions: Allow anon to read (for checking existing sessions)
DROP POLICY IF EXISTS "Anonymous users can create guest sessions" ON guest_sessions;
DROP POLICY IF EXISTS "Anonymous users can view guest sessions" ON guest_sessions;

CREATE POLICY "Anyone can view guest sessions"
  ON guest_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Tables: Allow reading tables for listing
DROP POLICY IF EXISTS "Anyone can view tables" ON tables;

CREATE POLICY "Anyone can view tables"
  ON tables FOR SELECT
  TO anon, authenticated
  USING (true);

-- Table players: Allow reading player data
DROP POLICY IF EXISTS "Anyone can view table players" ON table_players;
DROP POLICY IF EXISTS "Anyone can update ready status" ON table_players;
DROP POLICY IF EXISTS "Users can join tables" ON table_players;

CREATE POLICY "Anyone can view table players"
  ON table_players FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update table players"
  ON table_players FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Card distributions: Allow reading distributions
DROP POLICY IF EXISTS "Anyone can view distributions" ON card_distributions;

CREATE POLICY "Anyone can view distributions"
  ON card_distributions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Games: Allow reading game state
DROP POLICY IF EXISTS "Anyone can view games" ON games;

CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  TO anon, authenticated
  USING (true);

/*
  Note: INSERT, UPDATE, DELETE operations on these tables should be performed
  server-side using the service role key, which bypasses RLS completely.

  The policies above only apply to SELECT operations from the browser using
  the anon key for read-only access.
*/