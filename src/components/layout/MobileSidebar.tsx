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
  BarChart3,
  X,
  Home
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Final Compact Institutional Mobile Sidebar.
 * Optimized: Removed large avatar node, shrunk typography, and eliminated overlap.
 * Testbook-style high-density navigation.
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
    <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-hidden">
      {/* Compact Profile Section - Zero Overlap */}
      <div className="px-5 pt-10 pb-6 bg-[#0B1528] border-b border-white/5 relative shrink-0">
        <div className="flex justify-between items-start mb-4">
           <div className="space-y-1 text-left">
              <h2 className="font-headline font-black text-lg uppercase tracking-tight leading-tight truncate max-w-[180px]">
                 {profile?.name || "Aspirant Node"}
              </h2>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[180px] opacity-60">
                 {profile?.email || user?.email || "Registry: PENDING"}
              </p>
           </div>
           <button 
             onClick={onClose}
             className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
           >
             <X className="h-4 w-4 text-slate-400" />
           </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
           <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-400 text-[7px] font-black uppercase px-2 py-0.5 rounded-md">
              {profile?.role || "STUDENT"}
           </Badge>
           <Badge className="bg-[#F97316] text-white border-none text-[7px] font-black uppercase px-2 py-0.5 rounded-md shadow-lg">
              {profile?.status?.replace('_', ' ') || "FREE"} PASS
           </Badge>
        </div>
      </div>

      {/* Navigation Nodes with Scrollbar Breathing Room */}
      <ScrollArea className="flex-1 px-2">
        <div className="p-2 space-y-1">
          {mainPrepItems.map((item) => (
            <SidebarLink key={item.href} item={item} onClick={onClose} />
          ))}
          
          <div className="px-2 py-4">
            <Button asChild className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg h-12 font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl">
              <Link href="/pass" onClick={onClose}>
                <Gem className="h-3.5 w-3.5" /> Upgrade Pass
              </Link>
            </Button>
          </div>

          <div className="h-px w-full bg-white/5 mx-2 my-2" />

          {secondaryItems.map((item) => (
            <SidebarLink key={item.href} item={item} onClick={onClose} />
          ))}
        </div>
      </ScrollArea>

      {/* Institutional Footer */}
      <div className="p-4 border-t border-white/5 bg-[#0B1528]/50 shrink-0">
         <div className="flex items-center gap-3 opacity-30">
            <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center">
               <Shield className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="space-y-0">
               <p className="text-[7px] font-black uppercase tracking-[0.2em]">Cracklix v1.2</p>
               <p className="text-[6px] font-bold uppercase tracking-[0.1em] text-slate-500">Registry Secure</p>
            </div>
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
      className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all group border border-transparent h-[56px]"
    >
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center transition-all group-hover:scale-105 shrink-0`}>
          <item.icon className={`h-4.5 w-4.5 ${item.color}`} />
        </div>
        <span className="font-bold text-[14px] text-slate-400 group-hover:text-white transition-colors truncate">{item.label}</span>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-slate-700 group-hover:text-primary transition-all shrink-0" />
    </Link>
  );
}
