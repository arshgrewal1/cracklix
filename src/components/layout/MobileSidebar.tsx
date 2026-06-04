'use client';

import { 
  FileText, 
  FileStack, 
  Newspaper, 
  CalendarDays, 
  Bell, 
  Settings, 
  Phone, 
  Shield, 
  ChevronRight, 
  Gem,
  Trophy,
  Zap,
  GraduationCap,
  LayoutDashboard,
  BarChart3,
  X,
  Home
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * @fileOverview High-Fidelity Mobile Sidebar.
 * Refined Sequence: Profile -> Primary Preparation -> CTA -> Secondary Support -> Footer.
 * Fixed: Top overlap issue using safe-area-inset-top and added prominent Home button.
 */

export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const { user, profile } = useUser();

  const mainPrepItems = [
    { label: "Home Hub", href: "/", icon: Home, color: "text-primary" },
    { label: "My Mocks", href: "/mocks", icon: Zap, color: "text-orange-500" },
    { label: "Exam Hubs", href: "/exams", icon: GraduationCap, color: "text-blue-500" },
    { label: "Study Notes", href: "/notes", icon: FileText, color: "text-emerald-500" },
    { label: "Results Registry", href: "/dashboard", icon: BarChart3, color: "text-amber-500" },
    { label: "Hall of Rankers", href: "/leaderboard", icon: Trophy, color: "text-indigo-500" },
    { label: "PYQ Archives", href: "/pyqs", icon: FileStack, color: "text-slate-400" },
  ];

  const secondaryItems = [
    { label: "Daily Analysis", href: "/current-affairs", icon: Newspaper, color: "text-slate-500" },
    { label: "Exam Calendar", href: "/exam-calendar", icon: CalendarDays, color: "text-slate-500" },
    { label: "Notifications", href: "/notifications", icon: Bell, color: "text-slate-500" },
    { label: "Profile Settings", href: "/profile", icon: Settings, color: "text-slate-500" },
    { label: "Institutional Contact", href: "/contact", icon: Phone, color: "text-slate-500" },
    { label: "Privacy Protocol", href: "/privacy", icon: Shield, color: "text-slate-500" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-white pt-[env(safe-area-inset-top)]">
      {/* Header Profile Section */}
      <div className="p-6 bg-gradient-to-br from-[#0B1528] to-[#0F172A] border-b border-white/5 relative">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-[#F97316] rounded-2xl shadow-xl">
            <AvatarImage src={user?.photoURL || ""} />
            <AvatarFallback className="bg-primary text-white font-black text-xl">
              {profile?.name?.[0] || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-headline font-black text-lg truncate uppercase">{profile?.name || "Aspirant"}</p>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{profile?.role || "STUDENT"}</span>
               <div className="h-1 w-1 rounded-full bg-slate-700" />
               <span className="text-[10px] font-black text-primary uppercase tracking-widest">{profile?.status || "FREE"}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Navigation Nodes */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {mainPrepItems.map((item) => (
            <SidebarLink key={item.href} item={item} onClick={onClose} />
          ))}
          
          <div className="px-2 py-4">
            <Button asChild className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl h-14 font-black uppercase text-[11px] tracking-[0.1em] gap-3 shadow-2xl shadow-orange-900/20">
              <Link href="/pass" onClick={onClose}>
                <Gem className="h-4 w-4" /> Upgrade to Gold Pass
              </Link>
            </Button>
          </div>

          <div className="h-px w-full bg-white/5 mx-2 my-2" />

          {secondaryItems.map((item) => (
            <SidebarLink key={item.href} item={item} onClick={onClose} />
          ))}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-8 border-t border-white/5 opacity-40">
         <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">Cracklix v1.0</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-500">Punjab's No.1 Mock Hub</p>
         </div>
      </div>
    </div>
  );
}

function SidebarLink({ item, onClick }: { item: any, onClick: () => void }) {
  return (
    <Link 
      href={item.href} 
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5 h-[64px]"
    >
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center transition-all group-hover:scale-110 shadow-inner`}>
          <item.icon className={`h-5 w-5 ${item.color}`} />
        </div>
        <span className="font-bold text-sm text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-primary transition-all" />
    </Link>
  );
}
