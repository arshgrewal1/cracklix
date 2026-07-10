'use client';

import React from 'react';
import Link from 'next/link';
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
  Trophy,
  Calendar,
  HelpCircle,
  Wrench,
  ChevronRight,
  Tag,
  NotebookTabs,
  Library,
  Fingerprint
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_GROUPS = [
  {
    label: "Management",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "MCQ Bank", href: "/admin/questions", icon: Database },
      { label: "Bulk Ingestion", href: "/admin/bulk-import", icon: UploadCloud },
      { label: "Review Center", href: "/admin/qa", icon: Activity },
    ],
  },
  {
    label: "Question Structure",
    items: [
      { label: "Exams", href: "/admin/exam-registry", icon: GraduationCap },
      { label: "Boards", href: "/admin/exams", icon: Building2 },
      { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
      { label: "Chapters", href: "/admin/chapters", icon: NotebookTabs },
      { label: "Topics", href: "/admin/topics", icon: Library },
      { label: "Folders", href: "/admin/categories", icon: FolderTree },
      { label: "Tags", href: "/admin/coupons", icon: Tag },
    ],
  },
  {
    label: "Content Hub",
    items: [
      { label: "Mock Builder", href: "/admin/mocks/builder", icon: PenSquare },
      { label: "Mock Manager", href: "/admin/mocks", icon: ClipboardList },
      { label: "Current Affairs", href: "/admin/current-affairs", icon: Newspaper },
      { label: "Study Notes", href: "/admin/notes", icon: NotebookPen },
      { label: "PYQ Archive", href: "/admin/pyqs", icon: Archive },
      { label: "Exam Calendar", href: "/admin/calendar", icon: Calendar },
      { label: "Success Stories", href: "/admin/success-stories", icon: Trophy },
      { label: "Help Center", href: "/admin/help-center", icon: HelpCircle },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "Students", href: "/admin/users", icon: Users },
      { label: "Devices", href: "/admin/devices", icon: Smartphone },
      { label: "Support", href: "/admin/support", icon: MessageCircle },
      { label: "Revenue", href: "/admin/payments", icon: DollarSign },
      { label: "Verify Payments", href: "/admin/payments/verify", icon: Gem },
      { label: "Pass Manager", href: "/admin/passes", icon: Gem },
      { label: "Audit Trail", href: "/admin/audit-logs", icon: History },
      { label: "System Health", href: "/admin/health", icon: HeartPulse },
      { label: "Global Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function SidebarNav({
  isOpen,
  pathname,
}: SidebarNavProps) {
  const allNavItems = React.useMemo(() => NAV_GROUPS.flatMap(g => g.items), []);

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex-1 overflow-y-auto px-3 py-6 no-scrollbar space-y-8">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            {isOpen ? (
              <p className="px-4 text-[10px] font-bold tracking-tight text-slate-400 uppercase">
                {group.label}
              </p>
            ) : (
              <div className="h-px bg-slate-50 mx-2" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isExact = pathname === item.href;
                const isMatch = item.href !== "/admin" && pathname.startsWith(item.href);
                const hasBetterMatch = allNavItems.some(other => 
                  other.href !== item.href && 
                  other.href.length > item.href.length && 
                  pathname.startsWith(other.href)
                );

                const isActive = isExact || (isMatch && !hasBetterMatch);

                const navItem = (
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex h-10 items-center rounded-xl transition-all duration-300 active:scale-[0.98]",
                      isOpen ? "gap-4 px-4" : "justify-center",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 shrink-0 transition-transform",
                      isActive ? "text-white" : "group-hover:scale-110"
                    )} />

                    <span className={cn(
                      "truncate text-[13px] font-bold transition-all duration-300",
                      isOpen ? "max-w-[150px] opacity-100" : "max-w-0 opacity-0"
                    )}>
                      {item.label}
                    </span>

                    {isOpen && isActive && (
                      <ChevronRight className="ml-auto h-3 w-3 text-white/50" />
                    )}
                  </Link>
                );

                if (isOpen) return <div key={item.href}>{navItem}</div>;

                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={16}
                      className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-[11px] font-black text-[#0F172A] shadow-2xl tracking-widest"
                    >
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </TooltipProvider>
  );
}

interface SidebarNavProps {
  isOpen: boolean;
  pathname: string;
}
