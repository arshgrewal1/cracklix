
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

/**
 * @fileOverview Institutional CBT Header v11.0.
 * Updated: Translation options are now filtered by the Mock's available language registry.
 */
export default function ExamHeader({ 
  onPaletteToggle, 
  onExitRequest 
}: { 
  onPaletteToggle: () => void,
  onExitRequest: () => void
}) {
  const { 
    isPaused, 
    setPaused, 
    timeLeft,
    currentIdx,
    questions,
    language,
    baseLanguageMode,
    setLanguage
  } = useExamStore();

  const allLangModes: { label: string, value: LanguageDisplayMode }[] = [
    { label: "ENGLISH ONLY", value: "ENGLISH" },
    { label: "PUNJABI ONLY", value: "PUNJABI" },
    { label: "HINDI ONLY", value: "HINDI" },
    { label: "BILINGUAL (EN+PA)", value: "ENGLISH_PUNJABI" },
    { label: "BILINGUAL (EN+HI)", value: "ENGLISH_HINDI" },
  ];

  // Logic: Filter dropdown based on Admin's base configuration
  const availableModes = useMemo(() => {
    if (baseLanguageMode === 'ENGLISH_PUNJABI') {
      return allLangModes.filter(m => ['ENGLISH', 'PUNJABI', 'ENGLISH_PUNJABI'].includes(m.value));
    }
    if (baseLanguageMode === 'ENGLISH_HINDI') {
      return allLangModes.filter(m => ['ENGLISH', 'HINDI', 'ENGLISH_HINDI'].includes(m.value));
    }
    // For single language modes, only that one is relevant
    return allLangModes.filter(m => m.value === baseLanguageMode);
  }, [baseLanguageMode]);

  return (
    <header className="bg-[#0B1528] text-white flex flex-col shrink-0 z-[100] border-b border-white/5">
      <div className="h-12 flex items-center justify-between px-3 md:px-6">
        
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
           <button onClick={onExitRequest} className="p-1 text-slate-400 hover:text-white active:scale-90 transition-all">
              <ChevronLeft className="h-5 w-5" />
           </button>
           
           <div className="flex flex-col items-start leading-none">
              <p className="text-[6px] font-black uppercase text-primary tracking-widest mb-0.5">PROGRESS</p>
              <p className="text-[12px] font-black text-white">
                 {currentIdx + 1}<span className="text-slate-500 text-[10px] font-bold">/{questions.length}</span>
              </p>
           </div>
        </div>

        <div className="flex-1 flex justify-center px-1">
           <Timer 
             onTimeUp={() => {}} 
             initialSeconds={timeLeft} 
             isPaused={isPaused} 
           />
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
           {/* Runtime Filtered Language Hub */}
           {availableModes.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/5 text-white hover:bg-white/10 border border-white/5 rounded-lg">
                      <Languages className="h-3.5 w-3.5 text-primary" />
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0F172A] border-white/10 text-white rounded-xl shadow-2xl p-1">
                   {availableModes.map((mode) => (
                      <DropdownMenuItem 
                        key={mode.value} 
                        onClick={() => setLanguage(mode.value)}
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
             className="h-8 w-8 bg-white/5 text-white hover:bg-white/10 shrink-0 border border-white/5 rounded-lg"
           >
             {isPaused ? <Play className="h-3 w-3 fill-current text-primary" /> : <Pause className="h-3 w-3 fill-current" />}
           </Button>
           
           <Button 
             variant="ghost"
             onClick={onPaletteToggle}
             className="bg-primary hover:bg-orange-600 h-8 px-3 rounded-lg font-black uppercase text-[8px] tracking-widest gap-1.5 shadow-xl"
           >
              <Menu className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Palette</span>
           </Button>
        </div>
      </div>
    </header>
  );
}
