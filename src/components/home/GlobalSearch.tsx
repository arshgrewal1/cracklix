'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Zap, BookOpen, Newspaper, Layers, GraduationCap, ChevronRight, Sparkles, X, Loader2, Trophy, AlertCircle, FileText, Mic, Filter, ShieldCheck } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Institutional Sticky Search Hub v16.0.
 * FIXED: Implemented functional Voice Search (Mic).
 */

const TRENDING = [
  { label: "PPSC", href: "/exams/hub/ppsc" },
  { label: "PSSSB", href: "/exams/hub/psssb" },
  { label: "Punjab Police", href: "/exams/hub/punjab-police" },
  { label: "Mock tests", href: "/mocks" }
];

export default function GlobalSearch() {
  const db = useFirestore();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: exams, loading: eLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));
  const { data: mocks, loading: mLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));
  const { data: notes, loading: nLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "notes") : null), [db]));
  const { data: pyqs, loading: pLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "pyqs") : null), [db]));

  const isLoading = eLoading || mLoading || nLoading || pLoading;

  const results = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.trim().length < 2) return null;
    const term = debouncedQuery.toLowerCase().trim();

    const eMatches = (exams || []).filter(e => e.name?.toLowerCase().includes(term));
    const mMatches = (mocks || []).filter(m => m.title?.toLowerCase().includes(term));
    const nMatches = (notes || []).filter(n => n.title?.toLowerCase().includes(term));
    const pMatches = (pyqs || []).filter(p => p.title?.toLowerCase().includes(term));

    return {
      exams: eMatches.slice(0, 3),
      mocks: mMatches.slice(0, 4),
      notes: [...nMatches, ...pMatches].slice(0, 4)
    };
  }, [debouncedQuery, exams, mocks, notes, pyqs]);

  const hasResults = results && (
    results.exams.length > 0 || results.mocks.length > 0 || results.notes.length > 0
  );

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({ 
        variant: "destructive", 
        title: "Not Supported", 
        description: "Voice search is not supported in your browser." 
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsOpen(true);
    };

    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

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
    <section className="bg-white pb-6 pt-2">
      <div className="max-w-[1440px] mx-auto px-4 relative z-40" ref={containerRef}>
        <div className="max-w-[700px] mx-auto relative group w-full">
          
          <div className="relative flex items-center h-[56px] md:h-[68px] bg-slate-50 border border-slate-100 rounded-[20px] shadow-inner px-4 md:px-6 gap-2 md:gap-4 overflow-hidden focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300">
            <Search className={cn(
              "h-5 w-5 shrink-0 transition-colors",
              isOpen ? "text-primary" : "text-slate-400"
            )} />
            
            <input
              type="text"
              placeholder="Search exams, tests..."
              value={query}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              className="flex-1 min-w-0 bg-transparent border-none outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm md:text-xl"
            />

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
               {query && (
                 <button 
                   onClick={() => { setQuery(''); setDebouncedQuery(''); }}
                   className="p-1.5 hover:bg-slate-200 rounded-full transition-colors"
                 >
                   <X className="h-4 w-4 text-slate-400" />
                 </button>
               )}
               {isLoading && debouncedQuery && (
                 <Loader2 className="h-4 w-4 text-primary animate-spin mr-1" />
               )}
               <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
               <button 
                 onClick={startListening}
                 className={cn(
                   "h-9 w-9 md:h-11 md:w-11 rounded-xl flex items-center justify-center transition-all shrink-0",
                   isListening ? "bg-rose-500 text-white animate-pulse" : "text-slate-400 hover:text-primary"
                 )}
               >
                  <Mic className="h-4 w-4 md:h-5 md:w-5" />
               </button>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[1.5rem] shadow-5xl border border-slate-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto custom-scrollbar"
              >
                {(!debouncedQuery || debouncedQuery.length < 2) ? (
                  <div className="p-5 md:p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary fill-primary" />
                      <p className="text-[10px] font-bold tracking-tight text-slate-400 uppercase tracking-widest">Trending hubs</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING.map((item) => (
                        <Link 
                          key={item.label} 
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-2 bg-slate-50 hover:bg-primary/5 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-600 hover:text-primary transition-all flex items-center gap-2 active:scale-95 tracking-tight"
                        >
                          <Zap className="h-3 w-3" /> {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : hasResults ? (
                  <div className="divide-y divide-slate-50 text-left">
                    {results.exams.length > 0 && (
                      <SearchGroup label="Exam verticals">
                        {results.exams.map(e => (
                          <SearchResult key={e.id} href={`/exams/view?id=${e.id}`} title={e.name} sub={`${e.boardId} Hub`} icon={<GraduationCap className="h-4 w-4" />} onClick={() => setIsOpen(false)} />
                        ))}
                      </SearchGroup>
                    )}

                    {results.mocks.length > 0 && (
                      <SearchGroup label="Practice mocks">
                        {results.mocks.map(m => (
                          <SearchResult key={m.id} href={`/mocks/view?id=${m.id}`} title={m.title} sub={`${m.totalQuestions} items`} icon={<Zap className="h-4 w-4 text-primary" />} onClick={() => setIsOpen(false)} />
                        ))}
                      </SearchGroup>
                    )}

                    {results.notes.length > 0 && (
                      <SearchGroup label="Study material">
                        {results.notes.map(n => (
                          <SearchResult key={n.id} href="/notes" title={n.title} sub={n.category || 'PDF'} icon={<FileText className="h-4 w-4 text-blue-500" />} onClick={() => setIsOpen(false)} />
                        ))}
                      </SearchGroup>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center space-y-4 opacity-40">
                    <AlertCircle className="h-12 w-12 mx-auto text-slate-300" />
                    <div className="space-y-1">
                       <p className="font-bold text-sm tracking-tight text-[#0F172A]">No results matched</p>
                       <p className="text-[10px] font-medium text-slate-400">Try searching for PSSSB or Police.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Official System Verified Badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-slate-400">
           <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
           <span className="text-[9px] font-bold uppercase tracking-widest antialiased">Official system verified</span>
        </div>
      </div>
    </section>
  );
}

function SearchGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="p-4 space-y-2">
      <h5 className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</h5>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SearchResult({ href, title, sub, icon, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group active:scale-[0.99] border border-transparent hover:border-slate-100"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm md:text-base text-[#0F172A] truncate leading-tight">{title}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{sub}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1 shrink-0" />
    </Link>
  );
}
