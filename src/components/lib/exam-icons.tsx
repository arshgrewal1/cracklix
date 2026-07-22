import React from "react"
import { Shield, GraduationCap, Scale, Zap, Stethoscope, Landmark, BookOpen, Activity, Cpu, Building2, Globe, Settings, FileText, FileStack } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

/**
 * @fileOverview Institutional Branding Engine v34.0 (Maximization Overhaul).
 * FIXED: Removed aggressive rounded-full clipping and switched to object-contain for full logo visibility.
 */

const CANONICAL_BOARD_LOGOS: Record<string, string> = {
  'ppsc': '/logos/boards/ppsc.png',
  'psssb': '/logos/boards/psssb.png',
  'punjab-police': '/logos/boards/punjab-police.png',
  'teaching-hub': '/logos/boards/education-board.png',
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
  'punjab-technical-exams': '/logos/punjab-technical-exams.png',
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
    sm: "h-12 w-12 md:h-14 md:w-14",
    md: "h-16 w-16 md:h-24 md:w-24",
    lg: "h-24 w-24 md:h-32 md:w-32",
    xl: "h-32 w-32 md:h-48 md:w-48"
  };

  const containerSize = sizeClasses[size];

  if (logoUrl) {
    return (
      <div className={cn(
        "relative shrink-0 overflow-hidden transition-all bg-white rounded-2xl border border-slate-100 shadow-xl",
        containerSize, 
        className
      )}>
        <Image 
          src={logoUrl} 
          alt="Authority" 
          fill
          sizes="256px"
          className="object-contain p-1"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const getFallbackIcon = () => {
    if (bId === 'mock-test') return <Zap className="h-full w-full text-primary" />;
    if (bId === 'study-material') return <BookOpen className="h-full w-full text-indigo-600" />;
    if (bId === 'pyq') return <FileStack className="h-full w-full text-emerald-600" />;
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
      "flex items-center justify-center transition-all bg-white rounded-2xl border border-slate-100 shadow-xl",
      containerSize, 
      className
    )}>
      <div className="h-full w-full p-2">
        {getFallbackIcon()}
      </div>
    </div>
  );
};
