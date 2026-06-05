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
  Home,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Final Enterprise Mobile Sidebar (Adda247 Style).
 * Features: Safe-area awareness, independent scrolling, and premium profile cards.
 */

export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const { user, profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
    router.push('/login');
  };

  const initials = profile?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'A';

  const mainPrepItems = [
    { label: "Home Hub", href: "/", icon: Home, color: "text-blue-500" },
    { label: "My Mocks", href: "/mocks", icon: Zap, color: "text-[#F97316]" },
    { label: "Exam Hubs", href: "/exams", icon: GraduationCap, color: "text-indigo-500" },
    { label: "Study Notes", href: "/notes", icon: FileText, color: "text-emerald-500" },
    { label: "Results Registry", href: "/dashboard", icon: BarChart3, color: "text-amber-500" },
    { label: "Hall of Rankers", href: "/leaderboard", icon: Trophy, color: "text-rose-500" },
    { label: "PYQ Archives", href: "/pyqs", icon: FileStack, color: "text-slate-400" },
  ];

  const secondaryItems = [
    { label: "Daily Analysis", href: "/current-affairs", icon: Newspaper },
    { label: "Exam Calendar", href: "/exam-calendar", icon: CalendarDays },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Profile Settings", href: "/profile", icon: Settings },
    { label: "Institutional Contact", href: "/contact", icon: Phone },
    { label: "Privacy Protocol", href: "/privacy", icon: Shield },
  ];

  return (
    <div className="flex flex-col h-full bg-white text-[#0F172A] overflow-hidden">
      {/* Adda247 Style Profile Header - Respects Safe Areas */}
      <div className="px-5 pb-6 bg-[#0B1528] relative shrink-0 pt-[env(safe-area-inset-top,24px)] min-h-[160px] flex flex-col justify-center">
        <div className="flex justify-between items-start mb-4">
           <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-black text-xl shadow-xl border-2 border-white/10 shrink-0">
                 {initials}
              </div>
              <div className="space-y-0.5 text-left min-w-0">
                 <h2 className="font-headline font-black text-lg text-white uppercase tracking-tight leading-none truncate pr-2">
                    {profile?.name || "Aspirant Node"}
                 </h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate opacity-80">
                    {profile?.email || user?.email || "Registry: PENDING"}
                 </p>
                 <div className="pt-2">
                    <Badge className="bg-[#F97316] text-white border-none text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg">
                       {profile?.status?.replace('_', ' ') || "FREE"} PASS
                    </Badge>
                 </div>
              </div>
           </div>
           <button 
             onClick={onClose}
             className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors shrink-0"
           >
             <X className="h-4 w-4 text-slate-400" />
           </button>
        </div>
      </div>

      {/* Main Scrollable Menu Area */}
      <ScrollArea className="flex-1 px-3 mt-4">
        <div className="space-y-1 pb-10">
          <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Preparation Trajectory</p>
          {mainPrepItems.map((item) => (
            <SidebarLink 
              key={item.href} 
              item={item} 
              active={pathname === item.href}
              onClick={onClose} 
            />
          ))}
          
          <div className="px-3 py-6">
            <Button asChild className="w-full bg-primary hover:bg-orange-600 text-white rounded-xl h-14 font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl shadow-primary/20">
              <Link href="/pass" onClick={onClose}>
                <Gem className="h-4 w-4" /> Upgrade Pass
              </Link>
            </Button>
          </div>

          <div className="h-px w-full bg-slate-50 mx-3 my-4" />
          
          <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Institutional Links</p>
          {secondaryItems.map((item) => (
            <SidebarLink 
              key={item.href} 
              item={item} 
              active={pathname === item.href}
              onClick={onClose} 
            />
          ))}

          {/* Fixed Logout Link inside scrollable for accessibility */}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-between w-full px-4 h-[56px] rounded-xl hover:bg-rose-50 transition-all group mt-4 mb-8"
          >
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                  <LogOut className="h-5 w-5" />
               </div>
               <span className="font-bold text-[15px] text-rose-600">Logout Session</span>
            </div>
          </button>
        </div>
      </ScrollArea>

      {/* Bottom Footer Info */}
      <div className="p-5 border-t border-slate-50 bg-slate-50/30 shrink-0">
         <div className="flex items-center justify-between opacity-40">
            <div className="space-y-0 text-left">
               <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#0F172A]">Cracklix Platform</p>
               <p className="text-[7px] font-bold uppercase text-slate-500">Registry Verified 2026</p>
            </div>
            <Shield className="h-4 w-4 text-slate-400" />
         </div>
      </div>
    </div>
  );
}

function SidebarLink({ item, active, onClick }: { item: any, active: boolean, onClick: () => void }) {
  return (
    <Link 
      href={item.href} 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-4 rounded-xl transition-all h-[56px] group border border-transparent",
        active ? "bg-primary/5 border-primary/10" : "hover:bg-slate-50"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center transition-all shadow-inner shrink-0",
          active ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-primary"
        )}>
          {item.icon && <item.icon className={cn("h-5 w-5", !active && item.color)} />}
        </div>
        <span className={cn(
          "font-bold text-[15px] transition-colors truncate",
          active ? "text-primary" : "text-slate-600 group-hover:text-[#0F172A]"
        )}>
          {item.label}
        </span>
      </div>
      <ChevronRight className={cn(
        "h-4 w-4 transition-all shrink-0",
        active ? "text-primary translate-x-0.5" : "text-slate-200 group-hover:text-slate-400"
      )} />
    </Link>
  );
}
