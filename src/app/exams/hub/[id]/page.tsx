'use client';

import { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, GraduationCap, Zap, BookOpen, Layers, Shield, Loader2, FileText, Landmark, ShieldCheck, Scale, Star, CheckCircle2, RefreshCw, Info } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getAuthorityIcon } from "@/lib/exam-icons"

/**
 * @fileOverview Institutional Exam Explorer v21.0 (Live Counts).
 * UPDATED: Replaced "Nodes" with detailed content breakdown.
 */

const ACRONYMS = ["PSSSB", "PPSC", "CTET", "PSTET", "PSPCL", "PSTCL", "SSAPB"];

function formatTitle(name: string) {
  if (!name) return "";
  return name.split(' ').map(word => {
    const upper = word.toUpperCase();
    if (ACRONYMS.includes(upper)) return upper;
    return word;
  }).join(' ');
}

export default function HubExamsPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const hubId = params.id as string;
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [pinningId, setPinningId] = useState<string | null>(null);

  const { data: hub, loading: hubLoading } = useDoc<any>(useMemo(() => (db ? doc(db, "boards", hubId) : null), [db, hubId]));
  
  const examsQuery = useMemo(() => {
     if (!db || !hub) return null;
     return query(collection(db, "exams"), where("boardId", "in", [hub.id, hub.abbreviation]));
  }, [db, hub]);

  const { data: exams, loading: examsLoading } = useCollection<any>(examsQuery);
  const { data: categories } = useCollection<any>(useMemo(() => (db ? collection(db, "categories") : null), [db]));
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));
  const { data: pyqs } = useCollection<any>(useMemo(() => (db ? collection(db, "pyqs") : null), [db]));
  const { data: notes } = useCollection<any>(useMemo(() => (db ? collection(db, "notes") : null), [db]));

  const statsMap = useMemo(() => {
    const map: Record<string, any> = {};
    
    // 1. Audit Mocks
    (mocks || []).forEach(m => {
      const eids = m.examIds || (m.examId ? [m.examId] : []);
      eids.forEach((eid: string) => {
        if (!map[eid]) map[eid] = { full: 0, subject: 0, sectional: 0, pyq: 0, notes: 0, total: 0 };
        const type = m.mockType;
        if (type === 'FULL') map[eid].full++;
        else if (type === 'SUBJECT') map[eid].subject++;
        else if (type === 'SECTIONAL') map[eid].sectional++;
        else if (type === 'PYQ') map[eid].pyq++;
        map[eid].total++;
      });
    });

    // 2. Audit Official PYQs
    (pyqs || []).forEach(p => {
       const eid = p.examId;
       if (eid) {
          if (!map[eid]) map[eid] = { full: 0, subject: 0, sectional: 0, pyq: 0, notes: 0, total: 0 };
          map[eid].pyq++;
          map[eid].total++;
       }
    });

    // 3. Audit Study Materials
    (notes || []).forEach(n => {
       const eid = n.examId;
       if (eid) {
          if (!map[eid]) map[eid] = { full: 0, subject: 0, sectional: 0, pyq: 0, notes: 0, total: 0 };
          if (n.category === 'NOTES') map[eid].notes++;
          map[eid].total++;
       }
    });

    return map;
  }, [mocks, pyqs, notes]);

  const handleTogglePin = async (e: React.MouseEvent, examId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!db || !user || pinningId) return;
    
    setPinningId(examId);
    const isPinned = profile?.pinnedExams?.includes(examId);
    const userRef = doc(db, "users", user.uid);

    try {
      if (isPinned) {
        await updateDoc(userRef, { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
        toast({ title: "Removed from My Exams" });
      } else {
        await updateDoc(userRef, { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
        toast({ title: "Added to My Exams" });
      }
    } catch (err) {
      console.error("[PINNING_FAILURE]:", err);
      toast({ variant: "destructive", title: "Action Failed" });
    } finally {
      setPinningId(null);
    }
  };

  const handleOpenExam = (examId: string, hasContent: boolean) => {
     if (!hasContent) {
        toast({
           title: "Coming Soon",
           description: "Study material is currently being added for this exam.",
           duration: 3000
        });
        return;
     }
     router.push(`/exams/${examId}`);
  };

  if (hubLoading) return <div className="h-screen bg-white flex flex-col items-center justify-center space-y-4"><Zap className="h-8 w-8 text-primary animate-pulse" /><p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Loading Information...</p></div>;

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-10 md:py-12 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-12 opacity-[0.01]"><GraduationCap className="h-32 w-32 md:h-48 md:w-48" /></div>
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <button onClick={() => router.back()} className="h-9 w-9 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black mb-6 transition-all active:scale-90">
               <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 md:gap-8">
               <div className="h-14 w-14 rounded-2xl bg-slate-50 border-2 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0 relative">
                  {hub?.iconUrl && !failedImages['hub'] ? (
                    <Image 
                      src={hub.iconUrl} 
                      alt="Logo" 
                      fill
                      sizes="64px"
                      className="object-contain p-2" 
                      referrerPolicy="no-referrer" 
                      onError={() => setFailedImages(p => ({...p, 'hub': true}))} 
                    />
                  ) : (
                    <div className="p-2 w-full h-full opacity-40">
                      {getAuthorityIcon(hub?.id, hub?.abbreviation)}
                    </div>
                  )}
               </div>
               
               <div className="space-y-3 text-center lg:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                     <Badge className="bg-primary/5 text-primary border-none font-black px-2.5 py-0.5 rounded-lg text-[8px] tracking-widest uppercase">
                       {hub?.abbreviation} EXAMS
                     </Badge>
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-[#0F172A] leading-tight tracking-tight break-words antialiased">
                      {formatTitle(hub?.abbreviation || hub?.name?.split(' ')[0])}
                    </h1>
                    <p className="text-sm md:text-lg font-bold text-slate-500 leading-tight tracking-tight max-w-4xl">
                       {hub?.name}
                    </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl">
         {examsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl bg-white" />)}
            </div>
         ) : exams && exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
               {exams.map((exam) => {
                  const stats = statsMap[exam.id] || { full: 0, subject: 0, sectional: 0, pyq: 0, notes: 0, total: 0 };
                  const hasContent = stats.total > 0;
                  const category = categories?.find((c: any) => c.id === exam.categoryId);
                  const effectiveLogo = exam.iconUrl || hub?.iconUrl || category?.iconUrl;
                  const isPinned = profile?.pinnedExams?.includes(exam.id);

                  return (
                    <Card key={exam.id} onClick={() => handleOpenExam(exam.id, hasContent)} className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-[1.25rem] bg-white group overflow-hidden h-full flex flex-col p-6 md:p-8 text-left cursor-pointer">
                       <div className="flex justify-between items-start mb-6">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden">
                             {effectiveLogo && !failedImages[exam.id] ? (
                                <Image 
                                   src={effectiveLogo} 
                                   alt="Logo" 
                                   fill
                                   sizes="40px"
                                   className="object-contain p-2" 
                                   referrerPolicy="no-referrer" 
                                   onError={() => setFailedImages(p => ({ ...p, [exam.id]: true }))} 
                                />
                             ) : (
                               <div className="p-2 w-full h-full opacity-20">
                                 {getAuthorityIcon(hub?.id, hub?.abbreviation)}
                               </div>
                             )}
                          </div>
                          <button 
                            onClick={(e) => handleTogglePin(e, exam.id)}
                            disabled={pinningId === exam.id}
                            className={cn(
                              "h-8 w-8 rounded-lg border flex items-center justify-center transition-all active:scale-90 z-20",
                              isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-300 hover:text-primary hover:border-primary/20"
                            )}
                          >
                             {pinningId === exam.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : isPinned ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                          </button>
                       </div>

                       <div className="space-y-4 flex-1">
                          <h3 className="text-xl font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors line-clamp-2">
                             {exam.name}
                          </h3>
                          <div className="flex flex-col gap-1.5 mt-2">
                             {hasContent ? (
                                <>
                                   <StatLine label="Full Mocks" val={stats.full} />
                                   <StatLine label="Subject Tests" val={stats.subject} />
                                   <StatLine label="Sectional Tests" val={stats.sectional} />
                                   <StatLine label="Official PYQs" val={stats.pyq} />
                                   <StatLine label="Study Notes" val={stats.notes} />
                                </>
                             ) : (
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mt-2">
                                   <Info className="h-3.5 w-3.5" /> Content Coming Soon
                                </span>
                             )}
                          </div>
                       </div>

                       <div className="mt-8">
                          <Button variant="ghost" className={cn(
                             "w-full h-11 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 transition-all border-none shadow-md",
                             hasContent ? "bg-slate-900 text-white group-hover:bg-primary" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          )}>
                             {hasContent ? 'OPEN EXAM' : 'COMING SOON'} <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                       </div>
                    </Card>
                  )
               })}
            </div>
         ) : (
            <div className="py-20 text-center opacity-20 flex flex-col items-center">
               <Layers className="h-12 w-12 mb-4" />
               <p className="font-headline font-black text-lg uppercase tracking-widest">No Exams Registered</p>
            </div>
         )}
      </main>
      <Footer />
    </div>
  )
}

function StatLine({ label, val }: { label: string, val: number }) {
   return (
      <p className={cn(
         "text-[10px] font-bold uppercase tracking-tight flex items-center justify-between", 
         val > 0 ? "text-slate-600" : "text-slate-300"
      )}>
         <span>{label}</span>
         <span className="tabular-nums">{val}</span>
      </p>
   )
}

