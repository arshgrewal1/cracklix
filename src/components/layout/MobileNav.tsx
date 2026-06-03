
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, Zap, Gem, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * @fileOverview Premium Bottom Navigation Node for Mobile.
 * Features exactly 5 items: Home, Exams, Mocks, Pass, Profile.
 * Fixed: Home as first item and corrected AnimatePresence import.
 */

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: LayoutDashboard },
    { label: "Exams", href: "/exams", icon: GraduationCap },
    { label: "Mocks", href: "/mocks", icon: Zap },
    { label: "Pass", href: "/pass", icon: Gem },
    { label: "Profile", href: "/dashboard", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-[#0F172A] border-t border-white/5 pb-safe md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className="relative flex flex-col items-center justify-center gap-1 py-1">
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      layoutId="active-nav"
                      className="absolute -top-1 w-12 h-1 bg-[#F97316] rounded-full shadow-[0_0_12px_rgba(249,115,22,0.6)]"
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
                  "text-[10px] font-black uppercase tracking-tighter transition-colors duration-300",
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
