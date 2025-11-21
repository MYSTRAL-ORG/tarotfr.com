/*
  # Add Room Type and Buy-In to Tables

  1. Changes
    - Add `room_type_id` column to `tables` table
    - Add `buy_in` column to `tables` table
    - Add `buy_in_paid` column to `table_players` table
    - Add foreign key constraint for room_type_id

  2. Purpose
    - Track which room type each table belongs to
    - Store the buy-in amount for each table
    - Record if player has paid buy-in
*/

-- Add room_type_id and buy_in to tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tables' AND column_name = 'room_type_id'
  ) THEN
    ALTER TABLE tables ADD COLUMN room_type_id text REFERENCES room_types(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tables' AND column_name = 'buy_in'
  ) THEN
    ALTER TABLE tables ADD COLUMN buy_in integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add buy_in_paid to table_players
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'table_players' AND column_name = 'buy_in_paid'
  ) THEN
    ALTER TABLE table_players ADD COLUMN buy_in_paid boolean NOT NULL DEFAULT false;
  END IF;
END $$;
