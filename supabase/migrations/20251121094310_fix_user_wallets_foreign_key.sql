/*
  # Fix user_wallets foreign key to reference users table

  1. Changes
    - Drop the existing foreign key constraint that references auth.users
    - Add new foreign key constraint that references the public.users table
    - This allows both authenticated users and guest users to have wallets

  2. Security
    - Existing RLS policies remain unchanged
    - Service role can still manage all wallets
    - Anon users can view wallets (needed for guests)
    - Authenticated users can view their own wallet

  3. Notes
    - This migration is safe as it only changes the foreign key reference
    - Existing wallet data will not be affected
    - The trigger to auto-create wallets will now work for both guests and auth users
*/

-- Drop the existing foreign key constraint
ALTER TABLE IF EXISTS user_wallets
  DROP CONSTRAINT IF EXISTS user_wallets_user_id_fkey;

-- Add new foreign key constraint referencing public.users instead of auth.users
ALTER TABLE user_wallets
  ADD CONSTRAINT user_wallets_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- Update the trigger function to work with public.users table
DROP TRIGGER IF EXISTS create_wallet_on_user_creation ON users;
DROP FUNCTION IF EXISTS create_user_wallet();

CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id, tokens, total_tokens_earned)
  VALUES (NEW.id, 2000, 2000)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_wallet_on_user_creation
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();