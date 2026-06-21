"use client"

import React, { useMemo, useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc, updateDoc, limit, arrayRemove, serverTimestamp } from "firebase/firestore"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  Zap, 
  ChevronRight, 
  History, 
  Star,
  ShieldCheck,
  Clock,
  GraduationCap,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Plus,
  X,
  Smartphone,
  Download,
  Sparkles,
  AlertCircle,
  Gem,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { getAuthorityIcon } from "@/lib/exam-icons"

/**
 * @fileOverview Institutional My Exams Page v12.0 (Live Counts).
 * UPDATED: Detailed content breakdown on cards.
 */

export default function MyExamsPage() {
  const { user, profile, loading: userLoading } = useUser()
  const { isInstalled, canInstall, installApp } = usePWAInstall()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const [unpinningId, setUnpinningId] = useState<string | null>(null)
  const [settingTargetId, setSettingTargetId] = useState<string | null>(null)
  const [passTimer, setPassTimer] = useState("");

  useEffect(() => {
    if (!userLoading && !user) router.push("/login?returnUrl=/my-exams")
  }, [user, userLoading, router])

  useEffect(() => {
    if (!profile?.passExpiresAt) return;
    
    const interval = setInterval(() => {
       const expiry = new Date(profile.passExpiresAt).getTime();
       const now = new Date().getTime();
       const diff = expiry - now;

       if (diff <= 0) {
          setPassTimer("Expired");
          clearInterval(interval);
          return;
       }

       const d = Math.floor(diff / (1000 * 60 * 60 * 24));
       const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
       
       if (d > 0) setPassTimer(`${d} Days Remaining`);
       else if (h > 0) setPassTimer(`${h} Hours Remaining`);
       else setPassTimer(`Ending Soon`);
    }, 1000);

    return () => clearInterval(interval);
  }, [profile]);

  const examsQuery = useMemo(() => (db ? collection(db, "exams") : null), [db])
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db])
  const mocksQuery = useMemo(() => (db ? collection(db, "mocks") : null), [db])
  const pyqsQuery = useMemo(() => (db ? collection(db, "pyqs") : null), [db])
  const notesQuery = useMemo(() => (db ? collection(db, "notes") : null), [db])
  
  const { data: allExams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: mocks } = useCollection<any>(mocksQuery)
  const { data: pyqs } = useCollection<any>(pyqsQuery)
  const { data: notes } = useCollection<any>(notesQuery)

  const statsMap = useMemo(() => {
    const map: Record<string, any> = {};
    
    (mocks || []).forEach(m => {
       const eids = m.examIds || (m.examId ? [m.examId] : []);
       eids.forEach((eid: string) => {
          if (!map[eid]) map[eid] = { full: 0, subject: 0, sectional: 0, pyq: 0, notes: 0, total: 0 };
          if (m.mockType === 'FULL') map[eid].full++;
          else if (m.mockType === 'SUBJECT') map[eid].subject++;
          else if (m.mockType === 'SECTIONAL') map[eid].sectional++;
          else if (m.mockType === 'PYQ') map[eid].pyq++;
          map[eid].total++;
       });
    });

    (pyqs || []).forEach(p => {
       if (p.examId) {
          if (!map[p.examId]) map[p.examId] = { full: 0, subject: 0, sectional: 0, pyq: 0, notes: 0, total: 0 };
          map[p.examId].pyq++;
          map[p.examId].total++;
       }
    });

    (notes || []).forEach(n => {
       if (n.examId) {
          if (!map[n.examId]) map[n.examId] = { full: 0, subject: 0, sectional: 0, pyq: 0, notes: 0, total: 0 };
          if (n.category === 'NOTES') map[n.examId].notes++;
          map[n.examId].total++;
       }
    });

    return map;
  }, [mocks, pyqs, notes]);

  const pinnedExams = useMemo(() => {
    if (!allExams || !profile?.pinnedExams) return []
    return (allExams as any[]).filter((e: any) => profile.pinnedExams?.includes(e.id))
  }, [allExams, profile])

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid), limit(50))
  }, [db, user])

  const { data: rawResults, loading: attemptsLoading } = useCollection<any>(resultsQuery)

  const recentAttempts = useMemo(() => {
    if (!rawResults || rawResults.length === 0) return []
    return [...rawResults].sort((a, b) => {
       const timeA = new Date(a.timestamp || 0).getTime();
       const timeB = new Date(b.timestamp || 0).getTime();
       return timeB - timeA;
    }).slice(0, 10);
  }, [rawResults])

  const handleUnpin = async (examId: string) => {
    if (!db || !user || unpinningId) return;
    setUnpinningId(examId);
    try {
      await updateDoc(doc(db, "users", user.uid), { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
      toast({ title: "Removed", description: "Exam removed from your list." });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failed" });
    } finally { setUnpinningId(null); }
  };

  const handleSetTarget = async (examName: string, examId: string) => {
    if (!db || !user || settingTargetId) return;
    setSettingTargetId(examId);
    try {
      await updateDoc(doc(db, "users", user.uid), { targetExam: examName, updatedAt: serverTimestamp() });
      toast({ title: "Focus Updated", description: `Your focus is now set to ${examName}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally { setSettingTargetId(null); }
  };

  const handleOpenHub = (examId: string, hasContent: boolean) => {
     if (!hasContent) {
        toast({ title: "Coming Soon", description: "Study materials are being verified for this exam." });
        return;
     }
     router.push(`/exams/${examId}`);
  };

  if (userLoading) return <div className="h-screen flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>

  const passActive = profile?.passStatus === 'active';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body pb-safe text-left">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl space-y-10 md:space-y-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
           <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
                 <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tighter leading-none">MY <span className="text-primary">EXAMS</span></h1>
                    <p className="text-sm md:text-base text-slate-600 font-medium max-w-xl">Manage your official preparation list.</p>
                 </div>
                 <Button asChild className="h-12 px-8 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl gap-3 transition-all border-none">
                    <Link href="/exams"><Plus className="h-4 w-4 text-primary" /> Add Exams</Link>
                 </Button>
              </div>

              <section className="space-y-6">
                 <div className="flex items-center gap-2.5 px-1">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">My Followed Exams</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
                    {examsLoading ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[2rem] bg-white" />) : 
                    pinnedExams.length > 0 ? pinnedExams.map((exam: any) => {
                       const board = boards?.find((b: any) => b.id === exam.boardId || b.abbreviation === exam.boardId);
                       const stats = statsMap[exam.id] || { full: 0, subject: 0, sectional: 0, pyq: 0, notes: 0, total: 0 };
                       const hasContent = stats.total > 0;
                       const logoUrl = exam.iconUrl || board?.iconUrl;
                       const isTarget = profile?.targetExam === exam.name;

                       return (
                        <Card key={exam.id} className="border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[1.5rem] md:rounded-[2rem] bg-white group overflow-hidden h-auto flex flex-col p-6 md:p-8 text-center relative">
                          {isTarget && (
                            <div className="absolute top-4 right-4 z-20">
                              <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm px-2.5 py-0.5 font-black text-[7px] uppercase rounded-lg">
                                FOCUS
                              </Badge>
                            </div>
                          )}
                          <div className="flex flex-col items-center flex-1">
                             <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 shadow-inner overflow-hidden mb-5 relative">
                               {logoUrl && !failedImages[exam.id] ? (
                                 <img src={logoUrl} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" alt="Logo" onError={() => setFailedImages(p => ({...p, [exam.id]: true}))} />
                               ) : (
                                 <div className="p-2 w-full h-full opacity-40">
                                   {getAuthorityIcon(board?.id, board?.abbreviation)}
                                 </div>
                               )}
                             </div>
                             <h4 className="font-black text-lg md:text-xl text-[#0F172A] uppercase leading-tight mb-4 line-clamp-2">{exam.name}</h4>
                             
                             <div className="w-full flex flex-col gap-1.5 mb-6">
                                {hasContent ? (
                                   <>
                                      <StatLine label="Full Mocks" val={stats.full} />
                                      <StatLine label="Subject Tests" val={stats.subject} />
                                      <StatLine label="Sectional Tests" val={stats.sectional} />
                                      <StatLine label="Official PYQs" val={stats.pyq} />
                                      <StatLine label="Study Notes" val={stats.notes} />
                                   </>
                                ) : (
                                   <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center justify-center gap-1.5 mt-2 bg-amber-50 py-2 rounded-xl border border-amber-100">
                                      <Info className="h-3.5 w-3.5" /> Content Coming Soon
                                   </span>
                                )}
                             </div>
                          </div>

                          <div className="space-y-4 pt-6 border-t border-slate-50 mt-auto">
                             <div className="grid grid-cols-2 gap-3">
                                <Button onClick={() => handleSetTarget(exam.name, exam.id)} disabled={settingTargetId === exam.id || isTarget} variant="outline" className={cn("h-10 rounded-xl border-2 font-black uppercase text-[8px] tracking-tight gap-2", isTarget ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-white border-slate-100 text-[#0F172A]")}>{settingTargetId === exam.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Target className="h-3 w-3" />}{isTarget ? 'LOCKED' : 'FOCUS'}</Button>
                                <Button onClick={() => handleOpenHub(exam.id, hasContent)} className={cn("h-10 rounded-xl font-black uppercase text-[8px] tracking-tight border-none shadow-lg text-white", hasContent ? "bg-[#0F172A] hover:bg-black" : "bg-slate-200 text-slate-400 cursor-not-allowed")}>
                                   {hasContent ? 'OPEN EXAM' : 'COMING SOON'}
                                </Button>
                             </div>
                             <button onClick={() => handleUnpin(exam.id)} disabled={unpinningId === exam.id} className="w-fit mx-auto flex items-center justify-center gap-2 text-[8px] font-black text-slate-300 hover:text-rose-500 uppercase tracking-widest transition-colors active:scale-90">{unpinningId === exam.id ? <RefreshCw className="h-2.5 w-2.5 animate-spin" /> : <X className="h-2.5 w-2.5" />}REMOVE</button>
                          </div>
                        </Card>
                       )
                    }) : (
                       <Card className="col-span-full border-2 border-dashed border-slate-200 bg-white/50 py-16 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-6">
                          <Plus className="h-8 w-8 text-slate-300" />
                          <div className="space-y-1"><p className="text-xl font-black text-[#0F172A] uppercase">List Empty</p><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Follow an exam to customize your dashboard.</p></div>
                          <Button asChild className="bg-[#0F172A] hover:bg-black rounded-xl h-12 px-10 font-black uppercase text-[10px] tracking-widest border-none"><Link href="/exams">Find Exams</Link></Button>
                       </Card>
                    )}
                 </div>
              </section>
           </div>

           <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-4xl bg-[#0B1528] text-white p-8 md:p-10 rounded-[2rem] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Gem className="h-32 w-32" /></div>
                 <div className="relative z-10 space-y-6 text-left">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">ACCOUNT STATUS</p>
                       <h3 className="text-xl md:text-2xl font-black uppercase">{passActive ? 'Elite Active' : 'Free Tier'}</h3>
                    </div>
                    
                    {passActive && passTimer ? (
                       <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary shrink-0" />
                          <div className="min-w-0">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">VALIDITY</p>
                             <p className="text-xs font-bold text-white uppercase">{passTimer}</p>
                          </div>
                       </div>
                    ) : !passActive && (
                       <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                          <div className="min-w-0">
                             <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">ACCESS LIMITED</p>
                             <p className="text-xs font-bold text-rose-200 uppercase">Unlock All Mock Tests</p>
                          </div>
                       </div>
                    )}

                    <Button asChild className="w-full h-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-3xl border-none active:scale-95 transition-all">
                       <Link href="/pass">{passActive ? 'VIEW PASS' : 'UPGRADE NOW'} <ChevronRight className="h-4 w-4 ml-1" /></Link>
                    </Button>
                 </div>
              </Card>

              {!isInstalled && canInstall && (
                <div className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-xl space-y-5 text-left relative overflow-hidden group">
                   <div className="space-y-1">
                      <h4 className="text-base font-black text-[#0F172A] uppercase leading-none">Download App</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Get faster access to tests.</p>
                   </div>
                   <Button onClick={installApp} className="w-full h-11 bg-slate-50 hover:bg-slate-100 text-[#0F172A] font-black uppercase text-[9px] tracking-widest rounded-xl border-none shadow-sm gap-2">
                      <Download className="h-3.5 w-3.5" /> INSTALL NOW
                   </Button>
                </div>
              )}
           </div>
        </div>

        <section className="space-y-6 pt-4">
           <div className="flex items-center gap-2.5 px-1">
              <History className="h-4 w-4 text-slate-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Test History</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {attemptsLoading ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl bg-white" />) : 
              recentAttempts.length > 0 ? recentAttempts.map((r: any) => (
                 <Link key={r.id} href={`/results/${r.mockId}`}>
                    <Card className="border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-500 rounded-[1.5rem] bg-white p-5 md:p-6 flex items-center justify-between group overflow-hidden">
                       <div className="flex items-center gap-5 min-w-0 flex-1">
                          <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary/5 transition-all"><Zap className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-500" /></div>
                          <div className="min-w-0 space-y-1.5"><h4 className="font-black text-base md:text-lg text-[#0F172A] uppercase truncate leading-none">{r.mockTitle}</h4><div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-tight"><span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-primary" /> {new Date(r.timestamp).toLocaleDateString()}</span><Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-2 py-0.5 rounded text-[9px]">Score: {r.score}</Badge></div></div>
                       </div>
                       <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1 shrink-0 ml-4" />
                    </Card>
                 </Link>
              )) : <div className="col-span-full py-16 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm opacity-30 italic"><p className="font-black uppercase tracking-[0.4em] text-[9px]">No recent test activity detected.</p></div>}
           </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function StatLine({ label, val }: { label: string, val: number }) {
   return (
      <p className={cn(
         "text-[10px] font-bold uppercase tracking-tight flex items-center justify-between px-1", 
         val > 0 ? "text-slate-600" : "text-slate-300"
      )}>
         <span>{label}</span>
         <span className="tabular-nums">{val}</span>
      </p>
   )
}
