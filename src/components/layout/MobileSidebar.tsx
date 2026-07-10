'use client';

import React, { useState, useEffect } from "react";
import {
  Home,
  Zap,
  Target,
  ChevronRight,
  LogOut,
  Newspaper,
  Trophy,
  Landmark,
  BookOpen,
  X,
  Award
} from "lucide-react";

import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import StudentAvatar from "@/components/brand/StudentAvatar";
import Logo from "@/components/brand/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import ShareButton from "@/components/navigation/ShareButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PWAInstallButton from "@/components/PWAInstallButton";

/**
 * @fileOverview Mobile Sidebar v56.2.
 * FIXED: Added missing Badge import.
 */
export default function MobileSidebar({
  onClose,
}: {
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  const { user, profile, profileLoading } = useUser();
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
      router.push("/");
    } catch (error) {
      console.error('[MOBILE_SIDEBAR_LOGOUT_FAILURE]:', error);
    }
  };

  const mainItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "My Exam Hub", href: "/my-exams", icon: Target },
    { label: "Exam Explorer", href: "/exams", icon: Landmark },
    { label: "Practice Tests", href: "/mocks", icon: Zap },
    { label: "Current Affairs", href: "/current-affairs", icon: Newspaper },
    { label: "Study Material", href: "/notes", icon: BookOpen },
    { label: "Hall of Rankers", href: "/leaderboard", icon: Trophy },
  ];

  if (!mounted) return null;

  return (
    <div className="flex h-full flex-col bg-white font-body overflow-hidden text-left">

      {/* HEADER: FIXED CLOSE BUTTON VISIBILITY */}
      <div className="h-[80px] md:h-[112px] px-6 shrink-0 bg-white border-b border-slate-50 flex items-center justify-between">
         <Logo
           variant="light"
           align="left"
           className="h-12 md:h-16 w-auto flex-1"
           imgClassName="h-full w-auto"
           onClick={onClose}
         />
         <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 active:scale-95 transition-all border border-slate-100 ml-4"
          >
            <X className="h-6 w-6" />
          </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* USER PROFILE CARD */}
        <div className="px-2 py-4">
          <Link
            href="/profile"
            onClick={onClose}
            className="block active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-primary/20 transition-all">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                {profileLoading ? (
                  <Skeleton className="h-full w-full rounded-xl" />
                ) : (
                  <StudentAvatar
                    profile={profile}
                    className="h-full w-full border-none"
                    iconClassName="w-6 h-6"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-slate-900 tracking-tight truncate leading-none">
                  {profile?.name || user?.displayName || "Aspirant"}
                </h3>
                <p className="mt-1.5 text-[8px] text-slate-400 font-bold tracking-widest uppercase">
                  Account Hub
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
            </div>
          </Link>
        </div>

        {/* NAVIGATION LIST */}
        <div className="px-2">
          <p className="mb-2 px-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">
            Discovery Hub
          </p>

          <div className="space-y-1">
            {mainItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex h-12 items-center gap-4 rounded-xl px-4 transition-all active:scale-[0.98]",
                    isActive
                      ? "bg-blue-50 text-primary shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive
                        ? "text-primary"
                        : "text-slate-400"
                    )}
                  />

                  <span className="font-bold text-[14px] tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
            
            {/* DIRECT INSTALL LINK */}
            <Link
               href="/install"
               onClick={onClose}
               className={cn(
                 "flex h-12 items-center gap-4 rounded-xl px-4 transition-all bg-primary/5 text-primary border border-primary/10 mt-2"
               )}
            >
               <Award className="h-5 w-5 shrink-0" />
               <span className="font-bold text-[14px] tracking-tight">Install Official App</span>
               <Badge className="ml-auto bg-primary text-white text-[8px] font-black uppercase">Direct</Badge>
            </Link>
          </div>
        </div>

        {/* SHARE APP PROMO */}
        <div className="px-2 py-6">
           <div className="bg-[#0B1528] rounded-[1.5rem] p-4 space-y-3 border border-white/5 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Award className="h-12 w-12" /></div>
              <div className="relative z-10 text-left">
                <h4 className="text-[10px] font-black text-white tracking-widest uppercase">Spread the Word</h4>
              </div>
              <ShareButton 
                variant="dark" 
                className="w-full h-10 rounded-xl bg-primary hover:bg-blue-600 text-white text-[10px] border-none shadow-lg relative z-10" 
              />
              <PWAInstallButton variant="primary" />
           </div>
        </div>
      </div>

      {/* FOOTER: SIGNOUT */}
      <div className="border-t border-slate-100 bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shrink-0">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full h-14 justify-start text-red-500 text-sm font-black rounded-2xl hover:bg-red-50 transition-all active:scale-95"
        >
          <LogOut className="h-5 w-5 mr-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
