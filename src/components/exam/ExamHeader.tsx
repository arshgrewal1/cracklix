
'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { Pause, Play, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import Timer from '@/components/mocks/Timer';

/**
 * @fileOverview Institutional High-Fidelity Exam Header.
 * Updated: Palette button is hidden on desktop to satisfy "Single Palette" rule.
 */
export default function ExamHeader({ onPaletteToggle }: { onPaletteToggle: () => void }) {
  const { 
    isPaused, 
    setPaused, 
    language, 
    setLanguage, 
    mockTitle,
    timeLeft,
    currentIdx,
    questions
  } = useExamStore();

  return (
    <header className="bg-[#0B1528] text-white flex flex-col shrink-0 shadow-2xl z-50 select-none">
      <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8">
        
        {/* LEFT: PAUSE & IDENTITY */}
        <div className="flex items-center gap-4 min-w-0 max-w-[30%]">
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={() => setPaused(!isPaused)}
             className="h-9 w-9 rounded-xl bg-white/5 text-white hover:bg-white/10 shrink-0"
           >
             {isPaused ? <Play className="h-4 w-4 fill-current text-[#F97316]" /> : <Pause className="h-4 w-4 fill-current" />}
           </Button>
           <div className="hidden sm:block truncate">
              <p className="text-[7px] font-black uppercase text-slate-500 tracking-[0.2em] mb-0.5">Mock Series</p>
              <h1 className="text-[12px] font-black uppercase text-white tracking-tight truncate">{mockTitle}</h1>
           </div>
        </div>

        {/* CENTER: PROGRESS & TIMER */}
        <div className="flex flex-col items-center">
           <div className="flex items-center gap-4 md:gap-10">
              <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
                 <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Progress</p>
                 <p className="text-sm font-black text-white">
                    Question {currentIdx + 1} <span className="text-slate-500 text-[10px] font-bold">/ {questions.length}</span>
                 </p>
              </div>
              <Timer 
                onTimeUp={() => {}} 
                initialSeconds={timeLeft} 
                isPaused={isPaused} 
              />
           </div>
        </div>

        {/* RIGHT: TACTICAL CONTROLS */}
        <div className="flex items-center gap-2 md:gap-4">
           {/* Language Switcher */}
           <div className="hidden lg:flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
              {(['en', 'pa', 'bi'] as const).map(l => (
                <button 
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    language === l ? "bg-[#F97316] text-white shadow-lg" : "text-slate-500 hover:text-white"
                  )}
                >
                  {l === 'bi' ? 'Bilingual' : l.toUpperCase()}
                </button>
              ))}
           </div>
           
           <Button 
             onClick={onPaletteToggle}
             className="lg:hidden bg-[#F97316] hover:bg-orange-600 h-9 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl"
           >
              <LayoutGrid className="h-4 w-4" /> 
              <span>Palette</span>
           </Button>
        </div>
      </div>
    </header>
  );
}
