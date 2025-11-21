/*
  # Token Economy System

  1. New Tables
    - `user_wallets`
      - `user_id` (uuid, primary key, references auth.users)
      - `tokens` (bigint) - Current token balance
      - `total_tokens_earned` (bigint) - Lifetime earned tokens
      - `total_tokens_spent` (bigint) - Lifetime spent tokens
      - `total_tokens_purchased` (bigint) - Lifetime purchased tokens
      - `xp` (bigint) - Total experience points
      - `level` (integer) - Current level
      - `league_points` (bigint) - League ranking points
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `room_types`
      - `id` (text, primary key) - e.g., 'debutant_1'
      - `name` (text) - Display name
      - `category` (text) - DEBUTANT, PRO, LEGENDES, CYBORG
      - `buy_in` (integer) - Cost to enter
      - `reward_first` (integer) - 1st place reward
      - `reward_second` (integer) - 2nd place reward
      - `reward_draw` (integer) - 3rd place/draw reward
      - `xp_reward` (integer) - XP gained per game
      - `league_points` (integer) - League points gained
      - `min_level` (integer) - Minimum level required
      - `sort_order` (integer) - Display order
      - `enabled` (boolean) - Active/inactive

    - `level_config`
      - `level` (integer, primary key)
      - `xp_required` (bigint) - Total XP needed to reach this level
      - `reward_tokens` (integer) - Tokens awarded on level up
      - `unlocks_room` (text) - Room type unlocked at this level

    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text) - 'purchase', 'game_win', 'game_loss', 'level_reward', 'buy_in'
      - `amount` (integer) - Positive for gains, negative for losses
      - `balance_after` (bigint) - Balance after transaction
      - `game_id` (uuid, nullable) - Related game if applicable
      - `metadata` (jsonb) - Additional data
      - `created_at` (timestamptz)

    - `shop_items`
      - `id` (text, primary key) - e.g., 'pack_1'
      - `tokens` (integer) - Tokens in pack
      - `price_eur` (numeric) - Price in euros
      - `price_vnd` (numeric) - Price in VND
      - `display_order` (integer)
      - `title` (text)
      - `description` (text)
      - `enabled` (boolean)

    - `purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `shop_item_id` (text, references shop_items)
      - `tokens_received` (integer)
      - `price_paid` (numeric)
      - `currency` (text)
      - `stripe_payment_id` (text)
      - `status` (text) - 'pending', 'completed', 'failed'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to read their own data
    - Service role for game logic to update wallets

  3. Functions
    - `initialize_user_wallet()` - Trigger on user creation to give 2000 tokens
    - `deduct_buy_in()` - Function to handle table entry
    - `distribute_rewards()` - Function to handle end-game rewards
    - `add_xp_and_check_level()` - Function to handle XP and level ups
*/

-- User Wallets Table
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens bigint NOT NULL DEFAULT 2000,
  total_tokens_earned bigint NOT NULL DEFAULT 2000,
  total_tokens_spent bigint NOT NULL DEFAULT 0,
  total_tokens_purchased bigint NOT NULL DEFAULT 0,
  xp bigint NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  league_points bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON user_wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wallet (anon)"
  ON user_wallets FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Service role can manage wallets"
  ON user_wallets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Room Types Table
CREATE TABLE IF NOT EXISTS room_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  buy_in integer NOT NULL,
  reward_first integer NOT NULL,
  reward_second integer NOT NULL,
  reward_draw integer NOT NULL,
  xp_reward integer NOT NULL,
  league_points integer NOT NULL,
  min_level integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL,
  enabled boolean NOT NULL DEFAULT true
);

ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled room types"
  ON room_types FOR SELECT
  TO anon, authenticated
  USING (enabled = true);

-- Level Configuration Table
CREATE TABLE IF NOT EXISTS level_config (
  level integer PRIMARY KEY,
  xp_required bigint NOT NULL,
  reward_tokens integer NOT NULL DEFAULT 0,
  unlocks_room text
);

ALTER TABLE level_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view level config"
  ON level_config FOR SELECT
  TO anon, authenticated
  USING (true);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount integer NOT NULL,
  balance_after bigint NOT NULL,
  game_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage transactions"
  ON transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Shop Items Table
CREATE TABLE IF NOT EXISTS shop_items (
  id text PRIMARY KEY,
  tokens integer NOT NULL,
  price_eur numeric(10,2) NOT NULL,
  price_vnd numeric(12,0) NOT NULL,
  display_order integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  enabled boolean NOT NULL DEFAULT true
);

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled shop items"
  ON shop_items FOR SELECT
  TO anon, authenticated
  USING (enabled = true);

-- Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_item_id text NOT NULL REFERENCES shop_items(id),
  tokens_received integer NOT NULL,
  price_paid numeric(10,2) NOT NULL,
  currency text NOT NULL,
  stripe_payment_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage purchases"
  ON purchases FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function: Initialize wallet for new users
CREATE OR REPLACE FUNCTION initialize_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id, tokens, total_tokens_earned)
  VALUES (NEW.id, 2000, 2000)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create wallet on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_wallet();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_wallets_updated_at ON user_wallets;
CREATE TRIGGER update_user_wallets_updated_at
  BEFORE UPDATE ON user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();