
'use client';

import Link from "next/link";
import { Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const links = [
    { label: "Home", href: "/" },
    { label: "Exams", href: "/exams" },
    { label: "Mocks", href: "/mocks" },
    { label: "PYQs", href: "/pyqs" },
    { label: "Current Affairs", href: "/current-affairs" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0F172A] border-b border-white/5 py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <Logo variant="light" />

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 text-[12px] font-bold uppercase tracking-widest text-white/70">
          {links.map(link => (
            <Link 
              key={link.label} 
              href={link.href} 
              className="hover:text-[#F97316] transition-colors relative group"
            >
              {link.label}
              <motion.span 
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F97316]"
                whileHover={{ width: "100%" }}
              />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="text-white/70 hover:text-white transition-colors relative p-2">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#F97316]" />
          </button>
          
          <Button asChild className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-6 rounded-lg h-10 hidden sm:flex">
            <Link href="/login">Login</Link>
          </Button>
          
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
            className="absolute top-full left-0 w-full bg-[#0F172A] border-b border-white/10 lg:hidden flex flex-col p-6 gap-4"
          >
            {links.map(link => (
              <Link 
                key={link.label} 
                href={link.href} 
                className="text-white/70 hover:text-[#F97316] font-bold uppercase tracking-widest text-sm"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold w-full h-12">
              <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
