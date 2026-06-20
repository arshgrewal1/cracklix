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

/**
 * @fileOverview Mobile Sidebar Overhaul v40.0.
 * BRAND SYSTEM: Maximized Logo (60px) within 72px normalized header area.
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
    { label: "My Hub", href: "/my-exams", icon: Target },
    { label: "Exam List", href: "/exams", icon: Landmark },
    { label: "Practice", href: "/mocks", icon: Zap },
    { label: "Current Affairs", href: "/current-affairs", icon: Newspaper },
    { label: "Study Notes", href: "/notes", icon: BookOpen },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ];

  if (!mounted) return null;

  return (
    <div className="flex h-full flex-col bg-white font-body overflow-hidden text-left">

      <div className="h-[72px] px-4 shrink-0 bg-white border-b border-slate-50 flex items-center justify-between">
         <Logo
           variant="light"
           align="left"
           imgClassName="h-[60px]"
           onClick={onClose}
         />
         <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 active:scale-95 transition-all border border-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">

        <div className="px-3 py-4">
          <Link
            href="/profile"
            onClick={onClose}
            className="block active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4 rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm hover:border-primary/20 transition-all">
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
                <h3 className="text-sm font-black text-slate-900 tracking-tight truncate">
                  {profile?.name || user?.displayName || "Aspirant"}
                </h3>
                <p className="mt-0.5 text-[8px] text-slate-400 font-bold tracking-widest uppercase">
                  Manage Account
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
            </div>
          </Link>
        </div>

        <div className="px-2">
          <p className="mb-2 px-6 text-[10px] font-bold text-slate-400 tracking-wide uppercase">
            Library
          </p>

          <div className="space-y-0.5">
            {mainItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex h-10 items-center gap-4 rounded-xl px-6 transition-all active:scale-[0.98]",
                    isActive
                      ? "bg-blue-50 text-primary shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive
                        ? "text-primary"
                        : "text-slate-400"
                    )}
                  />

                  <span className="font-bold text-[13px] tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="px-4 py-4">
           <div className="bg-[#0B1528] rounded-[1.8rem] p-4 space-y-3 border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Award className="h-12 w-12" /></div>
              <div className="relative z-10 text-left">
                <h4 className="text-[10px] font-black text-white tracking-widest leading-none mb-1 uppercase">Elite Network</h4>
              </div>
              <ShareButton 
                variant="dark" 
                className="w-full h-11 rounded-xl bg-primary hover:bg-blue-600 text-white text-[10px] border-none shadow-lg relative z-10" 
              />
           </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shrink-0">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="
            w-full
            h-14 sm:h-16
            justify-start
            text-red-500
            text-lg sm:text-xl
            font-black
            rounded-2xl
            hover:bg-red-50
            hover:text-red-600
            transition-all
            active:scale-95
          "
        >
          <LogOut className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
