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
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Using Supabase URL:', supabaseUrl);
console.log('Using key type:', envVars.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon');

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
    console.log('🎮 Starting league players seeding...');

    // Get the current active season
    const { data: season, error: seasonError } = await supabase
      .from('league_seasons')
      .select('id')
      .eq('status', 'active')
      .single();

    if (seasonError || !season) {
      console.error('❌ No active season found');
      return;
    }

    console.log('✅ Found active season:', season.id);

    // Get league 1, division 1
    const { data: division, error: divisionError } = await supabase
      .from('league_divisions')
      .select('id')
      .eq('league_id', 1)
      .eq('division_number', 1)
      .single();

    if (divisionError || !division) {
      console.error('❌ No division found');
      return;
    }

    console.log('✅ Found division:', division.id);

    // Create fake users via auth.users and public.users
    const createdUsers = [];

    for (let i = 0; i < 30; i++) {
      const email = `fake${i}@league.test`;
      const displayName = fakeUserNames[i] || `Player${i + 1}`;

      // First, create auth user using admin API
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          display_name: displayName
        }
      });

      if (authError) {
        console.log(`⚠️  User ${email} might already exist, skipping...`);

        // Try to get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);

        if (existingUser) {
          createdUsers.push({
            id: existingUser.id,
            email: email,
            display_name: displayName
          });
        }
        continue;
      }

      console.log(`✅ Created user: ${displayName} (${email})`);

      createdUsers.push({
        id: authUser.user.id,
        email: email,
        display_name: displayName
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Created/found ${createdUsers.length} users`);

    // Now create public.users entries and league memberships
    for (const user of createdUsers) {
      // Create public user entry
      const { error: publicUserError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          is_guest: true,
          is_bot: false
        })
        .select();

      if (publicUserError && !publicUserError.message.includes('duplicate')) {
        console.error(`❌ Error creating public user for ${user.display_name}:`, publicUserError);
        continue;
      }

      // Generate random league points (0-1000)
      const leaguePoints = Math.floor(Math.random() * 1000);

      // Create league membership
      const { error: membershipError } = await supabase
        .from('league_memberships')
        .insert({
          user_id: user.id,
          division_id: division.id,
          season_id: season.id,
          league_points: leaguePoints
        });

      if (membershipError && !membershipError.message.includes('duplicate')) {
        console.error(`❌ Error creating membership for ${user.display_name}:`, membershipError);
      } else {
        console.log(`✅ Created membership for ${user.display_name} with ${leaguePoints} points`);
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('\n🎉 Seeding complete! Check /ligues page to see the results.');

  } catch (error) {
    console.error('❌ Error seeding league players:', error);
  }
}

seedLeaguePlayers();
