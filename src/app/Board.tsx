"use client";

import { useState } from "react";
import { addTask, updateTaskStatus } from "./actions";
import { Plus, ArrowRight, ArrowLeft } from "lucide-react";

export default function Board({ initialTasks }: { initialTasks: any[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isAdding, setIsAdding] = useState(false);

  const columns = [
    { id: "backlog", title: "Backlog" },
    { id: "working", title: "Working" },
    { id: "completed", title: "Completed" },
  ];

  async function handleMove(id: string, newStatus: string) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    await updateTaskStatus(id, newStatus);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Optimistic add for visual speed
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    if (!title) return;

    const newTask = {
      id: `temp_${Date.now()}`,
      title,
      description,
      status: "backlog",
      priority: "medium",
      assigned_agent: "Clara",
    };
    
    setTasks((prev) => [...prev, newTask]);
    setIsAdding(false);

    // Actual server action
    const res = await addTask(formData);
    if (!res.success) {
      alert("Failed to add task");
    } else {
      // Reload to get real IDs and refresh
      window.location.reload();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Active Board</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#f5f1e3] text-[#0B162C] px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-[#f5f1e3]/90 transition"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-[#f5f1e3]/5 border border-[#f5f1e3]/20 p-4 rounded-lg flex flex-col gap-4">
          <input
            name="title"
            placeholder="Task Title"
            required
            className="bg-transparent border border-[#f5f1e3]/20 rounded p-2 text-[#f5f1e3] outline-none focus:border-[#f5f1e3]/50"
          />
          <textarea
            name="description"
            placeholder="Description..."
            rows={2}
            className="bg-transparent border border-[#f5f1e3]/20 rounded p-2 text-[#f5f1e3] outline-none focus:border-[#f5f1e3]/50"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-[#f5f1e3]/70 hover:text-[#f5f1e3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#f5f1e3] text-[#0B162C] px-4 py-2 rounded font-medium"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => (t.status || "backlog").toLowerCase() === col.id);
          return (
            <div key={col.id} className="bg-[#f5f1e3]/5 rounded-xl border border-[#f5f1e3]/10 flex flex-col min-h-[500px]">
              <div className="p-4 border-b border-[#f5f1e3]/10 flex justify-between items-center">
                <h3 className="font-semibold">{col.title}</h3>
                <span className="bg-[#f5f1e3]/20 text-xs px-2 py-1 rounded-full">{colTasks.length}</span>
              </div>
              
              <div className="p-4 flex flex-col gap-3">
                {colTasks.map((task) => (
                  <div key={task.id} className="bg-[#0B162C] border border-[#f5f1e3]/20 p-4 rounded-lg flex flex-col gap-2 shadow-lg">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-medium leading-tight">{task.title}</h4>
                    </div>
                    {task.description && (
                      <p className="text-sm text-[#f5f1e3]/70 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="mt-2 flex justify-between items-center border-t border-[#f5f1e3]/10 pt-2">
                      <div className="text-xs text-[#f5f1e3]/50">
                        {task.assigned_agent || "Unassigned"}
                      </div>
                      
                      <div className="flex gap-1">
                        {col.id !== "backlog" && (
                          <button
                            onClick={() => handleMove(task.id, col.id === "completed" ? "working" : "backlog")}
                            className="p-1 hover:bg-[#f5f1e3]/20 rounded text-[#f5f1e3]/70 hover:text-[#f5f1e3]"
                          >
                            <ArrowLeft size={16} />
                          </button>
                        )}
                        {col.id !== "completed" && (
                          <button
                            onClick={() => handleMove(task.id, col.id === "backlog" ? "working" : "completed")}
                            className="p-1 hover:bg-[#f5f1e3]/20 rounded text-[#f5f1e3]/70 hover:text-[#f5f1e3]"
                          >
                            <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center text-sm text-[#f5f1e3]/40 py-8 italic">
                    No tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
