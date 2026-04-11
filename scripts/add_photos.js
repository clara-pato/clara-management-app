const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Populating dummy data for photos...');
  const { data: locations, error: fetchErr } = await supabase.from('locations').select('id, photos');
  if (fetchErr) {
    console.error("Fetch err:", fetchErr);
    return;
  }
  
  for (const loc of locations) {
    const dummyPhotos = (!loc.photos || loc.photos.length === 0) 
      ? ["https://images.unsplash.com/photo-1571983944621-e0c1f4e56596?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"] 
      : loc.photos;
    
    const { error: updErr } = await supabase.from('locations').update({
      photos: dummyPhotos
    }).eq('id', loc.id);
    if (updErr) console.error(`Error updating loc ${loc.id}:`, updErr);
    else console.log(`Updated loc ${loc.id} (photos: ${dummyPhotos.length})`);
  }
}
main();
