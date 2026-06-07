'use client';

import { 
  Home, 
  Zap, 
  FileText, 
  Target, 
  Library, 
  MessageCircleQuestion, 
  ChevronRight,
  LogOut,
  ShieldCheck,
  User,
  Gem,
  Share2,
  MessageCircle,
  Mail,
  MessageSquare,
  X,
  Shield,
  Sparkles,
  Newspaper
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import StudentAvatar from "@/components/brand/StudentAvatar";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Institutional Sidebar.
 * FIXED: Hydration mismatch and standard Current Affairs icon usage.
 */

export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const { profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
    router.push('/');
  };

  const shareText = "Prepare for Punjab Government Exams with Cracklix. Join 15,000+ students today!";
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cracklix.com';

  const shareOptions = [
    { 
      label: "WhatsApp", 
      icon: <MessageCircle className="h-5 w-5" />, 
      color: "bg-emerald-500", 
      href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}` 
    },
    { 
      label: "SMS", 
      icon: <MessageSquare className="h-5 w-5" />, 
      color: "bg-blue-500", 
      href: `sms:?body=${encodeURIComponent(shareText + " " + shareUrl)}` 
    },
    { 
      label: "Gmail", 
      icon: <Mail className="h-5 w-5" />, 
      color: "bg-rose-500", 
      href: `mailto:?subject=${encodeURIComponent("Cracklix - Punjab Exam Hub")}&body=${encodeURIComponent(shareText + " " + shareUrl)}` 
    },
  ];

  const menuItems = [
    { label: "My Exam Dashboard", href: "/my-exams", icon: Target },
    { label: "Home Page", href: "/", icon: Home },
    { label: "Elite Pass Hub", href: "/pass", icon: Gem, badge: "ACTIVATE" },
    { label: "Practice Tests", href: "/mocks", icon: Zap },
    { label: "Current Affairs Hub", href: "/current-affairs", icon: Newspaper },
    { label: "Share Cracklix", icon: Share2, onClick: () => setIsShareOpen(true) },
    { label: "Help & Support", href: "/contact", icon: MessageCircleQuestion },
  ];

  return (
    <>
      <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-y-auto no-scrollbar font-body w-full select-none">
        
        {/* 1. PROFILE SECTION */}
        <div className="bg-[#0B1528] px-6 pt-24 pb-10 flex flex-col gap-6 relative overflow-hidden border-b border-white/5 shrink-0">
          <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck className="h-40 w-40" /></div>
          
          <div className="flex items-center gap-5 relative z-10">
             <div className="relative group shrink-0">
                <StudentAvatar 
                  profile={profile} 
                  className="h-16 w-16 rounded-[1.2rem] border-4 border-white/10 shadow-2xl relative bg-[#0F172A]" 
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-6 w-6 rounded-lg border-4 border-[#0B1528] flex items-center justify-center shadow-xl">
                   <ShieldCheck className="h-3.5 w-3.5 text-white" />
                </div>
             </div>
             
             <div className="flex-1 min-w-0 text-left">
                <h2 className="text-lg font-black text-white leading-tight mb-1 uppercase tracking-tight break-words max-w-full">
                   {profile?.name || "Student"}
                </h2>
                <div className="flex items-center gap-2">
                   <span className="bg-primary text-white border-none px-2 py-0.5 rounded-md font-black uppercase text-[7px] tracking-widest shadow-lg">
                      {(profile?.status || 'Free').toUpperCase()} PASS
                   </span>
                </div>
             </div>
          </div>

          <Link 
            href="/profile" 
            onClick={onClose}
            className="flex items-center justify-between w-full p-3.5 bg-white/5 border border-white/10 rounded-xl group hover:bg-white/10 transition-all relative z-10"
          >
            <div className="flex items-center gap-3">
               <User className="h-4 w-4 text-primary" />
               <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">View My Profile</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-primary transition-all" />
          </Link>
        </div>

        {/* 2. MENU ITEMS */}
        <div className="flex flex-col py-6">
          {menuItems.map((item) => {
            const isActive = mounted && pathname === item.href;
            
            const content = (
              <>
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
              </>
            );

            if (item.onClick) {
              return (
                <button 
                  key={item.label}
                  onClick={() => { item.onClick!(); }}
                  className="flex items-center justify-between px-6 h-[46px] transition-all group border-l-4 border-transparent hover:bg-white/5"
                >
                  {content}
                </button>
              )
            }

            return (
              <Link 
                key={item.label}
                href={item.href || '#'}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-6 h-[46px] transition-all group border-l-4",
                  isActive ? "bg-primary/10 border-primary" : "hover:bg-white/5 border-transparent"
                )}
              >
                {content}
              </Link>
            )
          })}

          <div className="my-6 border-t border-white/5 mx-6" />
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-5 px-6 h-[46px] text-rose-500 hover:bg-rose-500/5 transition-all w-full text-left group"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="text-[14px] font-black uppercase tracking-tight">Logout</span>
          </button>
        </div>

        {/* 3. FOOTER */}
        <div className="mt-auto px-6 py-12 flex flex-col items-center gap-2 bg-black/20 border-t border-white/5 shrink-0">
           <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Punjab Hub</p>
           </div>
           <p className="text-[10px] font-black text-primary uppercase tracking-widest text-center">
              Developed by Arsh Grewal
           </p>
           <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">Cracklix Technologies © 2026</p>
        </div>
      </div>

      {/* SHARE HUB DIALOG */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
         <DialogContent className="bg-[#0F172A] text-white border-white/10 rounded-[2.5rem] max-w-[340px] p-0 overflow-hidden shadow-5xl">
            <div className="h-1.5 w-full bg-primary" />
            <DialogHeader className="p-8 pb-4 text-center relative">
               <DialogTitle className="text-xl font-headline font-black uppercase tracking-tight">Share Cracklix</DialogTitle>
               <button onClick={() => setIsShareOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </DialogHeader>
            <div className="p-8 pt-0 grid grid-cols-3 gap-4">
               {shareOptions.map((opt) => (
                  <a 
                    key={opt.label} 
                    href={opt.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => {
                       setIsShareOpen(false);
                       onClose();
                    }}
                    className="flex flex-col items-center gap-3 group"
                  >
                     <div className={cn(
                       "h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-active:scale-90",
                       opt.color
                     )}>
                        {opt.icon}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{opt.label}</span>
                  </a>
               ))}
            </div>
            <div className="p-8 pt-0">
               <Button 
                 variant="outline" 
                 className="w-full border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white rounded-xl h-12 font-black uppercase text-[10px] tracking-[0.2em]"
                 onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                    toast({ title: "Link Copied", description: "Website link saved to clipboard." });
                    setIsShareOpen(false);
                    onClose();
                 }}
               >
                  Copy URL
               </Button>
            </div>
         </DialogContent>
      </Dialog>
    </>
  );
}
