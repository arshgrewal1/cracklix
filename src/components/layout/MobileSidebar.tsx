
'use client';

import { 
  Home, 
  Zap, 
  FileText, 
  BookOpen, 
  Gem, 
  Book, 
  Target, 
  Library, 
  MessageCircleQuestion, 
  Newspaper, 
  ChevronRight,
  LogOut,
  Sparkles,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";

/**
 * @fileOverview High-Fidelity Fully Scrollable Mobile Sidebar v8.0.
 * MATCHED: Strictly aligns with screenshot (Initials box, Verified mark).
 * REFINED: Entire container is now scrollable to prevent header/footer clipping.
 */

export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const { profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const menuItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Pass", href: "/pass", icon: Gem, badge: "Renew Now" },
    { label: "Previous Year Papers", href: "/pyqs", icon: FileText },
    { label: "Test Series", href: "/mocks", icon: BookOpen },
    { label: "Study Notes", href: "/notes", icon: Library },
    { label: "Super Pass", href: "/pass", icon: Gem },
    { label: "Books", href: "/notes", icon: Book },
    { label: "Your Exams", href: "/my-exams", icon: Target },
    { label: "Library", href: "/notes", icon: Library },
    { label: "Doubts", href: "/contact", icon: MessageCircleQuestion, action: "Ask a Doubt" },
    { label: "Daily Current Affairs", href: "/current-affairs", icon: Newspaper },
  ];

  return (
    <div className="flex flex-col h-full bg-white text-[#0F172A] overflow-y-auto no-scrollbar font-body w-full select-none">
      
      {/* 1. PROFILE HEADER: Now scrolls with content */}
      <div className="px-6 pt-12 pb-8 flex items-start gap-5 border-b border-slate-50">
        <div className="h-20 w-20 rounded-[1.5rem] bg-black flex items-center justify-center shrink-0 shadow-2xl">
           <span className="text-white text-3xl font-black tracking-tighter">
              {profile?.name ? getInitials(profile.name) : 'AG'}
           </span>
        </div>
        
        <div className="flex-1 min-w-0 pt-1 text-left">
           <h2 className="text-2xl font-black text-[#0F172A] leading-none mb-2 uppercase tracking-tight truncate">
              {profile?.name || "Arsh Grewal"}
           </h2>
           <div className="space-y-1 mb-4">
              <p className="text-[12px] font-medium text-slate-500 truncate">{profile?.email || "arshgrewal@cracklix.com"}</p>
              <div className="flex items-center gap-2">
                 <p className="text-[12px] font-medium text-slate-500">{profile?.phone || "+91 98881 88602"}</p>
                 <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 fill-current" />
              </div>
           </div>
           <Link 
             href="/profile" 
             onClick={onClose}
             className="text-blue-500 font-bold text-sm hover:underline uppercase tracking-widest text-[10px]"
           >
             View Profile
           </Link>
        </div>
      </div>

      {/* 2. MENU REGISTRY */}
      <div className="flex flex-col py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-6 h-[52px] transition-all group",
                isActive ? "bg-[#EEF4FF]" : "hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-5">
                 <item.icon className={cn(
                   "h-5 w-5 shrink-0",
                   isActive ? "text-[#0F172A]" : "text-slate-700"
                 )} strokeWidth={1.5} />
                 <span className={cn(
                   "text-[14px] font-medium tracking-tight",
                   isActive ? "font-bold text-[#0F172A]" : "text-slate-800"
                 )}>
                   {item.label}
                 </span>
              </div>

              {item.badge && (
                <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  {item.badge}
                </span>
              )}

              {item.action && (
                <div className="bg-[#1E5EFF] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg active:scale-95 transition-all">
                   <span className="text-[9px] font-black uppercase tracking-tight">{item.action}</span>
                   <Sparkles className="h-3 w-3 fill-current" />
                </div>
              )}
            </Link>
          )
        })}

        <div className="my-4 border-t border-slate-50 mx-6" />
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-5 px-6 h-[52px] text-rose-500 hover:bg-rose-50 transition-all w-full text-left"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
          <span className="text-[14px] font-bold uppercase tracking-tight">Logout Registry</span>
        </button>
      </div>

      {/* 3. FOOTER SIGNATURE: Scrolls at the bottom */}
      <div className="mt-auto px-6 py-10 flex flex-col items-center gap-1 bg-slate-50/30 border-t border-slate-50">
         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Cracklix Technologies</p>
         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Developed by Arsh Grewal</p>
      </div>
    </div>
  );
}
