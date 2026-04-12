"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap, LayoutGrid, Store, LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";

export function Sidebar({ fullName }: { fullName: string }) {
  const pathname = usePathname();
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/marketplace", label: "Templates", icon: Store },
  ];

  return (
    <aside className="w-16 lg:w-56 bg-card border-r border-border flex flex-col min-h-screen shrink-0">
      <div className="p-3 lg:p-4 flex items-center justify-center lg:justify-start">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="hidden lg:block text-base font-bold text-amber-400">SiteForge</span>
        </Link>
      </div>
      <nav className="flex-1 px-2 lg:px-3 mt-2 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href === "/dashboard" && pathname.startsWith("/dashboard"));
          return (
            <Link key={link.href} href={link.href} title={link.label}
              className={cn("flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-2 lg:p-3 border-t border-border">
        <div className="flex items-center justify-center lg:justify-start gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <span className="hidden lg:block text-sm font-medium truncate flex-1">{fullName}</span>
        </div>
        <form action={logout}>
          <button type="submit" title="Sign out"
            className="flex items-center justify-center lg:justify-start gap-2 px-2 py-2 w-full rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:block">Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
