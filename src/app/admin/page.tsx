"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Database, Users, ShieldCheck, Zap, Loader2, Landmark, BookOpen, Send, CheckCircle2, Activity, Clock, ChevronRight, History } from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { useMemo, useState } from "react"
import { seedInitialData } from "@/services/seed-data"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import StudentAvatar from "@/components/brand/StudentAvatar"

/**
 * @fileOverview Institutional Command Center v26.0.
 * UPDATED: Responsive header sizes and activity node visibility.
 */

export default function AdminDashboard() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncStatus, setLastSyncStatus] = useState<'idle' | 'success'>('idle')

  // Real-time Data Nodes
  const { data: users, loading: uLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "users") : null), [db]))
  const { data: questions, loading: qLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: notes } = useCollection<any>(useMemo(() => (db ? collection(db, "notes") : null), [db]))
  const { data: pyqs } = useCollection<any>(useMemo(() => (db ? collection(db, "pyqs") : null), [db]))

  // Live Activity Feeds (Latest 5)
  const recentUsersQuery = useMemo(() => (db ? query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5)) : null), [db]);
  const { data: recentUsers } = useCollection<any>(recentUsersQuery);

  const recentResultsQuery = useMemo(() => (db ? query(collection(db, "results"), orderBy("timestamp", "desc"), limit(5)) : null), [db]);
  const { data: recentResults } = useCollection<any>(recentResultsQuery);

  const subjectBreakdown = useMemo(() => {
    if (!questions) return [];
    const map: Record<string, number> = {};
    questions.forEach((q: any) => {
       if (q.subjectId) map[q.subjectId] = (map[q.subjectId] || 0) + 1;
    });
    return Object.entries(map).map(([id, count]) => {
       const subjectName = subjects?.find((s: any) => s.id === id)?.name || id.replace(/-/g, ' ').toUpperCase();
       return { id, name: subjectName, count };
    }).sort((a, b) => b.count - a.count);
  }, [questions, subjects]);

  const handlePushToRegistry = async () => {
    if (!db) return
    setIsSyncing(true)
    setLastSyncStatus('idle')
    try {
      await seedInitialData(db)
      toast({ title: "Registry Synced", description: "Official Punjab Exam nodes updated." })
      setLastSyncStatus('success')
      setTimeout(() => setLastSyncStatus('idle'), 5000)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-12 pb-20 text-[#0F172A] text-left">
      {/* 1. INSTITUTIONAL HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8 px-2 md:px-0">
        <div className="min-w-0 flex-1">
           <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 shrink-0">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[8px] md:text-[9px] font-black uppercase text-emerald-600 tracking-widest">System Online</span>
              </div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 truncate">Live Registry Audit</span>
           </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-tight truncate">Admin Center</h1>
          <p className="text-slate-500 mt-1 md:mt-2 text-sm md:text-lg font-medium">Real-time platform metrics: {questions?.length || 0} Assets Registered.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
           <Button 
             onClick={handlePushToRegistry} 
             disabled={isSyncing} 
             className={cn(
               "h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-widest gap-3 shadow-xl text-white w-full sm:w-auto transition-all border-none",
               lastSyncStatus === 'success' ? 'bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700'
             )}
           >
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : lastSyncStatus === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />} 
              {isSyncing ? 'Syncing...' : lastSyncStatus === 'success' ? 'Sync Complete' : 'Push to Registry'}
           </Button>
           <Button asChild className="bg-[#0F172A] hover:bg-black text-white rounded-xl md:rounded-2xl h-12 md:h-14 px-8 md:px-10 font-black shadow-xl uppercase tracking-widest text-xs w-full sm:w-auto border-none">
            <Link href="/admin/bulk-import"><Plus className="mr-2 h-4 w-4" /> Bulk Ingestion</Link>
          </Button>
        </div>
      </div>

      {/* 2. STATS MATRIX */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 px-2 md:px-0">
         <StatCard label="Questions" value={questions?.length ?? "..."} icon={<Database className="text-blue-500" />} active />
         <StatCard label="Live Tests" value={mocks?.filter((m: any) => m.published).length ?? "..."} icon={<Zap className="text-primary" />} active />
         <StatCard label="Aspirants" value={users?.length || "0"} icon={<Users className="text-emerald-500" />} active />
         <StatCard label="PYQ Papers" value={pyqs?.length ?? "..."} icon={<Landmark className="text-orange-500" />} />
         <StatCard label="Study Notes" value={notes?.length ?? "..."} icon={<BookOpen className="text-rose-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 px-2 md:px-0">
         {/* 3. CONTENT HUB */}
         <Card className="lg:col-span-8 border-none shadow-3xl bg-white rounded-2xl md:rounded-[3rem] overflow-hidden text-left">
            <Tabs defaultValue="activity">
               <CardHeader className="p-6 md:p-12 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-xl md:text-2xl font-headline font-black uppercase text-[#0F172A] truncate">Registry Audit</CardTitle>
                    <CardDescription className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Monitoring live student activity and content depth.</CardDescription>
                  </div>
                  <TabsList className="bg-white border p-1 rounded-xl h-10 md:h-12 shadow-sm shrink-0">
                    <TabsTrigger value="activity" className="font-black uppercase text-[8px] md:text-[9px] px-4 md:px-6 h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Live Activity</TabsTrigger>
                    <TabsTrigger value="subjects" className="font-black uppercase text-[8px] md:text-[9px] px-4 md:px-6 h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Subjects</TabsTrigger>
                  </TabsList>
               </CardHeader>
               <CardContent className="p-0">
                  <TabsContent value="activity" className="m-0 divide-y divide-slate-50">
                     <div className="p-6 md:p-8 space-y-10">
                        {/* RECENT USERS */}
                        <section className="space-y-6">
                           <div className="flex items-center gap-3">
                              <Users className="h-4 w-4 text-blue-500" />
                              <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Latest Student Registrations</h4>
                           </div>
                           <div className="grid grid-cols-1 gap-4">
                              {recentUsers?.map((u: any) => (
                                 <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                       <StudentAvatar profile={u} className="h-9 w-9 md:h-10 md:w-10 rounded-xl shrink-0" />
                                       <div className="min-w-0 flex-1">
                                          <p className="font-bold text-xs md:text-sm text-[#0F172A] uppercase truncate">{u.name}</p>
                                          <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase truncate">{u.email}</p>
                                       </div>
                                    </div>
                                    <Badge variant="ghost" className="text-[8px] font-black text-slate-300 shrink-0">NEW HUB</Badge>
                                 </div>
                              ))}
                              {(!recentUsers || recentUsers.length === 0) && <p className="text-center py-10 opacity-20 text-[10px] font-black uppercase">No recent users.</p>}
                           </div>
                        </section>

                        {/* RECENT RESULTS */}
                        <section className="space-y-6">
                           <div className="flex items-center gap-3">
                              <Activity className="h-4 w-4 text-primary" />
                              <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Test Audit Stream</h4>
                           </div>
                           <div className="grid grid-cols-1 gap-4">
                              {recentResults?.map((r: any) => (
                                 <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                       <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                          <Zap className="h-4 w-4" />
                                       </div>
                                       <div className="min-w-0 flex-1">
                                          <p className="font-bold text-xs md:text-sm text-[#0F172A] uppercase truncate">{r.mockTitle}</p>
                                          <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase truncate">{r.userName} • Score: {r.score}</p>
                                       </div>
                                    </div>
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] md:text-[9px] shrink-0">{r.accuracy}%</Badge>
                                 </div>
                              ))}
                              {(!recentResults || recentResults.length === 0) && <p className="text-center py-10 opacity-20 text-[10px] font-black uppercase">No recent attempts.</p>}
                           </div>
                        </section>
                     </div>
                  </TabsContent>
                  
                  <TabsContent value="subjects" className="m-0">
                     <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {qLoading ? (
                           <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                              <Loader2 className="h-10 w-10 animate-spin" />
                           </div>
                        ) : subjectBreakdown.map((s) => (
                           <div key={s.id} className="p-6 md:p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-center gap-4 md:gap-6 min-w-0">
                                 <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs shrink-0">{s.name[0]}</div>
                                 <div className="min-w-0 flex-1">
                                    <p className="font-black text-[#0B1528] text-sm md:text-lg uppercase leading-none truncate">{s.name}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5 truncate">ID: {s.id}</p>
                                 </div>
                              </div>
                              <div className="text-right shrink-0 ml-4">
                                 <p className="text-xl md:text-2xl font-headline font-black text-primary leading-none tabular-nums">{s.count}</p>
                                 <p className="text-[7px] md:text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Questions</p>
                              </div>
                           </div>
                        ))}
                        {subjectBreakdown.length === 0 && !qLoading && <p className="text-center py-20 opacity-20 text-[10px] font-black uppercase">Awaiting content registry.</p>}
                     </div>
                  </TabsContent>
               </CardContent>
            </Tabs>
         </Card>

         {/* 4. QUICK ACTIONS HUB */}
         <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <Card className="border-none shadow-3xl bg-[#0F172A] text-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-700"><ShieldCheck className="h-64 w-64" /></div>
               <div className="relative z-10 space-y-8 md:space-y-10">
                  <div className="space-y-2">
                     <h3 className="text-xl md:text-2xl font-headline font-black uppercase tracking-tight">Quick Architect</h3>
                     <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Launch content generators</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                     <QuickLink label="New Mock Series" href="/admin/mocks/builder" icon={<Zap className="h-4 w-4" />} />
                     <QuickLink label="Manual MCQ Entry" href="/admin/questions/add" icon={<Plus className="h-4 w-4" />} />
                     <QuickLink label="Register Subject" href="/admin/subjects" icon={<BookOpen className="h-4 w-4" />} />
                  </div>
               </div>
            </Card>

            <div className="bg-white rounded-2xl md:rounded-[3rem] p-6 md:p-10 shadow-xl border border-slate-100 flex flex-col gap-6 text-left">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#F97316]">
                     <History className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Audit Logs</p>
               </div>
               <p className="text-xs md:text-sm font-bold text-[#0F172A] leading-relaxed uppercase">
                  View complete history of institutional modifications and pass grants.
               </p>
               <Button asChild variant="ghost" className="w-fit p-0 h-auto hover:bg-transparent group text-primary font-black uppercase text-[10px] tracking-[0.2em] gap-2">
                  <Link href="/admin/audit-logs">Enter Audit Trail <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" /></Link>
               </Button>
            </div>
         </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, active }: any) {
   return (
      <Card className="border-none shadow-xl bg-white p-4 md:p-6 rounded-xl md:rounded-[2.5rem] group hover:translate-y-[-4px] transition-all text-left relative overflow-hidden">
         {active && <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">{icon}</div>
            <div className="min-w-0">
               <p className="text-base md:text-2xl font-headline font-black text-[#0F172A] leading-none tabular-nums">{value === "..." ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : value}</p>
               <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1.5 md:mt-2 truncate">{label}</p>
            </div>
         </div>
      </Card>
   )
}

function QuickLink({ label, href, icon }: any) {
   return (
      <Link href={href} className="group/link block">
         <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
               <span className="text-primary shrink-0">{icon}</span>
               <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest truncate">{label}</span>
            </div>
            <ChevronRight className="h-3 w-3 text-slate-600 group-hover/link:translate-x-1 group-hover/link:text-primary transition-all shrink-0" />
         </div>
      </Link>
   )
}
