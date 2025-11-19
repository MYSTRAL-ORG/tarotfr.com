/*
  # Add distribution_id to tables

  1. Changes
    - Add distribution_id column to tables table
    - Add foreign key constraint to card_distributions
    - Make it nullable for existing tables

  2. Security
    - No changes to RLS policies
*/

-- Add distribution_id column to tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tables' AND column_name = 'distribution_id'
  ) THEN
    ALTER TABLE tables ADD COLUMN distribution_id uuid REFERENCES card_distributions(id);
  END IF;
END $$;
