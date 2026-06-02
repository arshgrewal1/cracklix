'use client';

import Link from "next/link";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export default function Logo({ className = "", variant = 'light' }: LogoProps) {
  const isLight = variant === 'light';
  
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      {/* Testbook Style Geometric Icon */}
      <div className="relative shrink-0">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative w-10 h-10 lg:w-11 lg:h-11 flex items-center justify-center bg-[#ff7a00] rounded-xl shadow-lg shadow-orange-500/20"
        >
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
            {/* The Stylized 'C' */}
            <path 
              d="M26 10.5C24.5 9.5 22.5 9 20 9C14.4772 9 10 13.4772 10 19C10 24.5228 14.4772 29 20 29C22.5 29 24.5 28.5 26 27.5" 
              stroke="white" 
              strokeWidth="4.5" 
              strokeLinecap="round"
            />
            {/* The Bold Tick */}
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              d="M18 19L24 25L34 11" 
              stroke="white" 
              strokeWidth="5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
          </svg>
        </motion.div>
      </div>

      <div className="flex flex-col">
        <h1 className="text-2xl lg:text-[26px] font-black leading-none tracking-tight flex items-baseline">
          <span className={`${isLight ? 'text-white' : 'text-[#0c1527]'} font-bold`}>
            Crack
          </span>
          <span className="text-[#ff7a00] font-black ml-0.5">
            lix
          </span>
        </h1>
        <div className="flex items-center gap-1 mt-0.5">
          <p className={`text-[9px] lg:text-[10px] uppercase tracking-[0.25em] font-bold ${isLight ? 'text-white/50' : 'text-gray-400'}`}>
            Punjab Exam Authority
          </p>
        </div>
      </div>
    </Link>
  );
}
