"use client"

import React, { useMemo, useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Lock,
  Zap,
  Play,
  Target,
  RefreshCw,
  Gem,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Universal Mock Overview Hub Client v4.3.
 * FIXED: Detects already completed tests and provides "View Analysis" option.
 */

export default function MockOverviewClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  
  const [isLocked, setIsLocked] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [activeAttempt, setActiveAttempt] = useState<any>(null);

  const mockId = useMemo(() => {
    const queryId = searchParams.get('id');
    if (queryId) return queryId;
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment !== 'view' ? lastSegment : null;
  }, [pathname, searchParams]);

  const { data: mock, loading: mockLoading } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))

  useEffect(() => {
    async function checkAccess() {
      if (mockLoading || !user || !mock || !db || !profile || !mockId) return;

      const tier = (mock.accessLevel || 'FREE').toUpperCase();
      const isPremium = tier === 'PREMIUM';
      
      try {
        const attemptSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
        if (attemptSnap.exists()) {
           setActiveAttempt(attemptSnap.data());
        }
      } catch (e) {}

      const userEmail = user?.email?.toLowerCase();
      const isFounder = userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail);
      const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;
      
      let hasActivePass = false;
      if (isAdmin) {
         hasActivePass = true;
      } else if (profile?.passExpiresAt) {
         const expiry = new Date(profile.passExpiresAt);
         if (expiry > new Date() && profile.pass?.active !== false) {
           hasActivePass = true;
         }
      }
      
      setIsLocked(isPremium && !hasActivePass);
      setAccessChecked(true);
    }
    checkAccess();
  }, [mock, mockLoading, user, profile, db, mockId]);

  if (mockLoading || userLoading || (user && mockId && !accessChecked)) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
       <Zap className="h-12 w-12 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Synchronizing...</p>
    </div>
  );

  if (!mockId || (!mock && !mockLoading)) return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-6">
       <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary shadow-xl border border-blue-100">
          <AlertCircle className="h-8 w-8" />
       </div>
       <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#0F172A]">Mock available nahi hai</h2>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">
             Coming Soon: This test is being prepared for the database.
          </p>
       </div>
       <div className="flex flex-col gap-3">
          <Button onClick={() => router.back()} variant="outline" className="rounded-xl h-12 px-8">Return back</Button>
       </div>
    </div>
  );

  const isFinished = activeAttempt?.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      <Navbar />
      <main className="flex-1 text-left pb-20">
        <section className="bg-slate-50 border-b border-slate-100 pt-6 pb-10 min-h-[420px] md:min-h-[480px] flex items-center">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="flex flex-col items-start gap-4 md:gap-6">
              
              <Badge className={cn(
                "border-none text-[10px] font-bold px-2.5 py-0.5 rounded-lg tracking-widest shadow-sm h-7 flex items-center", 
                mock.accessLevel === 'PREMIUM' ? "bg-[#FBBF24] text-[#78350F]" : "bg-emerald-50 text-emerald-600"
              )}>
                {mock.accessLevel === 'PREMIUM' ? '🔒 Premium' : 'Free Hub'}
              </Badge>

              <div className="space-y-4 md:space-y-6 w-full">
                <h1 className="text-[32px] md:text-[44px] lg:text-[56px] font-[800] text-[#0F172A] leading-[1.05] tracking-tight lg:max-w-[60%] break-words antialiased">
                  {mock.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-[#64748B] text-base font-bold tracking-widest">
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {mock.duration}m Time</span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> {mock.totalQuestions} Items</span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> {mock.totalQuestions * (mock.positiveMarks || 1)} Pts</span>
                </div>

                <div className="pt-2 md:pt-4 flex flex-col sm:flex-row gap-4">
                  <Button asChild className="h-14 w-full sm:w-60 bg-[#0F172A] hover:bg-black text-white font-bold tracking-tight text-sm rounded-[16px] shadow-3xl transition-all active:scale-95 border-none">
                    <Link href={isFinished ? `/results/view?id=${mock.id}` : `/mocks/instructions?id=${mock.id}`} className="flex items-center justify-center gap-3">
                      {isFinished ? (
                         <><BarChart3 className="h-4 w-4 text-primary" /> View analysis</>
                      ) : activeAttempt?.status === 'IN_PROGRESS' ? (
                         <><RefreshCw className="h-4 w-4 animate-spin" /> Resume prep</>
                      ) : (
                         <><Play className="h-4 w-4 fill-current text-primary" /> Start test</>
                      )}
                    </Link>
                  </Button>
                  
                  {isFinished && (
                    <Button asChild variant="outline" className="h-14 w-full sm:w-48 border-2 border-slate-100 rounded-[16px] text-[#0F172A] font-bold text-sm hover:bg-slate-50 transition-all">
                       <Link href={`/mocks/instructions?id=${mock.id}`}>Retake test</Link>
                    </Button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-white">
           <div className="container mx-auto px-4 md:px-8 max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <FeatureNode icon={ShieldCheck} title="Official pattern" desc="Curated according to latest board notifications." />
                 <FeatureNode icon={Zap} title="Expert solutions" desc="Detailed explanations for every question." />
                 <FeatureNode icon={Target} title="State rankings" desc="Compare performance with toppers across Punjab." />
              </div>
           </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function FeatureNode({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6 text-left group hover:bg-white hover:shadow-4xl transition-all duration-500">
      <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="space-y-2">
         <h3 className="text-xl font-black text-[#0F172A] leading-tight">{title}</h3>
         <p className="text-slate-400 font-bold text-[10px] tracking-widest leading-relaxed uppercase">{desc}</p>
      </div>
    </div>
  );
}