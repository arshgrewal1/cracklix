'use client';

import { 
  FileText, 
  CalendarDays, 
  Bell, 
  Phone, 
  ChevronRight, 
  Gem,
  Zap,
  BarChart3,
  Home,
  LogOut,
  Target,
  User as UserIcon,
  X,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import StudentAvatar from "@/components/brand/StudentAvatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import ShareButton from "@/components/navigation/ShareButton";

/**
 * @fileOverview Professional Exam-Platform Mobile Sidebar v5.0.
 * Optimized: 290px Width, 46px Menu Heights, 14px Padding, 14px Font Size.
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

  const navItems = [
    { label: "My Exams", href: "/my-exams", icon: Target, isPriority: true },
    { label: "Home", href: "/", icon: Home },
    { label: "Mock Tests", href: "/mocks", icon: Zap },
    { label: "Performance", href: "/dashboard", icon: BarChart3 },
    { label: "Exam Calendar", href: "/exam-calendar", icon: CalendarDays },
    { label: "Study Notes", href: "/notes", icon: FileText },
    { label: "Pass Hub", href: "/pass", icon: Gem },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Help & Support", href: "/contact", icon: Phone },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-white overflow-hidden font-body w-[290px] border-r border-white/5 select-none">
      {/* STICKY PROFILE HEADER */}
      <div className="shrink-0 bg-[#0B1528] px-[14px] pt-12 pb-6 relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-4 relative z-10">
          <div className="relative w-fit">
            <StudentAvatar 
              profile={profile} 
              className="h-16 w-16 border-[3px] border-white/10 rounded-[18px] shadow-2xl bg-[#0F172A]" 
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-6 w-6 rounded-lg border-[3px] border-[#0B1528] flex items-center justify-center shadow-xl">
               <ShieldCheck className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          
          <div className="space-y-1.5 text-left">
            <h2 className="font-headline font-black text-xl text-white uppercase tracking-tight truncate leading-tight">
              {profile?.name || "Student Hub"}
            </h2>
            <div className="flex items-center gap-2">
               <Badge className="bg-primary hover:bg-primary text-white border-none text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg tracking-widest">
                  {(profile?.status || 'Free').toUpperCase()} PASS
               </Badge>
               <Link href="/profile" onClick={onClose} className="text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-1">
                  Profile <ChevronRight className="h-3 w-3" />
               </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SMOOTH SCROLLING MENU */}
      <ScrollArea className="flex-1">
        <div className="p-[14px] space-y-1">
          {navItems.map((item) => (
            <MenuLink 
              key={item.href} 
              item={item} 
              active={pathname === item.href}
              onClick={onClose} 
            />
          ))}

          <div className="my-4 border-t border-white/5 mx-2" />
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-[14px] px-[14px] h-[46px] text-rose-500 hover:bg-rose-500/10 transition-all rounded-[10px] group"
          >
            <LogOut className="h-5 w-5 shrink-0 transition-transform group-active:scale-90" />
            <span className="text-[14px] font-[900] uppercase tracking-tight">Logout</span>
          </button>
        </div>

        <div className="px-[14px] pb-10 mt-2">
           <ShareButton 
             className="w-full h-[46px] bg-white/5 border border-white/10 shadow-none text-slate-400 hover:bg-primary hover:text-white rounded-[10px] font-black text-[11px] tracking-widest" 
             variant="ghost" 
           />
        </div>
      </ScrollArea>

      {/* FOOTER SIGNATURE */}
      <div className="px-[14px] py-6 border-t border-white/5 bg-black/20 flex flex-col items-center gap-1 shrink-0">
         <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
            <UserIcon className="h-3 w-3 text-primary/30" /> 
            ARSH GREWAL MANAGEMENT
         </div>
         <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">
            OFFICIAL PLATFORM 2026
         </p>
      </div>
    </div>
  );
}

function MenuLink({ item, active, onClick }: any) {
  return (
    <Link 
      href={item.href} 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-[14px] h-[46px] transition-all group w-full rounded-[10px]",
        active ? "bg-primary text-white shadow-xl shadow-primary/10" : "hover:bg-white/5 text-slate-400",
        item.isPriority && !active && "text-primary bg-primary/5 border border-primary/10"
      )}
    >
      <div className="flex items-center gap-[14px] min-w-0 flex-1">
        <item.icon className={cn(
          "h-5 w-5 shrink-0 transition-transform group-active:scale-90", 
          active ? "text-white" : item.isPriority ? "text-primary" : "text-slate-500 group-hover:text-primary"
        )} />
        <span className={cn(
          "text-[14px] font-[900] uppercase tracking-tight transition-colors truncate",
          active ? "text-white" : "group-hover:text-white"
        )}>
          {item.label}
        </span>
      </div>
      <ChevronRight className={cn(
        "h-4 w-4 transition-all shrink-0",
        active ? "opacity-100 text-white translate-x-1" : "opacity-0 group-hover:opacity-100 text-slate-700"
      )} />
    </Link>
  );
}
