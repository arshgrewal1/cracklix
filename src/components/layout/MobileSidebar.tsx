'use client';

import { 
  Home, 
  Zap, 
  FileText, 
  Target, 
  ChevronRight,
  LogOut,
  ShieldCheck,
  Gem,
  Newspaper,
  Download,
  User,
  Shield,
  Landmark,
  Layers,
  History
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/brand/Logo";
import PWAInstallButton from "@/components/PWAInstallButton";

/**
 * @fileOverview Hardened High-Density Mobile Sidebar v71.0.
 * UPDATED: Logo height set to 230px as requested.
 */
export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const { profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
    router.push('/');
  };

  const menuItems = [
    { label: "Home Page", href: "/", icon: Home },
    { label: "My Registry", href: "/my-exams", icon: Target },
    { label: "Exam List", href: "/exams", icon: Landmark },
    { label: "Practice Bank", href: "/mocks", icon: Zap },
    { label: "Study Updates", href: "/current-affairs", icon: Newspaper },
    { label: "Study Notes", href: "/notes", icon: FileText },
    { label: "Punjab Merit", href: "/leaderboard", icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0B1528] text-white overflow-y-auto no-scrollbar font-body select-none text-left pt-0">
      
      <div className="px-6 flex justify-start shrink-0 overflow-visible -mt-6 mb-[-25px]">
         <Logo imgClassName="h-[230px] origin-left" />
      </div>

      <div className="px-6 flex flex-col gap-0 relative overflow-hidden shrink-0 mt-0 pt-0">
        <Shield className="absolute top-0 right-4 h-40 w-40 text-white/[0.03] pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3 py-1">
           <div className="relative shrink-0">
              <div className="h-10 w-10 rounded-lg border-[2px] border-white/20 flex items-center justify-center bg-[#1E293B] shadow-2xl overflow-hidden">
                 <User className="h-5 w-5 text-slate-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-[#10B981] rounded-md border-[2px] border-[#0B1528] flex items-center justify-center text-white">
                 <ShieldCheck className="h-1.5 w-1.5" />
              </div>
           </div>
           <div className="space-y-0 text-left min-w-0">
              <h2 className="text-[13px] font-black text-white leading-none uppercase tracking-tight truncate">{profile?.name || "ASPIRANT"}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <Badge className={cn(
                    "border-none px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest shadow-sm", 
                    profile?.pass?.active ? "bg-[#10B981] text-white" : "bg-white/10 text-slate-400"
                 )}>
                    {profile?.pass?.active ? (profile.pass.plan || 'ELITE') : 'FREE NODE'}
                 </Badge>
              </div>
           </div>
        </div>
        <button onClick={() => { router.push('/profile'); onClose(); }} className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-between px-3 group active:scale-95 transition-all relative z-10 mb-2 mt-1">
           <div className="flex items-center gap-2"><User className="h-3 w-3 text-[#F97316]" /><span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-200">PROFILE SETTINGS</span></div>
           <ChevronRight className="h-3 w-3 text-slate-600" />
        </button>
      </div>

      <div className="px-6 mb-0 mt-1"><p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">MANAGEMENT CENTER</p></div>

      <div className="flex flex-col py-0">
        <div className="px-6 mb-2">
          <PWAInstallButton 
            className="w-full h-10 bg-primary/10 text-primary border-l-[3px] border-primary rounded-none justify-start px-4" 
            variant="ghost" 
          />
        </div>

        {menuItems.map((item) => {
          const isActive = mounted && pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} onClick={onClose} className={cn("flex items-center gap-4 px-6 h-[40px] transition-all border-l-[3px]", isActive ? "bg-white/[0.05] border-primary text-white" : "hover:bg-white/[0.02] border-transparent text-slate-400")}>
               <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-slate-600")} />
               <span className={cn("text-[11px] font-black uppercase tracking-tight", isActive ? "text-white" : "text-slate-400")}>{item.label}</span>
            </Link>
          )
        })}
        <button onClick={handleLogout} className="flex items-center gap-4 px-6 h-[40px] text-rose-500 hover:bg-rose-50/5 transition-all w-full text-left active:scale-95">
          <LogOut className="h-4 w-4 shrink-0" /><span className="text-[11px] font-black uppercase tracking-tight">LOG OUT SESSION</span>
        </button>
      </div>

      <div className="mt-auto px-6 py-4 flex flex-col items-center gap-1 bg-black/30 border-t border-white/5 pb-safe">
         <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">CRACKLIX v2.0</p>
         <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest leading-none text-center">OFFICIAL REGISTRY NODE</p>
      </div>
    </div>
  );
}
