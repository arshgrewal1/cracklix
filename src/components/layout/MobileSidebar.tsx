'use client';

import { 
  Home, 
  Zap, 
  FileText, 
  Target, 
  MessageCircleQuestion, 
  ChevronRight,
  LogOut,
  ShieldCheck,
  Gem,
  Newspaper,
  Download,
  User,
  Shield
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * @fileOverview Final Screenshot Replica Sidebar v43.0.
 * UPDATED: Simplified 'OFFICIAL LIST' to 'EXAM LIST'.
 */
export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const { profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
    router.push('/');
  };

  const handleInstallClick = () => {
    const prompt = (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
    } else {
       toast({ title: "App Active", description: "Already installed or check browser menu." });
    }
  };

  const menuItems = [
    { label: "HOME PAGE", href: "/", icon: Home },
    { label: "EXAM LIST", href: "/exams", icon: Target },
    { label: "ELITE PASS", href: "/pass", icon: Gem, hasPro: true },
    { label: "PRACTICE TESTS", href: "/mocks", icon: Zap },
    { label: "UPDATES HUB", href: "/current-affairs", icon: Newspaper },
    { label: "CONTACT US", href: "/contact", icon: MessageCircleQuestion },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0B1528] text-white overflow-y-auto no-scrollbar font-body select-none">
      
      {/* 1. USER IDENTITY HEADER (COMPACT) */}
      <div className="px-6 pt-12 pb-6 flex flex-col gap-5 relative overflow-hidden shrink-0">
        <Shield className="absolute top-10 right-4 h-40 w-40 text-white/[0.02] pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
           <div className="relative">
              <div className="h-16 w-16 rounded-[1.5rem] border-[2px] border-white/20 flex items-center justify-center bg-[#1E293B] shadow-2xl overflow-hidden">
                 <User className="h-8 w-8 text-slate-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-[#10B981] rounded-lg border-[2px] border-[#0B1528] flex items-center justify-center text-white">
                 <ShieldCheck className="h-2.5 w-2.5" />
              </div>
           </div>

           <div className="space-y-1 text-left">
              <h2 className="text-xl font-black text-white leading-none uppercase tracking-tight">
                 {profile?.name || "STUDENT"}
              </h2>
              <div className="flex flex-col items-start gap-1.5">
                 <div className="bg-[#F97316] text-white px-3 py-1 rounded-full font-black uppercase text-[8px] tracking-widest shadow-xl">
                    PASS ACTIVE
                 </div>
              </div>
           </div>
        </div>

        <button 
           onClick={() => { router.push('/profile'); onClose(); }}
           className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-between px-5 group active:scale-95 transition-all relative z-10"
        >
           <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-[#F97316]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-200">PROFILE HUB</span>
           </div>
           <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
        </button>
      </div>

      {/* 2. DOWNLOAD APP HUB (COMPACT) */}
      <div 
         onClick={handleInstallClick}
         className="flex items-center justify-between px-6 py-4 bg-[#0D242F] border-y border-white/5 cursor-pointer active:bg-[#11313d] transition-all shrink-0"
      >
         <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
               <Download className="h-5 w-5" />
            </div>
            <div className="text-left">
               <span className="text-[14px] uppercase tracking-tight font-black text-white block leading-none mb-0.5">DOWNLOAD APP</span>
               <p className="text-[8px] font-black text-[#10B981] uppercase tracking-widest leading-tight">INSTALL FOR FAST ACCESS</p>
            </div>
         </div>
         <button className="bg-[#10B981] text-white px-4 py-2 rounded-full font-black text-[8px] uppercase tracking-tighter shadow-xl border-none">
            INSTALL
         </button>
      </div>

      {/* 3. NAVIGATION MENU (COMPACT) */}
      <div className="flex flex-col py-1">
        {menuItems.map((item) => {
          const isActive = mounted && (pathname === item.href || (pathname === '/' && item.href === '/'));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-6 h-[60px] transition-all border-l-[4px] relative",
                isActive ? "bg-white/[0.04] border-[#F97316]" : "hover:bg-white/[0.01] border-transparent"
              )}
            >
              <div className="flex items-center gap-5">
                 <Icon className={cn(
                   "h-5 w-5 shrink-0 transition-all",
                   isActive ? "text-[#F97316]" : "text-[#475569]"
                 )} />
                 <span className={cn(
                   "text-[13px] uppercase tracking-tight font-black",
                   isActive ? "text-white" : "text-[#64748B]"
                 )}>
                   {item.label}
                 </span>
              </div>
              
              {item.hasPro && (
                <div className="bg-[#F97316]/10 border border-[#F97316]/20 px-2 py-0.5 rounded-md">
                   <span className="text-[8px] font-black text-[#F97316]">PRO</span>
                </div>
              )}
            </Link>
          )
        })}

        <div className="my-6 border-t border-white/5 mx-6 opacity-30" />
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-5 px-6 h-[56px] text-rose-500 hover:bg-rose-500/5 transition-all w-full text-left active:scale-95"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="text-[13px] font-black uppercase tracking-tight">LOG OUT SESSION</span>
        </button>
      </div>

      {/* 4. FOOTER CREDITS */}
      <div className="mt-auto px-6 py-10 flex flex-col items-center gap-1.5 bg-black/20 border-t border-white/5">
         <p className="text-[10px] font-black text-[#F97316] uppercase tracking-[0.3em] text-center">
            DEVELOPED BY ARSH GREWAL
         </p>
         <p className="text-[8px] font-bold text-[#334155] uppercase tracking-widest leading-none">© INSTITUTIONAL REGISTRY NODE</p>
      </div>
    </div>
  );
}
