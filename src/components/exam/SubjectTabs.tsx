
'use client';

import { useExamStore } from '@/store/useExamStore';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * @fileOverview High-Density Subject Navigation v2.0.
 * UPDATED: Optimized tab width to show only 2-3 sections at a time on mobile.
 */
export default function SubjectTabs() {
  const questions = useExamStore(s => s.questions);
  const currentIdx = useExamStore(s => s.currentIdx);
  const setCurrentIdx = useExamStore(s => s.setCurrentIdx);
  const status = useExamStore(s => s.status);

  const sections = useMemo(() => {
    const map = new Map<string, { id: string, name: string, startIdx: number, total: number, answered: number }>();
    
    questions.forEach((q, idx) => {
      const sid = q.sectionId || 'General';
      const st = status[idx];
      const isAnswered = st === 'answered' || st === 'answered-marked';

      if (!map.has(sid)) {
        map.set(sid, { 
          id: sid, 
          name: sid.toUpperCase(), 
          startIdx: idx,
          total: 0,
          answered: 0
        });
      }
      
      const current = map.get(sid)!;
      current.total++;
      if (isAnswered) current.answered++;
    });
    
    return Array.from(map.values());
  }, [questions, status]);

  const activeSectionId = questions[currentIdx]?.sectionId || '';

  return (
    <nav className="bg-white border-b border-slate-200 h-11 flex items-center px-2 overflow-x-auto no-scrollbar gap-2 shrink-0 sticky top-0 z-40 pointer-events-auto">
      {sections.map((s) => {
        const isActive = activeSectionId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => setCurrentIdx(s.startIdx)}
            className={cn(
              "h-full flex items-center justify-between gap-2 transition-all whitespace-nowrap border-b-2 px-3 cursor-pointer active:scale-95 min-w-[140px] max-w-[180px]",
              isActive 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <span className="text-[9px] font-[900] uppercase tracking-tighter leading-none truncate flex-1 text-left">
               {s.name.replace(/-/g, ' ')}
            </span>
            <span className={cn(
              "text-[8px] font-black px-1.5 py-0.5 rounded-md shrink-0",
              isActive 
                ? "bg-primary text-white shadow-sm" 
                : "bg-slate-100 text-slate-400"
            )}>
              {s.answered}/{s.total}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
