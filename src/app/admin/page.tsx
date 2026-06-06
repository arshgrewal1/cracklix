
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Database, Users, ShieldCheck, Rocket, Zap, RefreshCw, ChevronRight, ListTree, Loader2, FileText, Newspaper } from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { seedInitialData } from "@/services/seed-data"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Final Command Center v7.3.
 * Features: Dynamic Subject Detection & Real-time Institutional Counting.
 */

export default function AdminDashboard() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)

  // Real-time Collections - Global count for accurate recovery reporting
  const { data: users, loading: uLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "users") : null), [db]))
  const { data: questions, loading: qLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: mocks, loading: mLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))
  const { data: notes } = useCollection<any>(useMemo(() => (db ? collection(db, "notes") : null), [db]))
  const { data: pyqs } = useCollection<any>(useMemo(() => (db ? collection(db, "pyqs") : null), [db]))

  const proUsers = useMemo(() => users?.filter((u: any) => u.status && u.status !== 'Free') || [], [users]);

  // Dynamic Subject Matrix - Calculates counts for every section found in the database
  const subjectBreakdown = useMemo(() => {
    if (!questions) return [];
    
    // Extract unique subject IDs directly from questions to ensure 100% coverage
    const uniqueSubjectIds = Array.from(new Set(questions.map((q: any) => q.subjectId))).filter(Boolean);
    
    return uniqueSubjectIds.map(id => {
       const subjectName = subjects?.find((s: any) => s.id === id)?.name || id.replace('-', ' ').toUpperCase();
       return {
          id,
          name: subjectName,
          count: questions.filter((q: any) => q.subjectId === id).length
       }
    }).sort((a, b) => b.count - a.count);
  }, [questions, subjects]);

  const examBreakdown = useMemo(() => {
    if (!exams || !questions) return [];
    return exams.map(e => ({
      id: e.id,
      name: e.name,
      mockCount: mocks?.filter((m: any) => m.examId === e.id).length || 0,
      questionCount: questions.filter((q: any) => q.examId === e.id).length,
    })).sort((a, b) => b.questionCount - a.questionCount);
  }, [exams, mocks, questions]);

  const handleSyncDatabase = async () => {
    if (!db) return
    setIsSyncing(true)
    try {
      await seedInitialData(db)
      toast({ title: "Repository Synced", description: "Official Punjab Exam hierarchy pushed to Firestore." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-12 pb-20 pt-4 text-[#0F172A] text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="text-left">
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Registry Overview</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Command Center</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
             Audit: {qLoading ? '...' : questions?.length || 0} Atomic Nodes Locked • {mLoading ? '...' : mocks?.filter((m: any) => m.published).length || 0} Live Mocks.
          </p>
        </div>
        <div className="flex gap-4">
           <Button onClick={handleSyncDatabase} disabled={isSyncing} variant="outline" className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-3 border-slate-200 bg-white">
              {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />} Repo Sync
           </Button>
           <Button asChild className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-10 font-black shadow-2xl uppercase tracking-widest text-xs">
            <Link href="/admin/mocks/builder"><Plus className="mr-3 h-5 w-5" /> Assemble Mock</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
         <StatCard label="MCQ Bank Volume" value={questions?.length ?? "..."} icon={<Database className="text-blue-500" />} />
         <StatCard label="Live Series" value={mocks?.filter((m: any) => m.published).length ?? "..."} icon={<Zap className="text-primary" />} />
         <StatCard label="Pro Aspirants" value={proUsers.length} icon={<Users className="text-emerald-500" />} />
         <StatCard label="Audit Archives" value={pyqs?.length ?? "..."} icon={<FileText className="text-orange-500" />} />
         <StatCard label="Study Notes" value={notes?.length ?? "..."} icon={<Newspaper className="text-rose-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         <Card className="lg:col-span-7 border-none shadow-3xl bg-white rounded-[3.5rem] overflow-hidden text-left">
            <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/30">
               <div className="flex items-center justify-between">
                  <div className="text-left">
                     <CardTitle className="text-2xl font-headline font-black uppercase text-[#0F172A]">Subject breakdown hub</CardTitle>
                     <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Question distribution across the entire registry.</CardDescription>
                  </div>
                  <Button variant="ghost" asChild className="text-primary font-black uppercase text-[10px] tracking-widest">
                     <Link href="/admin/subjects">Subject Hub <ChevronRight className="h-3 w-3 ml-2" /></Link>
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {qLoading ? (
                     <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                        <Loader2 className="h-10 w-10 animate-spin" />
                        <p className="font-black uppercase text-[10px]">Auditing Registry...</p>
                     </div>
                  ) : subjectBreakdown.length > 0 ? subjectBreakdown.map((s) => (
                     <div key={s.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-6">
                           <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs">
                              {s.name[0]}
                           </div>
                           <div>
                              <p className="font-black text-[#0B1528] text-lg uppercase leading-none">{s.name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                {s.count} Total MCQs in Registry
                              </p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-headline font-black text-primary leading-none">{s.count}</p>
                           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Registry Nodes</p>
                        </div>
                     </div>
                  )) : (
                     <div className="p-20 text-center text-slate-400 italic">No nodes detected in global bank.</div>
                  )}
               </div>
            </CardContent>
         </Card>

         <div className="lg:col-span-5 space-y-10">
            <Card className="border-none shadow-3xl bg-[#0B1528] text-white rounded-[3.5rem] overflow-hidden text-left relative">
               <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><ListTree className="h-48 w-48" /></div>
               <CardHeader className="p-12 border-b border-white/5 relative z-10">
                  <div className="space-y-1">
                     <CardTitle className="text-2xl font-headline font-black uppercase">Vertical Density</CardTitle>
                     <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Content distribution across official exams.</CardDescription>
                  </div>
               </CardHeader>
               <CardContent className="p-0 relative z-10">
                  <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                     {examBreakdown.map((e) => (
                        <div key={e.id} className="p-8 flex items-center justify-between">
                           <div className="space-y-1">
                              <p className="font-bold text-white uppercase text-sm">{e.name}</p>
                              <p className="text-[9px] font-black text-primary uppercase tracking-widest">{e.mockCount} Series Published</p>
                           </div>
                           <div className="text-right">
                              <span className="text-xl font-black text-white">{e.questionCount}</span>
                              <p className="text-[7px] font-black text-slate-500 uppercase">MCQs</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none bg-primary rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform"><Zap className="h-32 w-32 fill-current" /></div>
               <div className="relative z-10 space-y-4">
                  <h4 className="text-2xl font-headline font-black uppercase leading-none">Audit Ready</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-200">System Integrity: 100%</p>
                  <Button asChild className="bg-[#0B1528] hover:bg-black text-white border-none rounded-xl h-11 px-8 font-black uppercase text-[10px] tracking-widest mt-4">
                     <Link href="/admin/questions">Browse Bank</Link>
                  </Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: any) {
   return (
      <Card className="border-none shadow-xl bg-white p-6 rounded-[2.5rem] group hover:translate-y-[-4px] transition-all text-left">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
               {icon}
            </div>
            <div className="min-w-0">
               <p className="text-2xl font-headline font-black text-[#0F172A] leading-none">
                  {value === "..." ? <Loader2 className="h-4 w-4 animate-spin text-slate-300" /> : value}
               </p>
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1 truncate">{label}</p>
            </div>
         </div>
      </Card>
   )
}
