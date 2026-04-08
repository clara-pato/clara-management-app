import fs from 'fs/promises';
import path from 'path';

// Define the root workspace path for Clara
const WORKSPACE_ROOT = '/Users/clara/.openclaw/workspace';
const DASHBOARD_FILE = 'work-management/data/dashboard.json';
const RETRO_FILE = 'clara-retro-ui/public/dashboard.json';

/**
 * Syncs the current state, emoticon, mood, and message to the dashboard files.
 * This ensures both the local dev environment and the Vercel-deployed mock
 * stay synchronized with Clara's actual activity.
 */
export async function syncClaraState(
  state: 'IDLE' | 'WORKING' | 'THINKING' | 'BLOCKED',
  emoticon: string,
  mood: string,
  message: string,
  currentTask: string = 'None'
) {
  const data = {
    state,
    emoticon,
    mood,
    message,
    current_task: currentTask,
    updated_at: new Date().toISOString()
  };

  const jsonContent = JSON.stringify(data, null, 2);

  try {
    // 1. Sync to the central data store
    const centralPath = path.join(WORKSPACE_ROOT, DASHBOARD_FILE);
    await fs.writeFile(centralPath, jsonContent);

    // 2. Sync to the Retro UI public folder for Vercel visibility
    const retroPath = path.join(WORKSPACE_ROOT, RETRO_FILE);
    await fs.writeFile(retroPath, jsonContent);

    console.log(`[ClaraStateSync] ${state}: ${message} (${emoticon})`);
  } catch (error) {
    console.error('[ClaraStateSync] Error syncing state:', error);
  }
}
