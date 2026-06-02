import Link from "next/link"

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export default function Logo({ className = "", variant = 'dark' }: LogoProps) {
  const isLight = variant === 'light';
  
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 100 100"
          className={`h-full w-full ${isLight ? 'text-white' : 'text-[#0B1F3A]'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        >
          {/* Refined C Shape for institutional look */}
          <path 
            d="M85 25 C 65 5, 15 20, 15 50 C 15 80, 65 95, 85 75" 
            strokeLinecap="round" 
            className="opacity-90"
          />
          {/* Subtle Punjab Map Outline Inside */}
          <path 
            d="M40 35 L55 40 L60 60 L45 70 L35 55 Z" 
            className={isLight ? 'text-white/20' : 'text-[#0B1F3A]/10'}
            fill="currentColor"
            stroke="none"
          />
          {/* Success Checkmark - Highlighted */}
          <path
            d="M42 50 L52 60 L75 35"
            className="text-[#F59E0B]"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-bold text-2xl tracking-tighter uppercase italic">
          <span className={isLight ? 'text-white' : 'text-[#0B1F3A]'}>Crack</span>
          <span className="text-[#F59E0B]">lix</span>
        </span>
        <span className={`text-[8px] uppercase tracking-[0.2em] font-black ${isLight ? 'text-white/60' : 'text-gray-400'}`}>
          Punjab Exam Trust
        </span>
      </div>
    </Link>
  )
}