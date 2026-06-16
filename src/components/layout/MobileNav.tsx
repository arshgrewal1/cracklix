'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Home, BarChart3, Target, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Production PWA Bottom Navigation v4.0.
 * DESIGN: Active = Blue/White | Inactive = Transparent/Gray | Pass = Blue CTA.
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
    <nav className="fixed bottom-0 left-0 right-0 z-[1100] bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pointer-events-auto">
      <div className="flex items-center justify-around h-[72px] px-2 max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isPremium) {
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center h-full px-1">
                <div className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-full h-[52px] rounded-2xl transition-all shadow-lg",
                  isActive 
                    ? "bg-[#2563EB] text-white ring-4 ring-[#2563EB]/10" 
                    : "bg-[#2563EB] text-white shadow-[#2563EB]/20"
                )}>
                  <Icon className="h-5 w-5 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">
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
                  "flex flex-col items-center justify-center gap-1 transition-all duration-300 px-3 py-2 rounded-2xl w-full",
                  isActive ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/20 scale-105" : "bg-transparent text-[#94A3B8]"
                )}>
                  <Icon 
                    className={cn(
                      "h-5 w-5 transition-colors duration-300",
                      isActive ? "text-white" : "text-[#94A3B8]"
                    )} 
                  />
                  <span className={cn(
                    "text-[10px] font-black uppercase transition-colors duration-300 tracking-tighter",
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
