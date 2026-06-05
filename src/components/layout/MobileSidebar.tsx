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
 * @fileOverview Compact Mobile Navigation Module (Adda247/Testbook Style).
 * Fixed: Strictly forced width to 200px to match new compact requirements.
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
    { label: "Exams", href: "/exams", icon: GraduationCap },
    { label: "My Mocks", href: "/mocks", icon: Zap },
    { label: "Notes", href: "/notes", icon: FileText },
    { label: "Results", href: "/dashboard", icon: BarChart3 },
    { label: "PYQ", href: "/pyqs", icon: FileStack },
    { label: "Pass", href: "/pass", icon: Gem },
    { label: "Analysis", href: "/current-affairs", icon: Newspaper },
  ];

  const secondaryMenu = [
    { label: "Profile Settings", href: "/profile", icon: Settings },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Contact Support", href: "/contact", icon: Phone },
  ];

  const moreMenu = [
    { label: "Hall of Rankers", href: "/leaderboard", icon: Trophy },
    { label: "Exam Calendar", href: "/exam-calendar", icon: CalendarDays },
    { label: "Institutional Nodes", href: "/about", icon: Info },
  ];

  return (
    <div className="flex flex-col h-full bg-white text-[#0F172A] overflow-hidden font-body w-[200px] max-w-[200px]">
      {/* 1. COMPACT PROFILE HUB */}
      <div className="px-4 py-6 bg-[#0B1528] shrink-0 border-b border-white/5">
        <div className="flex flex-col items-start gap-4">
          <StudentAvatar 
            profile={profile} 
            className="h-10 w-10 border border-white/10 rounded-xl shrink-0 shadow-lg" 
          />
          <div className="text-left w-full">
            <h2 className="font-headline font-black text-[13px] text-white uppercase tracking-tight leading-tight truncate">
              {profile?.name || "Aspirant"}
            </h2>
            <div className="mt-2">
              <Badge className="bg-[#F97316] text-white border-none text-[7px] font-black uppercase px-2 py-0.5 rounded-sm">
                {profile?.status?.replace('_', ' ') || "FREE"} PASS
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FITTED NAVIGATION LIST (200px Width) */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-0.5">
        {primaryMenu.map((item) => (
          <MenuLink 
            key={item.href} 
            item={item} 
            active={pathname === item.href}
            onClick={onClose} 
          />
        ))}

        <div className="my-2 border-t border-slate-50 mx-4" />

        <CollapsibleGroup 
          label="Account & Support" 
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
            className="w-full flex items-center gap-3 px-4 h-[44px] text-rose-500 hover:bg-rose-50 transition-colors group text-left"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span className="text-[13px] font-bold uppercase tracking-tight">Logout</span>
          </button>
        </CollapsibleGroup>

        <CollapsibleGroup 
          label="More Sections" 
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

      {/* 3. COMPACT FOOTER */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 shrink-0 mb-[env(safe-area-inset-bottom,0px)]">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] text-center">
          Cracklix v5.5
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
        "flex items-center justify-between px-4 h-[44px] transition-all group w-full",
        active ? "bg-primary/5 text-primary border-r-4 border-primary" : "hover:bg-slate-50 text-slate-600",
        indent && "pl-8"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-primary" : "text-slate-400")} />
        <span className={cn(
          "text-[12px] font-bold uppercase tracking-tight transition-colors truncate",
          active ? "text-primary" : "group-hover:text-[#0F172A]"
        )}>
          {item.label}
        </span>
      </div>
      <ChevronRight className={cn(
        "h-3 w-3 transition-all opacity-0 group-hover:opacity-100 shrink-0",
        active ? "opacity-100 text-primary" : "text-slate-200"
      )} />
    </Link>
  );
}

function CollapsibleGroup({ label, children, isOpen, onToggle }: any) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className="w-full">
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full px-4 h-10 hover:bg-slate-50 transition-all text-slate-400 group">
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 mt-1 overflow-hidden transition-all">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
