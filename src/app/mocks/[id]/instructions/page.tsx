'use client';

import { useEffect, useState, useMemo } from "react";
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
 * @fileOverview Hardened Instructions Hub v7.0 (Ultra-Compact).
 * UPDATED: Drastically reduced typography and padding for mobile visibility.
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
       <Zap className="h-10 w-10 text-[#F97316] animate-pulse" />
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
          <h2 className="text-3xl font-headline font-black text-[#0F172A] uppercase">Instructions Unavailable</h2>
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
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-5xl text-left">
        <div className="space-y-6 md:space-y-10">
           <div className="flex flex-col md:row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#F97316]" />
                    <Badge className="bg-orange-50 text-[#F97316] border-none px-3 py-1 rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-sm">Official Evaluation Engine</Badge>
                 </div>
                 <h1 className="text-xl md:text-5xl font-headline font-black text-[#0F172A] uppercase leading-[1] tracking-tighter">{mock.title}</h1>
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatPlate icon={<Clock />} label="DURATION" val={`${mock.duration} Mins`} />
              <StatPlate icon={<BookOpen />} label="QUESTIONS" val={mock.totalQuestions} />
              <StatPlate icon={<Zap />} label="MAX MARKS" val={mock.totalQuestions * (mock.positiveMarks || 1)} />
              <StatPlate icon={<ShieldCheck />} label="PENALTY" val={`-${mock.negativeMarks || 0.25}`} />
           </div>

           <Card className="border-none shadow-3xl shadow-slate-900/5 rounded-[2rem] md:rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="p-6 md:p-10 bg-slate-50/50 border-b border-slate-100">
                 <CardTitle className="text-xl md:text-2xl font-headline font-black uppercase text-[#0F172A] flex items-center gap-4">
                    <Info className="h-6 w-6 text-[#F97316]" /> Instructions Hub
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    <Instruction text="All questions are compulsory and carry equal weightage." />
                    <Instruction text="Negative marking is applied for incorrect audit choices." />
                    <Instruction text="The test will auto-submit exactly when the timer hits zero." />
                    <Instruction text="Switching tabs or minimizing the browser will log a violation." />
                    <Instruction text="Multi-language mode provides both English and local statements." />
                    <Instruction text="You can re-audit any question using the side palette." />
                 </div>

                 {availableLangs.length > 1 && (
                    <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
                       <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest">Select Default Language</p>
                       </div>
                       <div className="flex flex-wrap justify-center gap-3">
                          {availableLangs.includes('ENGLISH') && <LangBtn label="English" val="ENGLISH" active={prefLang === 'ENGLISH'} onClick={setPrefLang} />}
                          {availableLangs.includes('PUNJABI') && <LangBtn label="ਪੰਜਾਬੀ" val="PUNJABI" active={prefLang === 'PUNJABI'} onClick={setPrefLang} />}
                          {availableLangs.includes('HINDI') && <LangBtn label="हिन्दी" val="HINDI" active={prefLang === 'HINDI'} onClick={setPrefLang} />}
                          {availableLangs.includes('ENGLISH_PUNJABI') && <LangBtn label="English & ਪੰਜਾਬੀ" val="ENGLISH_PUNJABI" active={prefLang === 'ENGLISH_PUNJABI'} onClick={setPrefLang} />}
                          {availableLangs.includes('ENGLISH_HINDI') && <LangBtn label="English & हिन्दी" val="ENGLISH_HINDI" active={prefLang === 'ENGLISH_HINDI'} onClick={setPrefLang} />}
                       </div>
                    </div>
                 )}

                 <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-2xl flex items-start gap-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[9px] md:text-xs font-bold text-emerald-800 leading-relaxed uppercase">
                       I have read and understood all the guidelines. switching tabs will result in disqualification.
                    </p>
                 </div>

                 <Button 
                    onClick={handleStart}
                    className="w-full h-14 md:h-18 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] rounded-xl shadow-4xl group transition-all"
                 >
                    Agree & Continue <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
    <div className="p-4 md:p-6 bg-white rounded-2xl border border-slate-100 shadow-lg text-center space-y-1 group hover:border-[#F97316]/30 transition-all">
       <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto text-[#F97316] mb-2 shadow-inner">{icon}</div>
       <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
       <p className="text-sm md:text-xl font-black text-[#0F172A] uppercase tracking-tighter">{val}</p>
    </div>
  )
}

function Instruction({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 group">
       <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#F97316] transition-colors">
          <CheckCircle2 className="h-3 w-3 text-slate-400 group-hover:text-white" />
       </div>
       <p className="text-slate-600 font-bold uppercase text-[9px] leading-snug tracking-tight">{text}</p>
    </div>
  )
}

function LangBtn({ label, val, active, onClick }: any) {
  return (
    <button 
      onClick={() => onClick(val)}
      className={cn(
        "px-4 py-2 rounded-lg border font-black uppercase text-[8px] tracking-widest transition-all shadow-sm active:scale-95",
        active ? "border-[#F97316] bg-orange-50 text-[#F97316] shadow-lg" : "border-slate-100 text-slate-400 hover:border-slate-300"
      )}
    >
       {label}
    </button>
  )
}
