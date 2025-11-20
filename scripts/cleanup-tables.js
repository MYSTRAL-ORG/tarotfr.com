#!/usr/bin/env node

/**
 * Cleanup script for removing inactive/stale tables
 *
 * This script removes:
 * - Tables in WAITING status older than 1 hour
 * - Tables in PLAYING status older than 3 hours
 * - All associated table_players records
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const env = fs.readFileSync(envPath, 'utf8');

const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1] || env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1];

if (!url || !key) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(url, key);

async function cleanupTables() {
  console.log('Starting table cleanup...');

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  try {
    const { data: waitingTables, error: waitingError } = await supabase
      .from('tables')
      .select('id, created_at, status')
      .eq('status', 'WAITING')
      .lt('created_at', oneHourAgo.toISOString());

    if (waitingError) {
      console.error('Error fetching waiting tables:', waitingError);
    } else {
      console.log(`Found ${waitingTables?.length || 0} waiting tables older than 1 hour`);
    }

    const { data: playingTables, error: playingError } = await supabase
      .from('tables')
      .select('id, created_at, status')
      .eq('status', 'PLAYING')
      .lt('created_at', threeHoursAgo.toISOString());

    if (playingError) {
      console.error('Error fetching playing tables:', playingError);
    } else {
      console.log(`Found ${playingTables?.length || 0} playing tables older than 3 hours`);
    }

    const tablesToDelete = [...(waitingTables || []), ...(playingTables || [])];

    if (tablesToDelete.length === 0) {
      console.log('No tables to clean up');
      return;
    }

    console.log(`Deleting ${tablesToDelete.length} inactive tables...`);

    for (const table of tablesToDelete) {
      console.log(`  - Deleting table ${table.id} (${table.status}, created ${table.created_at})`);

      const { error: playersError } = await supabase
        .from('table_players')
        .delete()
        .eq('table_id', table.id);

      if (playersError) {
        console.error(`    Error deleting table_players for ${table.id}:`, playersError);
      }

      const { error: tableError } = await supabase
        .from('tables')
        .delete()
        .eq('id', table.id);

      if (tableError) {
        console.error(`    Error deleting table ${table.id}:`, tableError);
      } else {
        console.log(`    ✓ Deleted table ${table.id}`);
      }
    }

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupTables()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
