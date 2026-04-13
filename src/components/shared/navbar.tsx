"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <nav className="flex items-center gap-4">
          <Link href="/marketplace" className={`text-sm font-medium transition-colors ${pathname === "/marketplace" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            Templates
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard"><Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black h-8">Dashboard</Button></Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm" className="h-8 text-muted-foreground">Log in</Button></Link>
              <Link href="/signup"><Button size="sm" className="h-8 bg-amber-500 hover:bg-amber-600 text-black">Sign up</Button></Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
