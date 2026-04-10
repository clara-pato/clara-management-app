"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Building2, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <nav className="w-16 md:w-64 border-r bg-background flex flex-col justify-between py-6 z-[100]">
      <div>
        <div className="px-4 md:px-6 mb-8 hidden md:block text-xl font-bold tracking-tight text-foreground">
          CLARA OS
        </div>
        <div className="flex flex-col gap-2 px-2 md:px-4">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: pathname === "/" ? "secondary" : "ghost" }),
              "w-full justify-start h-12 md:h-10 px-3"
            )}
          >
            <LayoutDashboard className="w-5 h-5 md:mr-2" />
            <span className="hidden md:block">System</span>
          </Link>

          <Link
            href="/tasks"
            className={cn(
              buttonVariants({ variant: pathname === "/tasks" ? "secondary" : "ghost" }),
              "w-full justify-between h-12 md:h-10 px-3"
            )}
          >
            <div className="flex items-center">
              <CheckSquare className="w-5 h-5 md:mr-2" />
              <span className="hidden md:block">Tasks</span>
            </div>
            {pathname === "/tasks" && (
              <span className="hidden md:block bg-primary/20 text-primary p-0.5 rounded ml-2">
                <Plus className="w-3 h-3" />
              </span>
            )}
          </Link>

          <Link
            href="/crm"
            className={cn(
              buttonVariants({ variant: pathname === "/crm" || pathname?.startsWith("/crm/") ? "secondary" : "ghost" }),
              "w-full justify-start h-12 md:h-10 px-3"
            )}
          >
            <Building2 className="w-5 h-5 md:mr-2" />
            <span className="hidden md:block">CRM</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
