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
    <Link href="/" className={`flex items-center gap-3.5 group ${className}`}>
      {/* Modern Superellipse Icon Container */}
      <div className="relative shrink-0">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-11 h-11 flex items-center justify-center bg-gradient-to-br from-[#ff9500] to-[#ff7a00] rounded-[14px] shadow-lg shadow-orange-500/30 overflow-hidden"
        >
          {/* Subtle Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
          
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 relative z-10">
            {/* Modern Open 'C' Path */}
            <path 
              d="M26 12C24.5 10.5 22.5 9.5 20 9.5C14.7533 9.5 10.5 13.7533 10.5 19C10.5 24.2467 14.7533 28.5 20 28.5C22.5 28.5 24.5 27.5 26 26" 
              stroke="white" 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            {/* Sharp Modern Checkmark */}
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              d="M19 19L24.5 24.5L34 11" 
              stroke="white" 
              strokeWidth="4.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
            />
          </svg>
        </motion.div>
      </div>

      <div className="flex flex-col">
        <h1 className="text-2xl lg:text-[26px] font-bold leading-none tracking-tight flex items-baseline">
          <span className={`${isLight ? 'text-white' : 'text-[#0c1527]'} font-bold`}>
            Crack
          </span>
          <span className="text-[#ff7a00] font-black ml-0.5">
            lix
          </span>
        </h1>
        <div className="flex items-center gap-1.5 mt-1">
          <div className={`h-[1px] w-4 ${isLight ? 'bg-white/30' : 'bg-gray-300'}`} />
          <p className={`text-[9px] lg:text-[10px] uppercase tracking-[0.3em] font-black ${isLight ? 'text-white/40' : 'text-gray-400'}`}>
            Punjab Exam Authority
          </p>
        </div>
      </div>
    </Link>
  );
}
