'use client';

import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#08152d] via-[#0b1d3f] to-[#08152d] text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-1">
            <Logo variant="light" className="scale-90 origin-left" />
            <p className="text-white/50 mt-6 text-sm leading-relaxed max-w-xs">
              Punjab&apos;s smartest platform for Government Recruitment preparation. Built with integrity for future officers.
            </p>
          </div>

          <div>
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-8 text-white/40">
              Quick Links
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/" className="text-white/70 hover:text-[#F97316] transition-colors">Home</Link></li>
              <li><Link href="/exams" className="text-white/70 hover:text-[#F97316] transition-colors">Exams</Link></li>
              <li><Link href="/mocks" className="text-white/70 hover:text-[#F97316] transition-colors">Mocks</Link></li>
              <li><Link href="/pyqs" className="text-white/70 hover:text-[#F97316] transition-colors">PYQs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-8 text-white/40">
              Company
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#" className="text-white/70 hover:text-[#F97316] transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#F97316] transition-colors">Success Stories</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#F97316] transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#F97316] transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-8 text-white/40">
              Legal
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#" className="text-white/70 hover:text-[#F97316] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#F97316] transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#F97316] transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-8 text-white/40">
              Contact Support
            </h3>
            <div className="space-y-4 text-sm font-medium">
              <p className="text-white/70 flex items-center gap-2">
                <span className="text-[#F97316]">E:</span> support@cracklix.com
              </p>
              <p className="text-white/70 flex items-center gap-2">
                <span className="text-[#F97316]">P:</span> +91 98765 43210
              </p>
              <div className="pt-4 flex gap-4">
                 <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#F97316] transition-colors cursor-pointer">
                    <span className="font-black text-xs">𝕏</span>
                 </div>
                 <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#F97316] transition-colors cursor-pointer">
                    <span className="font-black text-xs">fb</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          <div>© 2026 Cracklix Authority. All rights reserved.</div>
          <div className="flex items-center gap-2">
            Made with <span className="text-[#F97316]">❤️</span> for Punjab Aspirants
          </div>
        </div>
      </div>
    </footer>
  );
}
