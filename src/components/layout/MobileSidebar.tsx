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
  Newspaper,
  Award,
  FileStack,
  Download,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import StudentAvatar from "@/components/brand/StudentAvatar";
import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Institutional Mobile Sidebar v6.1.
 * UPDATED: Integrated Live Pass Status with Expiry.
 */

export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const { profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkInstall = () => {
      if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
        setCanInstall(true);
      }
    };

    window.addEventListener('pwa-installable', checkInstall);
    checkInstall();
    
    return () => window.removeEventListener('pwa-installable', checkInstall);
  }, []);

  const passStatus = useMemo(() => {
    if (!profile?.pass) return null;
    const active = profile.pass.active;
    const expiry = new Date(profile.pass.expiryDate);
    const isExpired = expiry < new Date();
    
    return {
      active: active && !isExpired,
      label: isExpired ? "PASS EXPIRED" : `ACTIVE PASS`,
      expiry: expiry.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  }, [profile]);

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
    router.push('/');
  };

  const handleInstallClick = async () => {
    const prompt = (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
        (window as any).deferredPrompt = null;
      }
      onClose();
    }
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
    { label: "Home Page", href: "/", icon: Home },
    { label: "Exam Hub", href: "/my-exams", icon: Target },
    { label: "Elite Pass", href: "/pass", icon: Gem, badge: "PRO" },
    { label: "Practice Tests", href: "/mocks", icon: Zap },
    { label: "Latest News", href: "/current-affairs", icon: Newspaper },
    { label: "Share App", icon: Share2, onClick: () => setIsShareOpen(true) },
    { label: "Contact Us", href: "/contact", icon: MessageCircleQuestion },
  ];

  return (
    <>
      <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-y-auto no-scrollbar font-body w-full select-none pointer-events-auto">
        
        {/* 1. PROFILE SECTION */}
        <div className="bg-[#0B1528] px-6 pt-16 pb-8 flex flex-col gap-6 relative overflow-hidden border-b border-white/5 shrink-0">
          <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck className="h-40 w-40" /></div>
          
          <div className="flex items-center gap-4 relative z-10">
             <div className="relative group shrink-0">
                <StudentAvatar 
                  profile={profile} 
                  className="h-14 w-14 rounded-2xl border-2 border-white/10 shadow-2xl relative bg-[#0F172A]" 
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-5 w-5 rounded-md border-2 border-[#0B1528] flex items-center justify-center shadow-xl">
                   <ShieldCheck className="h-3 w-3 text-white" />
                </div>
             </div>
             
             <div className="flex-1 min-w-0 text-left space-y-1">
                <h2 className="text-base font-black text-white leading-tight uppercase tracking-tight truncate">
                   {profile?.name || "Student"}
                </h2>
                {passStatus ? (
                   <div className="flex flex-col gap-1">
                      <Badge className={cn(
                        "border-none px-2 py-0.5 rounded-md font-black uppercase text-[7px] tracking-widest shadow-lg w-fit",
                        passStatus.active ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                      )}>
                         {passStatus.label}
                      </Badge>
                      <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">EXP: {passStatus.expiry}</p>
                   </div>
                ) : (
                   <Badge className="bg-white/10 text-slate-300 border-none px-2 py-0.5 rounded-md font-black uppercase text-[7px] tracking-widest shadow-lg w-fit">
                      FREE PASS
                   </Badge>
                )}
             </div>
          </div>

          <Link 
            href="/profile" 
            onClick={onClose}
            className="flex items-center justify-between w-full p-3 bg-white/5 border border-white/10 rounded-xl group hover:bg-white/10 transition-all relative z-10"
          >
            <div className="flex items-center gap-3">
               <User className="h-4 w-4 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Profile Settings</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-primary transition-all" />
          </Link>
        </div>

        {/* 2. MENU ITEMS */}
        <div className="flex flex-col py-4">
          {canInstall && (
             <button 
                onClick={handleInstallClick}
                className="flex items-center justify-between px-6 h-[58px] transition-all group border-l-4 border-emerald-500 bg-emerald-500/5 mb-1"
             >
                <div className="flex items-center gap-4">
                   <Download className="h-5 w-5 shrink-0 text-emerald-400" />
                   <span className="text-[13px] uppercase tracking-tight font-black text-white">Install App</span>
                </div>
                <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase">GET</Badge>
             </button>
          )}

          {menuItems.map((item) => {
            const isActive = mounted && pathname === item.href;
            
            const content = (
              <>
                <div className="flex items-center gap-4">
                   <item.icon className={cn(
                     "h-5 w-5 shrink-0 transition-all",
                     isActive ? "text-primary scale-110" : "text-slate-500"
                   )} />
                   <span className={cn(
                     "text-[13px] uppercase tracking-tight",
                     isActive ? "font-black text-white" : "font-bold text-slate-400 group-hover:text-white"
                   )}>
                     {item.label}
                   </span>
                </div>

                {item.badge && (
                  <span className="text-[8px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
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
                  className="flex items-center justify-between px-6 h-[54px] transition-all group border-l-4 border-transparent active:bg-white/5"
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
                  "flex items-center justify-between px-6 h-[54px] transition-all group border-l-4",
                  isActive ? "bg-primary/10 border-primary" : "hover:bg-white/5 border-transparent"
                )}
              >
                {content}
              </Link>
            )
          })}

          <div className="my-4 border-t border-white/5 mx-6" />
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 h-[54px] text-rose-500 active:bg-rose-500/5 transition-all w-full text-left"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="text-[13px] font-black uppercase tracking-tight">Logout</span>
          </button>
        </div>

        {/* 3. FOOTER */}
        <div className="mt-auto px-6 py-10 flex flex-col items-center gap-2 bg-black/20 border-t border-white/5 shrink-0">
           <p className="text-[9px] font-black text-primary uppercase tracking-widest text-center">
              Developed by Arsh Grewal
           </p>
           <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest leading-none">Cracklix Hub © 2026</p>
        </div>
      </div>

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
         <DialogContent className="bg-[#0F172A] text-white border-white/10 rounded-[2.5rem] max-w-[340px] p-0 overflow-hidden shadow-5xl z-[2100]">
            <div className="h-1 w-full bg-primary" />
            <DialogHeader className="p-8 pb-4 text-center relative">
               <DialogTitle className="text-lg font-headline font-black uppercase tracking-tight">Share App</DialogTitle>
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
                    className="flex flex-col items-center gap-2"
                  >
                     <div className={cn(
                       "h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-xl",
                       opt.color
                     )}>
                        {opt.icon}
                     </div>
                     <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{opt.label}</span>
                  </a>
               ))}
            </div>
         </DialogContent>
      </Dialog>
    </>
  );
}
