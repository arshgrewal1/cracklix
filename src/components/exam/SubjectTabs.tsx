'use client';

import { useExamStore } from '@/store/useExamStore';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Question } from '@/types';

/**
 * @fileOverview Refined Subject Switching Hub v2.1 (Absolute Minimum).
 * UPDATED: Shrunken height to h-8 on mobile with micro-labels.
 */
export default function SubjectTabs() {
  const questions = useExamStore(s => s.questions);
  const currentIdx = useExamStore(s => s.currentIdx);
  const setCurrentIdx = useExamStore(s => s.setCurrentIdx);
  const status = useExamStore(s => s.status);

  const sections = useMemo(() => {
    const map = new Map<string, { id: string, name: string, startIdx: number, total: number, answered: number }>();
    
    (questions || []).forEach((q: Question, idx: number) => {
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

  const activeSectionId = questions[currentIdx]?.sectionId || 'General';

  return (
    <nav className="bg-white border-b border-slate-100 h-8 md:h-11 flex items-center px-1 overflow-x-auto no-scrollbar gap-0.5 shrink-0 sticky top-0 z-40">
      {sections.map((s) => {
        const isActive = activeSectionId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => setCurrentIdx(s.startIdx)}
            className={cn(
              "h-6 md:h-8 flex items-center justify-center px-1.5 rounded border transition-all whitespace-nowrap min-w-[70px] md:min-w-[120px]",
              isActive 
                ? "border-[#F97316] text-[#F97316] bg-orange-50/20 shadow-sm" 
                : "border-slate-50 text-slate-400 bg-white hover:bg-slate-50"
            )}
          >
            <span className="text-[6px] md:text-[8px] font-black uppercase tracking-tighter truncate">
               {s.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
}