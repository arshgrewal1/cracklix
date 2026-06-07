
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
  Layers,
  FileText,
  Zap,
  ChevronLeft,
  Sparkles,
  Info,
  Lock,
  Newspaper,
  FileStack,
  Map,
  Bell,
  GraduationCap,
  ListTree
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function ExamHubPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  const examId = params.id as string
  const [imgFailed, setImgFailed] = useState(false);

  const { data: exam, loading: examLoading } = useDoc<any>(useMemo(() => (db && examId ? doc(db, "exams", examId) : null), [db, examId]))
  
  const mocksQuery = useMemo(() => {
    if (!db || !examId) return null;
    return query(collection(db, "mocks"), where("examId", "==", examId), where("published", "==", true));
  }, [db, examId]);

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "results"), where("userId", "==", user.uid));
  }, [db, user]);

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: userResults } = useCollection<any>(resultsQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))

  const groupedMocks = useMemo(() => {
    if (!rawMocks) return { FULL: [], SUBJECT: [], CHAPTER: [], PYQ: [] };
    return {
      FULL: rawMocks.filter(m => m.mockType === 'FULL'),
      SUBJECT: rawMocks.filter(m => m.mockType === 'SUBJECT'),
      CHAPTER: rawMocks.filter(m => m.mockType === 'CHAPTER'),
      PYQ: rawMocks.filter(m => m.mockType === 'PYQ'),
    }
  }, [rawMocks])

  const hasPass = useMemo(() => profile?.status && profile?.status !== 'Free', [profile]);

  if (examLoading || userLoading) return <div className="h-screen flex items-center justify-center bg-white"><Skeleton className="h-20 w-20 rounded-full animate-pulse" /></div>
  if (!exam) return <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-4"><Info className="h-12 w-12 opacity-10" /><p className="font-black uppercase tracking-widest text-xs">Registry node missing</p></div>

  const activeBoard = boards?.find((b: any) => 
    b.id.toLowerCase() === exam.boardId?.toLowerCase() || 
    b.abbreviation?.toLowerCase() === exam.boardId?.toLowerCase()
  );

  const logoUrl = activeBoard?.iconUrl || exam.iconUrl;
  const isArmy = exam.boardId?.toLowerCase() === 'army' || exam.id?.toLowerCase().includes('army');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-3 md:py-6">
         <div className="container mx-auto px-4 max-w-7xl text-left">
            <div className="flex items-center gap-4 md:gap-8">
               <button onClick={() => router.back()} className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black shrink-0 transition-all">
                  <ChevronLeft className="h-5 w-5" />
               </button>
               
               <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl bg-white border border-slate-100 flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
                  {logoUrl && !imgFailed ? (
                    <img 
                      src={logoUrl} 
                      className={cn("w-full h-full object-contain p-1.5", isArmy ? "scale-150" : "")} 
                      alt="Board Logo" 
                      referrerPolicy="no-referrer" 
                      onError={() => setImgFailed(true)}
                    />
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

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-6xl pb-40">
         <Tabs defaultValue="FULL" className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-xl p-1 shadow-sm overflow-x-auto no-scrollbar">
               <TabsList className="bg-transparent border-none p-0 flex h-10 w-full justify-start gap-1">
                  <DashboardTab value="FULL" label="Full Mocks" icon={<Zap className="h-3 w-3" />} />
                  <DashboardTab value="SUBJECT" label="Subject Tests" icon={<BookOpen className="h-3 w-3" />} />
                  <DashboardTab value="CHAPTER" label="Chapter Tests" icon={<ListTree className="h-3 w-3" />} />
                  <DashboardTab value="PYQ" label="PYQ Papers" icon={<FileStack className="h-3 w-3" />} />
                  <DashboardTab value="NOTES" label="Study Notes" icon={<FileText className="h-3 w-3" />} />
                  <DashboardTab value="SYLLABUS" label="Syllabus" icon={<Info className="h-3 w-3" />} />
               </TabsList>
            </div>

            <div className="animate-in fade-in duration-500">
               <TabsContent value="FULL" className="m-0"><MockList data={groupedMocks.FULL} results={userResults} hasPass={hasPass} user={user} /></TabsContent>
               <TabsContent value="SUBJECT" className="m-0"><MockList data={groupedMocks.SUBJECT} results={userResults} hasPass={hasPass} user={user} /></TabsContent>
               <TabsContent value="CHAPTER" className="m-0"><MockList data={groupedMocks.CHAPTER} results={userResults} hasPass={hasPass} user={user} /></TabsContent>
               <TabsContent value="PYQ" className="m-0"><MockList data={groupedMocks.PYQ} results={userResults} hasPass={hasPass} user={user} /></TabsContent>
               
               <TabsContent value="NOTES" className="m-0"><EmptyNode label="No Study Notes Recorded" /></TabsContent>
               <TabsContent value="SYLLABUS" className="m-0"><EmptyNode label="Syllabus Audit Pending" /></TabsContent>
            </div>
         </Tabs>
      </main>

      {!hasPass && user && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 p-4 md:p-6 md:px-[25%] flex items-center justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
           <Button asChild className="w-full h-12 md:h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] md:text-sm rounded-xl transition-all shadow-xl">
              <Link href="/pass">Unlock Premium Registry</Link>
           </Button>
        </div>
      )}

      <Footer />
    </div>
  )
}

function DashboardTab({ value, label, icon }: any) {
   return (
      <TabsTrigger 
         value={value} 
         className="px-4 h-full font-black text-[9px] uppercase tracking-wider text-slate-400 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5"
      >
         {icon} {label}
      </TabsTrigger>
   )
}

function MockList({ data, results, hasPass, user }: any) {
   const router = useRouter();

   const handleInteraction = (e: React.MouseEvent, href: string) => {
      if (!user) {
         e.preventDefault();
         router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
         return;
      }
   };

   if (data.length === 0) return <EmptyNode label="Awaiting Content Registry" />;

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {data.map((mock: any) => {
            const result = results?.find((r: any) => r.mockId === mock.id);
            const isFree = mock.accessType === 'FREE';
            const locked = !isFree && !hasPass;

            return (
               <Card key={mock.id} className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-all text-left group">
                  <CardContent className="p-5 md:p-8 space-y-4">
                     <div className="flex items-center justify-between">
                        <Badge className={cn("border-none text-[8px] font-black px-2 py-0.5 rounded", isFree ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                           {isFree ? 'FREE' : 'PREMIUM'}
                        </Badge>
                        {result && <span className="text-[8px] font-black text-slate-300 uppercase">AUDITED</span>}
                     </div>
                     <h3 className="text-sm md:text-lg font-black text-[#0F172A] uppercase leading-tight group-hover:text-primary transition-colors">{mock.title}</h3>
                     <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-3">
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {mock.duration}m</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {mock.totalQuestions} Qs</span>
                     </div>
                     <div className="pt-2">
                        <Button 
                          asChild 
                          onClick={(e) => handleInteraction(e, `/mocks/${mock.id}`)}
                          className="w-full h-10 bg-slate-50 hover:bg-primary text-slate-600 hover:text-white border-none font-black uppercase text-[9px] rounded-xl"
                        >
                           <Link href={locked ? "/pass" : result ? `/results/${mock.id}` : `/mocks/${mock.id}`}>
                              {locked ? 'Unlock with Pass' : result ? 'View Results' : 'Attempt Now'}
                           </Link>
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            )
         })}
      </div>
   )
}

function EmptyNode({ label }: { label: string }) {
   return (
      <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl opacity-20">
         <Sparkles className="h-10 w-10 mx-auto mb-4" />
         <p className="font-black uppercase tracking-[0.2em] text-[10px]">{label}</p>
      </div>
   )
}
