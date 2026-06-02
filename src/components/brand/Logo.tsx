'use client';

import Link from "next/link";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark'; // 'light' for dark backgrounds (white text), 'dark' for light backgrounds (navy text)
  showTagline?: boolean;
}

export default function Logo({ className = "", variant = 'light', showTagline = true }: LogoProps) {
  const isLightVariant = variant === 'light'; 
  
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      {/* Premium Minimalist Icon: Geometric C + Checkmark */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-10 h-10 flex items-center justify-center shrink-0"
      >
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Main geometric C shape */}
          <path
            d="M32 10C29.5 7.5 25.5 6 21 6C12.7157 6 6 12.7157 6 21C6 29.2843 12.7157 36 21 36C25.5 36 29.5 34.5 32 32"
            stroke={isLightVariant ? "#FFFFFF" : "#0F172A"}
            strokeWidth="5"
            strokeLinecap="round"
          />
          
          {/* Integrated Qualification Checkmark */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            d="M16 21L20 25L30 15"
            stroke="#F97316"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <div className="flex flex-col">
        <div className="flex items-baseline leading-none">
          <span className={`text-2xl font-extrabold tracking-tighter ${isLightVariant ? 'text-white' : 'text-[#0F172A]'}`}>
            Crack
          </span>
          <span className="text-[#F97316] text-2xl font-extrabold tracking-tighter">
            lix
          </span>
        </div>
        {showTagline && (
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 ${isLightVariant ? 'text-white/40' : 'text-[#0F172A]/40'}`}>
            Punjab Exam Preparation
          </span>
        )}
      </div>
    </Link>
  );
}
