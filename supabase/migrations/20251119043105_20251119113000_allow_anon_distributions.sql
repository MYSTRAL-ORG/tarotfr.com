/*
  # Allow anonymous access to card distributions

  1. Changes
    - Add policy for anonymous users to view distributions
    - This allows public verification of distributions without login

  2. Security
    - Read-only access for anonymous users
    - No sensitive data exposed (only distribution metadata)
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view card distributions" ON card_distributions;

-- Create new policy that allows both authenticated and anonymous users
CREATE POLICY "Public can view card distributions"
  ON card_distributions FOR SELECT
  TO anon, authenticated
  USING (true);
