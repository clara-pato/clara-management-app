"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Clock, Play, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Board() {
  const [systemTasks, setSystemTasks] = useState<any[]>([]);
  const [opsTasks, setOpsTasks] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  const columns = [
    { id: "pending", title: "Pending", icon: <Clock className="w-4 h-4" /> },
    { id: "active", title: "Active / Working", icon: <Play className="w-4 h-4" /> },
    { id: "completed", title: "Completed", icon: <Check className="w-4 h-4" /> },
  ];

  const fetchOpsTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setOpsTasks(data);
    }
  };

  useEffect(() => {
    fetchOpsTasks();

    const sse = new EventSource('/api/stream');
    
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'event' && data.event === 'presence') {
          const payload = data.payload || {};
          const presenceTasks = payload.tasks || [];
          
          const formattedTasks = presenceTasks.map((t: any) => {
            let status = "pending";
            const state = (t.state || "").toLowerCase();
            if (["active", "thinking", "running"].includes(state)) status = "active";
            else if (["done", "completed", "resolved"].includes(state)) status = "completed";
            
            return {
              id: t.id || `task_${Math.random()}`,
              title: t.name || t.description || "Unknown Task",
              description: t.description || "",
              status,
              assigned_agent: t.agent || "OpenClaw",
            };
          });
          setSystemTasks(formattedTasks);
        }
      } catch (err) {}
    };

    return () => sse.close();
  }, []);

  const handleCreateOpsTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const { data, error } = await supabase.from('tasks').insert([
      { title: newTaskTitle, description: newTaskDesc, status: 'pending' }
    ]).select();

    if (!error && data) {
      setOpsTasks([...data, ...opsTasks]);
      setIsAdding(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
    }
  };

  const updateOpsTaskStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setOpsTasks(opsTasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    }
  };

  const deleteOpsTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setOpsTasks(opsTasks.filter(t => t.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* System Tasks Section */}
      <section>
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-mono text-emerald-400">Active System Tasks</h2>
          <div className="flex items-center gap-2 text-sm text-[#f5f1e3]/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live OpenClaw RPC
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(col => {
            const colTasks = systemTasks.filter(t => t.status === col.id);
            return (
              <div key={`sys-${col.id}`} className="bg-[#f5f1e3]/5 rounded-xl border border-[#f5f1e3]/10 min-h-[300px]">
                <div className="p-4 border-b border-[#f5f1e3]/10 flex justify-between items-center bg-[#f5f1e3]/[0.02]">
                  <div className="flex items-center gap-2 font-semibold">
                    {col.icon} {col.title}
                  </div>
                  <span className="bg-[#f5f1e3]/10 text-xs px-2 py-1 rounded-full">{colTasks.length}</span>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  {colTasks.map(task => (
                    <div key={task.id} className="bg-[#0B162C] border border-[#f5f1e3]/20 p-4 rounded-lg flex flex-col gap-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      {task.description && <p className="text-xs text-[#f5f1e3]/60 line-clamp-2">{task.description}</p>}
                      <div className="mt-2 text-xs text-[#f5f1e3]/40 flex items-center gap-2">
                        <span>Agent: {task.assigned_agent}</span>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && <div className="text-center text-xs text-[#f5f1e3]/30 py-4 italic">Empty</div>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Operations Tasks Section */}
      <section>
        <div className="mb-6 flex justify-between items-center border-t border-[#f5f1e3]/10 pt-10">
          <h2 className="text-xl font-mono">Persistent Operations Tasks</h2>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-[#f5f1e3] text-[#0B162C] px-4 py-2 rounded-lg font-medium hover:bg-[#f5f1e3]/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleCreateOpsTask} className="mb-6 bg-[#f5f1e3]/5 border border-[#f5f1e3]/10 p-4 rounded-xl flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Task Title" 
              className="bg-[#0B162C] border border-[#f5f1e3]/20 rounded-lg p-2 text-sm outline-none focus:border-[#f5f1e3]/50"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              autoFocus
            />
            <textarea 
              placeholder="Description (optional)" 
              className="bg-[#0B162C] border border-[#f5f1e3]/20 rounded-lg p-2 text-sm outline-none focus:border-[#f5f1e3]/50 min-h-[80px]"
              value={newTaskDesc}
              onChange={e => setNewTaskDesc(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-[#f5f1e3]/70 hover:text-[#f5f1e3]">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-[#f5f1e3] text-[#0B162C] rounded-lg font-medium">Save Task</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(col => {
            const colTasks = opsTasks.filter(t => t.status === col.id);
            return (
              <div key={`ops-${col.id}`} className="bg-[#f5f1e3]/5 rounded-xl border border-[#f5f1e3]/10 min-h-[500px]">
                <div className="p-4 border-b border-[#f5f1e3]/10 flex justify-between items-center bg-[#f5f1e3]/[0.02]">
                  <div className="flex items-center gap-2 font-semibold">
                    {col.icon} {col.title}
                  </div>
                  <span className="bg-[#f5f1e3]/10 text-xs px-2 py-1 rounded-full">{colTasks.length}</span>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  {colTasks.map(task => (
                    <div key={task.id} className="bg-[#0B162C] border border-[#f5f1e3]/20 p-4 rounded-lg flex flex-col gap-3 group relative">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm pr-6">{task.title}</h4>
                        <button onClick={() => deleteOpsTask(task.id)} className="text-red-400/50 hover:text-red-400 absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {task.description && <p className="text-xs text-[#f5f1e3]/60">{task.description}</p>}
                      
                      <div className="mt-2 flex gap-2 border-t border-[#f5f1e3]/10 pt-3">
                        {columns.map(c => (
                          <button
                            key={c.id}
                            onClick={() => updateOpsTaskStatus(task.id, c.id)}
                            className={`text-[10px] px-2 py-1 rounded border ${task.status === c.id ? 'border-[#f5f1e3] text-[#f5f1e3] bg-[#f5f1e3]/10' : 'border-[#f5f1e3]/20 text-[#f5f1e3]/50 hover:border-[#f5f1e3]/50'}`}
                          >
                            {c.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && <div className="text-center text-xs text-[#f5f1e3]/30 py-8 italic">No tasks</div>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
