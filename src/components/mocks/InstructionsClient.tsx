'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Info, CheckCircle2, Clock, BookOpen, Zap, Lock, AlertCircle, ChevronRight, ArrowLeft, RotateCcw, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

interface InstructionsClientProps {
  mockId?: string;
}

/**
 * @fileOverview Official Test Rules Hub v6.1.
 * REDESIGNED: Start Test button with vibrant primary-to-cyan gradient.
 * FIXED: Precise retake detection and universal ID extraction.
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
  const [isFinished, setIsFinished] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const activeId = useMemo(() => {
    if (propMockId) return propMockId;
    const queryId = searchParams.get('id');
    if (queryId && queryId !== 'manual') return queryId;
    
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 2 && segments[segments.length-1] === 'instructions') {
      return segments[segments.length - 2];
    }
    const last = segments[segments.length - 1];
    return (last && last !== 'instructions' && last !== 'view') ? last : null;
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
        setIsFinished(false);
        
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

        if (user) {
          const attemptRef = doc(db, "attempts", `${user.uid}_${activeId}`);
          const attemptSnap = await getDoc(attemptRef);
          if (attemptSnap.exists() && attemptSnap.data().status === 'COMPLETED') {
            setIsFinished(true);
          }
        } else {
          const guestResult = localStorage.getItem(`cracklix_guest_result_${activeId}`);
          if (guestResult) setIsFinished(true);
        }

        const tier = (mData.accessLevel || 'FREE').toUpperCase();
        if (tier === 'FREE') {
          setAccessChecked(true);
          setIsLoading(false);
          return;
        }

        if (!user && !userLoading) {
          router.push(`/login?returnUrl=${encodeURIComponent(pathname + (searchParams?.toString() ? '?' + searchParams.toString() : ''))}`);
          return;
        }

        if (user && profile) {
          const userEmail = user.email?.toLowerCase();
          const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || (userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail));
          
          if (isAdmin) {
            setAccessChecked(true);
          } else {
            const expiry = profile?.passExpiresAt ? new Date(profile.passExpiresAt) : null;
            const isPassActive = expiry && expiry > new Date() && profile?.pass?.active !== false;

            if (!isPassActive) {
              setAccessError("Your Pro Pass is required for this premium test.");
            } else {
              setAccessChecked(true);
            }
          }
        }

      } catch (err: any) {
        console.error("[INSTRUCTIONS_SYNC_ERROR]:", err);
        setAccessError("Database sync failed. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    }

    if (!userLoading) {
      loadTestAndAuditAccess();
    }
  }, [db, activeId, user, userLoading, profile, router, pathname, searchParams]);

  const handleRetake = async () => {
    if (!db || isResetting || !activeId) return;
    
    setIsResetting(true);
    try {
      if (user) {
        await deleteDoc(doc(db, "attempts", `${user.uid}_${activeId}`));
      }
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`cracklix_guest_attempt_${activeId}`);
        localStorage.removeItem(`cracklix_guest_result_${activeId}`);
      }

      setIsFinished(false);
      toast({ title: "Test reset successfully" });
    } catch (e) {
      toast({ variant: "destructive", title: "Reset failed" });
    } finally {
      setIsResetting(false);
    }
  };

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
        <Card className="max-w-md w-full bg-white rounded-[3rem] p-10 md:p-14 shadow-5xl border-none space-y-8 animate-in fade-in zoom-in-95">
           <div className="h-20 w-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto text-primary shadow-xl border border-blue-100">
              <AlertCircle className="h-10 w-10" />
           </div>
           <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Test Not Found</h2>
              <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">This test is unavailable or the link has expired.</p>
           </div>
           <Button asChild className="w-full h-14 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
              <Link href="/mocks"><ChevronRight className="h-4 w-4 mr-2" /> Back to hub</Link>
           </Button>
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
                 <button onClick={() => router.back()} className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-primary shadow-sm transition-all">
                    <ArrowLeft className="h-5 w-5" />
                 </button>
                 <Badge className="bg-blue-50 text-primary border-none px-4 py-1.5 rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-sm">Verified Practice</Badge>
              </div>
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-headline font-black text-[#0F172A] tracking-tight leading-tight">{mock?.title}</h1>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <StatPlate icon={<Clock />} label="Duration" val={`${mock?.duration || 0}m`} />
              <StatPlate icon={<BookOpen />} label="Items" val={mock?.totalQuestions || 0} />
              <StatPlate icon={<Zap />} label="Total Pts" val={(mock?.totalQuestions || 0) * (mock?.positiveMarks || 1)} />
              <StatPlate icon={<ShieldCheck />} label="Penalty" val={`-${mock?.negativeMarks || 0.25}`} />
           </div>

           {accessError && (
              <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-2">
                 <Lock className="h-6 w-6 text-rose-500 shrink-0" />
                 <p className="text-sm font-bold text-rose-700">{accessError}</p>
                 <Button asChild variant="link" className="ml-auto text-rose-700 font-black uppercase text-[10px]"><Link href="/pass">Upgrade</Link></Button>
              </div>
           )}

           <Card className="border-none shadow-3xl rounded-[2.5rem] md:rounded-[3.5rem] bg-white overflow-hidden border border-slate-100">
              <CardHeader className="p-8 md:p-12 bg-slate-50/50 border-b border-slate-100">
                 <CardTitle className="text-lg md:text-3xl font-headline font-black text-[#0F172A] flex items-center gap-4">
                    <Info className="h-7 w-7 text-primary" /> Test Guidelines
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 md:p-14 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Instruction text="Each question carries equal marks as per official norms." />
                    <Instruction text="Wrong answers incur a negative penalty as listed." />
                    <Instruction text="Automated submission triggers when time ends." />
                    <Instruction text="CBT interface mimics official recruitment boards." />
                    <Instruction text="Bilingual language support available during attempt." />
                    <Instruction text="Navigational palette allows direct question jumping." />
                 </div>

                 <div className="flex flex-col gap-6 items-center w-full max-w-2xl mx-auto pt-4">
                   {isFinished ? (
                      <div className="w-full space-y-4">
                        <Button 
                          onClick={() => router.push(`/results/view?id=${activeId}`)}
                          className="w-full h-16 md:h-20 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[12px] md:text-sm rounded-[18px] md:rounded-[2rem] shadow-xl transition-all active:scale-95 border-none flex items-center justify-center gap-3"
                        >
                           View analysis <ChevronRight className="h-5 w-5" />
                        </Button>
                        <Button 
                          onClick={handleRetake}
                          disabled={isResetting}
                          variant="outline"
                          className="w-full h-14 border-2 border-slate-100 text-[#0F172A] font-black uppercase text-[10px] rounded-2xl shadow-sm hover:bg-slate-50 active:scale-95 gap-3"
                        >
                           {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} 
                           Retake test (Reset)
                        </Button>
                      </div>
                   ) : (
                      <Button 
                        disabled={!!accessError}
                        onClick={() => router.push(`/mocks/attempt?id=${activeId}`)}
                        className="relative overflow-hidden w-full h-16 md:h-24 bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 text-white font-black uppercase tracking-[0.2em] text-[12px] md:text-xl rounded-[20px] md:rounded-[3rem] shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all active:scale-95 border-none group"
                      >
                         <div className="flex items-center justify-center gap-4 relative z-10">
                            <Play className="h-6 w-6 md:h-8 md:w-8 fill-white text-white" />
                            <span>Start Test</span>
                            <ChevronRight className="h-6 w-6 md:h-8 md:w-8 transition-transform group-hover:translate-x-2" />
                         </div>
                         <motion.div 
                            animate={{ x: ['-100%', '300%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] pointer-events-none"
                         />
                      </Button>
                   )}
                 </div>
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
       <div className={cn("h-10 w-10 md:h-16 md:w-16 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto text-primary mb-2 shadow-inner group-hover:scale-110 transition-transform")}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-8 md:w-8" }) : icon}
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
