'use client';

import { useExamStore } from '@/store/useExamStore';
import { cn } from '@/lib/utils';
import { useMemo; } from 'react';

/**
 * @fileOverview Refined Subject Switching Hub (Absolute Minimum).
 * UPDATED: Reduced height to h-9 and font sizes to text-[7px].
 */
export default function SubjectTabs() {
  const questions = useExamStore(s => s.questions);
  const currentIdx = useExamStore(s => s.currentIdx);
  const setCurrentIdx = useExamStore(s => s.setCurrentIdx);
  const status = useExamStore(s => s.status);

  const sections = useMemo(() => {
    const map = new Map<string, { id: string, name: string, startIdx: number, total: number, answered: number }>();
    
    (questions || []).forEach((q, idx) => {
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
    <nav className="bg-white border-b border-slate-100 h-9 md:h-11 flex items-center px-1 overflow-x-auto no-scrollbar gap-1 shrink-0 sticky top-0 z-40">
      {sections.map((s) => {
        const isActive = activeSectionId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => setCurrentIdx(s.startIdx)}
            className={cn(
              "h-6 md:h-8 flex items-center justify-center px-2 rounded border transition-all whitespace-nowrap min-w-[90px] md:min-w-[120px]",
              isActive 
                ? "border-primary text-primary bg-orange-50/20" 
                : "border-slate-50 text-slate-400 bg-white hover:bg-slate-50"
            )}
          >
            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tighter truncate">
               {s.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
