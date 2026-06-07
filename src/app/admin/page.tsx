
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Database, Users, ShieldCheck, Zap, RefreshCw, Loader2, Landmark, BookOpen, Send } from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { useMemo, useState } from "react"
import { seedInitialData } from "@/services/seed-data"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * @fileOverview Institutional Command Center.
 * Hardened: Verified Firestore instance checks to prevent runtime collection() errors.
 */

export default function AdminDashboard() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)

  const usersQuery = useMemo(() => (db && db.type === 'firestore' ? collection(db, "users") : null), [db])
  const questionsQuery = useMemo(() => (db && db.type === 'firestore' ? collection(db, "questions") : null), [db])
  const mocksQuery = useMemo(() => (db && db.type === 'firestore' ? collection(db, "mocks") : null), [db])
  const subjectsQuery = useMemo(() => (db && db.type === 'firestore' ? collection(db, "subjects") : null), [db])
  const examsQuery = useMemo(() => (db && db.type === 'firestore' ? collection(db, "exams") : null), [db])
  const notesQuery = useMemo(() => (db && db.type === 'firestore' ? collection(db, "notes") : null), [db])
  const pyqsQuery = useMemo(() => (db && db.type === 'firestore' ? collection(db, "pyqs") : null), [db])

  const { data: users } = useCollection<any>(usersQuery)
  const { data: questions, loading: qLoading } = useCollection<any>(questionsQuery)
  const { data: mocks } = useCollection<any>(mocksQuery)
  const { data: subjects } = useCollection<any>(subjectsQuery)
  const { data: exams } = useCollection<any>(examsQuery)
  const { data: notes } = useCollection<any>(notesQuery)
  const { data: pyqs } = useCollection<any>(pyqsQuery)

  const proUsers = useMemo(() => users?.filter((u: any) => u.status && u.status !== 'Free') || [], [users]);

  // Subject Breakdown Audit
  const subjectBreakdown = useMemo(() => {
    if (!questions) return [];
    const uniqueSubjectIds = Array.from(new Set(questions.map((q: any) => q.subjectId))).filter(Boolean);
    return uniqueSubjectIds.map(id => {
       const subjectName = subjects?.find((s: any) => s.id === id)?.name || id.replace('-', ' ').toUpperCase();
       return { id, name: subjectName, count: questions.filter((q: any) => q.subjectId === id).length }
    }).sort((a, b) => b.count - a.count);
  }, [questions, subjects]);

  // Exam Breakdown Audit
  const examBreakdown = useMemo(() => {
     if (!questions || !exams) return [];
     return exams.map((e: any) => {
        return { id: e.id, name: e.name, count: questions.filter((q: any) => q.examId === e.id).length }
     }).sort((a, b) => b.count - a.count);
  }, [questions, exams]);

  const handlePushToRegistry = async () => {
    if (!db) return
    setIsSyncing(true)
    try {
      await seedInitialData(db)
      toast({ title: "Registry Synced", description: "Official Punjab Exam hierarchy pushed to live registry." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-20 text-[#0F172A] text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8 px-2 md:px-0">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Registry Overview</span>
           </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Command Center</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-lg font-medium">Registry Volume: {questions?.length || 0} Atomic Nodes Locked.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
           <Button onClick={handlePushToRegistry} disabled={isSyncing} className="bg-emerald-600 hover:bg-emerald-700 h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest gap-3 shadow-xl text-white w-full sm:w-auto">
              {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Push to Registry
           </Button>
           <Button asChild className="bg-[#0F172A] hover:bg-black text-white rounded-xl md:rounded-2xl h-12 md:h-14 px-8 md:px-10 font-black shadow-xl uppercase tracking-widest text-xs w-full sm:w-auto">
            <Link href="/admin/bulk-import"><Plus className="mr-2 h-4 w-4" /> Bulk Import</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 px-2 md:px-0">
         <StatCard label="Atomic Bank" value={questions?.length ?? "..."} icon={<Database className="text-blue-500" />} />
         <StatCard label="Live Series" value={mocks?.filter((m: any) => m.published).length ?? "..."} icon={<Zap className="text-primary" />} />
         <StatCard label="Pro Aspirants" value={proUsers.length} icon={<Users className="text-emerald-500" />} />
         <StatCard label="PYQ Archives" value={pyqs?.length ?? "..."} icon={<Landmark className="text-orange-500" />} />
         <StatCard label="Study Notes" value={notes?.length ?? "..."} icon={<BookOpen className="text-rose-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 px-2 md:px-0">
         <Card className="lg:col-span-8 border-none shadow-3xl bg-white rounded-2xl md:rounded-[3.5rem] overflow-hidden text-left">
            <Tabs defaultValue="subjects">
               <CardHeader className="p-6 md:p-12 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-headline font-black uppercase text-[#0F172A]">Mastery Hubs</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sectional and Vertical Registry Audit.</CardDescription>
                  </div>
                  <TabsList className="bg-white border p-1 rounded-xl h-10 md:h-12 shadow-sm shrink-0">
                    <TabsTrigger value="subjects" className="font-black uppercase text-[8px] md:text-[9px] px-4 md:px-6 h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Subjects</TabsTrigger>
                    <TabsTrigger value="exams" className="font-black uppercase text-[8px] md:text-[9px] px-4 md:px-6 h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Exams</TabsTrigger>
                  </TabsList>
               </CardHeader>
               <CardContent className="p-0">
                  <TabsContent value="subjects" className="m-0">
                     <div className="divide-y divide-slate-50 max-h-[500px] md:max-h-[600px] overflow-y-auto custom-scrollbar">
                        {qLoading ? (
                           <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                              <Loader2 className="h-10 w-10 animate-spin" />
                              <p className="font-black uppercase text-[10px]">Auditing Registry...</p>
                           </div>
                        ) : subjectBreakdown.map((s) => (
                           <div key={s.id} className="p-6 md:p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-center gap-4 md:gap-6">
                                 <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs">{s.name[0]}</div>
                                 <div className="min-w-0">
                                    <p className="font-black text-[#0B1528] text-sm md:text-lg uppercase leading-none truncate">{s.name}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5 truncate">ID: {s.id}</p>
                                 </div>
                              </div>
                              <div className="text-right shrink-0">
                                 <p className="text-xl md:text-2xl font-headline font-black text-primary leading-none">{s.count}</p>
                                 <p className="text-[7px] md:text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Questions</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </TabsContent>
                  <TabsContent value="exams" className="m-0">
                     <div className="divide-y divide-slate-50 max-h-[500px] md:max-h-[600px] overflow-y-auto custom-scrollbar">
                        {qLoading ? (
                           <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                              <Loader2 className="h-10 w-10 animate-spin" />
                           </div>
                        ) : examBreakdown.map((e) => (
                           <div key={e.id} className="p-6 md:p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-center gap-4 md:gap-6">
                                 <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-black uppercase text-xs shadow-inner"><Landmark className="h-4 w-4 md:h-5 md:w-5" /></div>
                                 <div className="min-w-0">
                                    <p className="font-black text-[#0B1528] text-sm md:text-lg uppercase leading-none truncate">{e.name}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5 truncate">Exam ID: {e.id}</p>
                                 </div>
                              </div>
                              <div className="text-right shrink-0">
                                 <p className="text-xl md:text-2xl font-headline font-black text-amber-600 leading-none">{e.count}</p>
                                 <p className="text-[7px] md:text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Linked MCQs</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </TabsContent>
               </CardContent>
            </Tabs>
         </Card>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: any) {
   return (
      <Card className="border-none shadow-xl bg-white p-4 md:p-6 rounded-xl md:rounded-[2.5rem] group hover:translate-y-[-4px] transition-all text-left">
         <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">{icon}</div>
            <div className="min-w-0">
               <p className="text-lg md:text-2xl font-headline font-black text-[#0F172A] leading-none">{value === "..." ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : value}</p>
               <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1.5 truncate">{label}</p>
            </div>
         </div>
      </Card>
   )
}
