/*
  # League System

  1. New Tables
    - `leagues`
      - `id` (integer, primary key) - League number (1-15)
      - `name` (text) - Display name
      - `description` (text) - League description
      - `max_divisions` (integer) - Max divisions allowed (null = unlimited)
      - `created_at` (timestamptz)

    - `league_divisions`
      - `id` (uuid, primary key)
      - `league_id` (integer, foreign key) - Reference to league
      - `division_number` (integer) - Division number within league
      - `max_players` (integer) - Always 30
      - `created_at` (timestamptz)

    - `league_seasons`
      - `id` (uuid, primary key)
      - `season_number` (integer) - Sequential season number
      - `start_date` (timestamptz) - Season start
      - `end_date` (timestamptz) - Season end
      - `status` (text) - 'active', 'completed', 'processing'
      - `created_at` (timestamptz)

    - `league_memberships`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - Reference to user
      - `division_id` (uuid, foreign key) - Current division
      - `season_id` (uuid, foreign key) - Current season
      - `league_points` (integer) - Points for current season
      - `rank` (integer) - Current rank in division
      - `joined_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `league_rewards`
      - `id` (uuid, primary key)
      - `league_id` (integer, foreign key)
      - `rank` (integer) - Position in division (1-10)
      - `reward_tokens` (integer) - Token reward for this position
      - Unique constraint on (league_id, rank)

    - `league_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `season_id` (uuid, foreign key)
      - `league_id` (integer) - League at end of season
      - `division_id` (uuid, foreign key) - Division at end of season
      - `final_rank` (integer) - Final position in division
      - `final_points` (integer) - Final points
      - `reward_tokens` (integer) - Tokens earned
      - `promotion_status` (text) - 'promoted', 'relegated', 'maintained'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for league info
    - Users can view their own memberships and history
    - Service role for system operations

  3. Initial Data
    - Insert 15 leagues
    - Insert reward structure based on provided data
    - Create first season
    - Create initial divisions for league 1
*/

-- Leagues Table
CREATE TABLE IF NOT EXISTS leagues (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  max_divisions integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leagues"
  ON leagues FOR SELECT
  TO anon, authenticated
  USING (true);

-- League Divisions Table
CREATE TABLE IF NOT EXISTS league_divisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id integer NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  division_number integer NOT NULL,
  max_players integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  UNIQUE(league_id, division_number)
);

ALTER TABLE league_divisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view divisions"
  ON league_divisions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_league_divisions_league ON league_divisions(league_id);

-- League Seasons Table
CREATE TABLE IF NOT EXISTS league_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_number integer NOT NULL UNIQUE,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_season_status CHECK (status IN ('active', 'completed', 'processing'))
);

ALTER TABLE league_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seasons"
  ON league_seasons FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_league_seasons_status ON league_seasons(status);

-- League Memberships Table
CREATE TABLE IF NOT EXISTS league_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  division_id uuid NOT NULL REFERENCES league_divisions(id) ON DELETE CASCADE,
  season_id uuid NOT NULL REFERENCES league_seasons(id) ON DELETE CASCADE,
  league_points integer NOT NULL DEFAULT 0,
  rank integer,
  joined_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, season_id)
);

ALTER TABLE league_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own membership"
  ON league_memberships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view memberships (anon)"
  ON league_memberships FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Service role can manage memberships"
  ON league_memberships FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_league_memberships_user ON league_memberships(user_id);
CREATE INDEX idx_league_memberships_division ON league_memberships(division_id);
CREATE INDEX idx_league_memberships_season ON league_memberships(season_id);
CREATE INDEX idx_league_memberships_points ON league_memberships(league_points DESC);

-- League Rewards Table
CREATE TABLE IF NOT EXISTS league_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id integer NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  rank integer NOT NULL,
  reward_tokens integer NOT NULL,
  UNIQUE(league_id, rank)
);

ALTER TABLE league_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rewards"
  ON league_rewards FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_league_rewards_league ON league_rewards(league_id);

-- League History Table
CREATE TABLE IF NOT EXISTS league_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id uuid NOT NULL REFERENCES league_seasons(id) ON DELETE CASCADE,
  league_id integer NOT NULL REFERENCES leagues(id),
  division_id uuid NOT NULL REFERENCES league_divisions(id),
  final_rank integer NOT NULL,
  final_points integer NOT NULL,
  reward_tokens integer NOT NULL DEFAULT 0,
  promotion_status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_promotion_status CHECK (promotion_status IN ('promoted', 'relegated', 'maintained'))
);

ALTER TABLE league_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history"
  ON league_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view history (anon)"
  ON league_history FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Service role can manage history"
  ON league_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_league_history_user ON league_history(user_id);
CREATE INDEX idx_league_history_season ON league_history(season_id);

-- Insert 15 leagues
INSERT INTO leagues (id, name, description, max_divisions) VALUES
  (1, 'Ligue Bronze', 'Ligue de départ pour tous les nouveaux joueurs', NULL),
  (2, 'Ligue Argent', 'Première étape vers le sommet', NULL),
  (3, 'Ligue Or', 'Les joueurs sérieux commencent ici', NULL),
  (4, 'Ligue Platine', 'Compétition de niveau intermédiaire', NULL),
  (5, 'Ligue Émeraude', 'Les meilleurs joueurs émergent', NULL),
  (6, 'Ligue Diamant', 'Élite des joueurs réguliers', NULL),
  (7, 'Ligue Maître', 'Compétition de haut niveau', NULL),
  (8, 'Ligue Grand Maître', 'Les experts du jeu', NULL),
  (9, 'Ligue Challenger', 'La crème de la crème', NULL),
  (10, 'Ligue Légende I', 'Légendes en devenir', NULL),
  (11, 'Ligue Légende II', 'Légendes confirmées', NULL),
  (12, 'Ligue Légende III', 'Légendes redoutables', NULL),
  (13, 'Ligue Légende IV', 'Légendes exceptionnelles', NULL),
  (14, 'Ligue Légende V', 'Légendes ultimes', NULL),
  (15, 'Ligue Immortelle', 'Le sommet absolu, réservé aux meilleurs', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert league rewards based on provided data
-- League 1: Top 3 only
INSERT INTO league_rewards (league_id, rank, reward_tokens) VALUES
  (1, 1, 500), (1, 2, 200), (1, 3, 100)
ON CONFLICT (league_id, rank) DO NOTHING;

-- League 2: Top 3
INSERT INTO league_rewards (league_id, rank, reward_tokens) VALUES
  (2, 1, 750), (2, 2, 500), (2, 3, 200)
ON CONFLICT (league_id, rank) DO NOTHING;

-- League 3: Top 3
INSERT INTO league_rewards (league_id, rank, reward_tokens) VALUES
  (3, 1, 1000), (3, 2, 750), (3, 3, 500)
ON CONFLICT (league_id, rank) DO NOTHING;

-- League 4: Top 5
INSERT INTO league_rewards (league_id, rank, reward_tokens) VALUES
  (4, 1, 1500), (4, 2, 1000), (4, 3, 750), (4, 4, 500), (4, 5, 200)
ON CONFLICT (league_id, rank) DO NOTHING;

-- League 5: Top 5
INSERT INTO league_rewards (league_id, rank, reward_tokens) VALUES
  (5, 1, 2000), (5, 2, 1500), (5, 3, 1000), (5, 4, 750), (5, 5, 500)
ON CONFLICT (league_id, rank) DO NOTHING;

-- League 6: Top 7
INSERT INTO league_rewards (league_id, rank, reward_tokens) VALUES
  (6, 1, 3000), (6, 2, 2000), (6, 3, 1500), (6, 4, 1000), (6, 5, 750), (6, 6, 500), (6, 7, 200)
ON CONFLICT (league_id, rank) DO NOTHING;

-- League 7: Top 7
INSERT INTO league_rewards (league_id, rank, reward_tokens) VALUES
  (7, 1, 5000), (7, 2, 3000), (7, 3, 2000), (7, 4, 1500), (7, 5, 1000), (7, 6, 750), (7, 7, 500)
ON CONFLICT (league_id, rank) DO NOTHING;

-- League 8: Top 9
INSERT INTO league_rewards (league_id, rank, reward_tokens) VALUES
  (8, 1, 10000), (8, 2, 5000), (8, 3, 3000), (8, 4, 2000), (8, 5, 1500), (8, 6, 1000), (8, 7, 750), (8, 8, 500), (8, 9, 200)
ON CONFLICT (league_id, rank) DO NOTHING;

-- League 9-15: Top 10 (same rewards for leagues 9-15)
DO $$
BEGIN
  FOR league_num IN 9..15 LOOP
    INSERT INTO league_rewards (league_id, rank, reward_tokens) VALUES
      (league_num, 1, 20000), (league_num, 2, 15000), (league_num, 3, 10000),
      (league_num, 4, 5000), (league_num, 5, 3000), (league_num, 6, 2000),
      (league_num, 7, 1500), (league_num, 8, 1000), (league_num, 9, 750), (league_num, 10, 500)
    ON CONFLICT (league_id, rank) DO NOTHING;
  END LOOP;
END $$;

-- Create first season (one week from now)
INSERT INTO league_seasons (season_number, start_date, end_date, status)
VALUES (
  1,
  now(),
  now() + interval '7 days',
  'active'
)
ON CONFLICT (season_number) DO NOTHING;

-- Create initial division for league 1
INSERT INTO league_divisions (league_id, division_number)
VALUES (1, 1)
ON CONFLICT (league_id, division_number) DO NOTHING;

-- Function: Auto-assign new users to League 1, Division 1
CREATE OR REPLACE FUNCTION assign_user_to_league()
RETURNS TRIGGER AS $$
DECLARE
  v_season_id uuid;
  v_division_id uuid;
  v_current_members integer;
  v_max_division integer;
BEGIN
  -- Get current active season
  SELECT id INTO v_season_id
  FROM league_seasons
  WHERE status = 'active'
  ORDER BY season_number DESC
  LIMIT 1;

  IF v_season_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if user already has membership for this season
  IF EXISTS (
    SELECT 1 FROM league_memberships
    WHERE user_id = NEW.user_id AND season_id = v_season_id
  ) THEN
    RETURN NEW;
  END IF;

  -- Find a division in league 1 with space
  SELECT ld.id INTO v_division_id
  FROM league_divisions ld
  LEFT JOIN league_memberships lm ON lm.division_id = ld.id AND lm.season_id = v_season_id
  WHERE ld.league_id = 1
  GROUP BY ld.id, ld.division_number
  HAVING COUNT(lm.id) < 30
  ORDER BY ld.division_number
  LIMIT 1;

  -- If no division has space, create a new one
  IF v_division_id IS NULL THEN
    SELECT COALESCE(MAX(division_number), 0) + 1 INTO v_max_division
    FROM league_divisions
    WHERE league_id = 1;

    INSERT INTO league_divisions (league_id, division_number)
    VALUES (1, v_max_division)
    RETURNING id INTO v_division_id;
  END IF;

  -- Assign user to division
  INSERT INTO league_memberships (user_id, division_id, season_id, league_points)
  VALUES (NEW.user_id, v_division_id, v_season_id, 0)
  ON CONFLICT (user_id, season_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-assign on wallet creation
DROP TRIGGER IF EXISTS on_wallet_created ON user_wallets;
CREATE TRIGGER on_wallet_created
  AFTER INSERT ON user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION assign_user_to_league();

-- Function: Update rank when points change
CREATE OR REPLACE FUNCTION update_league_ranks()
RETURNS TRIGGER AS $$
BEGIN
  -- Update ranks for all members in the same division and season
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY league_points DESC, joined_at ASC) as new_rank
    FROM league_memberships
    WHERE division_id = NEW.division_id AND season_id = NEW.season_id
  )
  UPDATE league_memberships lm
  SET rank = ranked.new_rank
  FROM ranked
  WHERE lm.id = ranked.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_league_points_changed ON league_memberships;
CREATE TRIGGER on_league_points_changed
  AFTER INSERT OR UPDATE OF league_points ON league_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_league_ranks();