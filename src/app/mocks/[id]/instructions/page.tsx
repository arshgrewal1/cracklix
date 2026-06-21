'use client';

import React, { useEffect, useState, useMemo, isValidElement } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Info, CheckCircle2, Clock, BookOpen, Zap, Globe, Languages, ChevronRight, Home } from "lucide-react";
import { useExamStore } from "@/store/useExamStore";
import { cn } from "@/lib/utils";
import { LanguageDisplayMode } from "@/types";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

/**
 * @fileOverview Hardened Instructions Hub v12.0.
 * HARDENED: Strict Premium Access Guard.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function InstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const db = useFirestore();
  const { user, profile, loading: userLoading } = useUser();
  const { toast } = useToast();
  const mockId = params.id as string;
  const setLanguage = useExamStore(s => s.setLanguage);
  const [prefLang, setPrefLang] = useState<LanguageDisplayMode>('ENGLISH_PUNJABI');
  const [accessChecked, setAccessChecked] = useState(false);

  const { data: mock, loading } = useDoc<any>(useMemo(() => (db ? doc(db, "mocks", mockId) : null), [db, mockId]));

  useEffect(() => {
    if (!userLoading && !user) {
       router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, userLoading, router, pathname]);

  useEffect(() => {
    if (mock?.languageMode) {
      setPrefLang(mock.languageMode);
    }
  }, [mock]);

  // CORE ACCESS AUDIT
  useEffect(() => {
     if (loading || userLoading || !user || !mock || !profile) return;

     const tier = (mock.accessLevel || 'FREE').toUpperCase();
     const userEmail = user.email?.toLowerCase();
     const isAdmin = profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN' || (userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail));

     let hasActivePass = false;
     if (isAdmin) {
        hasActivePass = true;
     } else if (profile.passExpiresAt) {
        const expiry = new Date(profile.passExpiresAt);
        if (expiry > new Date() && profile.pass?.active !== false) {
           hasActivePass = true;
        }
     }

     if (tier === 'PREMIUM' && !hasActivePass) {
        toast({ 
          variant: "destructive", 
          title: "Access Restricted", 
          description: profile.passStatus === 'expired' ? "Renew your Elite Pass to attempt this test." : "Premium Pass required for this series." 
        });
        router.replace('/pass');
     } else {
        setAccessChecked(true);
     }
  }, [mock, loading, user, userLoading, profile, router, toast]);

  const availableLangs = useMemo(() => {
    if (!mock?.languageMode) return [];
    const mode = mock.languageMode;
    
    if (mode === 'ENGLISH_PUNJABI') return ['ENGLISH', 'PUNJABI', 'ENGLISH_PUNJABI'];
    if (mode === 'ENGLISH_HINDI') return ['ENGLISH', 'HINDI', 'ENGLISH_HINDI'];
    
    if (mode === 'ENGLISH') return ['ENGLISH'];
    if (mode === 'PUNJABI') return ['PUNJABI'];
    if (mode === 'HINDI') return ['HINDI'];
    return [];
  }, [mock]);

  const handleStart = () => {
    setLanguage(prefLang);
    router.push(`/mocks/${mockId}/attempt`);
  };

  if (loading || userLoading || (user && mock && !accessChecked)) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Hub...</p>
    </div>
  );

  if (!user) return null;

  if (!mock) return (
    <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-8 bg-white p-6">
       <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100 shadow-inner">
          <Info className="h-10 w-10 opacity-20" />
       </div>
       <div className="text-center space-y-2">
          <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400">Registry Sync Error</p>
          <h2 className="text-3xl font-headline font-black text-[#0F172A] uppercase">Test Not Found</h2>
          <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">This test node could not be verified in the master registry.</p>
       </div>
       <Button asChild className="h-14 px-10 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl gap-3">
          <Link href="/"><Home className="h-4 w-4" /> Return Home</Link>
       </Button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body select-none">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-5xl text-left pb-safe">
        <div className="space-y-8 md:space-y-12">
           <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4 text-primary" />
                 <Badge className="bg-blue-50 text-primary border-none px-3 py-1 rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-sm">Official Practice Hub</Badge>
              </div>
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-headline font-black text-[#0F172A] uppercase leading-tight tracking-tight">{mock.title}</h1>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              <StatPlate icon={<Clock />} label="DURATION" val={`${mock.duration}m`} />
              <StatPlate icon={<BookOpen />} label="QUESTIONS" val={mock.totalQuestions} />
              <StatPlate icon={<Zap />} label="TOTAL MARKS" val={mock.totalQuestions * (mock.positiveMarks || 1)} />
              <StatPlate icon={<ShieldCheck />} label="PENALTY" val={`-${mock.negativeMarks || 0.25}`} />
           </div>

           <Card className="border-none shadow-2xl rounded-[2rem] md:rounded-[3rem] bg-white overflow-hidden border border-slate-100">
              <CardHeader className="p-6 md:p-10 bg-slate-50/50 border-b border-slate-100">
                 <CardTitle className="text-base md:text-2xl font-headline font-black uppercase text-[#0F172A] flex items-center gap-4">
                    <Info className="h-6 w-6 text-primary" /> Test Guidelines
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-6 md:space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 md:gap-y-6">
                    <Instruction text="Questions carry equal weightage as per official norms." />
                    <Instruction text="Negative marking applicable for incorrect choices." />
                    <Instruction text="System will auto-submit when the timer reaches zero." />
                    <Instruction text="Switching browser tabs or windows is strictly prohibited." />
                    <Instruction text="You can switch between languages during the test." />
                    <Instruction text="Use the question palette on the right for navigation." />
                 </div>

                 {availableLangs.length > 1 && (
                    <div className="pt-6 md:pt-10 border-t border-slate-100 flex flex-col items-center gap-4 md:gap-6">
                       <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-slate-400" />
                          <p className="text-[10px] md:text-xs font-black text-[#0F172A] uppercase tracking-[0.3em]">Select Preferred Language</p>
                       </div>
                       <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                          {availableLangs.includes('ENGLISH') && <LangBtn label="English" val="ENGLISH" active={prefLang === 'ENGLISH'} onClick={setPrefLang} />}
                          {availableLangs.includes('PUNJABI') && <LangBtn label="ਪੰਜਾਬੀ" val="PUNJABI" active={prefLang === 'PUNJABI'} onClick={setPrefLang} />}
                          {availableLangs.includes('HINDI') && <LangBtn label="हिन्दी" val="HINDI" active={prefLang === 'HINDI'} onClick={setPrefLang} />}
                          {availableLangs.includes('ENGLISH_PUNJABI') && <LangBtn label="English & ਪੰਜਾਬੀ" val="ENGLISH_PUNJABI" active={prefLang === 'ENGLISH_PUNJABI'} onClick={setPrefLang} />}
                          {availableLangs.includes('ENGLISH_HINDI') && <LangBtn label="English & हिन्दी" val="ENGLISH_HINDI" active={prefLang === 'ENGLISH_HINDI'} onClick={setPrefLang} />}
                       </div>
                    </div>
                 )}

                 <div className="bg-emerald-50 border border-emerald-100 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
                    <div className="space-y-1">
                       <p className="text-sm md:text-lg font-bold text-emerald-900 leading-tight uppercase">Commit to Fair Practice</p>
                       <p className="text-[10px] md:text-sm text-emerald-700 font-medium leading-relaxed">
                          By clicking start, you agree to follow the institutional guidelines. Violations will be logged in your registry node.
                       </p>
                    </div>
                 </div>

                 <Button 
                    onClick={handleStart}
                    className="w-full h-16 md:h-20 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[11px] md:text-sm rounded-2xl md:rounded-[2rem] shadow-4xl group transition-all active:scale-95 border-none"
                 >
                    Initialize Test <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
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
       <div className="h-10 w-10 md:h-14 md:w-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto text-primary mb-2 shadow-inner group-hover:scale-110 transition-transform">
          {isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { className: "h-5 w-5 md:h-7 md:w-7" })}
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
       <p className="text-slate-600 font-bold uppercase text-[9px] md:text-[13px] leading-relaxed tracking-tight group-hover:text-[#0F172A] transition-colors">{text}</p>
    </div>
  )
}

function LangBtn({ label, val, active, onClick }: any) {
  return (
    <button 
      onClick={() => onClick(val)}
      className={cn(
        "px-4 md:px-6 py-2 md:py-3 rounded-xl border-2 font-black uppercase text-[9px] md:text-[11px] tracking-widest transition-all shadow-md active:scale-95",
        active ? "border-primary bg-blue-50 text-primary shadow-xl scale-105" : "border-slate-100 text-slate-400 hover:border-slate-300 bg-white"
      )}
    >
       {label}
    </button>
  )
}
