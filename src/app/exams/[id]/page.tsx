
"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { doc, collection, query, where } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  ChevronRight,
  FileText,
  Zap,
  ChevronLeft,
  Info,
  Lock,
  GraduationCap,
  ListTree,
  Download,
  Layers,
  RefreshCw,
  Play
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo, useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Exam Hub v15.0.
 * HARDENED: Strict accessLevel audit with direct console telemetry.
 * LOGIC: (Premium + Inactive) -> UNLOCK WITH PASS | (Premium + Active) -> ATTEMPT NOW
 */

export default function ExamHubPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  const examId = params.id as string
  const [imgFailed, setImgFailed] = useState(false);

  const { data: exam, loading: examLoading } = useDoc<any>(useMemo(() => (db && examId ? doc(db, "exams", examId) : null), [db, examId]))
  
  const mocksQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "mocks"), where("published", "==", true));
  }, [db]);

  const notesQuery = useMemo(() => {
    if (!db || !examId) return null;
    return query(collection(db, "notes"), where("examId", "==", examId));
  }, [db, examId]);

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "results"), where("userId", "==", user.uid));
  }, [db, user]);

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: rawNotes, loading: notesLoading } = useCollection<any>(notesQuery)
  const { data: userResults } = useCollection<any>(resultsQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))

  // VERIFIED ACCESS HUB
  const isPassActive = useMemo(() => {
     if (!profile) return false;
     const isAdmin = profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN';
     if (isAdmin) return true;

     // STATED BLUEPRINT: profile.pass.active must be true AND not expired
     if (profile.pass && profile.pass.active === true) {
        const expiry = new Date(profile.pass.expiryDate);
        const now = new Date();
        const active = expiry > now;
        return active;
     }
     
     return false;
  }, [profile]);

  const groupedContent = useMemo(() => {
    const mocks = (rawMocks || []).filter(m => {
       return m.examId === examId || (m.examIds && Array.isArray(m.examIds) && m.examIds.includes(examId));
    });
    const notes = rawNotes || [];
    return {
      FULL: mocks.filter(m => m.mockType === 'FULL'),
      SUBJECT: mocks.filter(m => m.mockType === 'SUBJECT'),
      SECTIONAL: mocks.filter(m => m.mockType === 'SECTIONAL'),
      PYQ: mocks.filter(m => m.mockType === 'PYQ'),
      NOTES: notes.filter(n => n.category === 'NOTES'),
      SYLLABUS: notes.filter(n => n.category === 'SYLLABUS')
    }
  }, [rawMocks, rawNotes, examId])

  if (examLoading || userLoading) return <div className="h-screen flex items-center justify-center bg-white"><Skeleton className="h-16 w-16 rounded-full animate-pulse" /></div>
  if (!exam) return <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-4"><Info className="h-12 w-12 opacity-10" /><p className="font-black uppercase tracking-widest text-xs">Registry node missing</p></div>

  const activeBoard = boards?.find((b: any) => 
    b.id.toLowerCase() === exam.boardId?.toLowerCase() || 
    b.abbreviation?.toLowerCase() === exam.boardId?.toLowerCase()
  );

  const logoUrl = exam.iconUrl || activeBoard?.iconUrl;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-4 md:py-6 text-left">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center gap-4 md:gap-8">
               <button onClick={() => router.back()} className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black shrink-0 transition-all">
                  <ChevronLeft className="h-5 w-5" />
               </button>
               <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl bg-white border border-slate-100 flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
                  {logoUrl && !imgFailed ? (
                    <img src={logoUrl} className="w-full h-full object-contain p-1.5" alt="Logo" referrerPolicy="no-referrer" onError={() => setImgFailed(true)} />
                  ) : (
                    <GraduationCap className="h-5 w-5 md:h-8 md:w-8 text-slate-300" />
                  )}
               </div>
               <div className="min-w-0">
                  <h1 className="text-lg md:text-2xl font-black text-[#0F172A] uppercase leading-tight tracking-tight truncate">
                     {activeBoard?.abbreviation || 'GOVT'} {exam.name}
                  </h1>
                  <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em]">Mastery Dashboard Active</p>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 py-8 max-w-6xl pb-40">
         <Tabs defaultValue="FULL" className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-xl p-1 shadow-sm overflow-x-auto no-scrollbar">
               <TabsList className="bg-transparent border-none p-0 flex h-10 w-full justify-start gap-1">
                  <DashboardTab value="FULL" label="Full Mocks" icon={<Zap className="h-3 w-3" />} />
                  <DashboardTab value="SUBJECT" label="Subject Tests" icon={<BookOpen className="h-3 w-3" />} />
                  <DashboardTab value="SECTIONAL" label="Sectional Tests" icon={<ListTree className="h-3 w-3" />} />
                  <DashboardTab value="PYQ" label="PYQ Papers" icon={<Layers className="h-3 w-3" />} />
                  <DashboardTab value="NOTES" label="Study Notes" icon={<FileText className="h-3 w-3" />} />
               </TabsList>
            </div>

            <div className="animate-in fade-in duration-500">
               <TabsContent value="FULL" className="m-0"><MockList data={groupedContent.FULL} results={userResults} isPassActive={isPassActive} /></TabsContent>
               <TabsContent value="SUBJECT" className="m-0"><MockList data={groupedContent.SUBJECT} results={userResults} isPassActive={isPassActive} /></TabsContent>
               <TabsContent value="SECTIONAL" className="m-0"><MockList data={groupedContent.SECTIONAL} results={userResults} isPassActive={isPassActive} /></TabsContent>
               <TabsContent value="PYQ" className="m-0"><MockList data={groupedContent.PYQ} results={userResults} isPassActive={isPassActive} /></TabsContent>
               <TabsContent value="NOTES" className="m-0"><NotesList data={groupedContent.NOTES} isPassActive={isPassActive} /></TabsContent>
            </div>
         </Tabs>
      </main>
      <Footer />
    </div>
  )
}

function DashboardTab({ value, label, icon }: any) {
   return (
      <TabsTrigger value={value} className="px-4 h-full font-black text-[9px] uppercase tracking-wider text-slate-400 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5">
         {icon} {label}
      </TabsTrigger>
   )
}

function MockList({ data, results, isPassActive }: { data: any[], results: any[], isPassActive: boolean }) {
   const router = useRouter();

   if (data.length === 0) return <EmptyNode label="Awaiting Content Registry" />;

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {data.map((mock: any) => {
            const result = results?.find((r: any) => r.mockId === mock.id);
            // STABILIZED FIELD NORMALIZATION
            const tier = (mock.accessLevel || mock.accessType || 'FREE').trim().toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const isLocked = isPremium && !isPassActive;

            // CRITICAL AUDIT LOG - Verify these values in your browser console
            console.log(`[RUNTIME_VAL] MOCK_CARD: "${mock.title}" | accessLevel: "${tier}" | isPassActive: ${isPassActive} | isLocked: ${isLocked}`);

            return (
               <Card key={mock.id} className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-all text-left group">
                  <CardContent className="p-5 md:p-8 space-y-4">
                     <div className="flex items-center justify-between">
                        <Badge className={cn(
                           "border-none text-[8px] font-black px-2 py-0.5 rounded shadow-sm", 
                           isPremium ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                           {tier === 'PREMIUM' ? 'PREMIUM HUB' : 'FREE ACCESS'}
                        </Badge>
                        {result && <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">AUDITED</span>}
                     </div>
                     <h3 className="text-sm md:text-lg font-black text-[#0F172A] uppercase leading-tight group-hover:text-primary transition-colors">{mock.title}</h3>
                     <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-3">
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {mock.duration}m</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {mock.totalQuestions} Qs</span>
                     </div>
                     <div className="pt-2">
                        {isLocked ? (
                           <Button 
                             onClick={() => router.push('/pass')} 
                             className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] rounded-xl shadow-xl gap-3 transition-all active:scale-95 border-none flex items-center justify-center"
                           >
                              <Lock className="h-4 w-4" /> UNLOCK WITH PASS
                           </Button>
                        ) : result ? (
                           <div className="flex flex-col sm:flex-row gap-2">
                              <Button asChild className="flex-1 h-11 bg-primary text-white font-black uppercase text-[10px] rounded-xl">
                                 <Link href={`/results/${mock.id}`}>View Score</Link>
                              </Button>
                              <Button asChild variant="outline" className="flex-1 h-11 border-slate-200 font-black uppercase text-[10px] rounded-xl">
                                 <Link href={`/mocks/${mock.id}/instructions`}>Re-attempt</Link>
                              </Button>
                           </div>
                        ) : (
                           <Button asChild className="w-full h-11 bg-slate-900 hover:bg-black text-white border-none font-black uppercase text-[10px] rounded-xl shadow-lg gap-3">
                              <Link href={`/mocks/${mock.id}/instructions`}><Play className="h-4 w-4 fill-current" /> ATTEMPT NOW</Link>
                           </Button>
                        )}
                     </div>
                  </CardContent>
               </Card>
            )
         })}
      </div>
   )
}

function NotesList({ data, isPassActive }: { data: any[], isPassActive: boolean }) {
   const router = useRouter();
   if (data.length === 0) return <EmptyNode label="No Materials Archive Found" />;
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {data.map((note: any) => {
            const isLocked = !note.isFree && !isPassActive;
            return (
               <Card key={note.id} className="border-none shadow-sm rounded-2xl bg-white p-5 md:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                     <Badge className={cn("border-none text-[8px] font-black px-2 py-0.5 rounded", note.isFree ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                        {note.isFree ? 'FREE' : 'PREMIUM'}
                     </Badge>
                  </div>
                  <h3 className="text-sm md:text-lg font-black text-[#0F172A] uppercase leading-tight">{note.title}</h3>
                  <div className="pt-2">
                     {isLocked ? (
                       <Button onClick={() => router.push('/pass')} className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] rounded-xl shadow-xl gap-2 border-none">
                          <Lock className="h-4 w-4" /> UNLOCK WITH PASS
                       </Button>
                     ) : (
                       <Button asChild className="w-full h-11 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] rounded-xl lg shadow-lg">
                          <a href={note.pdfUrl} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4 mr-2" /> Download Note</a>
                       </Button>
                     )}
                  </div>
               </Card>
            )
         })}
      </div>
   )
}

function EmptyNode({ label }: { label: string }) {
   return <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl opacity-20"><Zap className="h-10 w-10 mx-auto mb-4" /><p className="font-black uppercase tracking-[0.2em] text-[10px]">{label}</p></div>;
}
