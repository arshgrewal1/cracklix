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
 * Production Mobile Bottom Navigation v1.6.
 * UPDATED: Refined label size and improved vertical spacing.
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
      label: "My Exams",
      href: "/my-exams",
      icon: Target,
    },
    {
      label: "Practice",
      href: "/mocks",
      icon: Zap,
    },
    {
      label: "Progress",
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
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-slate-100 bg-white/95 backdrop-blur-md shadow-[0_-4px_25px_rgba(0,0,0,0.03)] md:hidden">

      <div className="flex h-[64px] items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">

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
              className="flex flex-1 flex-col items-center justify-center h-full"
            >
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl transition-all duration-300",

                  isActive
                    ? "h-[46px] w-[58px] bg-primary text-white shadow-md shadow-primary/10"
                    : "h-[46px] w-[58px] text-slate-400"
                )}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  fill={isActive ? "currentColor" : "none"}
                />

                <span
                  className={cn(
                    "mt-0.5 text-[9px] font-bold tracking-tight",

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