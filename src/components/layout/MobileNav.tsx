'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Home, BarChart3, Target, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * @fileOverview Institutional Bottom Navigation.
 * UPDATED: Removed 'uppercase' for a cleaner Title Case look.
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
    <nav className="fixed bottom-0 left-0 right-0 z-[1100] bg-[#0F172A] border-t border-white/5 pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.5)] pointer-events-auto">
      <div className="flex items-center justify-around h-[68px] px-2 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="flex-1 h-full touch-manipulation focus:outline-none">
              <div className="relative flex flex-col items-center justify-center gap-1.5 h-full py-1">
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      layoutId="active-nav-indicator"
                      className="absolute top-0 w-10 h-[3px] bg-primary rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "text-primary scale-110" : "text-slate-500"
                  )} 
                />
                
                <span className={cn(
                  "text-[8px] font-black tracking-[0.1em] transition-colors duration-300",
                  isActive ? "text-white" : "text-slate-500"
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
