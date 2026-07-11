'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Zap, BookOpen, Newspaper, Layers, GraduationCap, ChevronRight, Sparkles, X, Loader2, Trophy } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview Institutional Sticky Search Hub v14.0.
 * FIXED: Reduced height to 52px and refined typography.
 */

const TRENDING = [
  { label: "PPSC", href: "/exams/hub/ppsc" },
  { label: "PSSSB", href: "/exams/hub/psssb" },
  { label: "Punjab Police", href: "/exams/hub/punjab-police" },
  { label: "Mock Tests", href: "/mocks" }
];

export default function GlobalSearch() {
  const db = useFirestore();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));
  const { data: notes } = useCollection<any>(useMemo(() => (db ? collection(db, "notes") : null), [db]));
  const { data: caHub } = useCollection<any>(useMemo(() => (db ? collection(db, "current_affairs_hub") : null), [db]));

  const results = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) return null;
    const term = debouncedQuery.toLowerCase();

    return {
      exams: (exams || []).filter(e => e.name?.toLowerCase().includes(term)).slice(0, 3),
      mocks: (mocks || []).filter(m => m.title?.toLowerCase().includes(term)).slice(0, 4),
      notes: (notes || []).filter(n => n.title?.toLowerCase().includes(term)).slice(0, 3),
      ca: (caHub || []).filter(c => c.title?.toLowerCase().includes(term)).slice(0, 2)
    };
  }, [debouncedQuery, exams, mocks, notes, caHub]);

  const hasResults = results && (
    results.exams.length > 0 || results.mocks.length > 0 || results.notes.length > 0 || results.ca.length > 0
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full z-40 bg-white md:bg-transparent px-4 md:px-0 sticky top-[56px] md:static" ref={containerRef}>
      <div className="max-w-[700px] mx-auto relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
        
        <div className="relative">
          <Search className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
            isOpen ? "text-primary" : "text-slate-400"
          )} />
          
          <input
            type="text"
            placeholder="Search exams, tests, notes..."
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            className="w-full h-[50px] md:h-[52px] pl-11 pr-12 rounded-xl border border-slate-200 bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium text-sm md:text-base text-[#0F172A]"
          />

          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-[1.5rem] shadow-5xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 max-h-[400px] overflow-y-auto custom-scrollbar">
            
            {(!query || query.length < 2) ? (
              <div className="p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary fill-primary" />
                  <p className="text-[10px] font-bold tracking-tight text-slate-400">Popular searches</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((item) => (
                    <Link 
                      key={item.label} 
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-primary/5 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-600 hover:text-primary transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Zap className="h-3 w-3" /> {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : hasResults ? (
              <div className="divide-y divide-slate-50 text-left">
                {results.exams.length > 0 && (
                  <SearchGroup label="Exams">
                    {results.exams.map(e => (
                      <SearchResult key={e.id} href={`/exams/view?id=${e.id}`} title={e.name} sub="Official hub" icon={<GraduationCap className="h-4 w-4" />} onClick={() => setIsOpen(false)} />
                    ))}
                  </SearchGroup>
                )}

                {results.mocks.length > 0 && (
                  <SearchGroup label="Mock tests">
                    {results.mocks.map(m => (
                      <SearchResult key={m.id} href={`/mocks/view?id=${m.id}`} title={m.title} sub={`${m.totalQuestions} questions`} icon={<Zap className="h-4 w-4 text-primary" />} onClick={() => setIsOpen(false)} />
                    ))}
                  </SearchGroup>
                )}

                {results.notes.length > 0 && (
                  <SearchGroup label="Study material">
                    {results.notes.map(n => (
                      <SearchResult key={n.id} href="/notes" title={n.title} sub={n.category} icon={<BookOpen className="h-4 w-4 text-blue-500" />} onClick={() => setIsOpen(false)} />
                    ))}
                  </SearchGroup>
                )}

                <SearchGroup label="Merit list">
                   <SearchResult href="/leaderboard" title="Hall of Rankers" sub="View state merit list" icon={<Trophy className="h-4 w-4 text-amber-500" />} onClick={() => setIsOpen(false)} />
                </SearchGroup>
              </div>
            ) : (
              <div className="p-10 text-center space-y-3 opacity-30">
                <Search className="h-10 w-10 mx-auto text-slate-300" />
                <p className="font-bold text-xs tracking-tight">No matching results</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="p-3 space-y-1">
      <h5 className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</h5>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SearchResult({ href, title, sub, icon, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group active:scale-[0.99]"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-[#0F172A] truncate leading-none">{title}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1.5">{sub}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all" />
    </Link>
  );
}