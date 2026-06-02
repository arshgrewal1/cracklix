import Link from "next/link"

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export default function Logo({ className = "", variant = 'dark' }: LogoProps) {
  const isLight = variant === 'light';
  
  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`}>
      <div className="relative h-8 w-8 flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 100 100"
          className={`h-full w-full ${isLight ? 'text-white' : 'text-[#0F172A]'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        >
          {/* Institutional C with Checkmark */}
          <path 
            d="M80 30 C 70 15, 25 15, 25 50 C 25 85, 70 85, 80 70" 
            strokeLinecap="round" 
            className="opacity-90"
          />
          <path
            d="M45 50 L55 60 L85 30"
            className="text-[#F97316]"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-headline font-bold text-xl tracking-tighter uppercase italic">
          <span className={isLight ? 'text-white' : 'text-[#0F172A]'}>Crack</span>
          <span className="text-[#F97316]">lix</span>
        </span>
        <span className={`text-[7px] uppercase tracking-[0.2em] font-black ${isLight ? 'text-white/60' : 'text-gray-400'}`}>
          Punjab Exam Preparation
        </span>
      </div>
    </Link>
  )
}