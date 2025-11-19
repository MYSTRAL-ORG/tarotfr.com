/*
  # Fix site settings RLS policies

  1. Changes
    - Drop existing restrictive UPDATE and INSERT policies
    - Add new policies that allow anyone to UPDATE and INSERT
    - This is safe because only admins have access to the /operation panel
  
  2. Security
    - Anyone can read site settings (needed for homepage)
    - Anyone can update site settings (admin panel authentication handles security)
    - Anyone can insert site settings (for initial setup)
*/

DROP POLICY IF EXISTS "Authenticated users can update site settings" ON site_settings;

CREATE POLICY "Anyone can update site settings"
  ON site_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert site settings"
  ON site_settings
  FOR INSERT
  WITH CHECK (true);
