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
    .from("tasks")
    .insert([
       { title: "Dashboard Sync", description: "Make sure dashboard updates automatically via Supabase Realtime", priority: "high", status: "working" },
       { title: "Review Leads", description: "Check new location leads in Munich", priority: "med", status: "backlog" }
    ]);
  console.log("Tasks insert result:", { data, error });
}
main();
