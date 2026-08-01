import React from "react"
import { Shield, GraduationCap, Scale, Zap, Stethoscope, Landmark, BookOpen, Activity, Cpu, Building2, Globe, Settings, FileText, FileStack } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

/**
 * @fileOverview Institutional Branding Engine v45.0.
 * FIXED: Standardized normalization for diverse Board IDs (e.g. "Punjab Police" -> "punjab-police").
 * FIXED: Ensuring fallback Lucide icons always render if PNG nodes are missing.
 */

const CANONICAL_BOARD_LOGOS: Record<string, string> = {
  'ppsc': '/logos/boards/ppsc.png',
  'psssb': '/logos/boards/psssb.png',
  'punjab-police': '/logos/boards/punjab-police.png',
  'teaching-hub': '/logos/boards/education-board.png',
  'education-board': '/logos/boards/education-board.png',
  'pscl': '/logos/boards/pscb.png',
  'pspcl': '/logos/boards/pspcl.png',
  'pstcl': '/logos/boards/pstcl.png',
  'bfuhs': '/logos/boards/bfuhs.png',
  'banking-hub': '/logos/boards/pscb.png',
  'judiciary-hub': '/logos/boards/high-court.png',
  'ssc': '/logos/boards/ssc.png',
  'rrb': '/logos/boards/rrb.png',
  'idps': '/logos/boards/ibps.png',
  'defense': '/logos/boards/upsc.png',
  'pstet': '/logos/boards/pstet.png',
  'ctet': '/logos/boards/ctet.png',
  'current-affairs': '/logos/boards/current-affairs.png',
  'mock-test': '/logos/boards/mock-test.png',
  'study-material': '/logos/boards/study-material.png',
  'pyq': '/logos/boards/pyq.png'
};

const CANONICAL_CAT_LOGOS: Record<string, string> = {
  'punjab-government-exams': '/logos/categories/punjab-government-exams.png',
  'punjab-teaching-exams': '/logos/categories/punjab-teaching-exams.png',
  'punjab-technical-exams': '/logos/categories/punjab-government-exams.png',
  'banking-exams': '/logos/categories/banking-exams.png',
  'judiciary-exams': '/logos/categories/judiciary-exams.png',
  'central-government-exams': '/logos/categories/punjab-government-exams.png'
};

interface AuthorityLogoProps {
  board?: any;
  category?: any;
  boardId?: string;
  categoryId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AuthorityLogo = ({ board, category, boardId, categoryId, className, size = 'md' }: AuthorityLogoProps) => {
  const normalize = (id: string) => (id || "").toLowerCase().trim().replace(/\s+/g, '-').replace(/\./g, '');
  
  const bId = normalize(boardId || board?.id || board?.abbreviation || "");
  const cId = normalize(categoryId || category?.id || board?.categoryId || "");
  
  const logoUrl = 
    CANONICAL_BOARD_LOGOS[bId] || 
    board?.iconUrl || 
    board?.logoUrl || 
    CANONICAL_CAT_LOGOS[cId] || 
    category?.iconUrl || 
    category?.logoUrl;
  
  const sizeClasses = {
    sm: "h-9 w-9 md:h-11 md:w-11",
    md: "h-12 w-12 md:h-16 md:w-16",
    lg: "h-20 w-20 md:h-28 md:w-28",
    xl: "h-28 w-28 md:h-36 md:w-36"
  };

  const containerSize = sizeClasses[size];

  const getFallbackIcon = () => {
    if (bId === 'mock-test' || bId.includes('mock')) return <Zap className="h-full w-full text-primary" />;
    if (bId === 'study-material' || bId.includes('note')) return <BookOpen className="h-full w-full text-indigo-600" />;
    if (bId === 'pyq' || bId.includes('paper')) return <FileStack className="h-full w-full text-emerald-600" />;
    if (bId.includes('current')) return <Newspaper className="h-full w-full text-primary" />;
    if (cId.includes('govt')) return <Landmark className="h-full w-full text-amber-600" />;
    if (cId.includes('teaching')) return <BookOpen className="h-full w-full text-blue-600" />;
    if (cId.includes('technical')) return <Settings className="h-full w-full text-slate-600" />;
    if (cId.includes('bank')) return <Building2 className="h-full w-full text-emerald-700" />;
    if (cId.includes('judiciary')) return <Scale className="h-full w-full text-slate-700" />;
    if (cId.includes('central')) return <Globe className="h-full w-full text-blue-800" />;
    return <Shield className="h-full w-full text-slate-300" />;
  };

  return (
    <div className={cn(
      "relative shrink-0 overflow-hidden transition-all bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center",
      containerSize, 
      className
    )}>
      {logoUrl ? (
        <Image 
          src={logoUrl} 
          alt="Authority" 
          fill
          sizes="256px"
          className="object-contain p-1"
          referrerPolicy="no-referrer"
          onError={(e) => {
             // Handle broken image paths by removing the src and letting the fallback show
             (e.target as any).style.display = 'none';
          }}
        />
      ) : (
        <div className="h-full w-full p-2 opacity-20">
          {getFallbackIcon()}
        </div>
      )}
    </div>
  );
};

// Add missing Newspaper icon import if used in fallback
function Newspaper({ className }: { className?: string }) {
   return (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
       <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
       <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
     </svg>
   )
}
