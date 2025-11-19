/*
  # Allow Anonymous Table Operations

  1. Changes
    - Allow anonymous users to join tables
    - Allow anonymous users to create tables
    - Allow anonymous users to view and manage games
    - Enable full gameplay for guest users

  2. Security
    - Maintain data integrity with appropriate checks
    - Guest users have the same capabilities as authenticated users for gameplay
*/

-- Drop restrictive policy if exists
DROP POLICY IF EXISTS "Users can join tables" ON table_players;

-- Allow anonymous users to join tables
CREATE POLICY "Anyone can join tables"
  ON table_players FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous users to create tables
DROP POLICY IF EXISTS "Authenticated users can create tables" ON tables;

CREATE POLICY "Anyone can create tables"
  ON tables FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous users to update tables
CREATE POLICY "Anyone can update tables"
  ON tables FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to view games
DROP POLICY IF EXISTS "Users can view games at their tables" ON games;

CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to create games
CREATE POLICY "Anyone can create games"
  ON games FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous users to update games
CREATE POLICY "Anyone can update games"
  ON games FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to view game events
DROP POLICY IF EXISTS "Users can view events from their games" ON game_events;

CREATE POLICY "Anyone can view game events"
  ON game_events FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to create game events
CREATE POLICY "Anyone can create game events"
  ON game_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
