'use client';

import React, { useState, useEffect } from "react";
import {
  Home,
  Zap,
  Target,
  ChevronRight,
  LogOut,
  Newspaper,
  User,
  Trophy,
  Landmark,
  BookOpen,
  HelpCircle,
  MessageCircle,
  X,
} from "lucide-react";

import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import StudentAvatar from "@/components/brand/StudentAvatar";
import Logo from "@/components/brand/Logo";

/**
 * @fileOverview Mobile Sidebar Realignment v13.0.
 * REALIGNED: Match the new 150px header height and standard alignment.
 */
export default function MobileSidebar({
  onClose,
}: {
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  const { profile } = useUser();
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
      console.error(error);
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

  const supportItems = [
    {
      label: "Support Center",
      href: "/support",
      icon: MessageCircle,
    },
    {
      label: "Help Center",
      href: "/help",
      icon: HelpCircle,
    },
  ];

  if (!mounted) return null;

  return (
    <div className="flex h-full flex-col bg-white font-body">

      {/* HEADER: Symmetric gap, 150px height */}
      <div className="flex h-[150px] items-center justify-between border-b px-4 shrink-0 gap-4">
        <Logo
          variant="light"
          href="/"
          onClick={onClose}
          className="shrink-0 -ml-8"
        />

        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-700 active:scale-95 transition-all shrink-0"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar">

        {/* PROFILE CARD */}
        <div className="p-6">
          <Link
            href="/profile"
            onClick={onClose}
            className="block active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                <StudentAvatar
                  profile={profile}
                  className="h-full w-full border-none"
                  iconClassName="w-7 h-7"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-bold text-slate-900">
                  {profile?.name || "Aspirant"}
                </h3>
                <p className="mt-0.5 text-sm text-slate-400">
                  Manage preparation
                </p>
              </div>

              <ChevronRight className="h-6 w-6 shrink-0 text-slate-300" />
            </div>
          </Link>
        </div>

        {/* MAIN MENU */}
        <div className="px-4 pb-2">
          <p className="mb-4 px-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
            Preparation Hub
          </p>

          <div className="space-y-1">
            {[
              {
                label: "My Profile",
                href: "/profile",
                icon: User,
              },
              ...mainItems,
            ].map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex h-16 items-center gap-5 rounded-2xl px-6 transition-all active:scale-[0.98]",
                    isActive
                      ? "bg-blue-50 text-primary shadow-sm"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-6 w-6 shrink-0",
                      isActive
                        ? "text-primary"
                        : "text-slate-400"
                    )}
                  />

                  <span className="font-bold text-base">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* SUPPORT */}
        <div className="px-4 pb-8 mt-6">
          <p className="mb-4 px-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
            Institutional Support
          </p>

          <div className="space-y-1">
            {supportItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex h-16 items-center gap-5 rounded-2xl px-6 text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
              >
                <item.icon className="h-6 w-6 shrink-0 text-slate-400" />
                <span className="font-bold text-base">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-slate-100 bg-white p-6 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={handleLogout}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 text-base font-bold text-white shadow-xl transition-all active:scale-95"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
