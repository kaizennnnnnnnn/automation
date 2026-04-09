"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Zap,
  Link2,
  Store,
  LogOut,
  Upload,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { logout } from "@/app/(auth)/actions";

interface SidebarProps {
  fullName: string;
}

export function Sidebar({ fullName }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    {
      href: "/dashboard",
      label: "My Previews",
      icon: Link2,
    },
    {
      href: "/customize/upload",
      label: "New Preview",
      icon: Sparkles,
    },
    {
      href: "/marketplace",
      label: "Marketplace",
      icon: Store,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen shrink-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1B4FD8] rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold">SiteForge</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href === "/dashboard" && pathname.startsWith("/dashboard"));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#1B4FD8] text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-sm font-semibold">
            {fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fullName}</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 mt-1 w-full rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
