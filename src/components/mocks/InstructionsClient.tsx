'use client';

import React, { useEffect, useState, useMemo, isValidElement, cloneElement, ReactElement } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Info, CheckCircle2, Clock, BookOpen, Zap, Globe, ChevronRight, Home, Lock, AlertCircle } from "lucide-react";
import { useExamStore } from "@/store/useExamStore";
import { cn } from "@/lib/utils";
import { LanguageDisplayMode } from "@/types";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

interface InstructionsClientProps {
  mockId: string;
}

/**
 * @fileOverview Test Rules Hub - Simplified Language v2.2.
 * FIXED: Direct cloneElement usage to resolve build failures.
 */

export default function InstructionsClient({ mockId: propMockId }: InstructionsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user, profile, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  const [accessChecked, setAccessChecked] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  const mockId = useMemo(() => {
    if (propMockId) return propMockId;
    const queryId = searchParams.get('id');
    if (queryId) return queryId;
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 2]; 
    return lastSegment !== 'instructions' ? lastSegment : null;
  }, [pathname, searchParams, propMockId]);

  const { data: mock, loading } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]));

  useEffect(() => {
    if (!userLoading && !user) {
       router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, userLoading, router, pathname]);

  useEffect(() => {
     async function auditAccess() {
        if (loading || userLoading || !user || !mock || !profile || !db) return;

        const userEmail = user.email?.toLowerCase();
        const isAdmin = profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN' || (userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail));
        
        if (isAdmin) {
           setAccessChecked(true);
           return;
        }

        const now = new Date();
        const expiry = profile.passExpiresAt ? new Date(profile.passExpiresAt) : null;
        if (!expiry || now > expiry) {
           if (mock.accessLevel === 'PREMIUM') {
              setAccessError("Your Pro Pass has expired. Please renew to access this test.");
              return;
           }
        }

        const passId = profile.status || 'free-pass';
        const passRef = doc(db, "passes", passId);
        const passSnap = await getDoc(passRef);
        
        if (passSnap.exists()) {
           const passData = passSnap.data();
           const allowedMocks = passData.allowedMocks || [];
           const allowedCategories = passData.allowedCategories || [];

           const isMockExplicitlyAllowed = allowedMocks.includes(mockId);
           const isBoardExplicitlyAllowed = allowedCategories.includes(mock.boardId || "");

           if (!isMockExplicitlyAllowed && !isBoardExplicitlyAllowed && mock.accessLevel === 'PREMIUM') {
              setAccessError(`This test is not in your current plan. Upgrade your Pro Pass to continue.`);
              return;
           }
        }

        setAccessChecked(true);
     }
     auditAccess();
  }, [mock, loading, user, userLoading, profile, db, mockId]);

  if (loading || userLoading || (user && mock && !accessChecked && !accessError)) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Checking Access...</p>
    </div>
  );

  if (accessError) return (
     <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md w-full bg-white rounded-[3rem] p-10 md:p-14 shadow-5xl border-none space-y-8 animate-in zoom-in-95 duration-500">
           <div className="h-20 w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
              <Lock className="h-10 w-10" />
           </div>
           <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-headline font-black text-[#0F172A] uppercase leading-tight">Test Locked</h2>
              <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">{accessError}</p>
           </div>
           <div className="pt-4 flex flex-col gap-3">
              <Button asChild className="h-14 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl border-none">
                 <Link href="/pass">View Pro Pass Plans</Link>
              </Button>
              <Button variant="ghost" onClick={() => router.back()} className="h-12 text-slate-400 font-bold uppercase text-[9px]">Go Back</Button>
           </div>
        </Card>
     </div>
  );

  if (!user || !mock) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body select-none">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-5xl text-left pb-safe">
        <div className="space-y-8 md:space-y-12">
           <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4 text-primary" />
                 <Badge className="bg-blue-50 text-primary border-none px-3 py-1 rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-sm">Verified Practice</Badge>
              </div>
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-headline font-black text-[#0F172A] uppercase leading-tight tracking-tight">{mock.title}</h1>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              <StatPlate icon={<Clock />} label="Time" val={`${mock.duration}m`} />
              <StatPlate icon={<BookOpen />} label="Questions" val={mock.totalQuestions} />
              <StatPlate icon={<Zap />} label="Total Marks" val={mock.totalQuestions * (mock.positiveMarks || 1)} />
              <StatPlate icon={<ShieldCheck />} label="Penalty" val={`-${mock.negativeMarks || 0.25}`} />
           </div>

           <Card className="border-none shadow-2xl rounded-[2rem] md:rounded-[3rem] bg-white overflow-hidden border border-slate-100">
              <CardHeader className="p-6 md:p-10 bg-slate-50/50 border-b border-slate-100">
                 <CardTitle className="text-base md:text-2xl font-headline font-black text-[#0F172A] flex items-center gap-4">
                    <Info className="h-6 w-6 text-primary" /> Test Rules
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-6 md:space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 md:gap-y-6">
                    <Instruction text="Each question carries equal marks." />
                    <Instruction text="Wrong answers may reduce your final score." />
                    <Instruction text="Test will auto-submit when the timer ends." />
                    <Instruction text="Do not switch tabs or minimize the window." />
                    <Instruction text="You can change language during the test." />
                    <Instruction text="Use the question list on the right to navigate." />
                 </div>

                 <Button 
                    onClick={() => router.push(`/mocks/attempt?id=${mockId}`)}
                    className="w-full h-16 md:h-20 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[11px] md:text-sm rounded-2xl md:rounded-[2rem] shadow-4xl group transition-all active:scale-95 border-none"
                 >
                    Start Test Now <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
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
    <div className="p-4 md:p-8 bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-xl text-center space-y-2 md:space-y-4 group hover:border-primary/30 transition-all">
       <div className="h-10 w-10 md:h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto text-primary mb-2 shadow-inner group-hover:scale-110 transition-transform">
          {isValidElement(icon) && cloneElement(icon as React.ReactElement<any>, { className: "h-5 w-5 md:h-7 md:w-7" })}
       </div>
       <p className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
       <p className="text-lg md:text-3xl font-black text-[#0F172A] uppercase leading-none">{val}</p>
    </div>
  )
}

function Instruction({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-4 group">
       <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary transition-colors">
          <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
       </div>
       <p className="text-slate-600 font-bold text-[9px] md:text-[13px] leading-relaxed tracking-tight group-hover:text-[#0F172A] transition-colors">{text}</p>
    </div>
  )
}