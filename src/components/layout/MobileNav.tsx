'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Home, BarChart3, Target, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Production PWA Bottom Navigation v12.0.
 * SIZING: Height 88px. Active Box: 80x64px with 24px rounded corners.
 * COLORS: Active #2563EB, Inactive #6B7280.
 * ICONS: 24px (w-6 h-6). Labels: 12px.
 */
export default function MobileNav() {
  const pathname = usePathname();

  // Guard: Hide navigation during live CBT attempts or in the Admin Portal
  if (!pathname || pathname.includes('/attempt') || pathname.startsWith('/admin')) return null;

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "My Hub", href: "/my-exams", icon: Target },
    { label: "Practice", href: "/mocks", icon: Zap },
    { label: "Stats", href: "/dashboard", icon: BarChart3 },
    { label: "Pass", href: "/pass", icon: Gem },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-[#E2E8F0] pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pointer-events-auto h-[88px]">
      <div className="flex items-center justify-around h-full px-2 max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center h-full touch-manipulation focus:outline-none">
              <div className="flex flex-col items-center justify-center">
                <div className={cn(
                  "flex items-center justify-center transition-all duration-300",
                  isActive
                    ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/20 w-[80px] h-[64px] rounded-3xl" 
                    : "bg-white text-slate-500 w-12 h-12 rounded-2xl"
                )}>
                  <Icon 
                    className="w-6 h-6" 
                    fill={isActive ? "currentColor" : "none"}
                  />
                </div>
                
                <span className={cn(
                  "text-[12px] uppercase transition-colors duration-300 mt-1 tracking-tight font-bold",
                  isActive ? "text-[#2563EB]" : "text-slate-500"
                )}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
