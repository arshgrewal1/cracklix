
"use client"

import { useMemo, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useFirestore, useUser, useCollection } from "@/firebase"
import { doc, collection, query, where, getDocs, limit } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ChevronLeft,
  Info,
  Lock,
  Edit,
  ShieldAlert,
  Zap,
  Gem
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Mock Node with Advanced Tiered Access Control.
 * Logic: Checks specific subscription allowed_exams and active expiry.
 */

export default function MockOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user, profile } = useUser()
  const mockId = params.id as string
  
  const { data: mock, loading: mockLoading } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))
  const { data: passes } = useCollection<any>(useMemo(() => (db ? collection(db, "passes") : null), [db]))

  const [isLocked, setIsLocked] = useState(true);
  const [accessChecked, setAccessChecked] = useState(false);
  const [activePass, setActivePass] = useState<any>(null);

  // Advanced Access Logic Hub
  useEffect(() => {
    async function checkAccess() {
      if (mockLoading || !mock || !db) return;

      // 1. Logic Rule: FREE nodes are always unlocked
      if (mock.accessType === 'FREE') {
        setIsLocked(false);
        setAccessChecked(true);
        return;
      }

      // 2. Logic Rule: Admin bypass
      if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
        setIsLocked(false);
        setAccessChecked(true);
        return;
      }

      if (!user) {
        setIsLocked(true);
        setAccessChecked(true);
        return;
      }

      // 3. Logic Rule: Subscription Verification
      try {
        const subQuery = query(
          collection(db, "subscriptions"), 
          where("userId", "==", user.uid),
          where("status", "==", "ACTIVE"),
          limit(1)
        );
        const subSnap = await getDocs(subQuery);
        
        if (!subSnap.empty) {
          const subData = subSnap.docs[0].data();
          const expiry = new Date(subData.expiryDate);
          
          if (expiry > new Date()) {
            // Check if this pass allows this specific examId
            const passId = subData.passId;
            const passSnap = await getDocs(query(collection(db, "passes"), where("id", "==", passId)));
            
            if (!passSnap.empty) {
              const passData = passSnap.docs[0].data();
              setActivePass(passData);
              
              if (passData.allowedExams?.includes(mock.examId) || passData.type === 'PLATINUM') {
                setIsLocked(false);
              }
            }
          }
        }
      } catch (e) {
        console.error("Access Audit Error:", e);
      }

      setAccessChecked(true);
    }

    checkAccess();
  }, [mock, mockLoading, user, profile, db]);

  if (mockLoading || !accessChecked) return <div className="h-screen flex items-center justify-center bg-white"><Skeleton className="h-20 w-20 rounded-full" /></div>
  if (!mock) return <div className="h-screen flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">Registry node missing.</div>

  const requiredPass = passes?.find((p: any) => p.allowedExams?.includes(mock.examId));

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      <Navbar />
      
      <main className="flex-1">
        <section className="bg-slate-50 border-b border-slate-100 py-10 md:py-16">
          <div className="container mx-auto px-6 max-w-6xl text-left">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-xl text-slate-400 hover:text-[#0F172A] gap-2 mb-6 p-0 h-auto">
              <ChevronLeft className="h-4 w-4" /> Back to Hub
            </Button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4 max-w-2xl">
                 <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-orange-50 text-primary border-none px-3 py-1 rounded-lg font-black uppercase text-[9px] tracking-widest">
                       {mock.boardId?.toUpperCase() || "STATE"} OFFICIAL
                    </Badge>
                    {isLocked && (
                      <Badge className="bg-amber-100 text-amber-600 border-none px-3 py-1 rounded-lg font-black uppercase text-[9px] tracking-widest flex items-center gap-1.5">
                         <Lock className="h-3 w-3" /> PASS RESTRICTED
                      </Badge>
                    )}
                 </div>

                 <h1 className="text-3xl md:text-5xl font-headline font-black text-[#000000] uppercase leading-tight tracking-tight">
                   {mock.title}
                 </h1>

                 <div className="flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2 text-slate-500"><Clock className="h-4 w-4 text-primary" /><span className="text-xs font-bold">{mock.duration || 120} Mins</span></div>
                    <div className="flex items-center gap-2 text-slate-500"><BookOpen className="h-4 w-4 text-primary" /><span className="text-xs font-bold">{mock.totalQuestions || 150} Questions</span></div>
                 </div>
              </div>

              <div className="w-full md:w-auto">
                 {isLocked ? (
                    <Button asChild className="w-full h-16 md:h-20 md:px-12 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-amber-900/20 gap-4">
                      <Link href="/pass">
                        <Lock className="h-5 w-5" /> Unlock with Pass
                      </Link>
                    </Button>
                 ) : (
                    <Button asChild className="w-full h-16 md:h-20 md:px-12 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-slate-300 gap-4 group">
                      <Link href={`/mocks/${mockId}/attempt`}>Start Practice <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></Link>
                    </Button>
                 )}
              </div>
            </div>
          </div>
        </section>

        {isLocked ? (
           <div className="container mx-auto px-6 py-24 max-w-4xl text-center">
              <div className="space-y-12">
                 <div className="relative inline-block">
                    <div className="h-32 w-32 bg-amber-50 rounded-[3rem] flex items-center justify-center mx-auto text-amber-500 shadow-xl border border-amber-100">
                       <Lock className="h-12 w-12" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                       <Gem className="h-6 w-6 text-primary" />
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <h2 className="text-4xl font-headline font-black text-[#0F172A] uppercase">Mastery Node Locked</h2>
                    <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
                       This high-fidelity practice series is reserved for Institutional Pass holders. Activate a pass to unlock verified patterns and AI solutions.
                    </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <FeatureNode icon={<Zap />} label="500+ Full Mocks" />
                    <FeatureNode icon={<ShieldCheck />} color="text-emerald-500" label="Official PYQs" />
                    <FeatureNode icon={<CheckCircle2 />} color="text-blue-500" label="AI Explanations" />
                 </div>

                 <Button asChild className="h-16 px-16 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-3xl shadow-primary/30">
                    <Link href="/pass">Unlock All Mocks Now</Link>
                 </Button>
              </div>
           </div>
        ) : (
          <div className="container mx-auto px-6 py-12 max-w-6xl text-left">
             <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100 space-y-8 shadow-inner">
                <h3 className="text-xl font-headline font-black uppercase text-[#0F172A] flex items-center gap-4"><Info className="h-6 w-6 text-primary" /> Institutional Rules</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <li className="flex gap-4 items-start"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1" /> <span className="font-bold">Ensure 100% stable signal strength.</span></li>
                   <li className="flex gap-4 items-start"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1" /> <span className="font-bold">Bilingual toggle active inside engine.</span></li>
                   <li className="flex gap-4 items-start"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1" /> <span className="font-bold">Real-time audit generated post-submission.</span></li>
                   <li className="flex gap-4 items-start"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1" /> <span className="font-bold">Official 2026 marking scheme applied.</span></li>
                </ul>
             </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

function FeatureNode({ icon, label, color = "text-primary" }: any) {
  return (
    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
       <div className={cn("h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center", color)}>
          {icon}
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">{label}</span>
    </div>
  )
}
