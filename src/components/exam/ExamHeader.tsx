
'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { Pause, Play, Menu, ChevronLeft, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import Timer from '@/components/mocks/Timer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageDisplayMode } from '@/types';
import { useMemo } from 'react';

const ALL_LANG_MODES: { label: string, value: LanguageDisplayMode }[] = [
  { label: "ENGLISH ONLY", value: "ENGLISH" },
  { label: "PUNJABI ONLY", value: "PUNJABI" },
  { label: "HINDI ONLY", value: "HINDI" },
  { label: "BILINGUAL (EN+PA)", value: "ENGLISH_PUNJABI" },
  { label: "BILINGUAL (EN+HI)", value: "ENGLISH_HINDI" },
];

/**
 * @fileOverview Institutional CBT Header v18.0.
 * UPDATED: Optimized for high visibility of Mock Title and Palette Button across all breakpoints.
 */
export default function ExamHeader({ 
  onPaletteToggle, 
  onExitRequest 
}: { 
  onPaletteToggle: () => void,
  onExitRequest: () => void
}) {
  const language = useExamStore(s => s.language);
  const baseLanguageMode = useExamStore(s => s.baseLanguageMode);
  const isPaused = useExamStore(s => s.isPaused);
  const setPaused = useExamStore(s => s.setPaused);
  const timeLeft = useExamStore(s => s.timeLeft);
  const currentIdx = useExamStore(s => s.currentIdx);
  const questionsCount = useExamStore(s => s.questions.length);
  const setLanguage = useExamStore(s => s.setLanguage);
  const mockTitle = useExamStore(s => s.mockTitle);

  const availableModes = useMemo(() => {
    if (baseLanguageMode === 'ENGLISH_PUNJABI') {
      return ALL_LANG_MODES.filter(m => ['ENGLISH', 'PUNJABI', 'ENGLISH_PUNJABI'].includes(m.value));
    }
    if (baseLanguageMode === 'ENGLISH_HINDI') {
      return ALL_LANG_MODES.filter(m => ['ENGLISH', 'HINDI', 'ENGLISH_HINDI'].includes(m.value));
    }
    return ALL_LANG_MODES.filter(m => m.value === baseLanguageMode);
  }, [baseLanguageMode]);

  return (
    <header className="bg-[#0B1528] text-white flex flex-col shrink-0 z-[100] border-b border-white/5 shadow-lg">
      <div className="h-12 md:h-16 flex items-center justify-between px-3 md:px-6">
        
        {/* LEFT: BACK & PROGRESS & TITLE */}
        <div className="flex items-center gap-2 md:gap-6 shrink-0 min-w-0 flex-1">
           <button 
             onClick={onExitRequest} 
             className="p-1 text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer"
           >
              <ChevronLeft className="h-6 w-6" />
           </button>
           
           <div className="flex flex-col items-start leading-none gap-0.5">
              <p className="text-[7px] md:text-[9px] font-black uppercase text-primary tracking-[0.2em]">PROGRESS</p>
              <p className="text-[14px] md:text-[18px] font-black text-white">
                 {currentIdx + 1}<span className="text-slate-500 text-[10px] md:text-[12px] font-bold">/{questionsCount}</span>
              </p>
           </div>

           <div className="hidden sm:flex h-8 w-px bg-white/10 mx-2" />

           <div className="hidden sm:flex flex-col items-start leading-none min-w-0 max-w-[240px]">
              <p className="text-[7px] md:text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-0.5">EXAM HUB</p>
              <p className="text-[11px] md:text-[13px] font-black text-white uppercase truncate w-full">{mockTitle}</p>
           </div>
        </div>

        {/* CENTER: TIMER PILL */}
        <div className="flex-1 flex justify-center px-1">
           <Timer 
             onTimeUp={() => {}} 
             initialSeconds={timeLeft} 
             isPaused={isPaused} 
           />
        </div>

        {/* RIGHT: ACTIONS HUB */}
        <div className="flex items-center justify-end gap-2 md:gap-5 shrink-0 flex-1">
           {availableModes.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-9 w-9 md:h-11 md:w-11 bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95">
                      <Languages className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0F172A] border-white/10 text-white rounded-xl shadow-2xl p-1">
                   {availableModes.map((mode) => (
                      <DropdownMenuItem 
                        key={mode.value} 
                        onSelect={() => setLanguage(mode.value)}
                        className={cn(
                          "text-[10px] font-black uppercase px-4 py-3.5 rounded-lg cursor-pointer tracking-wider",
                          language === mode.value ? "bg-primary text-white" : "hover:bg-white/5 text-slate-400"
                        )}
                      >
                         {mode.label}
                      </DropdownMenuItem>
                   ))}
                </DropdownMenuContent>
              </DropdownMenu>
           )}

           <Button 
             variant="ghost" 
             size="icon" 
             onClick={() => setPaused(!isPaused)}
             className="h-9 w-9 md:h-11 md:w-11 bg-white/5 text-white hover:bg-white/10 shrink-0 border border-white/10 rounded-xl active:scale-95"
           >
             {isPaused ? <Play className="h-4 w-4 md:h-5 md:w-5 fill-current text-primary" /> : <Pause className="h-4 w-4 md:h-5 md:w-5 fill-current" />}
           </Button>
           
           <Button 
             variant="ghost"
             onClick={onPaletteToggle}
             className="bg-[#F97316] hover:bg-orange-600 h-9 md:h-12 px-3 md:px-6 rounded-xl font-black uppercase text-[8px] md:text-[11px] tracking-widest gap-2 md:gap-3 shadow-xl transition-all active:scale-95"
           >
              <Menu className="h-4 w-4" />
              <span className="hidden xs:inline">Palette</span>
           </Button>
        </div>
      </div>
    </header>
  );
}
