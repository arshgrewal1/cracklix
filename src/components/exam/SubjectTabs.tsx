
'use client';

import { useExamStore } from '@/store/useExamStore';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * @fileOverview Refined Subject Switching Hub (Compact).
 * UPDATED: Slimmer height and reduced font-sizes for high-density UI.
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
    <nav className="bg-white border-b border-slate-100 h-11 md:h-12 flex items-center px-2 overflow-x-auto no-scrollbar gap-1.5 shrink-0 sticky top-0 z-40">
      {sections.map((s) => {
        const isActive = activeSectionId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => setCurrentIdx(s.startIdx)}
            className={cn(
              "h-8 md:h-9 flex items-center justify-center px-3 rounded-md border transition-all whitespace-nowrap min-w-[110px] md:min-w-[140px]",
              isActive 
                ? "border-primary text-primary bg-orange-50/30" 
                : "border-slate-50 text-slate-400 bg-white hover:bg-slate-50"
            )}
          >
            <span className="text-[8px] md:text-[9px] font-[900] uppercase tracking-tight truncate">
               {s.name.replace(/-/g, ' ')}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
