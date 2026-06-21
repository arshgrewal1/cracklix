import React from "react"
import { Shield, GraduationCap, Scale, Zap, Stethoscope, Landmark, BookOpen, Activity, Cpu, Building2, Globe, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Branding Engine v21.0.
 * UPDATED: Added PSTET and CTET logo mappings based on local assets.
 */

const CANONICAL_BOARD_LOGOS: Record<string, string> = {
  'ppsc': '/logos/boards/ppsc.png',
  'psssb': '/logos/boards/psssb.png',
  'punjab-police': '/logos/boards/punjab-police.png',
  'teaching-hub': '/logos/boards/education-board.png',
  'pspcl': '/logos/boards/pspcl.png',
  'pstcl': '/logos/boards/pstcl.png',
  'bfuhs': '/logos/boards/bfuhs.png',
  'banking-hub': '/logos/boards/pscb.png',
  'judiciary-hub': '/logos/boards/high-court.png',
  'ssc': '/logos/boards/ssc.png',
  'rrb': '/logos/boards/rrb.png',
  'ibps': '/logos/boards/ibps.png',
  'defense': '/logos/boards/upsc.png',
  'pstet': '/logos/boards/pstet.png',
  'ctet': '/logos/boards/ctet.png'
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
    sm: "h-8 w-8 md:h-10 md:w-10",
    md: "h-10 w-10 md:h-14 md:w-14",
    lg: "h-16 w-16 md:h-24 md:w-24",
    xl: "h-20 w-20 md:h-32 md:w-32"
  };

  const containerSize = sizeClasses[size];

  if (logoUrl) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden flex items-center justify-center bg-white rounded-xl md:rounded-2xl p-1.5 shadow-inner", containerSize, className)}>
        <img 
          src={logoUrl} 
          alt="Official Authority Logo" 
          className="h-full w-full object-contain animate-in fade-in duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => { (e.target as any).style.display = 'none'; }}
        />
      </div>
    );
  }

  const getFallbackIcon = () => {
    if (cId.includes('govt')) return <Landmark className="h-full w-full text-amber-600" />;
    if (cId.includes('teaching')) return <BookOpen className="h-full w-full text-blue-600" />;
    if (cId.includes('technical')) return <Settings className="h-full w-full text-slate-600" />;
    if (cId.includes('bank')) return <Building2 className="h-full w-full text-emerald-700" />;
    if (cId.includes('judiciary')) return <Scale className="h-full w-full text-slate-700" />;
    if (cId.includes('central')) return <Globe className="h-full w-full text-blue-800" />;
    return <Shield className="h-full w-full text-slate-300" />;
  };

  return (
    <div className={cn("flex items-center justify-center p-1", containerSize, className)}>
      {getFallbackIcon()}
    </div>
  );
};
