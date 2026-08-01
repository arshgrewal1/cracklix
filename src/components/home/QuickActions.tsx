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
 * @fileOverview Home Quick Actions Hub v1.2.
 * FIXED: Standardized icon background to match Authority Logo style.
 */

const ACTIONS = [
  { label: "Daily Quiz", href: "/mocks", icon: Zap, color: "text-orange-500" },
  { label: "Mock Test", href: "/mocks", icon: Trophy, color: "text-primary" },
  { label: "Current Affairs", href: "/current-affairs", icon: Newspaper, color: "text-emerald-500" },
  { label: "PYQs", href: "/pyqs", icon: FileStack, color: "text-purple-500" },
  { label: "Notes", href: "/notes", icon: BookOpen, color: "text-indigo-500" },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark, color: "text-rose-500" },
  { label: "Downloads", href: "/notes", icon: Download, color: "text-cyan-500" },
  { label: "Exam Calendar", href: "/exam-calendar", icon: Calendar, color: "text-amber-500" },
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
                  "h-12 w-12 md:h-16 md:w-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-inner bg-slate-50 border border-slate-100",
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
