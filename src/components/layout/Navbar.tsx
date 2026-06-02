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
    { label: "Home", href: "/", active: true },
    { label: "Exams", href: "/exams" },
    { label: "Mocks", href: "/mocks" },
    { label: "PYQs", href: "/pyqs" },
    { label: "Current Affairs", href: "/current-affairs" },
  ];

  return (
    <nav className="sticky top-0 z-[1000] w-full bg-[#0c1527] border-b border-white/10 py-4">
      <div className="container mx-auto max-w-[85%] flex items-center justify-between">
        <Logo variant="light" />

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-[30px] text-[15px] font-medium text-[#cbd5e1]">
          {links.map(link => (
            <Link 
              key={link.label} 
              href={link.href} 
              className={`transition-colors hover:text-[#ff7a00] ${link.active ? 'text-[#ff7a00]' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <button className="relative text-white hover:text-[#ff7a00] transition-colors p-1">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-2 bg-[#ff7a00] text-[10px] px-1.5 py-0.5 rounded-full font-bold">3</span>
          </button>
          
          <Button asChild className="bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white font-bold px-6 rounded-md h-10 hidden sm:flex border-none cursor-pointer">
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
            className="absolute top-full left-0 w-full bg-[#0c1527] border-b border-white/10 lg:hidden flex flex-col p-6 gap-4"
          >
            {links.map(link => (
              <Link 
                key={link.label} 
                href={link.href} 
                className="text-[#cbd5e1] hover:text-[#ff7a00] font-bold text-sm uppercase tracking-widest"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white font-bold w-full h-12">
              <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
