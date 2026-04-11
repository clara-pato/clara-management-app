import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('/Users/clara/clara-pato/clara-management-app', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Fetching locations...");
  const { data: locations, error } = await supabase.from('locations').select('id, photos');
  if (error) {
    console.error("Error fetching locations:", error);
    return;
  }

  for (const location of locations) {
    if (!location.photos || !Array.isArray(location.photos) || location.photos.length === 0) {
      continue;
    }
    console.log(`Processing location ${location.id} with ${location.photos.length} photos...`);

    let isFirst = true;
    for (let i = 0; i < location.photos.length; i++) {
      let photoUrl = location.photos[i];
      if (typeof photoUrl === 'object' && photoUrl.url) {
        photoUrl = photoUrl.url;
      }
      
      if (!photoUrl || typeof photoUrl !== 'string') continue;
      
      try {
        console.log(`Downloading ${photoUrl}...`);
        const res = await fetch(photoUrl);
        if (!res.ok) {
          console.warn(`Failed to download ${photoUrl}: ${res.statusText}`);
          continue;
        }
        
        const buffer = await res.arrayBuffer();
        
        // Ensure photoUrl gets a reasonable extension
        let ext = 'jpg';
        if (photoUrl.toLowerCase().includes('.png')) ext = 'png';
        if (photoUrl.toLowerCase().includes('.jpeg')) ext = 'jpeg';
        if (photoUrl.toLowerCase().includes('.webp')) ext = 'webp';
        
        const filename = `photo_${i}_${Date.now()}.${ext}`;
        const storagePath = `${location.id}/${filename}`;
        
        console.log(`Uploading to bucket location_photos/${storagePath}...`);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('location_photos')
          .upload(storagePath, buffer, {
            contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
            upsert: false
          });
          
        if (uploadError) {
          console.error(`Upload error for ${photoUrl}:`, uploadError);
          continue;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('location_photos')
          .getPublicUrl(storagePath);
          
        const publicUrl = publicUrlData.publicUrl;
        
        console.log(`Inserting into location_photos table...`);
        const { error: insertError } = await supabase
          .from('location_photos')
          .insert({
            location_id: location.id,
            storage_path: storagePath,
            public_url: publicUrl,
            is_primary: isFirst
          });
          
        if (insertError) {
          console.error(`Insert error for ${storagePath}:`, insertError);
        } else {
          isFirst = false; // only the first successfully uploaded photo is primary
        }
        
      } catch (e) {
        console.error(`Error processing ${photoUrl}:`, e.message);
      }
    }
  }
  console.log("Migration complete.");
}

migrate();
