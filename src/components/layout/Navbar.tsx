"use client"

import Link from "next/link"
import { Search, Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import Logo from "@/components/brand/Logo"

export default function Navbar() {
  const links = [
    { label: "Home", href: "/" },
    { label: "Exams", href: "/exams" },
    { label: "Mocks", href: "/mocks" },
    { label: "PYQs", href: "/pyqs" },
    { label: "Current Affairs", href: "/current-affairs" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0F172A] border-b border-white/5 py-4">
      <div className="container mx-auto flex items-center justify-between px-6">
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
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F97316] transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="text-white/70 hover:text-white transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#F97316]" />
          </button>
          
          <Button asChild className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-6 rounded-lg h-10 hidden sm:flex">
            <Link href="/login">Login</Link>
          </Button>
          
          <button className="lg:hidden text-white">
             <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  )
}