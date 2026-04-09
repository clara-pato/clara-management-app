import { createClient } from "@supabase/supabase-js";
import * as fsLib from "fs";

const envLocal = fsLib.readFileSync("/Users/clara/.openclaw/workspace/clara-pato/clara-management-app/.env.local", "utf8");

const urlMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const url = urlMatch ? urlMatch[1] : "";

const keyMatch = envLocal.match(/SERVICE_ROLE_KEY=(.*)/);
const key = keyMatch ? keyMatch[1] : "";

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase
    .from("clara_state")
    .upsert({ 
      id: 1, 
      mood: "excited", 
      emoticon: "^_^", 
      message: "SYSTEM ONLINE", 
      current_task_id: "none", 
      updated_at: new Date().toISOString() 
    });
  console.log("Upsert result:", { data, error });
}
main();
