'use client';

import Link from "next/link";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark'; // 'light' means light text for dark backgrounds, 'dark' means dark text for light backgrounds
  showTagline?: boolean;
}

export default function Logo({ className = "", variant = 'light', showTagline = true }: LogoProps) {
  const isDarkBackground = variant === 'light'; 
  
  return (
    <Link href="/" className={`flex items-center gap-3.5 group ${className}`}>
      {/* Premium SaaS Icon: Punjab Map + Integrated Checkmark */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 flex items-center justify-center bg-[#F97316] rounded-xl shadow-xl shadow-orange-500/20 shrink-0 overflow-hidden"
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-8 h-8"
        >
          {/* Geometric Punjab Map Silhouette */}
          <path 
            d="M28 22 L72 18 L88 42 L82 78 L48 88 L22 68 L18 38 Z" 
            fill="white" 
            fillOpacity="0.15"
          />
          {/* Clean Integrated Checkmark */}
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            d="M34 54 L48 68 L74 36" 
            stroke="white" 
            strokeWidth="11" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </motion.div>

      <div className="flex flex-col">
        <div className="flex items-baseline leading-none">
          <span className={`text-[26px] font-black tracking-tighter ${isDarkBackground ? 'text-white' : 'text-[#0F172A]'}`}>
            Crack
          </span>
          <span className="text-[#F97316] text-[26px] font-black tracking-tighter">
            lix
          </span>
        </div>
        {showTagline && (
          <span className={`text-[10px] font-black uppercase tracking-[0.25em] mt-1.5 ${isDarkBackground ? 'text-white/40' : 'text-[#0F172A]/40'}`}>
            Punjab Exam Preparation
          </span>
        )}
      </div>
    </Link>
  );
}
