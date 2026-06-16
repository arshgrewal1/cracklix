
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
  HelpCircle
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
    label: "MANAGEMENT CENTER",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Boards Center", href: "/admin/exams", icon: Building2 },
      { label: "Exam Registry", href: "/admin/exam-registry", icon: GraduationCap },
      { label: "Subject Registry", href: "/admin/subjects", icon: BookOpen },
      { label: "MCQ Bank", href: "/admin/questions", icon: Database },
      { label: "Bulk Ingest", href: "/admin/bulk-import", icon: UploadCloud },
    ]
  },
  {
    label: "CONTENT PULSE",
    items: [
      { label: "Content Pulse", href: "/admin/qa", icon: Activity },
      { label: "Brand Magic", href: "/admin/brand-magic", icon: Sparkles },
      { label: "Mock Builder", href: "/admin/mocks/builder", icon: PenSquare },
      { label: "Mock Manager", href: "/admin/mocks", icon: ClipboardList },
      { label: "Curr. Affairs", href: "/admin/current-affairs", icon: Newspaper },
      { label: "Study Notes", href: "/admin/notes", icon: NotebookPen },
      { label: "PYQ Archive", href: "/admin/pyqs", icon: Archive },
      { label: "Free Center CMS", href: "/admin/free-content", icon: FileCode2 },
    ]
  },
  {
    label: "GOVERNANCE",
    items: [
      { label: "Student List", href: "/admin/users", icon: Users },
      { label: "Device Audit", href: "/admin/devices", icon: Smartphone },
      { label: "Support Nodes", href: "/admin/support", icon: MessageCircle },
      { label: "Revenue Center", href: "/admin/payments", icon: DollarSign },
      { label: "Verify UPI", href: "/admin/payments/verify", icon: Gem },
      { label: "Pass Manager", href: "/admin/passes", icon: Gem },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
      { label: "System Health", href: "/admin/health", icon: HeartPulse },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ]
  }
];

export default function SidebarNav({ isOpen, pathname }: SidebarNavProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-8">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            {isOpen ? (
              <h5 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-in fade-in duration-500">
                {group.label}
              h5>
            ) : (
              <div className="h-4" />
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                const content = (
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex items-center h-12 rounded-2xl transition-all duration-200 group",
                      isOpen ? "px-4 gap-4" : "justify-center",
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-white" : "group-hover:text-white"
                    )} />
                    <span className={cn(
                      "text-[14px] font-semibold truncate transition-all duration-300",
                      isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 pointer-events-none"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );

                if (isOpen) return <div key={item.label}>{content}</div>;

                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      {content}
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      sideOffset={20}
                      className="bg-[#0F172A] text-white border-white/10 font-bold uppercase text-[10px] tracking-widest px-4 py-2 rounded-lg"
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
