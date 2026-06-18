'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  Zap,
  BarChart3,
  Gem,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Production Mobile Bottom Navigation v1.2
 * UPDATED: Synchronized with Logo Blue (#1677FF) for active states.
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
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Hub",
      href: "/my-exams",
      icon: Target,
    },
    {
      label: "Practice",
      href: "/mocks",
      icon: Zap,
    },
    {
      label: "Stats",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      label: "Pass",
      href: "/pass",
      icon: Gem,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-slate-100 bg-white shadow-[0_-4px_30px_rgba(0,0,0,0.04)] md:hidden">

      <div className="flex h-[80px] items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" &&
              pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center"
            >
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-[1.5rem] transition-all duration-300",

                  isActive
                    ? "h-[56px] w-[68px] bg-primary text-white shadow-lg shadow-primary/20"
                    : "h-[56px] w-[68px] text-slate-400"
                )}
              >
                <Icon
                  className="h-6 w-6"
                  fill={isActive ? "currentColor" : "none"}
                />

                <span
                  className={cn(
                    "mt-1 text-[10px] font-bold uppercase tracking-wide",

                    isActive
                      ? "text-white"
                      : "text-slate-400"
                  )}
                >
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
