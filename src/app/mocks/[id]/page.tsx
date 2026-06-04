
"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ChevronLeft,
  Info,
  Layers,
  Award,
  Lock,
  Users,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Redesigned Mock Overview Page (Phase 160).
 * Features: Institutional Access Control (Membership Gating).
 */

export default function MockOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user, profile } = useUser()
  const mockId = params.id as string
  
  const { data: mock, loading } = useDoc<any>(useMemo(() => (db ? doc(db, "mocks", mockId) : null), [db, mockId]))

  // Strict Membership Gating Logic
  const isLocked = useMemo(() => {
    if (!mock || !profile) return true;
    
    // Founder/Super Admin Bypass
    const isFounder = user?.email === 'arshdeepgrewal1122@gmail.com';
    if (profile.role === 'SUPER_ADMIN' || isFounder) return false;

    // Plan-based Permission Check
    const tier = profile.status || 'Free';
    const type = mock.mockType;

    if (type === 'FULL') return tier !== 'Premium';
    if (type === 'SECTIONAL') return !['Gold', 'Premium'].includes(tier);
    if (type === 'SUBJECT' || type === 'PYQ' || type === 'CA_QUIZ') return !['Silver', 'Gold', 'Premium'].includes(tier);

    // Free access for 3 daily mocks or specific non-premium nodes
    if (!mock.isPremium) return false;

    return true;
  }, [mock, profile, user])

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Skeleton className="h-20 w-20 rounded-full" /></div>
  if (!mock) return <div className="h-screen flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">Mock not found.</div>

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      <Navbar />
      
      <main className="flex-1">
        <section className="bg-slate-50 border-b border-slate-100 py-10 md:py-16">
          <div className="container mx-auto px-6 max-w-6xl">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-xl text-slate-400 hover:text-[#0F172A] gap-2 mb-6 p-0 h-auto">
              <ChevronLeft className="h-4 w-4" /> Back to List
            </Button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4 max-w-2xl text-left">
                 <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-orange-500 text-white border-none px-3 py-1 rounded-lg font-black uppercase text-[9px] tracking-widest">
                       {mock.boardId || "PSSSB"} OFFICIAL
                    </Badge>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                       <ShieldCheck className="h-3.5 w-3.5" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Verified Pattern</span>
                    </div>
                    {isLocked && (
                      <Badge className="bg-amber-100 text-amber-600 border-none px-3 py-1 rounded-lg font-black uppercase text-[9px] tracking-widest flex items-center gap-1.5">
                         <Lock className="h-3 w-3" /> Membership Required
                      </Badge>
                    )}
                 </div>

                 <div className="space-y-1">
                    <h1 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase leading-tight tracking-tight">
                      {mock.title}
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Institutional Audit Version 2.4 • Updated: {new Date().toLocaleDateString('en-GB')}
                    </p>
                 </div>

                 <div className="flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2 text-slate-500">
                       <Users className="h-4 w-4 text-primary" />
                       <span className="text-xs font-bold">1,250+ Attempts</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                       <Clock className="h-4 w-4 text-primary" />
                       <span className="text-xs font-bold">{mock.duration || 120} Mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                       <BookOpen className="h-4 w-4 text-primary" />
                       <span className="text-xs font-bold">{mock.totalQuestions || 150} Questions</span>
                    </div>
                 </div>
              </div>

              <div className="w-full md:w-auto">
                 {isLocked ? (
                    <Button asChild className="w-full h-16 md:h-20 md:px-12 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-amber-900/20 gap-4">
                      <Link href="/pass">
                        <Lock className="h-5 w-5" /> Get Pass to Unlock
                      </Link>
                    </Button>
                 ) : (
                    <Button asChild className="w-full h-16 md:h-20 md:px-12 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-slate-300 gap-4 group">
                      <Link href={`/mocks/${mockId}/attempt`}>
                        Start Mock <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                 )}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             <div className="lg:col-span-8 space-y-12">
                <Card className="border-none shadow-3xl shadow-slate-900/5 rounded-[2.5rem] bg-white overflow-hidden">
                   <CardHeader className="p-10 border-b border-slate-50 text-left">
                      <CardTitle className="font-headline text-2xl font-black text-[#0F172A] uppercase">Test Instructions</CardTitle>
                      <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Please read carefully before starting the exam.</CardDescription>
                   </CardHeader>
                   <CardContent className="p-10 space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <InstructionCard icon={<Clock className="text-primary" />} title="Duration" value={`${mock.duration || 120} Minutes`} desc="Fixed time limit as per official board rules." />
                         <InstructionCard icon={<BookOpen className="text-blue-500" />} title="Questions" value={`${mock.totalQuestions || 150} MCQs`} desc="Includes mandatory Punjabi qualifying section." />
                         <InstructionCard icon={<Award className="text-emerald-500" />} title="Marking" value="1.0 Mark Correct" desc="Standard marking for all technical & non-technical nodes." />
                         <InstructionCard icon={<AlertTriangle className="text-rose-500" />} title="Negative" value="-0.25 Penalty" desc="Applied for every mismatched audit choice." />
                      </div>

                      <div className="bg-slate-50 rounded-3xl p-8 space-y-6">
                         <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-[#0F172A] flex items-center gap-3">
                            <Info className="h-4 w-4 text-primary" /> Exam Protocol
                         </h4>
                         <ul className="space-y-4">
                            <GuidelineItem text="Paper A (Questions 1-50) is mandatory. You must score 50% to qualify for Paper B evaluation." />
                            <GuidelineItem text="The clock will start the moment you click 'Start Mock'." />
                            <GuidelineItem text="Use the 'Bilingual Toggle' to switch between English and Punjabi languages." />
                            <GuidelineItem text="Do not refresh the page during the exam. All progress will be saved locally." />
                         </ul>
                      </div>
                   </CardContent>
                </Card>
             </div>

             <div className="lg:col-span-4 space-y-10">
                <Card className="border-none shadow-3xl shadow-slate-900/10 rounded-[2.5rem] bg-[#0F172A] text-white p-10 overflow-hidden relative text-left">
                   <div className="absolute top-0 right-0 p-6 opacity-5"><Layers className="h-32 w-32 rotate-12" /></div>
                   <div className="relative z-10 space-y-6">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Board Analysis</p>
                         <h3 className="text-2xl font-headline font-black uppercase">Official Patterns</h3>
                      </div>
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <WeightingItem label="Part A: Punjabi" value="50 Qs" />
                        <WeightingItem label="Part B: Main Exam" value="100 Qs" />
                      </div>
                      <p className="text-slate-400 text-xs font-medium leading-relaxed italic">
                         "This series is audited to mirror the exact difficulty levels of recent PSSSB and PPSC recruitments."
                      </p>
                   </div>
                </Card>

                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-start gap-4 text-left">
                   <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                   <div className="space-y-1">
                      <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Instant Results</p>
                      <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                         Get your All Punjab Rank and subject-wise accuracy analysis immediately after submission.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function InstructionCard({ icon, title, value, desc }: any) {
   return (
      <div className="flex gap-5 group text-left">
         <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-all">
            {icon}
         </div>
         <div className="space-y-1 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{title}</p>
            <p className="text-lg font-black text-[#0F172A]">{value}</p>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">{desc}</p>
         </div>
      </div>
   )
}

function GuidelineItem({ text }: { text: string }) {
   return (
      <li className="flex gap-4 items-start text-left">
         <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
         <span className="text-sm font-bold text-slate-600 leading-snug">{text}</span>
      </li>
   )
}

function WeightingItem({ label, value }: any) {
   return (
      <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
         <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">{label}</span>
         <span className="text-xs font-black text-primary">{value}</span>
      </div>
   )
}
