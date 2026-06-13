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
 * @fileOverview FINAL Screenshot Replica Sidebar v40.0.
 * MATCHED: Exact text sizes, icon colors, and layout nodes from the user screenshot.
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
    { label: "OFFICIAL LIST", href: "/exams", icon: Target },
    { label: "ELITE PASS", href: "/pass", icon: Gem, hasPro: true },
    { label: "PRACTICE TESTS", href: "/mocks", icon: Zap },
    { label: "UPDATES HUB", href: "/current-affairs", icon: Newspaper },
    { label: "CONTACT US", href: "/contact", icon: MessageCircleQuestion },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0B1528] text-white overflow-y-auto no-scrollbar font-body select-none">
      
      {/* 1. USER IDENTITY HEADER (EXACT REPLICA) */}
      <div className="px-6 pt-16 pb-8 flex flex-col gap-6 relative overflow-hidden shrink-0">
        {/* Background Shield Watermark */}
        <Shield className="absolute top-10 right-4 h-48 w-48 text-white/[0.03] pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-5">
           {/* Avatar with Verified Badge */}
           <div className="relative">
              <div className="h-20 w-20 rounded-[1.8rem] border-[2px] border-white/20 flex items-center justify-center bg-[#1E293B] shadow-2xl overflow-hidden">
                 <User className="h-10 w-10 text-slate-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-[#10B981] rounded-lg border-[2px] border-[#0B1528] flex items-center justify-center text-white">
                 <ShieldCheck className="h-3 w-3" />
              </div>
           </div>

           <div className="space-y-1.5 text-left">
              <h2 className="text-2xl font-black text-white leading-none uppercase tracking-tight">
                 {profile?.name || "ARSH GREWAL"}
              </h2>
              <div className="flex flex-col items-start gap-2">
                 <div className="bg-[#F97316] text-white px-5 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">
                    PASS ACTIVE
                 </div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    EXP: 16/06/2026
                 </p>
              </div>
           </div>
        </div>

        {/* PROFILE HUB BUTTON */}
        <button 
           onClick={() => { router.push('/profile'); onClose(); }}
           className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-between px-6 group active:scale-95 transition-all relative z-10"
        >
           <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-[#F97316]" />
              <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-200">PROFILE HUB</span>
           </div>
           <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {/* 2. DOWNLOAD APP HUB (EXACT REPLICA) */}
      <div 
         onClick={handleInstallClick}
         className="flex items-center justify-between px-6 py-5 bg-[#0D242F] border-y border-white/5 cursor-pointer active:bg-[#11313d] transition-all shrink-0"
      >
         <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#10B981] text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
               <Download className="h-7 w-7" />
            </div>
            <div className="text-left">
               <span className="text-[16px] uppercase tracking-tight font-black text-white block leading-none mb-1">DOWNLOAD APP</span>
               <div className="flex flex-col">
                  <p className="text-[9px] font-black text-[#10B981] uppercase tracking-widest leading-tight">INSTALL FOR FAST</p>
                  <p className="text-[9px] font-black text-[#10B981] uppercase tracking-widest leading-tight">ACCESS</p>
               </div>
            </div>
         </div>
         <button className="bg-[#10B981] text-white px-5 py-2.5 rounded-full font-black text-[9px] uppercase tracking-tighter shadow-xl border-none">
            INSTALL
         </button>
      </div>

      {/* 3. NAVIGATION MENU */}
      <div className="flex flex-col py-2">
        {menuItems.map((item) => {
          const isActive = mounted && (pathname === item.href || (pathname === '/' && item.href === '/'));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-6 h-[72px] transition-all border-l-[6px] relative",
                isActive ? "bg-white/[0.04] border-[#F97316]" : "hover:bg-white/[0.01] border-transparent"
              )}
            >
              <div className="flex items-center gap-6">
                 <Icon className={cn(
                   "h-6 w-6 shrink-0 transition-all",
                   isActive ? "text-[#F97316]" : "text-[#475569]"
                 )} />
                 <span className={cn(
                   "text-[15px] uppercase tracking-tight font-black",
                   isActive ? "text-white" : "text-[#64748B]"
                 )}>
                   {item.label}
                 </span>
              </div>
              
              {item.hasPro && (
                <div className="bg-[#F97316]/10 border border-[#F97316]/20 px-3 py-0.5 rounded-md">
                   <span className="text-[9px] font-black text-[#F97316]">PRO</span>
                </div>
              )}
            </Link>
          )
        })}

        <div className="my-8 border-t border-white/5 mx-6 opacity-30" />
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-6 px-6 h-[64px] text-rose-500 hover:bg-rose-500/5 transition-all w-full text-left active:scale-95"
        >
          <LogOut className="h-6 w-6 shrink-0" />
          <span className="text-[15px] font-black uppercase tracking-tight">LOG OUT SESSION</span>
        </button>
      </div>

      {/* 4. FOOTER CREDITS */}
      <div className="mt-auto px-6 py-12 flex flex-col items-center gap-2 bg-black/20 border-t border-white/5">
         <p className="text-[11px] font-black text-[#F97316] uppercase tracking-[0.3em] text-center">
            DEVELOPED BY ARSH GREWAL
         </p>
         <p className="text-[9px] font-bold text-[#334155] uppercase tracking-widest leading-none">© INSTITUTIONAL REGISTRY NODE</p>
      </div>
    </div>
  );
}
