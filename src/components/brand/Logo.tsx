import Link from "next/link"

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export default function Logo({ className = "", variant = 'dark' }: LogoProps) {
  // Navy: #0F172A, Orange: #F97316
  const isDark = variant === 'dark';
  
  return (
    <Link href="/" className={`flex items-center gap-3 group transition-transform hover:scale-[1.02] ${className}`}>
      <div className="relative h-12 w-12 flex items-center justify-center">
        {/* Accurate Punjab Map Outline SVG */}
        <svg
          viewBox="0 0 100 100"
          className={`h-12 w-12 ${isDark ? 'text-[#0F172A]' : 'text-white'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path 
            d="M52 5 L68 12 L82 35 L88 55 L78 85 L50 96 L25 88 L12 65 L8 40 L22 15 Z" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Integrated Orange Checkmark */}
          <path
            d="M35 55 L48 65 L68 35"
            className="text-[#F97316]"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-headline text-3xl font-black tracking-tighter uppercase leading-none">
          <span className={isDark ? 'text-[#0F172A]' : 'text-white'}>CRACK</span>
          <span className="text-[#F97316]">LIX</span>
        </span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black mt-0.5">
          Punjab Exam Preparation
        </span>
      </div>
    </Link>
  )
}
