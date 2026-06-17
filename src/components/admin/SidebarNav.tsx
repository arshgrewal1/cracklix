'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Database,
  Newspaper,
  BookOpen,
  Building2,
  GraduationCap,
  UploadCloud,
  FolderTree,
  Activity,
  Sparkles,
  PenSquare,
  ClipboardList,
  Archive,
  Users,
  DollarSign,
  Smartphone,
  Gem,
  History,
  HeartPulse,
  Settings,
  FileCode2,
  NotebookPen,
  MessageCircle,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarNavProps {
  isOpen: boolean;
  pathname: string;
}

const NAV_GROUPS = [
  {
    label: "Management",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Boards", href: "/admin/exams", icon: Building2 },
      { label: "Exam Registry", href: "/admin/exam-registry", icon: GraduationCap },
      { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
      { label: "MCQ Bank", href: "/admin/questions", icon: Database },
      { label: "Bulk Import", href: "/admin/bulk-import", icon: UploadCloud },
    ],
  },

  {
    label: "Content",
    items: [
      { label: "Content Pulse", href: "/admin/qa", icon: Activity },
      { label: "Brand Magic", href: "/admin/brand-magic", icon: Sparkles },
      { label: "Mock Builder", href: "/admin/mocks/builder", icon: PenSquare },
      { label: "Mock Manager", href: "/admin/mocks", icon: ClipboardList },
      { label: "Current Affairs", href: "/admin/current-affairs", icon: Newspaper },
      { label: "Study Notes", href: "/admin/notes", icon: NotebookPen },
      { label: "PYQ Archive", href: "/admin/pyqs", icon: Archive },
      { label: "Free CMS", href: "/admin/free-content", icon: FileCode2 },
    ],
  },

  {
    label: "Governance",
    items: [
      { label: "Students", href: "/admin/users", icon: Users },
      { label: "Devices", href: "/admin/devices", icon: Smartphone },
      { label: "Support", href: "/admin/support", icon: MessageCircle },
      { label: "Revenue", href: "/admin/payments", icon: DollarSign },
      { label: "Verify UPI", href: "/admin/payments/verify", icon: Gem },
      { label: "Pass Manager", href: "/admin/passes", icon: Gem },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
      { label: "Health", href: "/admin/health", icon: HeartPulse },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function SidebarNav({
  isOpen,
  pathname,
}: SidebarNavProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex-1 overflow-y-auto px-4 py-5 no-scrollbar">

        <div className="space-y-7">

          {NAV_GROUPS.map((group) => (
            <div key={group.label}>

              {/* GROUP TITLE */}
              {isOpen ? (
                <p className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {group.label}
                </p>
              ) : (
                <div className="mb-2 h-4" />
              )}

              {/* ITEMS */}
              <div className="space-y-1">

                {group.items.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    pathname === item.href ||
                    (
                      item.href !== "/admin" &&
                      pathname.startsWith(item.href)
                    );

                  const navItem = (
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex h-12 items-center rounded-2xl transition-all duration-200 active:scale-[0.98]",

                        isOpen
                          ? "gap-4 px-4"
                          : "justify-center",

                        isActive
                          ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/20"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          isActive
                            ? "text-white"
                            : "group-hover:text-white"
                        )}
                      />

                      <span
                        className={cn(
                          "truncate text-[14px] font-semibold transition-all duration-300",

                          isOpen
                            ? "max-w-[150px] opacity-100"
                            : "max-w-0 opacity-0"
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );

                  if (isOpen) {
                    return (
                      <div key={item.href}>
                        {navItem}
                      </div>
                    );
                  }

                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        {navItem}
                      </TooltipTrigger>

                      <TooltipContent
                        side="right"
                        sideOffset={16}
                        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white"
                      >
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}

              </div>

            </div>
          ))}

        </div>

      </nav>
    </TooltipProvider>
  );
}
