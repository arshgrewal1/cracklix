'use client';

import React, { useState, useEffect } from 'react';
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
  History,
  Archive,
  FileStack,
  KeyRound,
  ShieldAlert,
  FileText,
  ExternalLink,
  Home
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
      { label: "Student Portal", href: "/", icon: ExternalLink },
    ],
  },
  {
    label: "Main Hub",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Question Bank", href: "/admin/mcq-bank", icon: Database },
      { label: "Add Question", href: "/admin/mcq-bank/add", icon: Plus, perm: 'uploadQuestions' },
      { label: "CA Bank", href: "/admin/current-affairs/bank", icon: FileJson },
      { label: "Bulk Upload", href: "/admin/bulk-import", icon: UploadCloud, perm: 'uploadQuestions' },
      { label: "Review Center", href: "/admin/qa", icon: Activity, perm: 'reviewContent' },
    ],
  },
  {
    label: "Content Hub",
    items: [
      { label: "PYQ Archive", href: "/admin/pyqs", icon: FileStack, perm: 'uploadPYQs' },
      { label: "Study Notes", href: "/admin/notes", icon: FileText, perm: 'publishContent' },
      { label: "CA Hub", href: "/admin/current-affairs", icon: Newspaper, perm: 'publishContent' },
      { label: "Daily Quiz", href: "/admin/daily-quiz", icon: Flame, perm: 'createMock' },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "Role Manager", href: "/admin/roles", icon: KeyRound, perm: 'manageRoles' },
      { label: "Students", href: "/admin/users", icon: Users, perm: 'manageUsers' },
      { label: "Support Desk", href: "/admin/support", icon: MessageCircle, perm: 'manageNotifications' },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: History, perm: 'manageRoles' },
    ],
  },
  {
    label: "Job Portal",
    items: [
      { label: "Vacancy Hub", href: "/admin/vacancies", icon: Megaphone },
      { label: "Add Vacancy", href: "/admin/vacancies/add", icon: Plus, perm: 'publishContent' },
    ],
  },
  {
    label: "Tests & Folders",
    items: [
      { label: "Build Test", href: "/admin/mocks/builder", icon: PenSquare, perm: 'createMock' },
      { label: "Manage Tests", href: "/admin/mocks", icon: ClipboardList },
      { label: "Exam Center", href: "/admin/exam-registry", icon: GraduationCap, perm: 'manageCategories' },
      { label: "Folders", href: "/admin/categories", icon: FolderTree, perm: 'manageCategories' },
    ],
  },
  {
    label: "Financials",
    items: [
      { label: "Revenue", href: "/admin/revenue", icon: DollarSign, perm: 'viewRevenue' },
      { label: "Active Passes", href: "/admin/subscriptions", icon: CreditCard, perm: 'managePayments' },
      { label: "Verify Payments", href: "/admin/payments/verify", icon: ShieldCheck, perm: 'managePayments' },
      { label: "Pass Plans", href: "/admin/passes", icon: Gem, perm: 'managePasses' },
      { label: "Coupons", href: "/admin/coupons", icon: Tag, perm: 'manageCoupons' },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Health", href: "/admin/health", icon: HeartPulse, perm: 'websiteSettings' },
      { label: "Settings", href: "/admin/settings", icon: Settings, perm: 'websiteSettings' },
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
        // Filter items based on specific permissions + Founder email override
        const authorizedItems = group.items.filter(item => {
           if (!item.perm) return true;
           return checkPermission(profile, item.perm as any, user?.email);
        });

        if (authorizedItems.length === 0) return null;

        return (
          <div key={group.label} className="space-y-2">
            {isOpen ? (
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                      "truncate text-[13px] font-bold transition-all duration-300",
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
