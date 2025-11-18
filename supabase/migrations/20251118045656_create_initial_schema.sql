/*
  # Create Initial Tarot Game Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User identifier
      - `email` (text, unique, nullable) - Email for registered users
      - `display_name` (text) - Display name for the user
      - `is_guest` (boolean) - Whether this is a guest account
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `guest_sessions`
      - `id` (uuid, primary key) - Session identifier
      - `user_id` (uuid, foreign key) - Associated user
      - `nickname` (text) - Generated guest nickname
      - `created_at` (timestamptz) - Session creation timestamp
      - `expires_at` (timestamptz) - Session expiration timestamp
    
    - `tables`
      - `id` (uuid, primary key) - Table identifier
      - `status` (text) - Table status: 'WAITING', 'IN_GAME', 'FINISHED'
      - `max_players` (integer) - Maximum players (always 4 for Tarot)
      - `created_at` (timestamptz) - Table creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `table_players`
      - `id` (uuid, primary key) - Player-table relationship identifier
      - `table_id` (uuid, foreign key) - Reference to table
      - `user_id` (uuid, foreign key) - Reference to user
      - `seat_index` (integer) - Seat position (0-3)
      - `is_ready` (boolean) - Whether player is ready
      - `joined_at` (timestamptz) - Join timestamp
    
    - `games`
      - `id` (uuid, primary key) - Game identifier
      - `table_id` (uuid, foreign key) - Reference to table
      - `status` (text) - Game phase: 'LOBBY', 'DEALING', 'BIDDING', 'DOG_REVEAL', 'PLAYING', 'SCORING', 'END'
      - `current_dealer_seat` (integer) - Current dealer position
      - `current_player_seat` (integer) - Current active player position
      - `taker_seat` (integer, nullable) - Player who won the bid
      - `contract` (text, nullable) - Contract type: 'PETITE', 'GARDE', 'GARDE_SANS', 'GARDE_CONTRE'
      - `game_state` (jsonb) - Complete game state (hands, dog, tricks, etc.)
      - `created_at` (timestamptz) - Game creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `game_events`
      - `id` (uuid, primary key) - Event identifier
      - `game_id` (uuid, foreign key) - Reference to game
      - `event_type` (text) - Event type: 'BID', 'PLAY_CARD', 'DOG_REVEAL', etc.
      - `player_seat` (integer) - Player who triggered the event
      - `payload` (jsonb) - Event data
      - `created_at` (timestamptz) - Event timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    - Add policies for players to access their tables and games
    - Restrict write operations to authorized users only
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  display_name text NOT NULL,
  is_guest boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create guest_sessions table
CREATE TABLE IF NOT EXISTS guest_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Create tables table
CREATE TABLE IF NOT EXISTS tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'WAITING',
  max_players integer NOT NULL DEFAULT 4,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('WAITING', 'IN_GAME', 'FINISHED'))
);

-- Create table_players table
CREATE TABLE IF NOT EXISTS table_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid REFERENCES tables(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  seat_index integer NOT NULL,
  is_ready boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  CONSTRAINT valid_seat CHECK (seat_index >= 0 AND seat_index <= 3),
  CONSTRAINT unique_seat_per_table UNIQUE (table_id, seat_index),
  CONSTRAINT unique_user_per_table UNIQUE (table_id, user_id)
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid REFERENCES tables(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'LOBBY',
  current_dealer_seat integer,
  current_player_seat integer,
  taker_seat integer,
  contract text,
  game_state jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_game_status CHECK (status IN ('LOBBY', 'DEALING', 'BIDDING', 'DOG_REVEAL', 'PLAYING', 'SCORING', 'END')),
  CONSTRAINT valid_contract CHECK (contract IS NULL OR contract IN ('PETITE', 'GARDE', 'GARDE_SANS', 'GARDE_CONTRE'))
);

-- Create game_events table
CREATE TABLE IF NOT EXISTS game_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  player_seat integer NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_table_players_table_id ON table_players(table_id);
CREATE INDEX IF NOT EXISTS idx_table_players_user_id ON table_players(user_id);
CREATE INDEX IF NOT EXISTS idx_games_table_id ON games(table_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_game_events_game_id ON game_events(game_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid)
  WITH CHECK (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Guest sessions policies
CREATE POLICY "Users can view their own guest sessions"
  ON guest_sessions FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Tables policies (public read for lobby)
CREATE POLICY "Anyone can view tables"
  ON tables FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tables"
  ON tables FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Table players policies
CREATE POLICY "Users can view players in their tables"
  ON table_players FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM table_players tp
      WHERE tp.table_id = table_players.table_id
      AND tp.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
    )
  );

CREATE POLICY "Users can join tables"
  ON table_players FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Games policies
CREATE POLICY "Users can view games at their tables"
  ON games FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM table_players tp
      WHERE tp.table_id = games.table_id
      AND tp.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
    )
  );

-- Game events policies
CREATE POLICY "Users can view events from their games"
  ON game_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games g
      JOIN table_players tp ON tp.table_id = g.table_id
      WHERE g.id = game_events.game_id
      AND tp.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
    )
  );
