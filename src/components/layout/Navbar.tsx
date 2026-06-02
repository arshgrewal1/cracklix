"use client"

import Link from "next/link"
import { Search, User, Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import Logo from "@/components/brand/Logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const boards = [
    "PSSSB", "PPSC", "Punjab Police", "Teaching Exams", "High Court", "PSPCL & PSTCL", "BFUHS", "Banking & Cooperative"
  ]

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0F172A] border-b border-white/5 py-1">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo variant="light" />

        <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-white/70">
          <Link href="/" className="hover:text-primary transition-colors text-primary border-b-2 border-primary pb-1">Home</Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:text-primary transition-colors flex items-center gap-1 outline-none">
              Exams Categories
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0F172A] border-white/10 text-white min-w-[200px] mt-2">
              {boards.map(board => (
                <DropdownMenuItem key={board} asChild>
                  <Link href={`/exams?board=${encodeURIComponent(board)}`} className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary py-2.5 px-4 font-bold text-xs uppercase tracking-wider">
                    {board}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/mocks" className="hover:text-primary transition-colors">Mocks</Link>
          <Link href="/pyqs" className="hover:text-primary transition-colors">PYQs</Link>
          <Link href="/current-affairs" className="hover:text-primary transition-colors">Current Affairs</Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-white/60 hover:text-white transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <Link href="/notifications" className="text-white/60 hover:text-white transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
          </Link>
          <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
          <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black px-6 rounded-lg uppercase text-xs tracking-widest h-10 shadow-lg shadow-primary/20">
            <Link href="/admin">Login</Link>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
