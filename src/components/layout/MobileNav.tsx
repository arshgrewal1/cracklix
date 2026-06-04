
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Zap, Gem, User, Home, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * @fileOverview Premium Bottom Navigation Node for Mobile.
 * Updated to include Analytics and match high-fidelity 5-item UI.
 */

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Exams", href: "/exams", icon: GraduationCap },
    { label: "Mocks", href: "/mocks", icon: Zap },
    { label: "Analysis", href: "/analytics", icon: BarChart3 },
    { label: "Profile", href: "/dashboard", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-[#0F172A] border-t border-white/5 pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-around h-[76px] px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="flex-1 h-full">
              <div className="relative flex flex-col items-center justify-center gap-1.5 h-full py-1">
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      layoutId="active-nav-indicator"
                      className="absolute top-0 w-12 h-1 bg-[#F97316] rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "text-[#F97316] scale-110" : "text-[#7A8B9E]"
                  )} 
                />
                
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-tight transition-colors duration-300",
                  isActive ? "text-white" : "text-[#7A8B9E]"
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
