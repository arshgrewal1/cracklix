'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Home, BarChart3, Target, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Production PWA Bottom Navigation v7.0.
 * SIZING: Height 88px. Active Pille: 92x76px. Icons: 28px. Labels: text-xs.
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
    { label: "Pass", href: "/pass", icon: Gem, isPremium: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pointer-events-auto h-[88px]">
      <div className="flex items-center justify-around h-full px-2 max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isPremium) {
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center h-full px-1">
                <div className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-[92px] h-[76px] rounded-[28px] transition-all shadow-lg",
                  "bg-[#2563EB] text-white",
                  isActive ? "ring-4 ring-[#2563EB]/10" : "shadow-[#2563EB]/20"
                )}>
                  <Icon className="h-7 w-7 fill-current" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href} className="flex-1 h-full touch-manipulation focus:outline-none">
              <div className="flex flex-col items-center justify-center gap-1 h-full">
                <div className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-all duration-300 px-3 py-2 rounded-[28px] w-[92px] h-[76px]",
                  isActive ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/20 scale-105" : "bg-transparent text-[#94A3B8]"
                )}>
                  <Icon 
                    className={cn(
                      "h-7 w-7 transition-colors duration-300",
                      isActive ? "text-white" : "text-[#94A3B8]"
                    )} 
                  />
                  <span className={cn(
                    "text-[10px] md:text-xs font-black uppercase transition-colors duration-300 tracking-tighter",
                    isActive ? "text-white" : "text-[#94A3B8]"
                  )}>
                    {item.label}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
