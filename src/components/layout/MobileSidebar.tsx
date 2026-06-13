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
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview High-Fidelity Sidebar Visual Restoration v28.0.
 * MATCHED: User screenshot layout perfectly (Name -> Pass Badge -> Teal Download Bar -> Orange Active Menu).
 */
export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const { profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
      setCanInstall(true);
    }
    const handleInstallable = () => setCanInstall(true);
    window.addEventListener('pwa-installable', handleInstallable);
    return () => window.removeEventListener('pwa-installable', handleInstallable);
  }, []);

  const passStatus = useMemo(() => {
    if (!profile?.pass) return { active: false, label: "FREE PASS" };
    const active = profile.pass.active;
    const expiry = new Date(profile.pass.expiryDate);
    const isExpired = expiry < new Date();
    
    return {
      active: active && !isExpired,
      label: isExpired ? "PASS EXPIRED" : "PASS ACTIVE",
    };
  }, [profile]);

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
    router.push('/');
  };

  const handleInstallClick = async () => {
    const prompt = (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
    } else {
       toast({ title: "Check Home Screen", description: "The app is already installed or your browser doesn't support direct prompting." });
    }
  };

  const menuItems = [
    { label: "Platform Home", href: "/", icon: Home },
    { label: "My Exam Hub", href: "/my-exams", icon: Target },
    { label: "Practice Mocks", href: "/mocks", icon: Zap },
    { label: "Study Center", href: "/notes", icon: FileText },
    { label: "Updates Hub", href: "/current-affairs", icon: Newspaper },
    { label: "Upgrade Pass", href: "/pass", icon: Gem },
    { label: "Contact Us", href: "/contact", icon: MessageCircleQuestion },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-y-auto no-scrollbar font-body select-none">
      
      {/* 1. PROFILE HEADER HUB */}
      <div className="bg-[#0B1528] px-6 pt-20 pb-10 flex flex-col items-center gap-4 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck className="h-40 w-40" /></div>
        
        <div className="flex flex-col items-center gap-4 relative z-10 text-center">
           <h2 className="text-3xl font-black text-white leading-none uppercase tracking-tighter">
              {profile?.name || "Student"}
           </h2>
           <Badge className={cn(
             "border-none px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all",
             passStatus.active ? "bg-[#10B981] text-white" : "bg-rose-600 text-white"
           )}>
              {passStatus.label}
           </Badge>
        </div>
      </div>

      {/* 2. DOWNLOAD APP BAR (MATCHED TO SCREENSHOT) */}
      <div 
         onClick={handleInstallClick}
         className="flex items-center justify-between px-6 py-6 bg-[#0D242F] border-y border-white/5 cursor-pointer active:bg-[#11313d] transition-all shrink-0"
      >
         <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#10B981] text-white flex items-center justify-center shadow-lg">
               <Download className="h-7 w-7" />
            </div>
            <div className="text-left">
               <span className="text-[16px] uppercase tracking-tight font-black text-white block">Download App</span>
               <p className="text-[9px] font-black text-[#10B981] uppercase tracking-[0.05em] leading-none mt-1.5">Get Official Notifications</p>
            </div>
         </div>
         <button className="bg-[#10B981] text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-tighter shadow-xl">
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
                "flex items-center justify-between px-6 h-[72px] transition-all border-l-[6px]",
                isActive ? "bg-white/[0.03] border-[#F97316]" : "hover:bg-white/[0.01] border-transparent"
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
            </Link>
          )
        })}

        <div className="my-6 border-t border-white/5 mx-6 opacity-50" />
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-6 px-6 h-[64px] text-rose-500 hover:bg-rose-500/5 transition-all w-full text-left"
        >
          <LogOut className="h-6 w-6 shrink-0" />
          <span className="text-[15px] font-black uppercase tracking-tight">Log Out Session</span>
        </button>
      </div>

      {/* 4. FOOTER CREDITS */}
      <div className="mt-auto px-6 py-12 flex flex-col items-center gap-2 bg-black/20 border-t border-white/5">
         <p className="text-[10px] font-black text-[#F97316] uppercase tracking-widest text-center">
            Developed by Arsh Grewal
         </p>
         <p className="text-[8px] font-bold text-[#334155] uppercase tracking-widest leading-none">© Institutional Registry Node</p>
      </div>
    </div>
  );
}
