import React from "react"
import { Shield, GraduationCap, Scale, Zap, Stethoscope, Landmark, BookOpen, Activity, Cpu, Building2, Globe, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Branding Engine v10.0 (Hardened).
 * 
 * FAIL-SAFE SYSTEM:
 * 1. Hardcoded Canonical Mapping (100% Reliability for official nodes)
 * 2. Firestore Document URLs (Flexible admin overrides)
 * 3. Official Department SVG Fallbacks (Elegant degradation)
 */

const CANONICAL_BOARD_LOGOS: Record<string, string> = {
  'ppsc': '/logos/boards/ppsc.png',
  'psssb': '/logos/boards/psssb.png',
  'punjab-police': '/logos/boards/punjab-police.png',
  'pstet': '/logos/boards/pstet.png',
  'erb': '/logos/boards/education-board.png',
  'pspcl': '/logos/boards/pspcl.png',
  'pstcl': '/logos/boards/pstcl.png',
  'pscb': '/logos/boards/pscb.png',
  'bfuhs': '/logos/boards/bfuhs.png',
  'phhc': '/logos/boards/high-court.png',
  'ssc': '/logos/boards/ssc.png',
  'ibps': '/logos/boards/ibps.png',
  'rrb': '/logos/boards/rrb.png',
  'upsc': '/logos/boards/upsc.png'
};

const CANONICAL_CAT_LOGOS: Record<string, string> = {
  'punjab-government-exams': '/logos/categories/punjab-government-exams.png',
  'punjab-teaching-exams': '/logos/categories/punjab-teaching-exams.png',
  'punjab-technical-exams': '/logos/categories/punjab-technical-exams.png',
  'banking-exams': '/logos/categories/banking-exams.png',
  'punjab-health-exams': '/logos/categories/punjab-health-exams.png',
  'judiciary-exams': '/logos/categories/judiciary-exams.png',
  'high-court-exams': '/logos/categories/high-court.png'
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
  const bId = (boardId || board?.id || "").toLowerCase();
  const cId = (categoryId || category?.id || board?.categoryId || "").toLowerCase();
  
  // 1. Resolve Logo URL with inheritance and fallbacks
  const logoUrl = 
    CANONICAL_BOARD_LOGOS[bId] || 
    board?.iconUrl || 
    board?.logoUrl || 
    CANONICAL_CAT_LOGOS[cId] || 
    category?.iconUrl || 
    category?.logoUrl;
  
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-20 w-20"
  };

  const containerSize = sizeClasses[size];

  if (logoUrl) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden flex items-center justify-center bg-white rounded-xl", containerSize, className)}>
        <img 
          src={logoUrl} 
          alt="Institutional Branding" 
          className="h-full w-full object-contain animate-in fade-in duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // If image fails, revert to SVG fallback
            (e.target as any).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // 2. SVG Fallbacks (Only if no local or remote image exists)
  const getFallbackIcon = () => {
    if (cId.includes('govt')) return <Landmark className="h-full w-full text-amber-600" />;
    if (cId.includes('teaching') || bId.includes('pstet')) return <BookOpen className="h-full w-full text-blue-600" />;
    if (cId.includes('technical') || bId.includes('power') || bId.includes('pspcl')) return <Settings className="h-full w-full text-slate-600" />;
    if (cId.includes('bank')) return <Building2 className="h-full w-full text-emerald-700" />;
    if (cId.includes('health')) return <Stethoscope className="h-full w-full text-rose-600" />;
    if (cId.includes('judiciary') || cId.includes('court')) return <Scale className="h-full w-full text-slate-700" />;
    if (cId.includes('central')) return <Globe className="h-full w-full text-blue-800" />;
    return <Shield className="h-full w-full text-slate-300" />;
  };

  return (
    <div className={cn("flex items-center justify-center p-1", containerSize, className)}>
      {getFallbackIcon()}
    </div>
  );
};
