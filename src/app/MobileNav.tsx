"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, CheckSquare, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <div className="md:hidden">
      <div className="h-16 border-b bg-background flex items-center justify-between px-4">
        <span className="font-bold tracking-tight text-foreground">CLARA OS</span>
        <button onClick={() => setIsOpen(!isOpen)} className="text-foreground">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bottom-0 bg-background z-[200] flex flex-col p-4 gap-2">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center p-4 rounded-lg",
              pathname === "/" ? "bg-secondary text-secondary-foreground" : "text-foreground hover:bg-secondary/50"
            )}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span className="font-medium">System</span>
          </Link>
          <Link
            href="/tasks"
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center p-4 rounded-lg",
              pathname === "/tasks" ? "bg-secondary text-secondary-foreground" : "text-foreground hover:bg-secondary/50"
            )}
          >
            <CheckSquare className="w-5 h-5 mr-3" />
            <span className="font-medium">Tasks</span>
          </Link>
          <Link
            href="/crm"
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center p-4 rounded-lg",
              pathname === "/crm" || pathname?.startsWith("/crm/") ? "bg-secondary text-secondary-foreground" : "text-foreground hover:bg-secondary/50"
            )}
          >
            <Building2 className="w-5 h-5 mr-3" />
            <span className="font-medium">CRM</span>
          </Link>
        </div>
      )}
    </div>
  );
}
