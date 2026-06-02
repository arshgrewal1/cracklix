'use client';

import Link from "next/link";
import { Check } from "lucide-react";

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export default function Logo({ className = "", variant = 'light' }: LogoProps) {
  const isLight = variant === 'light';
  
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      <div className="relative shrink-0 hidden sm:block">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#ff7a00] flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
          <span className="text-white text-xl lg:text-2xl font-black">C</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-white rounded-full border-2 border-[#ff7a00] flex items-center justify-center shadow-sm">
          <Check className="text-[#ff7a00] h-3 w-3 lg:h-4 lg:w-4 stroke-[4px]" />
        </div>
      </div>

      <div className="flex flex-col">
        <h1 className="text-2xl lg:text-3xl font-black leading-none tracking-tight">
          <span className={isLight ? 'text-white' : 'text-[#0c1527]'}>Crack</span>
          <span className="text-[#ff7a00]">lix</span>
        </h1>
        <p className={`text-[8px] lg:text-[10px] uppercase tracking-[3px] font-black mt-1 ${isLight ? 'text-white/60' : 'text-gray-400'}`}>
          Punjab Exam Authority
        </p>
      </div>
    </Link>
  );
}
