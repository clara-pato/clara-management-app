const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: locations, error } = await supabase
    .from('locations')
    .select('id, probability');
  
  if (error) {
    console.error('Error fetching locations:', error);
    return;
  }

  let count = 0;
  for (const loc of locations) {
    if (loc.probability === 0) {
      const newProb = Math.floor(Math.random() * (85 - 50 + 1)) + 50; // 50 to 85
      await supabase
        .from('locations')
        .update({ probability: newProb })
        .eq('id', loc.id);
      console.log(`Updated ${loc.id} to ${newProb}`);
      count++;
    }
  }
  console.log(`Done. Updated ${count} locations.`);
}

run();