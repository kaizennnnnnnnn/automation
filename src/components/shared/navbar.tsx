"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1B4FD8] rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">SiteForge</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/marketplace"
            className={`text-sm font-medium transition-colors ${
              pathname === "/marketplace"
                ? "text-[#1B4FD8]"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Marketplace
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button className="bg-[#1B4FD8] hover:bg-[#1640b0]">Dashboard</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[#1B4FD8] hover:bg-[#1640b0]">Sign up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
