import fs from 'fs/promises';

const DASHBOARD_PATH = '/Users/clara/.openclaw/workspace/work-management/data/dashboard.json';
const RETRO_PUBLIC_PATH = '/Users/clara/.openclaw/workspace/clara-retro-ui/public/dashboard.json';

export async function syncState(state: string, emoticon: string, mood: string, message: string, task: string) {
    const data = {
        state,
        emoticon,
        mood,
        message,
        current_task: task,
        updated_at: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    
    // Sync to both locations for local and vercel mock support
    await fs.writeFile(DASHBOARD_PATH, json);
    await fs.writeFile(RETRO_PUBLIC_PATH, json);
    
    console.log(`[Clara Sync] State: ${state} | Mood: ${mood}`);
}
