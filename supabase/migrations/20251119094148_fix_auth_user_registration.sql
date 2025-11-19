/*
  # Fix Authentication and User Registration

  1. Changes
    - Allow authenticated users to insert their own profile in users table
    - Allow authenticated users to view and update their profile
    - Ensure Supabase Auth can create user records

  2. Security
    - Users can only create their own profile (matching auth.uid())
    - Users can only view and update their own data
    - Maintain data integrity
*/

-- Drop existing restrictive policies for authenticated users
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Allow authenticated users to insert their own profile (for registration)
CREATE POLICY "Authenticated users can create their profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Allow authenticated users to view their own profile
CREATE POLICY "Authenticated users can view their profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow authenticated users to update their own profile
CREATE POLICY "Authenticated users can update their profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
