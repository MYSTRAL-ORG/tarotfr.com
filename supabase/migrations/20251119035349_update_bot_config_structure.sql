/*
  # Update Bot Configuration Structure

  1. Changes
    - Drop existing bot_config table
    - Create new bot_config table with comprehensive behavior parameters
    - Add detailed configuration options for bidding, card play, and strategy

  2. New Structure
    - Behavior settings organized by game phases (bidding, dog handling, card play)
    - Visual configuration parameters instead of code
    - Common and level-specific settings
*/

DROP TABLE IF EXISTS bot_config CASCADE;

CREATE TABLE bot_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL UNIQUE CHECK (level IN ('easy', 'medium', 'hard')),
  
  -- Bidding behavior
  bidding_aggression integer DEFAULT 50 CHECK (bidding_aggression >= 0 AND bidding_aggression <= 100),
  min_trumps_to_bid integer DEFAULT 5 CHECK (min_trumps_to_bid >= 0 AND min_trumps_to_bid <= 21),
  oudler_weight integer DEFAULT 50 CHECK (oudler_weight >= 0 AND oudler_weight <= 100),
  high_trump_threshold integer DEFAULT 15 CHECK (high_trump_threshold >= 1 AND high_trump_threshold <= 21),
  risk_tolerance integer DEFAULT 50 CHECK (risk_tolerance >= 0 AND risk_tolerance <= 100),
  
  -- Dog handling
  dog_keep_oudlers boolean DEFAULT true,
  dog_keep_high_trumps boolean DEFAULT true,
  dog_discard_low_cards boolean DEFAULT true,
  dog_strategy_smart integer DEFAULT 50 CHECK (dog_strategy_smart >= 0 AND dog_strategy_smart <= 100),
  
  -- Card play - Leading
  lead_with_trumps_frequency integer DEFAULT 30 CHECK (lead_with_trumps_frequency >= 0 AND lead_with_trumps_frequency <= 100),
  lead_prefer_low_cards boolean DEFAULT true,
  lead_test_opponents boolean DEFAULT false,
  
  -- Card play - Following
  try_to_win_trick integer DEFAULT 50 CHECK (try_to_win_trick >= 0 AND try_to_win_trick <= 100),
  overtrump_aggression integer DEFAULT 50 CHECK (overtrump_aggression >= 0 AND overtrump_aggression <= 100),
  points_threshold_to_win integer DEFAULT 10 CHECK (points_threshold_to_win >= 0 AND points_threshold_to_win <= 50),
  
  -- Excuse handling
  excuse_use_strategy integer DEFAULT 50 CHECK (excuse_use_strategy >= 0 AND excuse_use_strategy <= 100),
  excuse_save_for_last boolean DEFAULT true,
  
  -- Team play awareness (as defender)
  team_play_awareness integer DEFAULT 50 CHECK (team_play_awareness >= 0 AND team_play_awareness <= 100),
  help_partner_probability integer DEFAULT 50 CHECK (help_partner_probability >= 0 AND help_partner_probability <= 100),
  block_taker_aggression integer DEFAULT 50 CHECK (block_taker_aggression >= 0 AND block_taker_aggression <= 100),
  
  -- Advanced strategy
  count_cards_played boolean DEFAULT false,
  predict_opponent_hands boolean DEFAULT false,
  adapt_to_game_progress boolean DEFAULT false,
  endgame_optimization integer DEFAULT 30 CHECK (endgame_optimization >= 0 AND endgame_optimization <= 100),
  
  -- Meta
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bot configs"
  ON bot_config FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update bot configs"
  ON bot_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert bot configs"
  ON bot_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default configurations
INSERT INTO bot_config (
  level,
  bidding_aggression,
  min_trumps_to_bid,
  oudler_weight,
  high_trump_threshold,
  risk_tolerance,
  dog_keep_oudlers,
  dog_keep_high_trumps,
  dog_discard_low_cards,
  dog_strategy_smart,
  lead_with_trumps_frequency,
  lead_prefer_low_cards,
  lead_test_opponents,
  try_to_win_trick,
  overtrump_aggression,
  points_threshold_to_win,
  excuse_use_strategy,
  excuse_save_for_last,
  team_play_awareness,
  help_partner_probability,
  block_taker_aggression,
  count_cards_played,
  predict_opponent_hands,
  adapt_to_game_progress,
  endgame_optimization
) VALUES
(
  'easy',
  20,  -- Low bidding aggression
  8,   -- Needs many trumps to bid
  30,  -- Doesn't value oudlers much
  18,  -- High threshold for "high trumps"
  20,  -- Very risk-averse
  true,
  false,
  true,
  20,  -- Poor dog handling
  10,  -- Rarely leads with trumps
  true,
  false,
  30,  -- Rarely tries to win
  20,  -- Low overtrump aggression
  15,  -- High points needed to try
  20,  -- Poor excuse usage
  false,
  10,  -- Poor team awareness
  20,  -- Rarely helps partner
  20,  -- Weak blocking
  false,
  false,
  false,
  10   -- Poor endgame
),
(
  'medium',
  50,  -- Moderate aggression
  6,   -- Reasonable trump requirement
  50,  -- Values oudlers appropriately
  15,  -- Standard high trump threshold
  50,  -- Balanced risk
  true,
  true,
  true,
  50,  -- Good dog handling
  40,  -- Sometimes leads trumps
  true,
  true,
  60,  -- Often tries to win
  50,  -- Moderate overtrump
  10,  -- Standard points threshold
  50,  -- Decent excuse strategy
  true,
  50,  -- Moderate team awareness
  60,  -- Often helps partner
  50,  -- Moderate blocking
  true,
  false,
  true,
  50   -- Good endgame
),
(
  'hard',
  80,  -- Very aggressive bidding
  5,   -- Can bid with fewer trumps
  70,  -- Highly values oudlers
  13,  -- Lower threshold (more cards count as high)
  70,  -- Risk-taking
  true,
  true,
  true,
  90,  -- Excellent dog handling
  60,  -- Frequently leads trumps strategically
  false,
  true,
  85,  -- Almost always tries to win when appropriate
  80,  -- Aggressive overtrump
  8,   -- Low points needed
  90,  -- Excellent excuse usage
  true,
  90,  -- Excellent team awareness
  90,  -- Almost always helps partner
  85,  -- Aggressive blocking
  true,
  true,
  true,
  90   -- Excellent endgame
);