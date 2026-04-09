"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Building2, Plus } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-16 md:w-64 border-r border-[#f5f1e3]/20 bg-[#080d1a] flex flex-col justify-between py-6 z-[100]">
      <div>
        <div className="px-4 md:px-6 mb-8 hidden md:block text-xl font-bold tracking-widest text-[#f5f1e3]">
          CLARA OS
        </div>
        <div className="flex flex-col gap-2 px-2 md:px-4">
          <Link href="/" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === "/" ? "bg-[#f5f1e3]/10 text-emerald-400" : "hover:bg-[#f5f1e3]/10"}`}>
            <LayoutDashboard className="w-6 h-6 shrink-0" />
            <span className="hidden md:block font-mono">System</span>
          </Link>
          <Link href="/tasks" className={`flex justify-between items-center p-3 rounded-lg transition-colors ${pathname === "/tasks" ? "bg-[#f5f1e3]/10 text-emerald-400" : "hover:bg-[#f5f1e3]/10"}`}>
            <div className="flex items-center gap-3">
              <CheckSquare className="w-6 h-6 shrink-0" />
              <span className="hidden md:block font-mono">Tasks</span>
            </div>
            {pathname === "/tasks" && (
              <span className="hidden md:block bg-emerald-400/20 text-emerald-400 p-1 rounded">
                <Plus className="w-3 h-3" />
              </span>
            )}
          </Link>
          <Link href="/crm" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === "/crm" || pathname?.startsWith("/crm/") ? "bg-[#f5f1e3]/10 text-emerald-400" : "hover:bg-[#f5f1e3]/10"}`}>
            <Building2 className="w-6 h-6 shrink-0" />
            <span className="hidden md:block font-mono">CRM</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
