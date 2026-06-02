'use client';

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#08152d] text-white pt-20 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-4xl font-bold font-headline">
              Crack<span className="text-orange-500">lix</span>
            </h2>

            <p className="text-gray-400 mt-4 text-sm leading-relaxed">
              Your one-stop platform for Punjab
              Government Exams. Built with trust for serious aspirants.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/80">
              Quick Links
            </h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link href="/" className="hover:text-orange-500 transition-colors">Home</Link></li>
              <li><Link href="/exams" className="hover:text-orange-500 transition-colors">Exams</Link></li>
              <li><Link href="/mocks" className="hover:text-orange-500 transition-colors">Mocks</Link></li>
              <li><Link href="/pyqs" className="hover:text-orange-500 transition-colors">PYQs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/80">
              Company
            </h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link href="#" className="hover:text-orange-500 transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/80">
              Legal
            </h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Terms</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Disclaimer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/80">
              Contact
            </h3>
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">
                support@cracklix.com
              </p>
              <p className="text-gray-400 text-sm">
                +91 98765 43210
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
          <div>© 2026 Cracklix. All rights reserved.</div>
          <div>Made with ❤️ for Punjab Aspirants</div>
        </div>
      </div>
    </footer>
  );
}
