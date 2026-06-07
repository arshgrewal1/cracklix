'use client';

import { 
  FileText, 
  CalendarDays, 
  Bell, 
  Phone, 
  ChevronRight, 
  Gem,
  Zap,
  BarChart3,
  Home,
  LogOut,
  ChevronDown,
  Target,
  User as UserIcon,
  X,
  ShieldCheck
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
import ShareButton from "@/components/navigation/ShareButton";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * @fileOverview High-Fidelity Mobile Sidebar v3.1.
 * FIXED: Added missing ShieldCheck import to resolve ReferenceError.
 */

export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const { profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
    router.push('/login');
  };

  const primaryMenu = [
    { label: "HOME", href: "/", icon: Home },
    { label: "MY EXAMS", href: "/my-exams", icon: Target },
    { label: "PRACTICE SERIES", href: "/mocks", icon: Zap },
    { label: "EXAM CALENDAR", href: "/exam-calendar", icon: CalendarDays },
    { label: "STUDY NOTES", href: "/notes", icon: FileText },
    { label: "PERFORMANCE", href: "/dashboard", icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-hidden font-body w-full border-r border-white/5">
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col min-h-full">
          
          {/* 1. HIGH-FIDELITY PROFILE HEADER */}
          <div className="px-6 md:px-10 pt-16 pb-12 bg-[#0B1528] relative overflow-hidden text-left border-b border-white/5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[100px] rounded-full" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all active:scale-90 z-20"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex flex-col gap-8 relative z-10">
              <div className="relative w-fit">
                <StudentAvatar 
                  profile={profile} 
                  className="h-20 w-20 md:h-24 md:w-24 border-4 border-white/10 rounded-[2rem] shadow-3xl bg-[#0F172A]" 
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-7 w-7 rounded-lg border-4 border-[#0B1528] flex items-center justify-center shadow-xl">
                   <ShieldCheck className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              
              <div className="space-y-5 text-left">
                <div className="flex flex-col gap-3">
                  <h2 className="font-headline font-black text-3xl md:text-4xl text-white uppercase tracking-tight break-words leading-none">
                    {profile?.name || "Student Node"}
                  </h2>
                  <Badge className="bg-primary text-white border-none text-[9px] font-black uppercase px-4 py-1.5 rounded-lg shadow-2xl w-fit tracking-wider">
                    {(profile?.status || 'Free').toUpperCase()} PASS
                  </Badge>
                </div>
                
                <Link 
                  href="/profile" 
                  onClick={onClose}
                  className="text-[11px] font-black uppercase tracking-[0.4em] text-primary hover:text-white transition-colors flex items-center gap-2 group"
                >
                  VIEW PROFILE <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* 2. MENU LIST */}
          <div className="flex-1 py-10">
            <div className="space-y-2">
              {primaryMenu.map((item) => (
                <MenuLink 
                  key={item.href} 
                  item={item} 
                  active={pathname === item.href}
                  onClick={onClose} 
                />
              ))}

              <div className="my-10 border-t border-white/5 mx-10" />

              <CollapsibleGroup 
                label="MY ACCOUNT" 
                isOpen={isAccountOpen} 
                onToggle={setIsAccountOpen}
              >
                <MenuLink item={{ label: "PASS HUB", href: "/pass", icon: Gem }} active={pathname === '/pass'} onClick={onClose} indent />
                <MenuLink item={{ label: "NOTIFICATIONS", href: "/notifications", icon: Bell }} active={pathname === '/notifications'} onClick={onClose} indent />
                <MenuLink item={{ label: "CONTACT US", href: "/contact", icon: Phone }} active={pathname === '/contact'} onClick={onClose} indent />
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-5 px-14 h-16 text-rose-500 hover:bg-rose-500/10 transition-all group"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span className="text-[14px] font-black uppercase tracking-tight">Logout</span>
                </button>
              </CollapsibleGroup>

              <div className="px-10 mt-8 pb-12">
                 <ShareButton 
                   className="w-full h-16 bg-white/5 border border-white/10 shadow-none text-slate-300 hover:bg-primary hover:text-white rounded-[1.5rem] font-black" 
                   variant="ghost" 
                 />
              </div>
            </div>
          </div>

          {/* 3. SIGNATURE FOOTER */}
          <div className="px-8 py-12 border-t border-white/5 bg-black/20 flex flex-col items-center gap-2 mt-auto shrink-0">
             <div className="flex items-center gap-2 text-[11px] font-black text-white uppercase tracking-[0.3em]">
                <UserIcon className="h-4 w-4 text-primary" /> 
                DEVELOPED BY ARSH GREWAL
             </div>
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.5em]">
                OFFICIAL HUB 2026
             </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function MenuLink({ item, active, onClick, indent = false }: any) {
  return (
    <Link 
      href={item.href} 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-10 h-16 transition-all group w-full",
        active ? "bg-primary/10 text-primary border-l-[6px] border-primary" : "hover:bg-white/5 text-slate-400",
        indent && "pl-14"
      )}
    >
      <div className="flex items-center gap-6 min-w-0 flex-1">
        <item.icon className={cn("h-6 w-6 shrink-0 transition-transform group-active:scale-90", active ? "text-primary" : "text-slate-500 group-hover:text-primary")} />
        <span className={cn(
          "text-[15px] font-black uppercase tracking-tight transition-colors truncate",
          active ? "text-white" : "group-hover:text-white"
        )}>
          {item.label}
        </span>
      </div>
      <ChevronRight className={cn(
        "h-4 w-4 transition-all",
        active ? "opacity-100 text-primary translate-x-1" : "opacity-0 group-hover:opacity-100 text-slate-700"
      )} />
    </Link>
  );
}

function CollapsibleGroup({ label, children, isOpen, onToggle }: any) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className="w-full">
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full px-10 h-14 hover:bg-white/5 transition-all text-slate-500 group">
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">{label}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 overflow-hidden transition-all">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
