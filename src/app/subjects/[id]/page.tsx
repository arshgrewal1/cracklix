"use client"

import React, { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc } from "firebase/firestore"
import { Card } from "@/components/ui/card"
import { 
  ChevronRight, 
  ArrowLeft,
  Search,
  Zap,
  Layers,
  ZapOff
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { TestSeries, Subject } from "@/types"
import { AuthorityLogo } from "@/lib/exam-icons"
import { cn } from "@/lib/utils"

export default function SubjectDetailPortal() {
  const params = useParams()
  const subjectId = params?.id as string
  const db = useFirestore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => { setMounted(true) }, [])

  const { data: subject, loading: sLoading } = useDoc<Subject>(useMemo(() => (db && subjectId ? doc(db, "subjects", subjectId) : null), [db, subjectId]));
  const seriesQuery = useMemo(() => (db && subjectId ? query(collection(db, "test_series"), where("subjectId", "==", subjectId)) : null), [db, subjectId]);
  const { data: rawSeries, loading: serLoading } = useCollection<TestSeries>(seriesQuery as any);
  const mocksQuery = useMemo(() => (db && subjectId ? query(collection(db, "mocks"), where("published", "==", true), where("learningSubjectId", "==", subjectId)) : null), [db, subjectId]);
  const { data: mocks } = useCollection<any>(mocksQuery);

  const series = useMemo(() => {
     if (!rawSeries) return [];
     let base = rawSeries
        .filter(s => s.isActive !== false)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
     if (searchTerm) {
        base = base.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
     }
     return base;
  }, [rawSeries, searchTerm]);

  const seriesCounts = useMemo(() => {
    const map: Record<string, { tests: number, questions: number }> = {};
    if (!series || !mocks) return map;
    series.forEach(ser => {
      const tests = mocks.filter(m => m.seriesId === ser.id);
      map[ser.id] = {
        tests: tests.length,
        questions: tests.reduce((acc, m) => acc + (Number(m.totalQuestions) || 0), 0)
      };
    });
    return map;
  }, [series, mocks]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-body text-left">
      {/* TOP APP BAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] h-14 md:h-16 flex items-center px-4 md:px-8 gap-4 shadow-soft">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full transition-colors shrink-0">
          <ArrowLeft className="h-5 w-5 text-[#111827]" />
        </button>
        <h1 className="text-[20px] font-bold text-[#111827] truncate">
          {sLoading ? "Loading..." : subject?.name}
        </h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* SEARCH HUB */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <Input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="h-12 pl-11 rounded-xl bg-white border-[#E5E7EB] text-[15px] shadow-soft focus:ring-2 focus:ring-[#147BFF]/10 transition-all" 
            placeholder="Search series..." 
          />
        </div>

        {/* SERIES LIST */}
        <div className="space-y-3">
          {serLoading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[18px] bg-white border border-[#E5E7EB]" />)
          ) : series.length > 0 ? (
            series.map((item) => {
              const counts = seriesCounts[item.id] || { tests: 0, questions: 0 };
              return (
                <motion.div 
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/subjects/${subjectId}/series/${item.id}`)}
                >
                  <Card className="border border-[#E5E7EB] shadow-soft rounded-[18px] bg-white p-4 flex items-center gap-4 cursor-pointer hover:border-[#147BFF]/30 transition-all group overflow-hidden">
                    <div className="h-12 w-12 rounded-[14px] bg-[#F6F8FC] flex items-center justify-center shrink-0 border border-[#E5E7EB] shadow-inner group-hover:scale-105 transition-transform">
                      <AuthorityLogo boardId={item.boardId} size="sm" className="p-0 shadow-none border-none bg-transparent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[17px] font-bold text-[#111827] leading-tight break-words">{item.title}</h3>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                        <span className="text-[13px] font-medium text-[#6B7280] whitespace-nowrap">{counts.tests} Mock Tests</span>
                        <span className="h-1 w-1 rounded-full bg-[#E5E7EB] hidden sm:block" />
                        <span className="text-[13px] font-medium text-[#6B7280] whitespace-nowrap">{counts.questions} Questions</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#6B7280] opacity-30 group-hover:opacity-100 group-hover:text-[#147BFF] transition-all shrink-0" />
                  </Card>
                </motion.div>
              )
            })
          ) : (
            <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
              <ZapOff className="h-12 w-12 text-[#6B7280]" />
              <p className="text-[15px] font-bold uppercase tracking-widest text-[#6B7280]">No Series Available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
