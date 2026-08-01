'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import {
  Database,
  Newspaper,
  BookOpen,
  Building2,
  GraduationCap,
  UploadCloud,
  FolderTree,
  Activity,
  SquarePen,
  ClipboardList,
  Users,
  DollarSign,
  Gem,
  HeartPulse,
  Settings,
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
  History,
  Archive,
  FileStack,
  KeyRound,
  FileText,
  Home,
  Layers,
  RefreshCw,
  CheckCircle
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from '@/firebase';
import { checkPermission } from '@/lib/permissions';

const NAV_GROUPS = [
  {
    label: "Portal Navigation",
    items: [
      { label: "Student Portal", href: "/", icon: Home },
    ],
  },
  {
    label: "Asset Bank",
    items: [
      { label: "Question Bank", href: "/admin/mcq-bank", icon: Database },
      { label: "Bulk Ingestion", href: "/admin/bulk-import", icon: UploadCloud, perm: 'uploadQuestions' },
      { label: "CA Bank", href: "/admin/current-affairs/bank", icon: FileJson },
      { label: "Legacy Archive", href: "/admin/questions", icon: Archive },
      { label: "Used Items", href: "/admin/used-questions", icon: History },
    ],
  },
  {
    label: "Test Center",
    items: [
      { label: "Build Test", href: "/admin/mocks/builder", icon: SquarePen, perm: 'createMock' },
      { label: "Manage Tests", href: "/admin/mocks", icon: ClipboardList },
      { label: "Daily Quiz", href: "/admin/daily-quiz", icon: Flame, perm: 'createMock' },
      { label: "Review Hub", href: "/admin/qa", icon: Activity, perm: 'reviewContent' },
    ],
  },
  {
    label: "Hierarchy & Registry",
    items: [
      { label: "Folders", href: "/admin/categories", icon: FolderTree, perm: 'manageCategories' },
      { label: "Boards", href: "/admin/exams", icon: Building2, perm: 'manageCategories' },
      { label: "Exams", href: "/admin/exam-registry", icon: GraduationCap, perm: 'manageCategories' },
      { label: "Subjects", href: "/admin/learning/subjects", icon: BookOpen, perm: 'manageCategories' },
      { label: "Series", href: "/admin/learning/series", icon: Layers, perm: 'manageSeries' },
      { label: "Chapters", href: "/admin/chapters", icon: NotebookTabs, perm: 'manageSeries' },
      { label: "Topics", href: "/admin/topics", icon: Library, perm: 'manageSeries' },
    ],
  },
  {
    label: "Content Hub",
    items: [
      { label: "PYQ Archive", href: "/admin/pyqs", icon: FileStack, perm: 'uploadPYQs' },
      { label: "Study Notes", href: "/admin/notes", icon: FileText, perm: 'publishContent' },
      { label: "CA Manager", href: "/admin/current-affairs", icon: Newspaper, perm: 'publishContent' },
      { label: "CA Bulk Upload", href: "/admin/current-affairs/bulk", icon: UploadCloud, perm: 'uploadQuestions' },
      { label: "Free Hub", href: "/admin/free-content", icon: Zap, perm: 'publishContent' },
      { label: "Exam Calendar", href: "/admin/calendar", icon: Calendar, perm: 'publishContent' },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Role Manager", href: "/admin/roles", icon: KeyRound, perm: 'manageRoles' },
      { label: "Students", href: "/admin/users", icon: Users, perm: 'manageUsers' },
      { label: "Success Stories", href: "/admin/success-stories", icon: Trophy, perm: 'publishContent' },
      { label: "Help Articles", href: "/admin/help-center", icon: HelpCircle, perm: 'publishContent' },
      { label: "Support Desk", href: "/admin/support", icon: MessageCircle, perm: 'manageNotifications' },
    ],
  },
  {
    label: "Job Portal",
    items: [
      { label: "Vacancy Hub", href: "/admin/vacancies", icon: Newspaper },
    ],
  },
  {
    label: "Financials",
    items: [
      { label: "Revenue", href: "/admin/revenue", icon: DollarSign, perm: 'viewRevenue' },
      { label: "Active Passes", href: "/admin/subscriptions", icon: CheckCircle, perm: 'managePayments' },
      { label: "Verify Payments", href: "/admin/payments/verify", icon: ShieldCheck, perm: 'managePayments' },
      { label: "Pass Plans", href: "/admin/passes", icon: Gem, perm: 'managePasses' },
      { label: "Coupons", href: "/admin/coupons", icon: Tag, perm: 'manageCoupons' },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Health", href: "/admin/health", icon: HeartPulse, perm: 'websiteSettings' },
      { label: "Maintenance", href: "/admin/maintenance", icon: RefreshCw, perm: 'websiteSettings' },
      { label: "Settings", href: "/admin/settings", icon: Settings, perm: 'websiteSettings' },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: History, perm: 'manageRoles' },
    ],
  },
];

interface SidebarNavProps {
  isOpen: boolean;
  pathname: string;
}

export default function SidebarNav({ isOpen, pathname }: SidebarNavProps) {
  const { user, profile } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allNavItems = React.useMemo(() => NAV_GROUPS.flatMap(g => g.items), []);

  if (!mounted) return <div className="flex-1" />;

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-6 no-scrollbar space-y-8">
      {NAV_GROUPS.map((group) => {
        const authorizedItems = group.items.filter(item => {
           if (!(item as any).perm) return true;
           return checkPermission(profile, (item as any).perm, user?.email);
        });

        if (authorizedItems.length === 0) return null;

        return (
          <div key={group.label} className="space-y-2">
            {isOpen ? (
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                {group.label}
              </p>
            ) : (
              <div className="h-px bg-slate-50 mx-2" />
            )}

            <div className="space-y-1">
              {authorizedItems.map((item) => {
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
                      "group flex items-center rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer select-none border border-transparent",
                      isOpen ? "h-11 gap-4 px-4 w-full" : "h-12 w-12 mx-auto justify-center",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20 border-primary/10"
                        : "text-slate-500 hover:bg-slate-50 hover:text-primary hover:border-slate-100"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 shrink-0",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-primary group-hover:scale-110"
                    )} />

                    <span className={cn(
                      "truncate text-[13px] font-bold transition-all duration-300 text-left",
                      isOpen ? "max-w-[150px] opacity-100" : "max-w-0 opacity-0 hidden"
                    )}>
                      {item.label}
                    </span>

                    {isOpen && isActive && (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/50" />
                    )}
                  </Link>
                );

                if (isOpen) return <div key={item.href}>{navItem}</div>;

                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center">
                        {navItem}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      align="center"
                      className="bg-[#0F172A] text-white border-none font-bold text-xs"
                    >
                       {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )
      })}
    </nav>
  );
}
