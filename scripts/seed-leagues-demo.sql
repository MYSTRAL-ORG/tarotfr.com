-- Script to seed league data for demo purposes
-- This script creates fake league memberships to visualize the /ligues page
-- Note: These are not real auth users, just demo data

-- Disable RLS temporarily
ALTER TABLE public.league_memberships DISABLE ROW LEVEL SECURITY;

-- Delete any existing fake memberships
DELETE FROM public.league_memberships
WHERE user_id::text LIKE '00000000-0000-0000-0000-%';

-- Insert 30 fake league memberships with random points for the current season and division
INSERT INTO public.league_memberships (user_id, division_id, season_id, league_points)
SELECT
  ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid,
  'e243a707-111f-4124-8a5f-81a5b68c9cd0'::uuid, -- League 1, Division 1
  'da8bfc76-e6ea-4876-840f-195f313ba6d7'::uuid, -- Current active season
  (random() * 1000)::int
FROM generate_series(0, 29) as i;

-- Re-enable RLS
ALTER TABLE public.league_memberships ENABLE ROW LEVEL SECURITY;

-- Show results
SELECT
  COUNT(*) as total_members,
  MIN(league_points) as min_points,
  MAX(league_points) as max_points,
  AVG(league_points)::int as avg_points
FROM public.league_memberships
WHERE division_id = 'e243a707-111f-4124-8a5f-81a5b68c9cd0';
