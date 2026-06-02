
'use client';

import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { Twitter, Facebook, Instagram, Mail, Phone, Heart, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0c1527] text-white pt-20 pb-8 border-t border-white/10">
      <div className="container mx-auto max-w-[85%]">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-1">
            <Logo variant="light" className="scale-90 origin-left" />
            <p className="text-gray-400 mt-4 text-sm leading-relaxed max-w-xs">
              Your one-stop platform for Punjab Government Exams. Built with integrity for future officers.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
              <ShieldCheck className="h-3.5 w-3.5" />
              Founded by Arsh Grewal
            </div>
          </div>

          <div>
            <h3 className="font-bold text-base mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-[#ff7a00] transition-colors">Home</Link></li>
              <li><Link href="/exams" className="hover:text-[#ff7a00] transition-colors">Exams</Link></li>
              <li><Link href="/mocks" className="hover:text-[#ff7a00] transition-colors">Mocks</Link></li>
              <li><Link href="/about" className="hover:text-[#ff7a00] transition-colors">About Founder</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base mb-6">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-[#ff7a00] transition-colors">Our Vision</Link></li>
              <li><Link href="#" className="hover:text-[#ff7a00] transition-colors">Success Stories</Link></li>
              <li><Link href="/current-affairs" className="hover:text-[#ff7a00] transition-colors">Analysis Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base mb-6">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-[#ff7a00] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-[#ff7a00] transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-[#ff7a00] transition-colors">Disclaimer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base mb-6">Support</h3>
            <div className="space-y-4 text-sm text-gray-400">
              <p className="flex items-center gap-3 overflow-hidden">
                <Mail className="h-4 w-4 text-[#ff7a00] shrink-0" /> 
                <span className="truncate">cracklixhelp@gmail.com</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#ff7a00] shrink-0" /> 
                <span>+91 98881 88602</span>
              </p>
              <div className="pt-4 flex gap-4">
                 <div className="h-9 w-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#ff7a00] transition-colors cursor-pointer group">
                    <Twitter className="h-4 w-4 text-white" />
                 </div>
                 <div className="h-9 w-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#ff7a00] transition-colors cursor-pointer group">
                    <Facebook className="h-4 w-4 text-white" />
                 </div>
                 <div className="h-9 w-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#ff7a00] transition-colors cursor-pointer group">
                    <Instagram className="h-4 w-4 text-white" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <div>© 2026 Cracklix. Built by Arsh Grewal.</div>
          <div className="flex items-center gap-2">Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> for Punjab Aspirants</div>
        </div>
      </div>
    </footer>
  );
}
