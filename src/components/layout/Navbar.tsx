
'use client';

import Link from "next/link";
import { Menu, X, User, LogOut, ShieldCheck, ChevronDown, Bell, LayoutDashboard, Search, Trophy, Bookmark, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useAuth, useDoc, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Refined Navbar with Phase 41 Announcement Bar integration.
 */

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const links = [
    { label: "Exams", href: "/exams" },
    { label: "Mocks", href: "/mocks" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Current Affairs", href: "/current-affairs" },
  ];

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';

  return (
    <div className="sticky top-0 z-[1000] w-full">
      {/* Phase 41: Shimmering Announcement Bar */}
      {settings?.showAnnouncement && (
        <div className="bg-primary text-white py-2.5 px-6 flex items-center justify-center gap-3 overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2.5s_infinite] pointer-events-none" />
          <Megaphone className="h-4 w-4 shrink-0 animate-bounce" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
            {settings.announcement}
          </p>
        </div>
      )}

      <nav className="w-full bg-[#0B1528] border-b border-white/5 py-4 shadow-2xl backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto max-w-[95%] lg:max-w-[90%] flex items-center justify-between px-4">
          <div className="flex items-center gap-12">
            <Logo variant="light" />

            <div className="hidden lg:flex items-center gap-[30px] text-[14px] font-bold uppercase tracking-widest text-[#7A8B9E]">
              {links.map(link => (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  className={`transition-colors hover:text-primary ${pathname === link.href ? 'text-white' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/search" className="text-slate-400 hover:text-white transition-colors p-2">
              <Search className="h-5 w-5" />
            </Link>

            {loading ? (
              <Skeleton className="h-10 w-24 rounded-lg bg-white/5" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 flex items-center gap-2 px-2 hover:bg-white/5 rounded-xl border border-white/5">
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} />
                        <AvatarFallback className="bg-primary/20 text-primary font-black text-xs">
                          {profile?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start leading-none text-left">
                        <p className="text-xs font-bold text-white truncate max-w-[100px]">{profile?.name || 'User'}</p>
                        <p className="text-[9px] text-[#7A8B9E] uppercase font-black tracking-widest mt-0.5">{profile?.status || 'Free'}</p>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-[#7A8B9E]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-[#0F172A] border-white/10 text-white rounded-[2rem] p-3 shadow-4xl" align="end">
                    <DropdownMenuLabel className="font-headline font-bold px-4 py-3 text-slate-400 text-[10px] uppercase tracking-widest">Account Hub</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5 mb-2" />
                    <DropdownNavItem href="/dashboard" icon={<LayoutDashboard />} label="Performance Engine" />
                    <DropdownNavItem href="/leaderboard" icon={<Trophy className="text-amber-500" />} label="Punjab Hall of Fame" />
                    <DropdownNavItem href="/bookmarks" icon={<Bookmark className="text-primary" />} label="Study Repository" />
                    <DropdownNavItem href="/profile" icon={<User />} label="Profile Settings" />
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-white/5 my-2" />
                        <DropdownNavItem href="/admin" icon={<ShieldCheck className="text-primary" />} label="Command Center" className="text-primary font-black" />
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-white/5 my-2" />
                    <DropdownMenuItem onClick={handleLogout} className="focus:bg-destructive/10 focus:text-destructive rounded-xl px-4 py-3 cursor-pointer transition-colors text-destructive/80 font-bold">
                      <LogOut className="h-4 w-4 mr-3" /> Logout Portal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-2.5 rounded-xl h-auto border-none transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/20">
                <Link href="/login">Initialize Profile</Link>
              </Button>
            )}
            
            <button 
              className="lg:hidden text-white p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-[#0B1528] border-b border-white/10 lg:hidden flex flex-col p-6 gap-6 shadow-4xl"
            >
              {links.map(link => (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  className={`text-lg font-bold uppercase tracking-widest ${pathname === link.href ? 'text-primary' : 'text-[#7A8B9E]'}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <DropdownMenuSeparator className="bg-white/5" />
              {user ? (
                 <Button onClick={handleLogout} variant="destructive" className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs">
                   <LogOut className="h-4 w-4 mr-2" /> Termination Session
                 </Button>
              ) : (
                <Button asChild className="bg-primary text-white font-black w-full h-14 rounded-2xl uppercase tracking-widest text-xs">
                  <Link href="/login" onClick={() => setIsOpen(false)}>Initialize Entry</Link>
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

function DropdownNavItem({ href, icon, label, className }: any) {
  return (
    <DropdownMenuItem asChild className={`focus:bg-white/5 rounded-xl px-4 py-3 cursor-pointer transition-colors ${className}`}>
      <Link href={href} className="flex items-center gap-4 w-full">
        <span className="h-4 w-4">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </DropdownMenuItem>
  )
}
