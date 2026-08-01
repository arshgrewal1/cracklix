import React from "react"
import { Shield, GraduationCap, Scale, Zap, Stethoscope, Landmark, BookOpen, Activity, Cpu, Building2, Globe, Settings, FileText, FileStack, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

/**
 * @fileOverview Institutional Branding Engine v48.0.
 * FIXED: Removed white square boxes and implemented 'Icon Zoom' logic for seamless UI integration.
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
  const normalize = (id: string) => {
    if (!id) return "";
    return id.toLowerCase().trim().replace(/\s+/g, '-').replace(/\./g, '');
  };
  
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
    if (bId === 'mock-test' || bId.includes('mock') || bId.includes('test')) return <Zap className="h-full w-full text-primary" />;
    if (bId === 'study-material' || bId.includes('note')) return <BookOpen className="h-full w-full text-indigo-600" />;
    if (bId === 'pyq' || bId.includes('paper')) return <FileStack className="h-full w-full text-emerald-600" />;
    if (bId.includes('current')) return <Newspaper className="h-full w-full text-primary" />;
    if (bId.includes('computer')) return <Cpu className="h-full w-full text-blue-500" />;
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
      "relative shrink-0 transition-all flex items-center justify-center bg-transparent border-none shadow-none",
      containerSize, 
      className
    )}>
      {logoUrl ? (
        <div className="relative w-full h-full transition-transform duration-500 hover:scale-110 scale-110">
          <Image 
            src={logoUrl} 
            alt="Authority" 
            fill
            sizes="256px"
            className="object-contain"
            referrerPolicy="no-referrer"
            onError={(e) => {
               (e.target as any).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="h-full w-full p-0 opacity-20 scale-110">
          {getFallbackIcon()}
        </div>
      )}
    </div>
  );
};
