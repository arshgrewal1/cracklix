
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Newspaper, 
  FileStack, 
  BookOpen, 
  Bookmark, 
  Download, 
  Calendar,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * @fileOverview Home Quick Actions Hub v1.0.
 */

const ACTIONS = [
  { label: "Daily Quiz", href: "/mocks", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
  { label: "Mock Test", href: "/mocks", icon: Trophy, color: "text-primary", bg: "bg-blue-50" },
  { label: "Current Affairs", href: "/current-affairs", icon: Newspaper, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "PYQs", href: "/pyqs", icon: FileStack, color: "text-purple-500", bg: "bg-purple-50" },
  { label: "Notes", href: "/notes", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-50" },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark, color: "text-rose-500", bg: "bg-rose-50" },
  { label: "Downloads", href: "/notes", icon: Download, color: "text-cyan-500", bg: "bg-cyan-50" },
  { label: "Exam Calendar", href: "/exam-calendar", icon: Calendar, color: "text-amber-500", bg: "bg-amber-50" },
];

export default function QuickActions() {
  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 md:gap-6">
          {ACTIONS.map((action, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link 
                href={action.href}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={cn(
                  "h-12 w-12 md:h-16 md:w-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm border border-slate-100/50",
                  action.bg,
                  action.color
                )}>
                  <action.icon className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-slate-500 text-center leading-tight group-hover:text-primary transition-colors">
                  {action.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
