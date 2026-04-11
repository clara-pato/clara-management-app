const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Adding probability column...');
  let { error } = await supabase.rpc('exec_sql', { 
    query: "ALTER TABLE locations ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 0; NOTIFY pgrst, 'reload schema';" 
  });
  if (error) console.error("SQL alter error:", error);
  else console.log("Added column successfully.");

  // Now populate dummy data for photos and probabilities
  console.log('Populating dummy data...');
  const { data: locations, error: fetchErr } = await supabase.from('locations').select('id, photos, probability');
  if (fetchErr) {
    console.error("Fetch err:", fetchErr);
    return;
  }
  
  for (const loc of locations) {
    const dummyPhotos = (!loc.photos || loc.photos.length === 0) 
      ? ["https://images.unsplash.com/photo-1571983944621-e0c1f4e56596?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"] 
      : loc.photos;
    
    // assign random prob if 0
    const newProb = (loc.probability === 0 || loc.probability == null) ? Math.floor(Math.random() * 60) + 40 : loc.probability;
    
    const { error: updErr } = await supabase.from('locations').update({
      probability: newProb,
      photos: dummyPhotos
    }).eq('id', loc.id);
    if (updErr) console.error(`Error updating loc ${loc.id}:`, updErr);
    else console.log(`Updated loc ${loc.id} (prob: ${newProb}, photos: ${dummyPhotos.length})`);
  }
}
main();
