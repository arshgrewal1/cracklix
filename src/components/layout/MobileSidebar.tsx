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
import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/brand/Logo";

/**
 * @fileOverview Hardened Production Sidebar Center v54.0.
 * UPDATED: Increased Logo size to h-36.
 */
export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);
  const { profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
      setHasPrompt(true);
    }
    const handleInstallable = () => setHasPrompt(true);
    window.addEventListener('pwa-installable', handleInstallable);
    return () => window.removeEventListener('pwa-installable', handleInstallable);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
    router.push('/');
  };

  const handleInstallClick = async () => {
    if (typeof window === 'undefined') return;
    
    const prompt = (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        (window as any).deferredPrompt = null;
        setHasPrompt(false);
        onClose();
        toast({ title: "Welcome!", description: "Adding app to your home screen." });
      }
    } else {
      toast({ title: "How to Install", description: "On iPhone, tap 'Share' then 'Add to Home Screen'. On Android, check your browser menu." });
    }
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
    <div className="flex flex-col h-full bg-[#0B1528] text-white overflow-y-auto no-scrollbar font-body select-none text-left">
      
      {/* BRAND LOGO */}
      <div className="px-6 pt-10 pb-4 flex justify-start shrink-0 overflow-visible pt-safe">
         <Logo imgClassName="h-36 origin-left" />
      </div>

      {/* IDENTITY HEADER */}
      <div className="px-6 pt-8 pb-6 flex flex-col gap-5 relative overflow-hidden shrink-0">
        <Shield className="absolute top-10 right-4 h-40 w-40 text-white/[0.03] pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
           <div className="relative shrink-0">
              <div className="h-14 w-14 rounded-2xl border-[2px] border-white/20 flex items-center justify-center bg-[#1E293B] shadow-2xl overflow-hidden">
                 <User className="h-7 w-7 text-slate-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-[#10B981] rounded-md border-[2px] border-[#0B1528] flex items-center justify-center text-white">
                 <ShieldCheck className="h-2.5 w-2.5" />
              </div>
           </div>

           <div className="space-y-1 text-left min-w-0">
              <h2 className="text-[17px] font-black text-white leading-none uppercase tracking-tight truncate">
                 {profile?.name || "ASPIRANT"}
              </h2>
              <div className="flex items-center gap-2">
                 <Badge className={cn(
                    "border-none px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                    profile?.pass?.active ? "bg-emerald-50 text-white" : "bg-white/10 text-slate-400"
                 )}>
                    {profile?.pass?.active ? (profile.pass.plan || 'ELITE') : 'FREE NODE'}
                 </Badge>
              </div>
           </div>
        </div>

        <button 
           onClick={() => { router.push('/profile'); onClose(); }}
           className="w-full h-11 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-between px-4 group active:scale-95 transition-all relative z-10"
        >
           <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-[#F97316]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-200">PROFILE SETTINGS</span>
           </div>
           <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {/* PWA INSTALL ACTION */}
      <div 
         onClick={handleInstallClick}
         className={cn(
           "flex items-center justify-between px-6 py-4 border-y border-white/5 cursor-pointer transition-all shrink-0",
           hasPrompt ? "bg-primary/10 active:bg-primary/20" : "bg-black/20 opacity-50"
         )}
      >
         <div className="flex items-center gap-4">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-colors",
              hasPrompt ? "bg-primary text-white" : "bg-white/5 text-slate-500"
            )}>
               <Download className="h-4 w-4" />
            </div>
            <div className="text-left leading-tight">
               <span className="text-[11px] uppercase tracking-tight font-black text-white block mb-0.5">INSTALL CRACKLIX</span>
               <p className={cn("text-[7px] font-black uppercase tracking-widest", hasPrompt ? "text-primary" : "text-slate-500")}>
                 {hasPrompt ? "CLICK TO ADD APP" : "FASTER ACCESS ENABLED"}
               </p>
            </div>
         </div>
         {hasPrompt && <Badge className="bg-primary text-white border-none animate-pulse">GET</Badge>}
      </div>

      {/* NAV MENU */}
      <div className="flex flex-col py-2">
        {menuItems.map((item) => {
          const isActive = mounted && pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-5 px-6 h-[56px] transition-all border-l-[4px]",
                isActive ? "bg-white/[0.05] border-primary text-white" : "hover:bg-white/[0.02] border-transparent text-slate-400"
              )}
            >
               <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-slate-600")} />
               <span className={cn("text-[12px] font-black uppercase tracking-tight", isActive ? "text-white" : "text-slate-400")}>
                 {item.label}
               </span>
            </Link>
          )
        })}

        <div className="my-6 border-t border-white/5 mx-6 opacity-40" />
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-5 px-6 h-[56px] text-rose-500 hover:bg-rose-50/5 transition-all w-full text-left active:scale-95"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="text-[12px] font-black uppercase tracking-tight">LOG OUT SESSION</span>
        </button>
      </div>

      {/* VERSION INFO */}
      <div className="mt-auto px-6 py-10 flex flex-col items-center gap-1.5 bg-black/30 border-t border-white/5 pb-safe">
         <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">CRACKLIX PWA v2.0</p>
         <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none text-center">OFFICIAL REGISTRY NODE</p>
      </div>
    </div>
  );
}
