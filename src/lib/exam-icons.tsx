import { Shield, GraduationCap, Scale, Zap, Stethoscope, Landmark, BookOpen } from "lucide-react"

export const PsssbIcon = () => (
  <div className="h-16 w-16 rounded-full bg-white border border-[#E2E8F0] p-2 flex items-center justify-center shadow-sm">
    <svg viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M8 11h8" /><path d="M12 7v8" />
    </svg>
  </div>
)

export const PpscIcon = () => (
  <div className="h-16 w-16 rounded-full bg-white border border-[#E2E8F0] p-2 flex items-center justify-center shadow-sm">
    <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
      <path d="M12 3v19M5 8h14M15 13H9M12 8c0-3 3-5 3-5M12 8c0-3-3-5-3-5" />
    </svg>
  </div>
)

export const PoliceIcon = () => (
  <div className="h-16 w-16 rounded-full bg-white border border-[#E2E8F0] p-2 flex items-center justify-center shadow-sm">
    <Shield className="h-10 w-10 text-[#1E3A8A] fill-[#1E3A8A]/10" />
  </div>
)

export const TeachingIcon = () => (
  <div className="h-16 w-16 rounded-full bg-white border border-[#E2E8F0] p-2 flex items-center justify-center shadow-sm">
    <div className="relative">
      <BookOpen className="h-10 w-10 text-[#F97316]" />
      <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#F97316] rounded-full border-2 border-white" />
    </div>
  </div>
)

export const JusticeIcon = () => (
  <div className="h-16 w-16 rounded-full bg-white border border-[#E2E8F0] p-2 flex items-center justify-center shadow-sm">
    <Scale className="h-10 w-10 text-[#475569]" />
  </div>
)

export const PowerIcon = () => (
  <div className="h-16 w-16 rounded-full bg-white border border-[#E2E8F0] p-2 flex items-center justify-center shadow-sm">
    <Zap className="h-10 w-10 text-[#1E3A8A] fill-[#F97316]" />
  </div>
)

export const MedIcon = () => (
  <div className="h-16 w-16 rounded-full bg-white border border-[#E2E8F0] p-2 flex items-center justify-center shadow-sm">
    <div className="bg-[#1E3A8A]/5 rounded-full p-1">
      <Stethoscope className="h-8 w-8 text-[#1E3A8A]" />
    </div>
  </div>
)

export const BankIcon = () => (
  <div className="h-16 w-16 rounded-full bg-white border border-[#E2E8F0] p-2 flex items-center justify-center shadow-sm">
    <Landmark className="h-10 w-10 text-[#0B1F3A]" />
  </div>
)
