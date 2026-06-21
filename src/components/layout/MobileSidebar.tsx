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
import PWAInstallButton from "@/components/PWAInstallButton";

/**
 * @fileOverview Mobile Sidebar v45.0 (High Density).
 * TYPOGRAPHY: Convert headings to proper Title Case.
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

      <div className="h-[64px] px-3 shrink-0 bg-white border-b border-slate-50 flex items-center justify-between">
         <Logo
           variant="light"
           align="left"
           imgClassName="h-[54px]"
           onClick={onClose}
         />
         <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 active:scale-95 transition-all border border-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">

        <div className="px-2 py-3">
          <Link
            href="/profile"
            onClick={onClose}
            className="block active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm hover:border-primary/20 transition-all">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                {profileLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : (
                  <StudentAvatar
                    profile={profile}
                    className="h-full w-full border-none"
                    iconClassName="w-5 h-5"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-black text-slate-900 tracking-tight truncate leading-none">
                  {profile?.name || user?.displayName || "Aspirant"}
                </h3>
                <p className="mt-1 text-[7px] text-slate-400 font-bold tracking-widest uppercase">
                  Account Hub
                </p>
              </div>

              <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
            </div>
          </Link>
        </div>

        <div className="px-2 mb-4">
           <PWAInstallButton 
             variant="dark"
             className="w-full h-10 rounded-lg"
           />
        </div>

        <div className="px-2">
          <p className="mb-1.5 px-4 text-[9px] font-black text-slate-400 tracking-widest uppercase">
            Discovery Hub
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
                    "flex h-9 items-center gap-3 rounded-lg px-4 transition-all active:scale-[0.98]",
                    isActive
                      ? "bg-blue-50 text-primary shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isActive
                        ? "text-primary"
                        : "text-slate-400"
                    )}
                  />

                  <span className="font-bold text-[12px] tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="px-2 py-4">
           <div className="bg-[#0B1528] rounded-[1.25rem] p-3 space-y-2 border border-white/5 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Award className="h-10 w-10" /></div>
              <div className="relative z-10 text-left">
                <h4 className="text-[9px] font-black text-white tracking-widest uppercase">Spread the Word</h4>
              </div>
              <ShareButton 
                variant="dark" 
                className="w-full h-9 rounded-lg bg-primary hover:bg-blue-600 text-white text-[9px] border-none shadow-lg relative z-10" 
              />
           </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shrink-0">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full h-12 justify-start text-red-500 text-sm font-black rounded-xl hover:bg-red-50 transition-all active:scale-95"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
