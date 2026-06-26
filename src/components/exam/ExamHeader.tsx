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
  { label: "English Only", value: "ENGLISH" },
  { label: "ਪੰਜਾਬੀ Only", value: "PUNJABI" },
  { label: "Hindi Only", value: "HINDI" },
  { label: "English & ਪੰਜਾਬੀ", value: "ENGLISH_PUNJABI" },
  { label: "English & हिन्दी", value: "ENGLISH_HINDI" },
];

/**
 * @fileOverview Hardened CBT Header v38.1.
 * FIXED: Optimized MAP button and action slots to prevent horizontal collisions.
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
    <header className="bg-[#0B1528] text-white flex flex-col shrink-0 z-[100] border-b border-white/5 shadow-xl sticky top-0 pt-[env(safe-area-inset-top)]">
      <div className="h-14 md:h-18 flex items-center justify-between px-2 md:px-8 gap-1">
        
        {/* LEFT SLOT: Progress */}
        <div className="flex items-center gap-1 md:gap-4 flex-[0.8] min-w-0">
           <button 
             onClick={onExitRequest} 
             className="p-2 text-slate-400 hover:text-white transition-all active:scale-90 shrink-0"
           >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
           </button>
           
           <div className="flex items-center gap-1 bg-white/10 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-white/10 shrink-0 shadow-inner">
              <span className="text-sm md:text-xl font-black text-primary tabular-nums">
                 {currentIdx + 1}
              </span>
              <span className="text-[10px] md:text-xs font-bold text-slate-500">
                 /{questionsCount}
              </span>
           </div>
        </div>

        {/* CENTER SLOT: Timer */}
        <div className="flex justify-center shrink-0 px-0.5">
           <Timer 
             onTimeUp={() => {}} 
             initialSeconds={timeLeft} 
             isPaused={isPaused} 
           />
        </div>

        {/* RIGHT SLOT: Actions */}
        <div className="flex items-center justify-end gap-1 md:gap-3 flex-1 min-w-0">
           {availableModes.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <button className="h-8 w-8 md:h-12 md:w-12 bg-white/10 text-white hover:bg-white/20 border border-white/10 rounded-xl flex items-center justify-center transition-all shrink-0">
                      <Languages className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary" />
                   </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0F172A] border-white/10 text-white rounded-2xl shadow-5xl p-2 z-[2000]">
                   {availableModes.map((mode) => (
                      <DropdownMenuItem 
                        key={mode.value} 
                        onSelect={() => setLanguage(mode.value)}
                        className={cn(
                          "text-[11px] font-bold px-4 py-3 rounded-xl cursor-pointer mb-1 last:mb-0 transition-all",
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
             className="h-8 w-8 md:h-12 md:w-12 bg-white/10 text-white border border-white/10 rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0"
           >
             {isPaused ? <Play className="h-3.5 w-3.5 md:h-5 md:w-5 fill-current text-primary" /> : <Pause className="h-3.5 w-3.5 md:h-5 md:w-5 fill-current" />}
           </button>
           
           <button 
             onClick={onPaletteToggle}
             className="bg-primary hover:bg-blue-600 text-white h-8 md:h-12 px-2.5 md:px-8 rounded-xl font-black uppercase text-[9px] md:text-[11px] tracking-widest flex items-center justify-center shadow-lg active:scale-95 border-none transition-all"
           >
              Map
           </button>
        </div>
      </div>
    </header>
  );
}
