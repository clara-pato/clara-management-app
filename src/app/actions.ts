"use server";

import fs from "fs/promises";
import path from "path";

const DATA_FILE = "/Users/clara/.openclaw/workspace/work-management/data/tasks.json";

export async function getTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return parsed.tasks || [];
  } catch (err) {
    console.error("Error reading tasks:", err);
    return [];
  }
}

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const workstream = formData.get("workstream") as string || "General";
  
  if (!title) return { success: false, error: "Title is required" };

  try {
    const tasks = await getTasks();
    const newTask = {
      id: `task_${Date.now()}`,
      title,
      description,
      workstream,
      status: "backlog", // Default to backlog
      priority: "medium",
      assigned_agent: "Clara",
      last_activity: new Date().toISOString(),
    };

    tasks.push(newTask);
    await fs.writeFile(DATA_FILE, JSON.stringify({ tasks }, null, 2), "utf-8");
    return { success: true };
  } catch (err) {
    console.error("Error writing task:", err);
    return { success: false, error: "Failed to save task" };
  }
}

export async function updateTaskStatus(id: string, newStatus: string) {
  try {
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex((t: any) => t.id === id);
    if (taskIndex === -1) return { success: false, error: "Task not found" };

    tasks[taskIndex].status = newStatus;
    tasks[taskIndex].last_activity = new Date().toISOString();

    await fs.writeFile(DATA_FILE, JSON.stringify({ tasks }, null, 2), "utf-8");
    return { success: true };
  } catch (err) {
    console.error("Error updating task:", err);
    return { success: false, error: "Failed to update task" };
  }
}
