
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  Zap,
  BarChart3,
  Gem,
  Bookmark,
  FileText
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Premium Mobile Bottom Navigation v2.2 [Typography Optimized].
 */

export default function MobileNav() {
  const pathname = usePathname();

  if (
    !pathname ||
    pathname.includes("/attempt") ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Exams", href: "/exams", icon: Target },
    { label: "Practice", href: "/mocks", icon: Zap },
    { label: "Saved", href: "/bookmarks", icon: Bookmark },
    { label: "Pro", href: "/pass", icon: Gem },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-slate-100 bg-white/95 backdrop-blur-md shadow-[0_-4px_25px_rgba(0,0,0,0.03)] md:hidden">
      <div className="flex h-[68px] items-center justify-around px-4 pb-[env(safe-area-inset-bottom)] relative">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center h-full relative"
            >
              <div
                className={cn(
                  "flex flex-col items-center justify-center transition-all duration-300",
                  isActive ? "text-primary" : "text-slate-400"
                )}
              >
                <div className={cn(
                   "p-2 rounded-xl transition-all duration-500",
                   isActive ? "bg-primary/10 shadow-inner" : ""
                )}>
                   <Icon
                     className={cn("h-[20px] w-[20px]", isActive ? "stroke-[3px]" : "stroke-[2px]")}
                     fill={isActive ? "currentColor" : "none"}
                   />
                </div>

                <span
                  className={cn(
                    "mt-1 text-[9px] font-bold tracking-tight",
                    isActive ? "text-primary" : "text-slate-400"
                  )}
                >
                  {item.label}
                </span>

                {isActive && (
                   <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
