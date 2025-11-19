/*
  # Allow public access to completed games

  1. Changes
    - Add policy for anonymous and authenticated users to view completed games
    - This allows distribution verification without requiring authentication

  2. Security
    - Only allows viewing games with status 'END' or 'SCORING'
    - Read-only access
    - No sensitive player data exposed
*/

-- Add policy to allow public viewing of completed games
CREATE POLICY "Public can view completed games"
  ON games FOR SELECT
  TO anon, authenticated
  USING (status IN ('END', 'SCORING'));
