import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

export type Mood = 'excited' | 'working' | 'idle' | 'blocked';
export type TaskPriority = 'low' | 'med' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'working' | 'completed';

export async function updateMood(mood: Mood, emoticon: string, message?: string, taskId?: string) {
    const updateData: any = { mood, emoticon, updated_at: new Date().toISOString() };
    if (message !== undefined) updateData.message = message;
    if (taskId !== undefined) updateData.current_task_id = taskId;

    const { data, error } = await supabase
        .from('clara_state')
        .update(updateData)
        .eq('id', 1);
        
    if (error) {
        console.error('Failed to update mood:', error);
        throw error;
    }
    return data;
}

export async function updateTask(id: string, updates: { title?: string, description?: string, priority?: TaskPriority, status?: TaskStatus }) {
    const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('Failed to update task:', error);
        throw error;
    }
    return data;
}

export async function logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    const { data, error } = await supabase
        .from('clara_logs')
        .insert({ message, level });
        
    if (error) {
        console.error('Failed to insert log:', error);
        throw error;
    }
    return data;
}
