
'use client';

import React, { useState, useEffect } from "react";
import { 
  Home, 
  Zap, 
  FileText, 
  Target, 
  ChevronRight,
  LogOut,
  ShieldCheck,
  Gem,
  Newspaper,
  User,
  Trophy,
  Landmark,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Instagram,
  Settings
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/brand/Logo";
import StudentAvatar from "@/components/brand/StudentAvatar";
import { TELEGRAM_GROUP, INSTAGRAM_PROFILE } from "@/lib/constants";

/**
 * @fileOverview Premium Blue Sidebar Hub v4.0.
 * UPDATED: Integrated Support, Help, and Social Links.
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
    await signOut(auth);
    onClose();
    router.push('/');
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
    <div className="flex flex-col h-full bg-white border-r border-slate-200 font-body select-none text-left">
      
      <div className="h-24 px-6 flex items-center shrink-0">
         <Logo imgClassName="h-12 w-auto" />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        <div className="px-6 mb-8">
           <div className="bg-blue-50 border border-blue-100 rounded-[1.5rem] p-4 flex items-center gap-4">
              <StudentAvatar profile={profile} className="h-12 w-12 rounded-2xl border-2 border-white shadow-md bg-white" />
              <div className="min-w-0 flex-1">
                 <h2 className="text-sm font-bold text-slate-900 truncate">{profile?.name || "Aspirant"}</h2>
                 <Badge className="bg-white text-blue-600 border-blue-100 text-[10px] font-semibold px-2 py-0 h-5 rounded-lg shadow-sm">
                    {profile?.pass?.active ? (profile.pass.plan || 'Premium') : 'Free Pass'}
                 </Badge>
              </div>
           </div>
        </div>

        <NavGroup label="Personal Prep" items={[{ label: "My Profile", href: "/profile", icon: User }]} pathname={pathname} onClose={onClose} />
        <NavGroup label="Management Center" items={mainItems} pathname={pathname} onClose={onClose} />
        <NavGroup label="Support & Help" items={supportItems} pathname={pathname} onClose={onClose} />

        <div className="px-8 mb-3">
           <p className="text-[11px] uppercase font-bold tracking-widest text-slate-400">Community</p>
        </div>
        <div className="px-4 mb-8 space-y-1">
           <a href={TELEGRAM_GROUP} target="_blank" className="h-12 flex items-center gap-3 px-4 rounded-2xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
              <MessageCircle className="h-5 w-5 text-slate-400" />
              <span className="text-[15px] font-semibold">Telegram Group</span>
           </a>
           <a href={INSTAGRAM_PROFILE} target="_blank" className="h-12 flex items-center gap-3 px-4 rounded-2xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all">
              <Instagram className="h-5 w-5 text-slate-400" />
              <span className="text-[15px] font-semibold">Instagram</span>
           </a>
        </div>
      </div>

      <div className="p-6 border-t border-slate-200 bg-white mt-auto pb-safe">
         <button onClick={handleLogout} className="h-12 w-full flex items-center gap-3 px-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-semibold active:scale-95">
           <LogOut className="h-5 w-5" />
           <span className="text-[15px]">Log Out Session</span>
         </button>
      </div>
    </div>
  );
}

function NavGroup({ label, items, pathname, onClose }: any) {
   return (
      <>
         <div className="px-8 mb-3 mt-4">
            <p className="text-[11px] uppercase font-bold tracking-widest text-slate-400">{label}</p>
         </div>
         <div className="flex flex-col gap-1 px-4 mb-4">
            {items.map((item: any) => (
               <Link key={item.label} href={item.href} onClick={onClose} className={cn(
                  "h-12 flex items-center gap-3 px-4 rounded-2xl transition-all duration-200 group",
                  pathname === item.href ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
               )}>
                  <item.icon className={cn("h-5 w-5 shrink-0", pathname === item.href ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                  <span className="text-[15px] font-semibold">{item.label}</span>
               </Link>
            ))}
         </div>
      </>
   )
}
