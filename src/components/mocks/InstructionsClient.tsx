'use client';

import React, { useEffect, useState, useMemo, isValidElement, cloneElement, ReactElement } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Info, CheckCircle2, Clock, BookOpen, Zap, Lock, AlertCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

interface InstructionsClientProps {
  mockId?: string;
}

/**
 * @fileOverview Official Test Rules Hub v4.0.
 * FIXED: Dual-registry lookup (mocks + daily_quizzes) to prevent blank screens.
 * FIXED: Added "Quiz Not Found" fallback and hardened loading states.
 */

export default function InstructionsClient({ mockId: propMockId }: InstructionsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user, profile, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  const [mock, setMock] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessChecked, setAccessChecked] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const activeId = useMemo(() => {
    if (propMockId) return propMockId;
    const queryId = searchParams?.get('id');
    if (queryId) return queryId;
    
    // Fallback path segment extraction
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment !== 'instructions' ? lastSegment : null;
  }, [pathname, searchParams, propMockId]);

  useEffect(() => {
    async function loadTestAndAuditAccess() {
      if (!db || !activeId) {
        if (!activeId) {
          setIsLoading(false);
          setNotFound(true);
        }
        return;
      }

      try {
        setIsLoading(true);
        
        // 1. DUAL-REGISTRY LOOKUP
        const mockRef = doc(db, "mocks", activeId);
        const dailyRef = doc(db, "daily_quizzes", activeId);
        
        let targetSnap = await getDoc(mockRef);
        if (!targetSnap.exists()) {
          targetSnap = await getDoc(dailyRef);
        }

        if (!targetSnap.exists()) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        const mData = targetSnap.data();
        setMock(mData);

        // 2. ACCESS AUDIT
        const tier = (mData.accessLevel || 'FREE').toUpperCase();
        if (tier === 'FREE') {
          setAccessChecked(true);
          setIsLoading(false);
          return;
        }

        if (!user) {
          router.push(`/login?returnUrl=${encodeURIComponent(pathname + (searchParams?.toString() ? '?' + searchParams.toString() : ''))}`);
          return;
        }

        const userEmail = user.email?.toLowerCase();
        const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || (userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail));
        
        if (isAdmin) {
          setAccessChecked(true);
          setIsLoading(false);
          return;
        }

        const now = new Date();
        const expiry = profile?.passExpiresAt ? new Date(profile.passExpiresAt) : null;
        const isPassActive = expiry && expiry > now && profile?.pass?.active !== false;

        if (!isPassActive && tier === 'PREMIUM') {
          setAccessError("Your Pro Pass has expired. Please renew to access this premium test.");
          setIsLoading(false);
          return;
        }

        // Logic Check: Does current pass allow this specific mock or authority?
        const passId = profile?.status || 'free-pass';
        const passRef = doc(db, "passes", passId);
        const passSnap = await getDoc(passRef);
        
        if (passSnap.exists()) {
          const passData = passSnap.data();
          const allowedMocks = passData.allowedMocks || [];
          const allowedCategories = passData.allowedCategories || [];

          const isAllowed = allowedMocks.includes(activeId) || allowedCategories.includes(mData.boardId || "");

          if (!isAllowed && tier === 'PREMIUM') {
             setAccessError(`This test is not included in your current ${passData.name || 'Plan'}. Upgrade to continue.`);
             setIsLoading(false);
             return;
          }
        }

        setAccessChecked(true);
      } catch (err: any) {
        console.error("[INSTRUCTIONS_SYNC_ERROR]:", err);
        setAccessError("A temporary synchronization error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    if (!userLoading) {
      loadTestAndAuditAccess();
    }
  }, [db, activeId, user, userLoading, profile, router, pathname, searchParams]);

  if (isLoading || userLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-8 p-6">
       <Zap className="h-12 w-12 text-primary animate-pulse" />
       <div className="space-y-3 w-full max-w-md">
          <Skeleton className="h-10 w-3/4 mx-auto rounded-xl" />
          <Skeleton className="h-4 w-1/2 mx-auto rounded-xl" />
       </div>
    </div>
  );

  if (notFound) return (
     <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md w-full bg-white rounded-[3rem] p-10 md:p-14 shadow-5xl border-none space-y-8">
           <div className="h-20 w-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto text-primary shadow-xl border border-blue-100">
              <AlertCircle className="h-10 w-10" />
           </div>
           <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Test Not Found</h2>
              <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">This preparation node has been archived or the ID provided is invalid.</p>
           </div>
           <div className="pt-4">
              <Button asChild className="w-full h-14 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl border-none">
                 <Link href="/mocks"><ChevronRight className="h-4 w-4 mr-2" /> Back to Practice Hub</Link>
              </Button>
           </div>
        </Card>
     </div>
  );

  if (accessError) return (
     <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md w-full bg-white rounded-[3rem] p-10 md:p-14 shadow-5xl border-none space-y-8 animate-in zoom-in-95 duration-500">
           <div className="h-20 w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
              <Lock className="h-10 w-10" />
           </div>
           <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-headline font-black text-[#0F172A] uppercase leading-tight">Access Locked</h2>
              <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">{accessError}</p>
           </div>
           <div className="pt-4 flex flex-col gap-3">
              <Button asChild className="h-14 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl border-none">
                 <Link href="/pass">View Pass Hub</Link>
              </Button>
              <Button variant="ghost" onClick={() => router.back()} className="h-12 text-slate-400 font-bold uppercase text-[9px] tracking-widest">Go Back</Button>
           </div>
        </Card>
     </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body select-none">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-5xl text-left pb-safe">
        <div className="space-y-8 md:space-y-12">
           <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-3">
                 <button onClick={() => router.back()} className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-primary shadow-sm active:scale-90 transition-all">
                    <ArrowLeft className="h-5 w-5" />
                 </button>
                 <Badge className="bg-blue-50 text-primary border-none px-4 py-1.5 rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-sm">Verified Practice</Badge>
              </div>
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-headline font-black text-[#0F172A] uppercase leading-tight tracking-tight">{mock.title}</h1>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <StatPlate icon={<Clock />} label="Duration" val={`${mock.duration}m`} />
              <StatPlate icon={<BookOpen />} label="Items" val={mock.totalQuestions} />
              <StatPlate icon={<Zap />} label="Total Pts" val={mock.totalQuestions * (mock.positiveMarks || 1)} />
              <StatPlate icon={<ShieldCheck />} label="Penalty" val={`-${mock.negativeMarks || 0.25}`} />
           </div>

           <Card className="border-none shadow-3xl rounded-[2.5rem] md:rounded-[3.5rem] bg-white overflow-hidden border border-slate-100">
              <CardHeader className="p-8 md:p-12 bg-slate-50/50 border-b border-slate-100">
                 <CardTitle className="text-lg md:text-3xl font-headline font-black text-[#0F172A] flex items-center gap-4">
                    <Info className="h-7 w-7 text-primary" /> Test Guidelines
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 md:p-14 space-y-10 md:space-y-16">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Instruction text="Each question carries equal marks as per official norms." />
                    <Instruction text="Wrong answers incur a negative penalty as listed." />
                    <Instruction text="Automated submission node triggers when time ends." />
                    <Instruction text="CBT interface mimics official recruitment boards." />
                    <Instruction text="Bilingual language support available during attempt." />
                    <Instruction text="Navigational palette allows direct question jumping." />
                 </div>

                 <Button 
                    onClick={() => router.push(`/mocks/attempt?id=${activeId}`)}
                    className="w-full h-16 md:h-24 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[11px] md:text-base rounded-2xl md:rounded-[3rem] shadow-5xl group transition-all active:scale-95 border-none"
                 >
                    Initialize Attempt <ChevronRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                 </Button>
              </CardContent>
           </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatPlate({ icon, label, val }: any) {
  return (
    <div className="p-5 md:p-10 bg-white rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-xl text-center space-y-2 md:space-y-5 group hover:border-primary/30 transition-all">
       <div className="h-10 w-10 md:h-16 md:w-16 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto text-primary mb-2 shadow-inner group-hover:scale-110 transition-transform">
          {isValidElement(icon) && cloneElement(icon as ReactElement<any>, { className: "h-5 w-5 md:h-8 md:w-8" })}
       </div>
       <p className="text-[8px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
       <p className="text-xl md:text-4xl font-black text-[#0F172A] uppercase leading-none tabular-nums">{val}</p>
    </div>
  )
}

function Instruction({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-4 group">
       <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary transition-all shadow-inner">
          <CheckCircle2 className="h-3.5 w-3.5 md:h-5 md:w-5 text-slate-400 group-hover:text-white" />
       </div>
       <p className="text-slate-600 font-bold text-sm md:text-lg leading-relaxed tracking-tight group-hover:text-[#0F172A] transition-colors">{text}</p>
    </div>
  )
}
