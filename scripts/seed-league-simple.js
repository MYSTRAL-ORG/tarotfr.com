const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const fakeUserNames = [
  'AlphaKing', 'BetaMaster', 'GammaChamp', 'DeltaPro', 'EpsilonAce',
  'ZetaLegend', 'EtaWarrior', 'ThetaHero', 'IotaKnight', 'KappaElite',
  'LambdaStar', 'MuChallenger', 'NuVictory', 'XiPhoenix', 'OmicronTitan',
  'PiGenius', 'RhoSavant', 'SigmaBoss', 'TauChampion', 'UpsilonKing',
  'PhiMaestro', 'ChiDragon', 'PsiMystic', 'OmegaGod', 'AlphaOmega',
  'NovaStar', 'QuantumLeap', 'SolarFlare', 'CosmicRay', 'AstroBlaze'
];

async function seedLeaguePlayers() {
  try {
    console.log('🎮 Starting simple league seeding with SQL...');

    // Get the current active season
    const { data: season } = await supabase
      .from('league_seasons')
      .select('id')
      .eq('status', 'active')
      .single();

    if (!season) {
      console.error('❌ No active season found');
      return;
    }

    console.log('✅ Found active season:', season.id);

    // Get league 1, division 1
    const { data: division } = await supabase
      .from('league_divisions')
      .select('id')
      .eq('league_id', 1)
      .eq('division_number', 1)
      .single();

    if (!division) {
      console.error('❌ No division found');
      return;
    }

    console.log('✅ Found division:', division.id);

    // Get current user (the logged-in user)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('⚠️  No user logged in. You need to be logged in to see yourself in the rankings.');
      console.log('   But we\'ll continue with fake data anyway...');
    } else {
      console.log('✅ Found current user:', user.email);

      // Ensure current user has a public.users entry
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'You',
          is_guest: false,
          is_bot: false
        }, { onConflict: 'id' });

      if (userError) {
        console.error('Error creating/updating user:', userError);
      }

      // Add current user to the league with random points
      const myPoints = Math.floor(Math.random() * 1000);
      const { error: membershipError } = await supabase
        .from('league_memberships')
        .upsert({
          user_id: user.id,
          division_id: division.id,
          season_id: season.id,
          league_points: myPoints
        }, { onConflict: 'user_id,season_id' });

      if (membershipError) {
        console.error('Error creating membership:', membershipError);
      } else {
        console.log(`✅ Added you to the league with ${myPoints} points`);
      }
    }

    // For the rest, we'll just insert fake data into league_memberships without creating actual users
    // This will show names in the UI but they won't be real users
    console.log('\n📝 Creating 29 fake league memberships...');

    const fakeMemberships = [];
    for (let i = 0; i < 29; i++) {
      // Generate a fake UUID for these players
      const fakeUserId = `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`;
      const leaguePoints = Math.floor(Math.random() * 1000);

      fakeMemberships.push({
        user_id: fakeUserId,
        division_id: division.id,
        season_id: season.id,
        league_points: leaguePoints
      });
    }

    // Insert fake memberships
    const { error: insertError } = await supabase
      .from('league_memberships')
      .upsert(fakeMemberships, { onConflict: 'user_id,season_id', ignoreDuplicates: true });

    if (insertError) {
      console.error('❌ Error inserting fake memberships:', insertError);
    } else {
      console.log('✅ Created 29 fake league memberships');
    }

    console.log('\n🎉 Seeding complete!');
    console.log('Note: The fake players won\'t have real user profiles, so they will show as "Unknown Player" in the UI.');
    console.log('To fix this, we need the Supabase service_role key to create real auth users.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

seedLeaguePlayers();
