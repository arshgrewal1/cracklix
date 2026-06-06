
'use client';

import { useExamStore } from '@/store/useExamStore';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * @fileOverview Professional Sectional Navigation with Live Progress.
 * Highlights the current section and shows Attempted/Total nodes.
 */
export default function SubjectTabs() {
  const { questions, currentIdx, setCurrentIdx, status } = useExamStore();

  const sections = useMemo(() => {
    const map = new Map<string, { id: string, name: string, startIdx: number, total: number, answered: number }>();
    
    questions.forEach((q, idx) => {
      const sid = q.sectionId || 'General';
      const st = status[idx];
      const isAnswered = st === 'answered' || st === 'answered-marked';

      if (!map.has(sid)) {
        map.set(sid, { 
          id: sid, 
          name: sid.replace(/-/g, ' ').toUpperCase(), 
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
    <nav className="bg-white border-b border-slate-200 h-12 flex items-center px-4 overflow-x-auto no-scrollbar gap-2 shrink-0 shadow-sm z-40 sticky top-0">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => setCurrentIdx(s.startIdx)}
          className={cn(
            "px-6 h-full flex items-center justify-center gap-3 transition-all whitespace-nowrap border-b-[3px]",
            activeSectionId === s.id 
              ? "border-[#F97316] text-[#F97316] bg-orange-50/30" 
              : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
          <span className={cn(
            "text-[9px] font-bold px-2 py-0.5 rounded-full",
            activeSectionId === s.id ? "bg-[#F97316] text-white" : "bg-slate-100 text-slate-400"
          )}>
            {s.answered}/{s.total}
          </span>
        </button>
      ))}
    </nav>
  );
}
