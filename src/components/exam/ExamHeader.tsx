
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
 * @fileOverview Institutional CBT Header v22.0.
 * Adjusted for maximum density to match user screenshot hierarchy perfectly.
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
      <div className="h-14 md:h-16 flex items-center justify-between px-2 md:px-6">
        
        {/* LEFT: BACK & PROGRESS & TITLE */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0 min-w-0 flex-1">
           <button 
             onClick={onExitRequest} 
             className="p-1 text-slate-400 hover:text-white active:scale-90 transition-all cursor-pointer"
           >
              <ChevronLeft className="h-5 w-5" />
           </button>
           
           <div className="flex flex-col items-start leading-none gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                 <p className="text-[8px] font-black uppercase text-primary tracking-widest">PROGRESS</p>
                 <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">EXAM HUB</p>
              </div>
              <div className="flex items-baseline gap-2 min-w-0">
                 <p className="text-[14px] md:text-[18px] font-black text-white shrink-0">
                    {currentIdx + 1}<span className="text-slate-500 text-[10px] md:text-[12px] font-bold">/{questionsCount}</span>
                 </p>
                 <p className="text-[10px] md:text-[13px] font-black text-white uppercase truncate max-w-[120px] md:max-w-[240px]">{mockTitle}</p>
              </div>
           </div>
        </div>

        {/* CENTER: TIMER PILL */}
        <div className="flex justify-center px-1">
           <Timer 
             onTimeUp={() => {}} 
             initialSeconds={timeLeft} 
             isPaused={isPaused} 
           />
        </div>

        {/* RIGHT: ACTIONS HUB */}
        <div className="flex items-center justify-end gap-1.5 md:gap-4 shrink-0 flex-1">
           {availableModes.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <button className="h-9 w-9 md:h-11 md:w-11 bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95 flex items-center justify-center">
                      <Languages className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                   </button>
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

           <button 
             onClick={() => setPaused(!isPaused)}
             className="h-9 w-9 md:h-11 md:w-11 bg-white/5 text-white hover:bg-white/10 shrink-0 border border-white/10 rounded-xl active:scale-95 flex items-center justify-center"
           >
             {isPaused ? <Play className="h-4 w-4 md:h-5 md:w-5 fill-current text-primary" /> : <Pause className="h-4 w-4 md:h-5 md:w-5 fill-current" />}
           </button>
           
           <button 
             onClick={onPaletteToggle}
             className="bg-primary hover:bg-orange-600 h-9 w-9 md:h-12 md:px-6 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center shadow-xl transition-all active:scale-95 border-none"
           >
              <Menu className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Palette</span>
           </button>
        </div>
      </div>
    </header>
  );
}
