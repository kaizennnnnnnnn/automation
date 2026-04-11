"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-emerald-400">SiteForge</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/marketplace" className={`text-sm font-medium transition-colors ${pathname === "/marketplace" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            Templates
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard"><Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8">Dashboard</Button></Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm" className="h-8 text-muted-foreground">Log in</Button></Link>
              <Link href="/signup"><Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700">Sign up</Button></Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
