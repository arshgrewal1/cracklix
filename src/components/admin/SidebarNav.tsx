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
  HeartPulse,
  Settings,
  NotebookPen,
  MessageCircle,
  Trophy,
  Calendar,
  HelpCircle,
  ChevronRight,
  Tag,
  NotebookTabs,
  Library,
  CreditCard,
  ShieldCheck,
  FileJson,
  Zap,
  Flame,
  BarChart3,
  Megaphone,
  Plus,
  BookMarked,
  Layers,
  History
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Admin Sidebar Navigation v4.2 [Import Fix].
 */

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Student Portal", href: "/", icon: GraduationCap },
      { label: "Question Bank", href: "/admin/mcq-bank", icon: Database },
      { label: "Used Questions", href: "/admin/used-questions", icon: History },
      { label: "CA Bank", href: "/admin/current-affairs/bank", icon: FileJson },
      { label: "Bulk Upload", href: "/admin/bulk-import", icon: UploadCloud },
      { label: "Review Center", href: "/admin/qa", icon: Activity },
    ],
  },
  {
    label: "Job Portal",
    items: [
      { label: "Vacancy Hub", href: "/admin/vacancies", icon: Megaphone },
      { label: "Add Vacancy", href: "/admin/vacancies/add", icon: Plus },
    ],
  },
  {
    label: "Learning Hub",
    items: [
      { label: "Subject Hub", href: "/admin/learning/subjects", icon: BookMarked },
      { label: "Series Hub", href: "/admin/learning/series", icon: Layers },
    ],
  },
  {
    label: "Today's Challenge",
    items: [
      { label: "Quiz List", href: "/admin/daily-quiz", icon: Flame },
      { label: "Leaderboard", href: "/admin/daily-quiz/leaderboard", icon: Trophy },
      { label: "Quiz Results", href: "/admin/daily-quiz/results", icon: BarChart3 },
    ],
  },
  {
    label: "Tests & Folders",
    items: [
      { label: "Build Test", href: "/admin/mocks/builder", icon: PenSquare },
      { label: "Manage Tests", href: "/admin/mocks", icon: ClipboardList },
      { label: "Exam Center", href: "/admin/exam-registry", icon: GraduationCap },
      { label: "Boards", href: "/admin/exams", icon: Building2 },
      { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
      { label: "Chapters", href: "/admin/chapters", icon: NotebookTabs },
      { label: "Topics", href: "/admin/topics", icon: Library },
      { label: "Folders", href: "/admin/categories", icon: FolderTree },
    ],
  },
  {
    label: "Payments",
    items: [
      { label: "Revenue", href: "/admin/revenue", icon: DollarSign },
      { label: "Active Passes", href: "/admin/subscriptions", icon: CreditCard },
      { label: "Verify Payments", href: "/admin/payments/verify", icon: ShieldCheck },
      { label: "Pass Plans", href: "/admin/passes", icon: Gem },
      { label: "Coupons", href: "/admin/coupons", icon: Tag },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "Current Affairs", href: "/admin/current-affairs", icon: Newspaper },
      { label: "Study Notes", href: "/admin/notes", icon: NotebookPen },
      { label: "Old Papers", href: "/admin/pyqs", icon: Archive },
      { label: "Exam Dates", href: "/admin/calendar", icon: Calendar },
      { label: "Toppers", href: "/admin/success-stories", icon: Trophy },
      { label: "Help Articles", href: "/admin/help-center", icon: HelpCircle },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Students", href: "/admin/users", icon: Users },
      { label: "Active Logins", href: "/admin/devices", icon: Smartphone },
      { label: "Support Desk", href: "/admin/support", icon: MessageCircle },
      { label: "Admin Logs", href: "/admin/audit-logs", icon: History },
      { label: "Health", href: "/admin/health", icon: HeartPulse },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

interface SidebarNavProps {
  isOpen: boolean;
  pathname: string;
}

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
              <p className="px-4 text-[10px] font-semibold tracking-tight text-slate-400">
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
                      "h-4 w-4 shrink-0",
                      isActive ? "text-white" : "group-hover:scale-110"
                    )} />

                    <span className={cn(
                      "truncate text-[13px] font-semibold transition-all duration-300",
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
                      align="center"
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
