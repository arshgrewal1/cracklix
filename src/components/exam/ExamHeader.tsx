
'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { Pause, Play, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import Timer from '@/components/mocks/Timer';

/**
 * @fileOverview Professional Testbook-style CBT Header v2.5.
 * Calibrated for high-contrast visibility and dual-row mobile adaptability.
 */
export default function ExamHeader({ title, onPaletteToggle }: { title: string, onPaletteToggle: () => void }) {
  const { 
    isPaused, 
    setPaused, 
    language, 
    setLanguage, 
    currentIdx, 
    questions, 
    currentSectionId,
    timeLeft 
  } = useExamStore();

  const formattedSection = currentSectionId.replace(/-/g, ' ').toUpperCase();

  return (
    <header className="bg-[#0B1528] text-white flex flex-col shrink-0 shadow-xl border-b border-white/10 sticky top-0 z-50">
      
      {/* ROW 1: PRIMARY CONTROLS (Always visible, highly dense) */}
      <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/5">
        
        {/* LEFT: Identity */}
        <div className="flex items-center gap-4">
           <h1 className="hidden md:block font-black text-xs uppercase tracking-tight truncate max-w-[200px]">{title}</h1>
           <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/10">
              {(['en', 'pa', 'bi'] as const).map(l => (
                <button 
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[9px] font-black tracking-widest transition-all",
                    language === l ? "bg-[#F97316] text-white shadow-lg" : "text-[#CBD5E1] hover:text-white"
                  )}
                >
                  {l.toUpperCase()}
                </button>
              ))}
           </div>
        </div>

        {/* CENTER: High-Contrast Timer */}
        <div className="flex items-center gap-2 md:gap-3">
           <Timer 
             onTimeUp={() => {}} 
             initialSeconds={timeLeft} 
             isPaused={isPaused} 
           />
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={() => setPaused(!isPaused)}
             className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/10"
           >
             {isPaused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
           </Button>
        </div>

        {/* RIGHT: Finish Button */}
        <div className="flex items-center gap-2">
           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 md:px-6 rounded-lg font-black uppercase text-[9px] tracking-widest shadow-xl border-none">
              Finish
           </Button>
        </div>
      </div>

      {/* ROW 2: CONTEXT & PALETTE TRIGGER (Mobile Optimized) */}
      <div className="h-11 md:h-12 bg-white/5 flex items-center justify-between px-4 md:px-8">
         <div className="flex items-center gap-4 min-w-0">
            <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] truncate">
              SECTION: {formattedSection || 'MASTERY HUB'}
            </p>
         </div>
         
         <div className="flex items-center gap-6">
            <p className="font-black text-[10px] md:text-[11px] text-white uppercase tracking-widest">
               QUESTION {currentIdx + 1} OF {questions.length}
            </p>
            <button 
              onClick={onPaletteToggle}
              className="lg:hidden flex items-center gap-2 px-3 py-1 bg-white/10 rounded-md border border-white/10 text-[9px] font-black uppercase"
            >
               <LayoutGrid className="h-3 w-3 text-primary" /> Palette
            </button>
         </div>
      </div>
    </header>
  );
}
