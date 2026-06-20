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

/**
 * @fileOverview Hardened Instructions Hub v10.2 (TypeScript Hardened).
 */
export default function InstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const mockId = params.id as string;
  const setLanguage = useExamStore(s => s.setLanguage);
  const [prefLang, setPrefLang] = useState<LanguageDisplayMode>('ENGLISH_PUNJABI');

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

  if (loading || userLoading) return (
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
    <div className="min-h-screen bg-slate-50/50 font-body select-none">
      <Navbar />
      <main className="container mx-auto px-2 md:px-6 py-2 md:py-6 max-w-5xl text-left">
        <div className="space-y-2 md:space-y-6">
           <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-1.5">
                 <ShieldCheck className="h-3 w-3 text-primary" />
                 <Badge className="bg-blue-50 text-primary border-none px-1.5 py-0 rounded-full font-black uppercase text-[6px] md:text-[8px] tracking-widest shadow-sm">Official Engine</Badge>
              </div>
              <h1 className="text-[14px] md:text-3xl lg:text-4xl font-headline font-black text-[#0F172A] uppercase leading-tight tracking-tight">{mock.title}</h1>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-4">
              <StatPlate icon={<Clock />} label="DURATION" val={`${mock.duration}m`} />
              <StatPlate icon={<BookOpen />} label="QUESTIONS" val={mock.totalQuestions} />
              <StatPlate icon={<Zap />} label="MARKS" val={mock.totalQuestions * (mock.positiveMarks || 1)} />
              <StatPlate icon={<ShieldCheck />} label="PENALTY" val={`-${mock.negativeMarks || 0.25}`} />
           </div>

           <Card className="border-none shadow-xl rounded-lg md:rounded-[2rem] bg-white overflow-hidden">
              <CardHeader className="p-2 md:p-6 bg-slate-50/50 border-b border-slate-100">
                 <CardTitle className="text-[10px] md:text-lg font-headline font-black uppercase text-[#0F172A] flex items-center gap-2">
                    <Info className="h-3 w-3 text-primary" /> Instructions Hub
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6 space-y-3 md:space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 md:gap-y-3">
                    <Instruction text="Questions carry equal weightage." />
                    <Instruction text="Negative marking for incorrect audit choices." />
                    <Instruction text="Auto-submit when timer hits zero." />
                    <Instruction text="Switching tabs will log a violation." />
                    <Instruction text="Multi-language mode available below." />
                    <Instruction text="Use side palette for navigation." />
                 </div>

                 {availableLangs.length > 1 && (
                    <div className="pt-2 md:pt-6 border-t border-slate-100 flex flex-col items-center gap-2 md:gap-4">
                       <div className="flex items-center gap-1.5">
                          <Globe className="h-2.5 w-2.5 text-slate-400" />
                          <p className="text-[7px] md:text-[10px] font-black text-[#0F172A] uppercase tracking-widest">Select Language</p>
                       </div>
                       <div className="flex flex-wrap justify-center gap-1.5">
                          {availableLangs.includes('ENGLISH') && <LangBtn label="English" val="ENGLISH" active={prefLang === 'ENGLISH'} onClick={setPrefLang} />}
                          {availableLangs.includes('PUNJABI') && <LangBtn label="ਪੰਜਾਬੀ" val="PUNJABI" active={prefLang === 'PUNJABI'} onClick={setPrefLang} />}
                          {availableLangs.includes('HINDI') && <LangBtn label="हिन्दी" val="HINDI" active={prefLang === 'HINDI'} onClick={setPrefLang} />}
                          {availableLangs.includes('ENGLISH_PUNJABI') && <LangBtn label="English & ਪੰਜਾਬੀ" val="ENGLISH_PUNJABI" active={prefLang === 'ENGLISH_PUNJABI'} onClick={setPrefLang} />}
                          {availableLangs.includes('ENGLISH_HINDI') && <LangBtn label="English & हिन्दी" val="ENGLISH_HINDI" active={prefLang === 'ENGLISH_HINDI'} onClick={setPrefLang} />}
                       </div>
                    </div>
                 )}

                 <div className="bg-emerald-50 border border-emerald-100 p-2 md:p-4 rounded-md md:rounded-xl flex items-start gap-2">
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[6px] md:text-[10px] font-bold text-emerald-800 leading-tight uppercase">
                       I agree to all guidelines. Tab switching is strictly prohibited.
                    </p>
                 </div>

                 <Button 
                    onClick={handleStart}
                    className="w-full h-9 md:h-14 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest text-[8px] md:text-[10px] rounded-md md:rounded-xl shadow-lg group transition-all"
                 >
                    Agree & Continue <ChevronRight className="ml-1.5 h-3 w-3 group-hover:translate-x-1 transition-transform" />
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
    <div className="p-1.5 md:p-5 bg-white rounded-md md:rounded-xl border border-slate-100 shadow-sm text-center space-y-0.5 group hover:border-primary/30 transition-all">
       <div className="h-5 w-5 md:h-9 md:w-9 bg-slate-50 rounded-md flex items-center justify-center mx-auto text-primary mb-0.5 shadow-inner">
          {isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { className: "h-2.5 w-2.5 md:h-4 md:w-4" })}
       </div>
       <p className="text-[5px] md:text-[8px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
       <p className="text-[11px] md:text-lg font-black text-[#0F172A] uppercase leading-none">{val}</p>
    </div>
  )
}

function Instruction({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-1.5 group">
       <div className="h-3 w-3 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary transition-colors">
          <CheckCircle2 className="h-2 w-2 text-slate-400 group-hover:text-white" />
       </div>
       <p className="text-slate-600 font-bold uppercase text-[6px] md:text-[8px] leading-snug tracking-tighter">{text}</p>
    </div>
  )
}

function LangBtn({ label, val, active, onClick }: any) {
  return (
    <button 
      onClick={() => onClick(val)}
      className={cn(
        "px-2 py-1 rounded border font-black uppercase text-[6px] md:text-[7px] tracking-widest transition-all shadow-sm active:scale-95",
        active ? "border-primary bg-blue-50 text-primary shadow-md" : "border-slate-100 text-slate-400 hover:border-slate-300"
      )}
    >
       {label}
    </button>
  )
}
