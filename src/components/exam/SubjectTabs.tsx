
'use client';

import { useExamStore } from '@/store/useExamStore';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * @fileOverview High-Fidelity Subject Hub v7.0.
 * Perfectly aligns with the user screenshot: white background, bold orange border for active state.
 */
export default function SubjectTabs() {
  const questions = useExamStore(s => s.questions);
  const currentIdx = useExamStore(s => s.currentIdx);
  const setCurrentIdx = useExamStore(s => s.setCurrentIdx);
  const status = useExamStore(s => s.status);

  const sections = useMemo(() => {
    const map = new Map<string, { id: string, name: string, startIdx: number, total: number, answered: number }>();
    
    (questions || []).forEach((q, idx) => {
      const sid = q.sectionId || 'General Hub';
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

  const activeSectionId = questions[currentIdx]?.sectionId || 'General Hub';

  return (
    <nav className="bg-white border-b border-slate-100 h-16 flex items-center px-4 overflow-x-auto no-scrollbar gap-3 shrink-0 sticky top-0 z-40 shadow-sm">
      {sections.map((s) => {
        const isActive = activeSectionId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => setCurrentIdx(s.startIdx)}
            className={cn(
              "h-11 flex items-center justify-center px-4 rounded-xl border-2 transition-all whitespace-nowrap min-w-[48%] md:min-w-[200px]",
              isActive 
                ? "border-primary text-primary bg-white shadow-md" 
                : "border-slate-100 text-slate-400 bg-white"
            )}
          >
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-tighter leading-tight text-center truncate">
               {s.name.replace(/-/g, ' ')}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
