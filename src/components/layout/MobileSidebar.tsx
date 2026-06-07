
'use client';

import { 
  Home, 
  Zap, 
  FileText, 
  Target, 
  Library, 
  MessageCircleQuestion, 
  Newspaper, 
  ChevronRight,
  LogOut,
  ShieldCheck,
  User,
  Gem
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import StudentAvatar from "@/components/brand/StudentAvatar";
import React from "react";

/**
 * @fileOverview Institutional Dark Sidebar v10.0 (Recovered).
 * Reverts style to the premium Dark Navy theme with 'Node' terminology.
 * Optimized: 290px width, 14px font size, 46px menu height.
 */

export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const { profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
    router.push('/');
  };

  const menuItems = [
    { label: "My Exams Hub", href: "/my-exams", icon: Target },
    { label: "Home Registry", href: "/", icon: Home },
    { label: "Elite Pass Hub", href: "/pass", icon: Gem, badge: "ACTIVATE" },
    { label: "Test Series", href: "/mocks", icon: Zap },
    { label: "Previous Papers", href: "/pyqs", icon: FileText },
    { label: "Study Materials", href: "/notes", icon: Library },
    { label: "Daily Analysis", href: "/current-affairs", icon: Newspaper },
    { label: "Ask Arsh Grewal", href: "/contact", icon: MessageCircleQuestion },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-y-auto no-scrollbar font-body w-full select-none">
      
      {/* 1. PROFILE NODE (Institutional Dark) */}
      <div className="bg-[#0B1528] px-6 pt-12 pb-10 flex flex-col gap-6 relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck className="h-40 w-40" /></div>
        
        <div className="flex items-center gap-5 relative z-10">
           <div className="relative group">
              <StudentAvatar 
                profile={profile} 
                className="h-20 w-20 rounded-[1.5rem] border-4 border-white/10 shadow-2xl relative bg-[#0F172A]" 
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-7 w-7 rounded-lg border-4 border-[#0B1528] flex items-center justify-center shadow-xl">
                 <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </div>
           </div>
           
           <div className="flex-1 min-w-0 text-left">
              <h2 className="text-2xl font-black text-white leading-none mb-2 uppercase tracking-tight truncate">
                 {profile?.name || "Aspirant Node"}
              </h2>
              <div className="flex items-center gap-2">
                 <span className="bg-primary text-white border-none px-3 py-1 rounded-md font-black uppercase text-[8px] tracking-widest shadow-lg">
                    {profile?.status || 'Free'} Pass
                 </span>
              </div>
           </div>
        </div>

        <Link 
          href="/profile" 
          onClick={onClose}
          className="flex items-center justify-between w-full p-4 bg-white/5 border border-white/10 rounded-xl group hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-3">
             <User className="h-4 w-4 text-primary" />
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">Registry Profile</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-primary transition-all" />
        </Link>
      </div>

      {/* 2. MENU REGISTRY */}
      <div className="flex flex-col py-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-6 h-[46px] transition-all group border-l-4",
                isActive ? "bg-primary/10 border-primary" : "hover:bg-white/5 border-transparent"
              )}
            >
              <div className="flex items-center gap-5">
                 <item.icon className={cn(
                   "h-5 w-5 shrink-0 transition-all",
                   isActive ? "text-primary scale-110" : "text-slate-500 group-hover:text-primary"
                 )} />
                 <span className={cn(
                   "text-[14px] uppercase tracking-tight",
                   isActive ? "font-black text-white" : "font-bold text-slate-400 group-hover:text-white"
                 )}>
                   {item.label}
                 </span>
              </div>

              {item.badge && (
                <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}

        <div className="my-6 border-t border-white/5 mx-6" />
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-5 px-6 h-[46px] text-rose-500 hover:bg-rose-500/5 transition-all w-full text-left group"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="text-[14px] font-black uppercase tracking-tight">Logout Node</span>
        </button>
      </div>

      {/* 3. FOUNDER FOOTER */}
      <div className="mt-auto px-6 py-12 flex flex-col items-center gap-2 bg-black/20 border-t border-white/5">
         <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Institutional Hub</p>
         </div>
         <p className="text-[10px] font-black text-primary uppercase tracking-widest text-center">
            Developed by Arsh Grewal
         </p>
         <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">Cracklix Technologies © 2026</p>
      </div>
    </div>
  );
}
