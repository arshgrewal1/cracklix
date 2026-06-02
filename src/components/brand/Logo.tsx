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
    <Link href="/" className={`flex items-center gap-4 group ${className}`}>
      {/* Premium Stylish Icon: Long C with Big Tick and Outline */}
      <div className="relative shrink-0">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: -2 }}
          className="relative w-12 h-12 flex items-center justify-center"
        >
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
            {/* The Stylish Long C with Outline */}
            <path 
              d="M34 10C30 6 22 4 14 8C6 12 4 22 8 30C12 38 22 40 30 36C34 34 36 30 36 30" 
              stroke={isLight ? "#ff7a00" : "#0c1527"} 
              strokeWidth="4" 
              strokeLinecap="round"
              className="transition-colors duration-300"
            />
            {/* The Big Bold Tick (Checkmark) */}
            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              d="M16 22L24 30L40 10" 
              stroke="#ff7a00" 
              strokeWidth="5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(255,122,0,0.5)]"
            />
          </svg>
        </motion.div>
        
        {/* Subtle Glow beneath the icon */}
        <div className="absolute inset-0 bg-orange-500/10 blur-xl -z-10 rounded-full group-hover:bg-orange-500/20 transition-colors" />
      </div>

      <div className="flex flex-col">
        <h1 className="text-2xl lg:text-3xl font-black leading-none tracking-tight flex items-baseline">
          <span className={`${isLight ? 'text-white' : 'text-[#0c1527]'} font-extrabold`}>
            Crack
          </span>
          <span className="text-[#ff7a00] font-black italic ml-0.5">
            lix
          </span>
        </h1>
        <div className="flex items-center gap-1.5 mt-1">
          <div className={`h-[1.5px] w-5 ${isLight ? 'bg-white/20' : 'bg-gray-200'}`} />
          <p className={`text-[9px] lg:text-[10px] uppercase tracking-[0.3em] font-black ${isLight ? 'text-white/60' : 'text-gray-400'}`}>
            Punjab Exam Authority
          </p>
        </div>
      </div>
    </Link>
  );
}
