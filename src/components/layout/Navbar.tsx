"use client"

import Link from "next/link"
import { Search, Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import Logo from "@/components/brand/Logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const links = [
    { label: "Home", href: "/" },
    { label: "Exams", href: "/exams" },
    { label: "Mock Tests", href: "/mocks" },
    { label: "PYQs", href: "/pyqs" },
    { label: "Current Affairs", href: "/current-affairs" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 py-3">
      <div className="container mx-auto flex items-center justify-between px-6">
        <Logo variant="dark" />

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
          {links.map(link => (
            <Link 
              key={link.label} 
              href={link.href} 
              className="hover:text-secondary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex text-slate-400 hover:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <Link href="/notifications" className="relative text-slate-400 hover:text-primary transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-secondary" />
          </Link>
          <div className="h-6 w-[1px] bg-slate-100 mx-2 hidden sm:block" />
          <Link href="/login" className="text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-secondary transition-colors hidden sm:block">
            Login
          </Link>
          <Button asChild size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-black px-6 rounded-xl shadow-lg shadow-secondary/20 h-10">
            <Link href="/mocks">Start Mock</Link>
          </Button>
          
          {/* Mobile Menu Toggle */}
          <button className="lg:hidden text-slate-600">
             <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  )
}
