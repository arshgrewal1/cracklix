'use client';

import React, { useState, useEffect } from "react";
import { 
  Home, 
  Zap, 
  Target, 
  ChevronRight,
  LogOut,
  ShieldCheck,
  Newspaper,
  User,
  Trophy,
  Landmark,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Instagram,
  X
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import StudentAvatar from "@/components/brand/StudentAvatar";
import Logo from "@/components/brand/Logo";
import { TELEGRAM_GROUP, INSTAGRAM_PROFILE } from "@/lib/constants";

/**
 * @fileOverview Premium Sidebar Hub v24.0.
 * UPDATED: Synchronized with 140px header height to fit the 120px logo.
 */
export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const { user, profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
      router.push('/');
    } catch (e) {}
  };

  const mainItems = [
    { label: "Home Page", href: "/", icon: Home },
    { label: "My Hub", href: "/my-exams", icon: Target },
    { label: "Exam List", href: "/exams", icon: Landmark },
    { label: "Practice Bank", href: "/mocks", icon: Zap },
    { label: "Study Updates", href: "/current-affairs", icon: Newspaper },
    { label: "Study Notes", href: "/notes", icon: BookOpen },
    { label: "Punjab Merit", href: "/leaderboard", icon: Trophy },
  ];

  const supportItems = [
    { label: "Support Center", href: "/support", icon: MessageCircle },
    { label: "Help Center", href: "/help", icon: HelpCircle },
  ];

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full bg-white font-body select-none text-left relative overflow-hidden">
      
      {/* 1. BRAND HEADER - h-[140px] */}
      <div className="flex items-center justify-between px-4 h-[140px] border-b shrink-0 bg-white">
        <Logo variant="light" href="/" onClick={onClose} />
        <button 
          onClick={onClose}
          className="h-10 w-10 flex items-center justify-center text-slate-700 active:bg-gray-50 transition-all shrink-0 rounded-xl hover:bg-slate-50"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 2. NAVIGATION HUB */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar py-2">
        
        {/* PROFILE CARD */}
        <div className="mx-5 mt-6">
           <Link href="/profile" onClick={onClose} className="block active:scale-[0.98] transition-all">
              <div className="p-5 rounded-[32px] border border-blue-100 bg-white flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                 <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    <StudentAvatar profile={profile} className="h-full w-full border-none" iconClassName="w-8 h-8" />
                 </div>
                 <div className="min-w-0 flex-1 space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight break-words">
                      {profile?.name || "Aspirant"}
                    </h3>
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#2563EB] text-white text-[10px] font-bold shadow-sm">
                        {profile?.pass?.active ? (profile.pass.plan || 'Elite') : 'Free Pass'}
                      </span>
                    </div>
                 </div>
                 <ChevronRight className="w-6 h-6 text-slate-300 ml-auto shrink-0" />
              </div>
           </Link>
        </div>

        {/* SECTION HEADING */}
        <h4 className="px-6 mt-8 mb-4 text-xs font-bold tracking-tight text-slate-400">
          Personalized Preparation
        </h4>

        {/* MENU ITEMS */}
        <div className="flex flex-col gap-1 px-4">
           {[{ label: "My Profile", href: "/profile", icon: User }, ...mainItems].map((item: any) => {
              const isActive = pathname === item.href;
              return (
                 <Link key={item.label} href={item.href} onClick={onClose} className={cn(
                   "w-full h-14 px-6 flex items-center gap-4 rounded-2xl transition-all duration-200 group active:scale-[0.98]",
                   isActive ? "bg-blue-50 text-[#2563EB] shadow-sm" : "text-slate-600 hover:bg-slate-50"
                 )}>
                   <item.icon className={cn("w-6 h-6 shrink-0 transition-colors", isActive ? "text-[#2563EB]" : "text-slate-500 group-hover:text-[#2563EB]")} />
                   <span className={cn("font-semibold text-sm tracking-tight", isActive ? "text-[#2563EB]" : "text-slate-700")}>{item.label}</span>
                 </Link>
              )
           })}
        </div>

        {/* RESOLUTION HUB */}
        <h4 className="px-6 mt-8 mb-4 text-xs font-bold tracking-tight text-slate-400">
          Support Hub
        </h4>
        <div className="flex flex-col gap-1 px-4">
           {supportItems.map((item: any) => (
              <Link key={item.label} href={item.href} onClick={onClose} className="w-full h-14 px-6 flex items-center gap-4 rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98] text-slate-600">
                <item.icon className="w-6 h-6 text-slate-500" />
                <span className="font-semibold text-sm tracking-tight text-slate-700">{item.label}</span>
              </Link>
           ))}
        </div>
      </div>

      {/* 3. SYSTEM FOOTER */}
      <div className="p-4 border-t border-slate-100 bg-white mt-auto pb-[env(safe-area-inset-bottom)]">
         <button 
           onClick={handleLogout} 
           className="h-14 w-full rounded-2xl bg-slate-900 text-white hover:bg-black transition-all font-bold text-sm active:scale-95 shadow-xl flex items-center justify-center gap-3"
         >
           <LogOut className="w-5 h-5 text-blue-600" />
           <span>Log Out Session</span>
         </button>
      </div>
    </div>
  );
}
