
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
  { label: "ਪੰਜਾਬੀ ONLY", value: "PUNJABI" },
  { label: "HINDI ONLY", value: "HINDI" },
  { label: "ENGLISH & ਪੰਜਾਬੀ", value: "ENGLISH_PUNJABI" },
  { label: "ENGLISH & HINDI", value: "ENGLISH_HINDI" },
];

/**
 * @fileOverview Production-Grade CBT Header v27.0.
 * FIXED: Mobile overlap issues and strict timer-synchronization logic.
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
    <header className="bg-[#0B1528] text-white flex flex-col shrink-0 z-[100] border-b border-white/5 shadow-lg relative">
      <div className="h-14 md:h-18 flex items-center justify-between px-3 md:px-6">
        
        {/* LEFT: BACK & PROGRESS PILL */}
        <div className="flex items-center gap-1 md:gap-4 shrink-0 min-w-0 flex-1">
           <button 
             onClick={onExitRequest} 
             className="p-1 text-slate-400 hover:text-white transition-all cursor-pointer"
           >
              <ChevronLeft className="h-5 w-5" />
           </button>
           
           <div className="flex items-baseline gap-1 min-w-0 ml-1 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
              <p className="text-sm md:text-xl font-black text-primary tabular-nums leading-none">
                 {currentIdx + 1}
              </p>
              <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-60 leading-none">
                 /{questionsCount}
              </p>
           </div>
        </div>

        {/* CENTER: CALIBRATED TIMER */}
        <div className="flex justify-center px-1">
           <Timer 
             onTimeUp={() => {}} 
             initialSeconds={timeLeft} 
             isPaused={isPaused} 
           />
        </div>

        {/* RIGHT: COMMAND HUB */}
        <div className="flex items-center justify-end gap-1.5 md:gap-4 shrink-0 flex-1">
           {availableModes.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <button className="h-10 w-10 md:h-11 md:w-11 bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center justify-center shadow-xl">
                      <Languages className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                   </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-[#0F172A] border-white/10 text-white rounded-xl shadow-2xl p-1">
                   {availableModes.map((mode) => (
                      <DropdownMenuItem 
                        key={mode.value} 
                        onSelect={() => setLanguage(mode.value)}
                        className={cn(
                          "text-[10px] font-black uppercase px-4 py-3 rounded-lg cursor-pointer tracking-wider",
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
             className="h-10 w-10 md:h-11 md:w-11 bg-white/5 text-white hover:bg-white/10 shrink-0 border border-white/10 rounded-xl flex items-center justify-center shadow-xl"
           >
             {isPaused ? <Play className="h-4 w-4 md:h-5 md:w-5 fill-current text-primary" /> : <Pause className="h-4 w-4 md:h-5 md:w-5 fill-current" />}
           </button>
           
           <button 
             onClick={onPaletteToggle}
             className="bg-[#F97316] hover:bg-orange-600 text-white h-10 md:h-11 px-3 md:px-5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center shadow-xl shadow-orange-500/20 transition-all border-none"
           >
              <span>MAP</span>
           </button>
        </div>
      </div>
    </header>
  );
}
