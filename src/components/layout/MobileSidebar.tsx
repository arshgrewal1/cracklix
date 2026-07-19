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
  Award,
  CreditCard,
  ShieldCheck
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

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Mobile Sidebar v83.0.
 * UPDATED: Reduced logo size (h-14 to h-24) for a cleaner onboarding experience.
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

  const isAdmin = React.useMemo(() => {
    if (!user || !profile) return false;
    const userEmail = user?.email?.toLowerCase();
    const isFounder = userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail);
    return profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;
  }, [user, profile]);

  const mainItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "My Exam Center", href: "/my-exams", icon: Target },
    { label: "My Purchases", href: "/my-purchases", icon: CreditCard },
    { label: "Exam Explorer", href: "/exams", icon: Landmark },
    { label: "Practice Tests", href: "/mocks", icon: Zap },
    { label: "Current Affairs", href: "/current-affairs", icon: Newspaper },
    { label: "Study Material", href: "/notes", icon: BookOpen },
    { label: "Hall of Rankers", href: "/leaderboard", icon: Trophy },
  ];

  if (!mounted) return null;

  return (
    <div className="flex h-full flex-col bg-white font-body overflow-hidden text-left">

      {/* HEADER: Centered Logo + Absolute Close Button */}
      <div className="h-[120px] md:h-[150px] px-6 shrink-0 bg-white border-b border-slate-50 flex items-center justify-center relative">
         <Logo
           variant="light"
           align="center"
           className="flex-shrink-0"
           imgClassName="h-14 md:h-24 w-auto"
           onClick={onClose}
         />
         <button
            onClick={onClose}
            className="absolute right-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 active:scale-95 transition-all border border-slate-100 cursor-pointer z-20"
          >
            <X className="h-6 w-6" />
          </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* USER PROFILE CARD */}
        <div className="px-3 py-4">
          <Link
            href="/profile"
            onClick={onClose}
            className="block active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-primary/20 transition-all">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
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

              <div className="min-w-0 flex-1 text-left">
                <h3 className="text-base font-black text-slate-900 tracking-tight truncate leading-none">
                  {profile?.name || user?.displayName || "Aspirant"}
                </h3>
                <p className="mt-1.5 text-[9px] text-slate-400 font-bold tracking-widest uppercase">
                  Account Center
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
            </div>
          </Link>
        </div>

        {/* NAVIGATION LIST */}
        <div className="px-3">
          <p className="mb-2 px-4 text-[10px] font-black text-slate-400 tracking-widest uppercase text-left">
            Explore
          </p>

          <div className="space-y-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex h-14 items-center gap-4 rounded-xl px-4 transition-all active:scale-[0.98] bg-[#0F172A] text-white shadow-lg mb-2 cursor-pointer border-none"
              >
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                <span className="font-bold text-[15px] tracking-tight">Admin Console</span>
                <ChevronRight className="ml-auto h-4 w-4 opacity-30" />
              </Link>
            )}

            {mainItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex h-14 items-center gap-4 rounded-xl px-4 transition-all active:scale-[0.98] cursor-pointer border border-transparent",
                    isActive
                      ? "bg-blue-50 text-primary border-blue-100 shadow-sm"
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

                  <span className="font-bold text-[15px] tracking-tight flex-1 text-left">
                    {item.label}
                  </span>
                  
                  {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* SHARE APP PROMO */}
        <div className="px-3 py-6">
           <div className="bg-[#0B1528] rounded-[2rem] p-6 space-y-4 border border-white/5 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Award className="h-16 w-16" /></div>
              <div className="relative z-10 text-left">
                <h4 className="text-[10px] font-black text-white tracking-[0.3em] uppercase">Community</h4>
                <p className="text-[14px] font-bold text-slate-400 mt-2">Help others prepare smarter.</p>
              </div>
              <ShareButton 
                variant="dark" 
                className="w-full h-14 rounded-xl bg-primary hover:bg-blue-700 text-white text-[10px] border-none shadow-lg relative z-10" 
              />
           </div>
        </div>
      </div>

      {/* FOOTER: SIGNOUT */}
      <div className="border-t border-slate-100 bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shrink-0">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full h-14 justify-start text-red-500 text-sm font-black rounded-2xl hover:bg-red-50 transition-all active:scale-95 cursor-pointer border-none"
        >
          <LogOut className="h-5 w-5 mr-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
