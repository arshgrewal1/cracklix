
'use client';

import { 
  FileText, 
  FileStack, 
  Newspaper, 
  CalendarDays, 
  Bell, 
  Settings, 
  Phone, 
  ChevronRight, 
  Gem,
  Trophy,
  Zap,
  GraduationCap,
  BarChart3,
  Home,
  LogOut,
  ChevronDown,
  Info
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import StudentAvatar from "@/components/brand/StudentAvatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

/**
 * @fileOverview Responsive Mobile Navigation Hub.
 * Updated: Replaced 'Exams' with 'Exam Calendar' for differentiation.
 */

export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const { profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
    router.push('/login');
  };

  const primaryMenu = [
    { label: "Home", href: "/", icon: Home },
    { label: "Practice Series", href: "/mocks", icon: Zap },
    { label: "Exam Calendar", href: "/exam-calendar", icon: CalendarDays },
    { label: "Daily Analysis", href: "/current-affairs", icon: Newspaper },
    { label: "Study Notes", href: "/notes", icon: FileText },
    { label: "Performance", href: "/dashboard", icon: BarChart3 },
    { label: "PYQ Hub", href: "/pyqs", icon: FileStack },
    { label: "Pass Registry", href: "/pass", icon: Gem },
  ];

  const secondaryMenu = [
    { label: "Profile Settings", href: "/profile", icon: Settings },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Contact Support", href: "/contact", icon: Phone },
  ];

  const moreMenu = [
    { label: "Hall of Rankers", href: "/leaderboard", icon: Trophy },
    { label: "Origin Story", href: "/about", icon: Info },
  ];

  return (
    <div className="flex flex-col h-full bg-white text-[#0F172A] overflow-hidden font-body w-[180px] lg:w-[280px] max-w-[180px] lg:max-w-[280px]">
      
      {/* 1. UNIFIED SCROLLABLE CONTENT (Profile + Menu) */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        
        {/* HIGH-DENSITY PROFILE HUB (Responsive Scale) */}
        <div className="px-3 lg:px-6 pt-1.5 lg:pt-5 pb-1 lg:pb-4 bg-[#0B1528] border-b border-white/5 mb-1">
          <div className="flex flex-col gap-1 lg:gap-3">
            <StudentAvatar 
              profile={profile} 
              className="h-6 w-6 lg:h-10 lg:w-10 border border-white/10 rounded-md lg:rounded-xl shrink-0 shadow-lg -mt-0.5" 
              iconClassName="h-3/4 w-3/4"
            />
            <div className="flex items-center justify-between gap-1 w-full overflow-hidden">
              <h2 className="font-headline font-black text-[11px] lg:text-[15px] text-white uppercase tracking-tight leading-none truncate flex-1">
                {profile?.name || "Aspirant"}
              </h2>
              <Badge className="bg-[#F97316] text-white border-none text-[5px] lg:text-[9px] font-black uppercase px-1 py-0.5 lg:px-2 rounded-sm shrink-0">
                {profile?.status === 'Free' ? 'FREE' : 'GOLD'}
              </Badge>
            </div>
          </div>
        </div>

        {/* NAVIGATION LIST */}
        <div className="space-y-0.5 pt-1 lg:pt-2">
          {primaryMenu.map((item) => (
            <MenuLink 
              key={item.href} 
              item={item} 
              active={pathname === item.href}
              onClick={onClose} 
            />
          ))}

          <div className="my-1 lg:my-3 border-t border-slate-50 mx-3 lg:mx-6" />

          <CollapsibleGroup 
            label="Account" 
            isOpen={isAccountOpen} 
            onToggle={setIsAccountOpen}
          >
            {secondaryMenu.map((item) => (
              <MenuLink 
                key={item.href} 
                item={item} 
                active={pathname === item.href}
                onClick={onClose}
                indent
              />
            ))}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-6 h-[38px] lg:h-[48px] text-rose-500 hover:bg-rose-50 transition-colors group text-left"
            >
              <LogOut className="h-[16px] w-[16px] lg:h-[20px] lg:w-[20px] shrink-0" />
              <span className="text-[11px] lg:text-[14px] font-bold uppercase tracking-tight">Logout</span>
            </button>
          </CollapsibleGroup>

          <CollapsibleGroup 
            label="More" 
            isOpen={isMoreOpen} 
            onToggle={setIsMoreOpen}
          >
            {moreMenu.map((item) => (
              <MenuLink 
                key={item.href} 
                item={item} 
                active={pathname === item.href}
                onClick={onClose}
                indent
              />
            ))}
          </CollapsibleGroup>
        </div>
      </div>

      {/* 2. COMPACT FIXED FOOTER */}
      <div className="px-3 py-2 lg:py-4 border-t border-slate-100 bg-slate-50 shrink-0 mb-[env(safe-area-inset-bottom,0px)]">
        <p className="text-[7px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
          Cracklix v6.5
        </p>
      </div>
    </div>
  );
}

function MenuLink({ item, active, onClick, indent = false }: any) {
  return (
    <Link 
      href={item.href} 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-3 lg:px-6 h-[40px] lg:h-[50px] transition-all group w-full",
        active ? "bg-primary/5 text-primary border-r-[3px] border-primary" : "hover:bg-slate-50 text-slate-600",
        indent && "pl-6 lg:pl-10"
      )}
    >
      <div className="flex items-center gap-2.5 lg:gap-3.5 min-w-0 flex-1">
        <item.icon className={cn("h-[16px] w-[16px] lg:h-[20px] lg:w-[20px] shrink-0", active ? "text-primary" : "text-slate-400")} />
        <span className={cn(
          "text-[11px] lg:text-[14px] font-bold uppercase tracking-tight transition-colors truncate",
          active ? "text-primary" : "group-hover:text-[#0F172A]"
        )}>
          {item.label}
        </span>
      </div>
      <ChevronRight className={cn(
        "h-2.5 w-2.5 lg:h-3.5 lg:w-3.5 transition-all opacity-0 group-hover:opacity-100 shrink-0",
        active ? "opacity-100 text-primary" : "text-slate-200"
      )} />
    </Link>
  );
}

function CollapsibleGroup({ label, children, isOpen, onToggle }: any) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className="w-full">
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full px-3 lg:px-6 h-8 lg:h-12 hover:bg-slate-50 transition-all text-slate-400 group">
          <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.1em]">{label}</span>
          <ChevronDown className={cn("h-3 w-3 transition-transform duration-300", isOpen && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 mt-0.5 overflow-hidden transition-all">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
