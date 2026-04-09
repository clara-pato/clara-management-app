import { createClient } from "@supabase/supabase-js";
import * as fsLib from "fs";

const envLocal = fsLib.readFileSync("/Users/clara/.openclaw/workspace/clara-pato/clara-management-app/.env.local", "utf8");
const urlMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const url = urlMatch ? urlMatch[1] : "";
const keyMatch = envLocal.match(/SERVICE_ROLE_KEY=(.*)/);
const key = keyMatch ? keyMatch[1] : "";
const supabase = createClient(url, key);

async function main() {
  const moods = ["working", "thinking", "idle", "excited", "spawning_agent", "blocked", "waiting_for_input"];
  const messages = [
    "Scraping Immowelt leads...",
    "Thinking about architecture...",
    "Awaiting new instructions...",
    "Found an amazing location in Munich!",
    "Deploying new agent...",
    "Error 403: Cloudflare blocked me",
    "Please provide user input."
  ];
  
  let i = 0;
  setInterval(async () => {
    const mood = moods[i % moods.length];
    const msg = messages[i % messages.length];
    console.log(`Update to -> Mood: ${mood}, Msg: ${msg}`);
    
    await supabase.from("clara_state").upsert({ 
      id: 1, 
      mood: mood, 
      message: msg, 
      current_task_id: `task_00${(i % 5) + 1}`, 
      updated_at: new Date().toISOString() 
    });
    i++;
  }, 3000);
}
main();
