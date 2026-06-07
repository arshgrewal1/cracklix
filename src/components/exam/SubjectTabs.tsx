'use client';

import { useExamStore } from '@/store/useExamStore';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

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
    <nav className="bg-white border-b border-slate-100 h-10 flex items-center px-2 overflow-x-auto no-scrollbar gap-1.5 shrink-0 sticky top-0 z-40">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => setCurrentIdx(s.startIdx)}
          className={cn(
            "px-4 h-full flex items-center justify-center gap-2 transition-all whitespace-nowrap border-b-2",
            activeSectionId === s.id 
              ? "border-primary text-primary bg-orange-50/50" 
              : "border-transparent text-slate-400"
          )}
        >
          <span className="text-[9px] font-black uppercase tracking-widest">{s.name}</span>
          <span className={cn(
            "text-[8px] font-bold px-1.5 py-0.5 rounded-full",
            activeSectionId === s.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
          )}>
            {s.answered}/{s.total}
          </span>
        </button>
      ))}
    </nav>
  );
}