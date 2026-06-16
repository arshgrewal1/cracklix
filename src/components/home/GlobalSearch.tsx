'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Zap, BookOpen, Newspaper, Layers, GraduationCap, ChevronRight, Sparkles, X, Loader2 } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview Institutional Global Search Hub v1.0.
 * Performs real-time auditing across all preparation registries.
 */

const TRENDING = [
  { label: "Punjab Police Constable", href: "/exams/police-constable" },
  { label: "PSSSB Clerk 2025", href: "/exams/psssb-clerk" },
  { label: "Revenue Patwari Mock", href: "/mocks" },
  { label: "Latest Punjab GK", href: "/current-affairs" }
];

export default function GlobalSearch() {
  const db = useFirestore();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. DATA AGGREGATION
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));
  const { data: notes } = useCollection<any>(useMemo(() => (db ? collection(db, "notes") : null), [db]));
  const { data: pyqs } = useCollection<any>(useMemo(() => (db ? collection(db, "pyqs") : null), [db]));
  const { data: caHub } = useCollection<any>(useMemo(() => (db ? collection(db, "current_affairs_hub") : null), [db]));

  // 2. SEARCH LOGIC
  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return null;
    const term = query.toLowerCase();

    return {
      exams: (exams || []).filter(e => e.name?.toLowerCase().includes(term)).slice(0, 3),
      mocks: (mocks || []).filter(m => m.title?.toLowerCase().includes(term)).slice(0, 4),
      notes: (notes || []).filter(n => n.title?.toLowerCase().includes(term)).slice(0, 3),
      pyqs: (pyqs || []).filter(p => p.title?.toLowerCase().includes(term)).slice(0, 3),
      ca: (caHub || []).filter(c => c.title?.toLowerCase().includes(term)).slice(0, 2)
    };
  }, [query, exams, mocks, notes, pyqs, caHub]);

  const hasResults = results && (
    results.exams.length > 0 || 
    results.mocks.length > 0 || 
    results.notes.length > 0 || 
    results.pyqs.length > 0 || 
    results.ca.length > 0
  );

  // 3. EVENT HANDLERS
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
    <div className="relative w-full z-40 bg-white md:bg-transparent px-4 md:px-0 sticky top-16 md:static" ref={containerRef}>
      <div className="max-w-[700px] mx-auto relative group">
        {/* BACKGROUND GLOW */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
        
        <div className="relative">
          <Search className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
            isOpen ? "text-primary" : "text-slate-400"
          )} />
          
          <input
            type="text"
            placeholder="Search exams, mocks, notes, PYQs..."
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            className="w-full h-12 md:h-14 pl-12 pr-12 rounded-xl md:rounded-2xl border border-slate-200 bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm md:text-lg text-[#0F172A]"
          />

          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* DROPDOWN HUB */}
        {isOpen && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 max-h-[500px] overflow-y-auto custom-scrollbar">
            
            {/* 1. SUGGESTIONS (EMPTY STATE) */}
            {(!query || query.length < 2) ? (
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-primary fill-current" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trending Preparations</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((item) => (
                    <Link 
                      key={item.label} 
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 bg-slate-50 hover:bg-primary/5 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-600 hover:text-primary transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Zap className="h-3 w-3" /> {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : hasResults ? (
              <div className="divide-y divide-slate-50 text-left">
                
                {/* GROUP: EXAMS */}
                {results.exams.length > 0 && (
                  <SearchGroup label="EXAM VERTICALS">
                    {results.exams.map(e => (
                      <SearchResult key={e.id} href={`/exams/${e.id}`} title={e.name} sub="Official Hub" icon={<GraduationCap className="h-4 w-4" />} onClick={() => setIsOpen(false)} />
                    ))}
                  </SearchGroup>
                )}

                {/* GROUP: MOCKS */}
                {results.mocks.length > 0 && (
                  <SearchGroup label="MOCK TEST SERIES">
                    {results.mocks.map(m => (
                      <SearchResult key={m.id} href={`/mocks/${m.id}`} title={m.title} sub={`${m.totalQuestions} Questions`} icon={<Zap className="h-4 w-4 text-primary" />} onClick={() => setIsOpen(false)} />
                    ))}
                  </SearchGroup>
                )}

                {/* GROUP: PYQS */}
                {results.pyqs.length > 0 && (
                  <SearchGroup label="PREVIOUS PAPERS">
                    {results.pyqs.map(p => (
                      <SearchResult key={p.id} href="/pyqs" title={p.title} sub={`Official Paper ${p.year}`} icon={<Layers className="h-4 w-4 text-emerald-500" />} onClick={() => setIsOpen(false)} />
                    ))}
                  </SearchGroup>
                )}

                {/* GROUP: NOTES */}
                {results.notes.length > 0 && (
                  <SearchGroup label="STUDY NOTES">
                    {results.notes.map(n => (
                      <SearchResult key={n.id} href="/notes" title={n.title} sub={n.category} icon={<BookOpen className="h-4 w-4 text-blue-500" />} onClick={() => setIsOpen(false)} />
                    ))}
                  </SearchGroup>
                )}

                {/* GROUP: CURRENT AFFAIRS */}
                {results.ca.length > 0 && (
                  <SearchGroup label="STUDY UPDATES">
                    {results.ca.map(c => (
                      <SearchResult key={c.id} href="/current-affairs" title={c.title} sub="Latest Patterns" icon={<Newspaper className="h-4 w-4 text-orange-500" />} onClick={() => setIsOpen(false)} />
                    ))}
                  </SearchGroup>
                )}
              </div>
            ) : (
              <div className="p-12 text-center space-y-4 opacity-30">
                <Search className="h-12 w-12 mx-auto text-slate-300" />
                <p className="font-headline font-black uppercase text-sm tracking-widest">No preparation nodes found</p>
              </div>
            )}

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Institutional Global Registry v4.0</p>
               <Badge className="bg-white border-slate-200 text-slate-400 text-[8px] font-black uppercase px-2">SSL SECURED</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="p-4 space-y-2">
      <h5 className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</h5>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SearchResult({ href, title, sub, icon, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group active:scale-[0.98]"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm md:text-base text-[#0F172A] truncate uppercase leading-none">{title}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{sub}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1" />
    </Link>
  );
}
