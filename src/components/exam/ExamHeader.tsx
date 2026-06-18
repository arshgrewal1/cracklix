'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { Pause, Play, ChevronLeft, Languages } from 'lucide-react';
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
  { label: "ਪੰਜਾਬੀ ONLY", value: "PUNJABI" },
  { label: "HINDI ONLY", value: "HINDI" },
  { label: "ENGLISH & ਪੰਜਾਬੀ", value: "ENGLISH_PUNJABI" },
  { label: "ENGLISH & हिन्दी", value: "ENGLISH_HINDI" },
];

/**
 * @fileOverview Hardened CBT Header v34.0 (Responsive Hardened).
 * FIXED: Shrinkage and scaling for 320px devices to prevent overlap between Timer and Progress.
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
    <header className="bg-[#0B1528] text-white flex flex-col shrink-0 z-[100] border-b border-white/5 shadow-md relative h-10 md:h-12">
      <div className="h-full flex items-center justify-between px-2 md:px-6">
        
        {/* LEFT: BACK & PROGRESS */}
        <div className="flex items-center gap-1 md:gap-3 shrink-0 flex-1">
           <button 
             onClick={onExitRequest} 
             className="p-1.5 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-90"
           >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
           </button>
           
           <div className="flex items-baseline gap-1 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
              <span className="text-[11px] md:text-base font-black text-primary tabular-nums">
                 {currentIdx + 1}
              </span>
              <span className="text-[7px] md:text-[10px] font-bold uppercase text-slate-600">
                 /{questionsCount}
              </span>
           </div>
        </div>

        {/* CENTER: TIMER - SCALED FOR SMALL SCREENS */}
        <div className="flex justify-center px-1 shrink-0 scale-[0.6] xs:scale-[0.8] md:scale-95">
           <Timer 
             onTimeUp={() => {}} 
             initialSeconds={timeLeft} 
             isPaused={isPaused} 
           />
        </div>

        {/* RIGHT: COMMANDS */}
        <div className="flex items-center justify-end gap-1 md:gap-2 flex-1">
           {availableModes.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <button className="h-7 w-7 md:h-9 md:w-9 bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center">
                      <Languages className="h-3.5 w-3.5 text-primary" />
                   </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 bg-[#0F172A] border-white/10 text-white rounded-xl shadow-2xl p-1 z-[2000]">
                   {availableModes.map((mode) => (
                      <DropdownMenuItem 
                        key={mode.value} 
                        onSelect={() => setLanguage(mode.value)}
                        className={cn(
                          "text-[9px] font-black uppercase px-4 py-2.5 rounded-lg cursor-pointer tracking-wider",
                          language === mode.value ? "bg-primary text-white" : "hover:bg-white/5 text-slate-400"
                        )}
                      >
                         {mode.label}
                      </DropdownMenuItem>
                   ))}
                </DropdownMenuContent>
              </DropdownMenu>
           )}

           <button 
             onClick={() => setPaused(!isPaused)}
             className="h-7 w-7 md:h-9 md:w-9 bg-white/5 text-white border border-white/10 rounded-lg flex items-center justify-center active:scale-90"
           >
             {isPaused ? <Play className="h-3.5 w-3.5 fill-current text-primary" /> : <Pause className="h-3.5 w-3.5 fill-current" />}
           </button>
           
           <button 
             onClick={onPaletteToggle}
             className="bg-primary text-white h-7 px-2 md:px-5 rounded-lg font-black uppercase text-[8px] md:text-[10px] tracking-tight flex items-center justify-center shadow-md active:scale-90 border-none"
           >
              MAP
           </button>
        </div>
      </div>
    </header>
  );
}