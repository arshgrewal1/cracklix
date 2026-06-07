'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { Pause, Play, Menu, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Timer from '@/components/mocks/Timer';

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
    mockTitle,
    timeLeft,
    currentIdx,
    questions,
  } = useExamStore();

  return (
    <header className="bg-[#0B1528] text-white flex flex-col shrink-0 z-[100] border-b border-white/5">
      <div className="h-12 md:h-16 flex items-center justify-between px-3 md:px-8">
        
        <div className="flex items-center gap-2 md:gap-4">
           <button onClick={onExitRequest} className="p-1 text-slate-400 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
           </button>
           
           <div className="flex flex-col items-start leading-none">
              <p className="text-[6px] md:text-[8px] font-black uppercase text-primary tracking-widest mb-0.5">PROGRESS</p>
              <p className="text-[12px] md:text-sm font-black text-white">
                 {currentIdx + 1}<span className="text-slate-500 text-[10px] font-bold">/{questions.length}</span>
              </p>
           </div>
        </div>

        <div className="flex-1 flex justify-center">
           <Timer 
             onTimeUp={() => {}} 
             initialSeconds={timeLeft} 
             isPaused={isPaused} 
           />
        </div>

        <div className="flex items-center gap-2">
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
             className="bg-primary hover:bg-orange-600 h-8 px-3 rounded-lg font-black uppercase text-[8px] md:text-[10px] tracking-widest gap-1.5 shadow-xl"
           >
              <Menu className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Palette</span>
           </Button>
        </div>
      </div>
    </header>
  );
}