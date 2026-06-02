'use client';

import Link from "next/link";
import { Menu, X, User, LogOut, ShieldCheck, ChevronDown, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useAuth } from "@/firebase";
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

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const links = [
    { label: "Home", href: "/" },
    { label: "Exams", href: "/exams" },
    { label: "Mocks", href: "/mocks" },
    { label: "PYQs", href: "/pyqs" },
    { label: "Current Affairs", href: "/current-affairs" },
  ];

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';

  return (
    <nav className="sticky top-0 z-[1000] w-full bg-[#0B1528] border-b border-white/5 py-4">
      <div className="container mx-auto max-w-[95%] lg:max-w-[90%] flex items-center justify-between px-4">
        <Logo variant="light" />

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-[30px] text-[15px] font-medium text-[#7A8B9E]">
          {links.map(link => (
            <Link 
              key={link.label} 
              href={link.href} 
              className={`transition-colors hover:text-[#F97316] ${pathname === link.href ? 'text-white' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link 
              href="/admin" 
              className="text-primary font-black uppercase tracking-widest text-[10px] bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1.5 hover:bg-primary/20 transition-all"
            >
              <ShieldCheck className="h-3 w-3" /> Admin Portal
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {loading ? (
            <Skeleton className="h-10 w-24 rounded-lg bg-white/5" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <button className="relative text-white hover:text-orange-500 transition-colors p-2 hidden sm:block">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500 border-2 border-[#0B1528]" />
              </button>
              
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
                <DropdownMenuContent className="w-56 bg-[#0F172A] border-white/10 text-white rounded-2xl p-2" align="end">
                  <DropdownMenuLabel className="font-headline font-bold px-3 py-2 text-slate-400 text-[10px] uppercase tracking-widest">Account Info</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem asChild className="focus:bg-white/5 rounded-xl px-3 py-2.5 cursor-pointer transition-colors">
                    <Link href="/profile" className="flex items-center gap-2 w-full"><User className="h-4 w-4" /> My Profile</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary rounded-xl px-3 py-2.5 cursor-pointer transition-colors">
                      <Link href="/admin" className="flex items-center gap-2 w-full"><ShieldCheck className="h-4 w-4" /> Admin Portal</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={handleLogout} className="focus:bg-destructive/10 focus:text-destructive rounded-xl px-3 py-2.5 cursor-pointer transition-colors text-destructive/80 font-bold">
                    <LogOut className="h-4 w-4 mr-2" /> Logout Aspirant
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button asChild className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-8 py-2.5 rounded-xl h-auto border-none transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-500/20">
              <Link href="/login">Login</Link>
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-[#0B1528] border-b border-white/10 lg:hidden flex flex-col p-6 gap-4"
          >
            {links.map(link => (
              <Link 
                key={link.label} 
                href={link.href} 
                className={`text-[15px] font-bold uppercase tracking-widest ${pathname === link.href ? 'text-primary' : 'text-[#7A8B9E]'}`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link 
                href="/admin" 
                className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <ShieldCheck className="h-4 w-4" /> Admin Portal
              </Link>
            )}
            <DropdownMenuSeparator className="bg-white/5" />
            {user ? (
               <Button onClick={handleLogout} variant="destructive" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs">
                 <LogOut className="h-4 w-4 mr-2" /> Logout
               </Button>
            ) : (
              <Button asChild className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold w-full h-12 rounded-xl">
                <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
