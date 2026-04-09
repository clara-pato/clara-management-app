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
    .upsert({ id: 1, mood: "working", message: "Updating database migrations and removing emoticon column...", current_task_id: "db_sync", updated_at: new Date().toISOString() });
        
  console.log("Forced update:", data, error);
}
main();
