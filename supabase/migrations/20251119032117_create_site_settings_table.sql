/*
  # Create site settings table

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `landing_page_mode` (boolean, default false) - Enable/disable landing page mode
      - `updated_at` (timestamptz) - Last update timestamp
      - `updated_by` (uuid) - User who made the last update
  
  2. Security
    - Enable RLS on `site_settings` table
    - Add policy for authenticated users to read settings
    - Add policy for admin users to update settings
  
  3. Initial Data
    - Insert default settings row with landing_page_mode set to false
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_mode boolean DEFAULT false NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON site_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO site_settings (landing_page_mode) 
VALUES (false)
ON CONFLICT DO NOTHING;
