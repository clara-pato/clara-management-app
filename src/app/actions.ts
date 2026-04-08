"use server";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getTasks() {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return [];
  }
}

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const workstream = formData.get("workstream") as string || "General";
  
  if (!title) return { success: false, error: "Title is required" };

  try {
    const newTask = {
      title,
      description,
      status: "backlog",
      priority: "med",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('tasks')
      .insert([newTask]);
      
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Error writing task:", err);
    return { success: false, error: "Failed to save task" };
  }
}

export async function updateTaskStatus(id: string, newStatus: string) {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Error updating task:", err);
    return { success: false, error: "Failed to update task" };
  }
}
