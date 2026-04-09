import Board from "./Board";

export default function TasksPage() {
  return (
    <div className="flex flex-col h-full w-full bg-[#0B162C] text-[#f5f1e3] p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-mono mb-2">TASKS & OPERATIONS</h1>
        <p className="text-[#f5f1e3]/60">Manage system agents and business operations.</p>
      </div>
      <Board />
    </div>
  );
}
