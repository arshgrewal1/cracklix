
'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { Pause, Play, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { cn } from '@/lib/utils';
import Timer from '@/components/mocks/Timer';

/**
 * @fileOverview Institutional CBT Header v6.0.
 * Standardized: Language keys updated to match 'bilingual' canonical type.
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
    questions,
    isPaletteVisible,
    togglePalette
  } = useExamStore();

  return (
    <header className="bg-[#0B1528] text-white flex flex-col shrink-0 shadow-2xl z-50 select-none">
      <div className="h-14 flex items-center justify-between px-3 md:px-8">
        
        {/* LEFT: PAUSE & IDENTITY */}
        <div className="flex items-center gap-3 min-w-0">
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={() => setPaused(!isPaused)}
             className="h-9 w-9 rounded-xl bg-white/5 text-white hover:bg-white/10 shrink-0"
           >
             {isPaused ? <Play className="h-4 w-4 fill-current text-[#F97316]" /> : <Pause className="h-4 w-4 fill-current" />}
           </Button>
           <div className="hidden sm:block truncate ml-1">
              <p className="text-[6px] font-black uppercase text-slate-500 tracking-[0.3em] mb-0.5">Mock Series</p>
              <h1 className="text-[10px] md:text-[11px] font-black uppercase text-white tracking-tight truncate">{mockTitle}</h1>
           </div>
        </div>

        {/* CENTER: PROGRESS & TIMER */}
        <div className="flex items-center gap-4 md:gap-12">
           <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-8">
              <p className="text-[7px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Progress</p>
              <p className="text-sm font-black text-white leading-none">
                 Question {currentIdx + 1} <span className="text-slate-500 text-xs font-bold">/ {questions.length}</span>
              </p>
           </div>
           <Timer 
             onTimeUp={() => {}} 
             initialSeconds={timeLeft} 
             isPaused={isPaused} 
           />
        </div>

        {/* RIGHT: TACTICAL CONTROLS */}
        <div className="flex items-center gap-2 md:gap-5">
           <div className="hidden lg:flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10">
              {(['en', 'pa', 'bilingual'] as const).map(l => (
                <button 
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                    language === l ? "bg-[#F97316] text-white shadow-lg" : "text-slate-500 hover:text-white"
                  )}
                >
                  {l === 'bilingual' ? 'Bilingual' : l.toUpperCase()}
                </button>
              ))}
           </div>
           
           <Button 
             variant="ghost"
             onClick={() => {
                if (window.innerWidth < 1024) onPaletteToggle();
                else togglePalette();
             }}
             className="bg-[#F97316] hover:bg-orange-600 h-9 px-4 rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 shadow-xl"
           >
              {isPaletteVisible ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              <span className="hidden sm:inline">{isPaletteVisible ? 'Hide Palette' : 'Show Palette'}</span>
              <span className="sm:hidden">Palette</span>
           </Button>
        </div>
      </div>
    </header>
  );
}
