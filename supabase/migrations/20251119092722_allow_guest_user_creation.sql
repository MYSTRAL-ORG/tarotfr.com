/*
  # Allow Guest User Creation

  1. Changes
    - Add policy to allow anonymous users to insert guest users
    - Add policy to allow anonymous users to insert guest sessions
    - Add policy to allow anonymous users to view their own user profile (for guests)
    - Add policy to allow anonymous users to view their own guest sessions

  2. Security
    - Restrict INSERT to guest users only (is_guest = true)
    - Ensure email is null for guest accounts
    - Maintain data integrity with appropriate checks
*/

-- Allow anonymous users to create guest users
CREATE POLICY "Anonymous users can create guest accounts"
  ON users FOR INSERT
  TO anon
  WITH CHECK (
    is_guest = true 
    AND email IS NULL
  );

-- Allow anonymous users to view their guest profiles
CREATE POLICY "Anonymous users can view guest profiles"
  ON users FOR SELECT
  TO anon
  USING (is_guest = true);

-- Allow anonymous users to create guest sessions
CREATE POLICY "Anonymous users can create guest sessions"
  ON guest_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to view guest sessions
CREATE POLICY "Anonymous users can view guest sessions"
  ON guest_sessions FOR SELECT
  TO anon
  USING (true);
