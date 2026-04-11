const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { error } = await supabase.rpc('exec_sql', { query: 'ALTER TABLE locations ADD COLUMN source text; NOTIFY pgrst, \'reload schema\';' });
  console.log("SQL error:", error);
}

main();