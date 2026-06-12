'use client';

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showTagline?: boolean;
  href?: string;
  iconOnly?: boolean;
}

/**
 * @fileOverview Official Cracklix Logo Component.
 * MATCHES: High-fidelity 3D style with white "Crackli" and orange "x" plus tagline accents.
 */
export function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <div className={cn("relative shrink-0 flex items-center justify-center", className)}>
      <img 
        src="https://i.ibb.co/VW2MK9ww/file-00000000deec7206abdeca16860cdec1.png" 
        alt="Cracklix Emblem" 
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export default function Logo({ className = "", variant = 'light', showTagline = true, href = "/", iconOnly = false }: LogoProps) {
  const isDark = variant === 'dark';

  return (
    <Link href={href} className={cn("flex items-center gap-3 md:gap-5 group pointer-events-auto select-none shrink-0", className)}>
      <LogoIcon className="w-10 h-10 md:w-16 md:h-16" />

      {!iconOnly && (
        <div className="flex flex-col items-start justify-center leading-none">
          <div className="flex items-baseline">
            {/* "Crackli" in white with depth shadow */}
            <span className={cn(
              "text-2xl md:text-5xl font-black tracking-tighter font-headline",
              isDark ? "text-slate-900" : "text-white"
            )} style={{ 
               filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.5))'
            }}>
              Crackli
            </span>
            {/* Stylized "x" in orange gradient */}
            <span className="text-2xl md:text-5xl font-black tracking-tighter font-headline bg-gradient-to-b from-[#FFB800] to-[#F97316] bg-clip-text text-transparent" style={{
               filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.5))'
            }}>
              x
            </span>
          </div>
          
          {showTagline && (
            <div className="mt-1 flex items-center gap-2 w-full justify-center">
              <div className="h-[1.5px] w-3 md:w-6 bg-gradient-to-r from-transparent to-[#F97316]" />
              <span className={cn(
                "text-[6px] md:text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap",
                isDark ? "text-slate-500" : "text-white"
              )}>
                PUNJAB&apos;S NO.1 STUDY HUB
              </span>
              <div className="h-[1.5px] w-3 md:w-6 bg-gradient-to-l from-transparent to-[#F97316]" />
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
