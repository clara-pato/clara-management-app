import { getTasks } from "./actions";
import Board from "./Board";
import { Activity, Brain, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tasks = await getTasks();

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header & Mood */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#f5f1e3]/20 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clara Task Manager</h1>
          <p className="text-[#f5f1e3]/70">PATO Pickleball Internal Operations</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-[#f5f1e3]/10 px-4 py-2 rounded-lg flex items-center gap-3">
            <Brain size={18} className="text-[#f5f1e3]" />
            <div className="flex flex-col">
              <span className="text-xs text-[#f5f1e3]/60 uppercase tracking-wider">Mood</span>
              <span className="text-sm font-medium">Focused & Sarcastic</span>
            </div>
          </div>
          <div className="bg-[#f5f1e3]/10 px-4 py-2 rounded-lg flex items-center gap-3">
            <Activity size={18} className="text-[#f5f1e3]" />
            <div className="flex flex-col">
              <span className="text-xs text-[#f5f1e3]/60 uppercase tracking-wider">System</span>
              <span className="text-sm font-medium text-emerald-400">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Board */}
      <Board initialTasks={tasks} />
    </main>
  );
}
