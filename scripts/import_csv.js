const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const leadsFile = '/Users/clara/.openclaw/workspace/projects/location-search/leads.csv';

const records = [];
fs.createReadStream(leadsFile)
  .pipe(parse({ columns: true, skip_empty_lines: true, relax_column_count: true }))
  .on('data', (data) => records.push(data))
  .on('end', async () => {
    console.log(`Parsed ${records.length} records. Uploading to Supabase...`);
    
    for (const record of records) {
      // Create agent if agent details exist
      let agent_id = null;
      if (record.contact_name || record.contact_phone || record.contact_email) {
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .insert({
            name: record.contact_name || 'Unknown',
            phone: record.contact_phone || null,
            email: record.contact_email || null,
            company: null
          })
          .select('id')
          .single();
          
        if (agentError) {
          console.error('Error inserting agent:', agentError.message);
        } else if (agentData) {
          agent_id = agentData.id;
        }
      }

      // Map status
      let status = 'new';
      if (record.status) {
        const st = record.status.toLowerCase();
        if (['new', 'contacting', 'viewing', 'offer_sent', 'rejected', 'lease_signed'].includes(st)) {
          status = st;
        }
      }

      let ceiling = null;
      if (record.ceiling_height_m) {
        let val = parseFloat(record.ceiling_height_m.replace(/[^0-9.]/g, ''));
        if (!isNaN(val)) ceiling = val;
      }

      // Insert location
      const { data: locData, error: locError } = await supabase
        .from('locations')
        .insert({
          address: record.address || 'Unknown',
          city: record.city || 'Unknown',
          size_sqm: record.size_sqm ? parseFloat(record.size_sqm) : null,
          ceiling_height_m: ceiling,
          asking_rent: record.asking_rent ? parseFloat(record.asking_rent) : null,
          listing_url: record.listing_url || null,
          status: status,
          notes: record.notes || null,
          photos: record.photos ? JSON.stringify([record.photos]) : '[]'
        })
        .select('id')
        .single();
        
      if (locError) {
        console.error('Error inserting location:', locError.message);
        continue;
      }
    }
    
    console.log("Migration complete.");
  });
