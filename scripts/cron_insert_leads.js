const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  await supabase.rpc('exec_sql', { query: 'ALTER TABLE locations ADD COLUMN IF NOT EXISTS source TEXT;' });
  
  const leads = [
    {
      address: "Kirchbergstr. 23, Pfersee",
      city: "Augsburg",
      size_sqm: 625,
      ceiling_height_m: null,
      asking_rent: 5938,
      listing_url: "https://www.immowelt.de/suche/mieten/hallen-industrieflaechen/bayern/augsburg-86150/ad08de8231",
      status: "new",
      notes: "Verified via web_fetch. Hall/warehouse matches >400m2 criteria.",
      source: "immowelt"
    }
  ];

  for (const lead of leads) {
    const { data, error } = await supabase.from('locations').insert(lead);
    if (error) {
      console.error("Error inserting lead:", error);
    } else {
      console.log("Successfully inserted lead:", lead.address);
    }
  }
}

main();
