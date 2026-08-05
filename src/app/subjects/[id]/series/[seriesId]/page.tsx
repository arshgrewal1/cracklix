"use client"

import React, { useMemo, useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc } from "firebase/firestore"
import { Card } from "@/components/ui/card"
import { 
  ChevronRight, 
  ArrowLeft,
  Lock,
  Zap,
  Crown,
  CheckCircle2,
  ChevronDown,
  FileStack,
  Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { TestSeries, MockTest } from "@/types"
import { cn } from "@/lib/utils"
import { hasSeriesAccess } from "@/lib/access-control"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

/**
 * @fileOverview Professional Test Listing Hub v5.0 [PWA Fixed].
 * FIXED: Card overlap and collision issues on 320px screens.
 * FIXED: Content clipping below bottom navigation.
 * FIXED: Navigation guard added to prevent blinking/duplicate pushes.
 */

export default function SeriesDetailPortal() {
  const params = useParams()
  const seriesId = params?.seriesId as string
  const db = useFirestore()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const { data: series, loading: serLoading } = useDoc<TestSeries>(useMemo(() => (db && seriesId ? doc(db, "test_series", seriesId) : null), [db, seriesId]));
  const mocksQuery = useMemo(() => (db && seriesId ? query(collection(db, "mocks"), where("published", "==", true), where("seriesId", "==", seriesId)) : null), [db, seriesId]);
  const { data: mocks, loading: mocksLoading } = useCollection<MockTest>(mocksQuery as any);
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]));
  const attemptsQuery = useMemo(() => (db && user ? query(collection(db, "attempts"), where("userId", "==", user.uid)) : null), [db, user]);
  const { data: attempts } = useCollection<any>(attemptsQuery);

  const seriesAccess = useMemo(() => {
     if (!series) return { hasAccess: false };
     return hasSeriesAccess(profile, series);
  }, [profile, series]);

  const sections = useMemo(() => {
     if (!mocks) return { full: [], subject: {}, pyq: {} };
     
     const full = mocks.filter(m => m.mockType === 'FULL');
     const subjectTests = mocks.filter(m => m.mockType === 'SUBJECT' || m.mockType === 'SECTIONAL');
     const pyqs = mocks.filter(m => m.mockType === 'PYQ');

     const subjectGrouped = subjectTests.reduce((acc: any, m) => {
        const subName = subjects?.find((s:any) => s.id === m.learningSubjectId)?.name || 'General';
        if (!acc[subName]) acc[subName] = [];
        acc[subName].push(m);
        return acc;
     }, {});

     const pyqGrouped = pyqs.reduce((acc: any, p) => {
        const date = p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000) : new Date();
        const year = date.getFullYear().toString();
        if (!acc[year]) acc[year] = [];
        acc[year].push(p);
        return acc;
     }, {});

     return { full, subject: subjectGrouped, pyq: pyqGrouped };
  }, [mocks, subjects]);

  if (!mounted || serLoading || authLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="animate-spin text-[#147BFF] h-8 w-8" /></div>

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-body text-left">
      {/* TOP APP BAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] h-14 md:h-16 flex items-center px-4 md:px-8 gap-4 shadow-soft">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full transition-colors shrink-0">
          <ArrowLeft className="h-5 w-5 text-[#111827]" />
        </button>
        <h1 className="text-[18px] md:text-[20px] font-bold text-[#111827] truncate">
          {series?.title}
        </h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-[calc(120px+env(safe-area-inset-bottom))] space-y-8">
        
        {/* FULL LENGTH SECTION */}
        {sections.full.length > 0 && (
          <section className="space-y-4">
            <SectionHeader label="Full Length Tests" />
            <div className="space-y-3">
               {sections.full.map((m, i) => (
                  <TestCard 
                    key={m.id} 
                    test={m} 
                    index={i + 1} 
                    attempt={attempts?.find((a:any) => a.mockId === m.id)} 
                    hasAccess={seriesAccess.hasAccess} 
                  />
               ))}
            </div>
          </section>
        )}

        {/* SUBJECT SECTIONS */}
        {Object.entries(sections.subject).map(([subName, list]: [string, any]) => (
          <section key={subName} className="space-y-4">
             <SectionHeader label={subName} />
             <div className="space-y-3">
                {list.map((m: any, i: number) => (
                   <TestCard 
                    key={m.id} 
                    test={m} 
                    index={i + 1} 
                    attempt={attempts?.find((a:any) => a.mockId === m.id)} 
                    hasAccess={seriesAccess.hasAccess} 
                  />
                ))}
             </div>
          </section>
        ))}

        {/* PREVIOUS YEAR PAPERS */}
        {Object.keys(sections.pyq).length > 0 && (
          <section className="space-y-4">
            <SectionHeader label="Previous Year Papers" icon={<FileStack className="h-5 w-5 text-[#147BFF]" />} />
            <Accordion type="single" collapsible className="space-y-3">
              {Object.entries(sections.pyq).sort((a,b) => b[0].localeCompare(a[0])).map(([year, list]: [string, any]) => (
                <AccordionItem key={year} value={year} className="border-none">
                  <AccordionTrigger className="bg-white px-6 h-14 rounded-xl border border-[#E5E7EB] hover:no-underline font-bold text-[#111827] shadow-soft">
                     {year} Papers
                  </AccordionTrigger>
                  <AccordionContent className="pt-3 space-y-3 px-1">
                    {list.map((m: any, i: number) => (
                       <TestCard 
                         key={m.id} 
                         test={m} 
                         index={i + 1} 
                         attempt={attempts?.find((a:any) => a.mockId === m.id)} 
                         hasAccess={seriesAccess.hasAccess} 
                       />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {mocksLoading && <div className="py-20 text-center"><Loader2 className="animate-spin h-10 w-10 mx-auto text-[#147BFF]" /></div>}
        {!mocksLoading && mocks?.length === 0 && (
           <div className="py-20 text-center opacity-30 italic font-bold text-[#6B7280]">No tests discovered in this hub.</div>
        )}
      </main>
    </div>
  )
}

function SectionHeader({ label, icon }: any) {
  return (
    <div className="flex items-center gap-3 px-1">
      {icon || <div className="h-1.5 w-6 bg-[#147BFF] rounded-full" />}
      <h2 className="text-[15px] md:text-[17px] font-bold text-[#111827] uppercase tracking-tight">{label}</h2>
    </div>
  )
}

function TestCard({ test, index, attempt, hasAccess }: { test: MockTest, index: number, attempt: any, hasAccess: boolean }) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationGuard = useRef(false);

  const isCompleted = attempt?.status === 'COMPLETED';
  const isStarted = attempt?.status === 'IN_PROGRESS';
  const isPremium = test.accessLevel === 'PREMIUM';
  const locked = isPremium && !hasAccess;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigationGuard.current) return;
    
    navigationGuard.current = true;
    setIsNavigating(true);

    if (locked) {
      router.push('/pass');
    } else if (isCompleted) {
      router.push(`/results/view?id=${test.id}&attemptId=${attempt.attemptId}`);
    } else if (isStarted) {
      router.push(`/mocks/attempt?id=${test.id}`);
    } else {
      router.push(`/mocks/instructions?id=${test.id}`);
    }

    // Safety timeout to reset guard if navigation is cancelled or slow
    setTimeout(() => {
      navigationGuard.current = false;
      setIsNavigating(false);
    }, 2000);
  };

  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <Card onClick={handleClick} className="border border-[#E5E7EB] shadow-soft rounded-[18px] bg-white p-3 md:p-4 flex items-center gap-3 md:gap-4 cursor-pointer hover:border-[#147BFF]/30 transition-all group overflow-hidden relative">
        {/* LEFT: CIRCULAR NUMBER */}
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#147BFF] flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg shrink-0 transition-transform group-hover:scale-105">
          {index}
        </div>

        {/* CENTER: CONTENT */}
        <div className="flex-1 min-w-0 pr-1 md:pr-2">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1">
             <h3 className="text-sm md:text-[17px] font-bold text-[#111827] truncate leading-tight">{test.title}</h3>
             {isPremium && <Crown className="h-3 w-3 md:h-3.5 md:w-3.5 text-amber-500 fill-current shrink-0" />}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-2 md:gap-x-3 gap-y-1 text-[10px] md:text-[13px] font-medium text-[#6B7280]">
            <div className="flex items-center gap-1 whitespace-nowrap">
               <span>{test.totalQuestions}</span>
               <span className="text-[9px] opacity-60 uppercase font-black">Qs</span>
            </div>
            <span className="opacity-20 hidden md:inline">•</span>
            <div className="flex items-center gap-1 whitespace-nowrap">
               <span>{test.totalQuestions * (test.positiveMarks || 1)}</span>
               <span className="text-[9px] opacity-60 uppercase font-black">Pts</span>
            </div>
            <span className="opacity-20 hidden md:inline">•</span>
            <div className="flex items-center gap-1 whitespace-nowrap">
               <span>{test.duration}</span>
               <span className="text-[9px] opacity-60 uppercase font-black">Min</span>
            </div>
          </div>
        </div>

        {/* RIGHT: ACTION */}
        <div className="shrink-0 flex items-center">
          {isNavigating ? (
            <div className="h-9 w-20 md:w-24 bg-slate-50 flex items-center justify-center rounded-xl">
               <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : locked ? (
            <div className="h-9 md:h-10 px-3 md:px-4 flex items-center justify-center bg-slate-100 text-[#6B7280] rounded-xl font-bold text-[11px] md:text-[13px] gap-1.5">
               <Lock className="h-3 w-3" /> <span className="hidden xs:inline">Locked</span>
            </div>
          ) : isCompleted ? (
            <button className="h-9 md:h-10 px-3 md:px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-[11px] md:text-[13px] shadow-md transition-all active:scale-95 whitespace-nowrap">
               Result
            </button>
          ) : isStarted ? (
            <button className="h-9 md:h-10 px-3 md:px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-[11px] md:text-[13px] shadow-md transition-all active:scale-95 whitespace-nowrap">
               Resume
            </button>
          ) : (
            <button className="h-9 md:h-10 px-4 md:px-6 bg-[#147BFF] hover:bg-blue-600 text-white rounded-xl font-bold text-[11px] md:text-[13px] shadow-md transition-all active:scale-95 whitespace-nowrap flex items-center gap-1">
               Start <ChevronRight className="hidden md:inline h-4 w-4" />
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

