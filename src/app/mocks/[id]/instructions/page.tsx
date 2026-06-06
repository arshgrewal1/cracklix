
'use client';

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Info, CheckCircle2, Clock, BookOpen, Zap, Globe, Languages, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useExamStore } from "@/store/useExamStore";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Testbook-Style Entrance Hub.
 * Features: Institutional instructions and language preference nodes.
 */
export default function InstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const mockId = params.id as string;
  const { setLanguage } = useExamStore();
  const [prefLang, setPrefLang] = useState<'en' | 'pa' | 'hi' | 'bilingual'>('bilingual');

  const { data: mock, loading } = useDoc<any>(useMemo(() => (db ? doc(db, "mocks", mockId) : null), [db, mockId]));

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-[#F97316] animate-pulse" /></div>;
  if (!mock) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 font-body select-none">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-5xl text-left">
        <div className="space-y-12">
           
           {/* HEADER HUB */}
           <div className="flex flex-col md:row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-[#F97316]" />
                    <Badge className="bg-orange-50 text-[#F97316] border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-sm">Official Evaluation Engine</Badge>
                 </div>
                 <h1 className="text-4xl md:text-7xl font-headline font-black text-[#0F172A] uppercase leading-[0.9] tracking-tighter">{mock.title}</h1>
              </div>
           </div>

           {/* STATS MATRIX */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatPlate icon={<Clock />} label="DURATION" val={`${mock.duration} Mins`} />
              <StatPlate icon={<BookOpen />} label="QUESTIONS" val={mock.totalQuestions} />
              <StatPlate icon={<Zap />} label="MAX MARKS" val={mock.totalQuestions * (mock.positiveMarks || 1)} />
              <StatPlate icon={<ShieldCheck />} label="PENALTY" val={`-${mock.negativeMarks || 0.25}`} />
           </div>

           <Card className="border-none shadow-3xl shadow-slate-900/5 rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="p-10 md:p-16 bg-slate-50/50 border-b border-slate-100">
                 <CardTitle className="text-3xl font-headline font-black uppercase text-[#0F172A] flex items-center gap-6">
                    <Info className="h-8 w-8 text-[#F97316]" /> Instructions Hub
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10 md:p-16 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                    <Instruction text="All questions are compulsory and carry equal weightage." />
                    <Instruction text="Negative marking is applied for incorrect audit choices." />
                    <Instruction text="The test will auto-submit exactly when the timer hits zero." />
                    <Instruction text="Switching tabs or minimizing the browser will log a violation." />
                    <Instruction text="Bilingual mode provides both English and Punjabi statements." />
                    <Instruction text="You can re-audit any question using the side palette." />
                 </div>

                 <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-8">
                    <div className="flex items-center gap-3">
                       <Globe className="h-5 w-5 text-slate-400" />
                       <p className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Select Default Assessment Language</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                       <LangBtn label="English" val="en" active={prefLang === 'en'} onClick={setPrefLang} />
                       <LangBtn label="Punjabi" val="pa" active={prefLang === 'pa'} onClick={setPrefLang} />
                       <LangBtn label="Hindi" val="hi" active={prefLang === 'hi'} onClick={setPrefLang} />
                       <LangBtn label="Bilingual" val="bilingual" active={prefLang === 'bilingual'} onClick={setPrefLang} />
                    </div>
                 </div>

                 <div className="bg-emerald-50 border-2 border-emerald-100 p-8 rounded-[2rem] flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
                    <p className="text-xs md:text-sm font-bold text-emerald-800 leading-relaxed uppercase">
                       I have read and understood all the institutional guidelines. I am aware that using multiple tabs or external aid will result in immediate disqualification.
                    </p>
                 </div>

                 <Button 
                    asChild 
                    className="w-full h-20 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[1.5rem] shadow-4xl group transition-all"
                    onClick={() => setLanguage(prefLang)}
                 >
                    <Link href={`/mocks/${mockId}/attempt`}>
                       Agree & Continue <ChevronRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </Link>
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
    <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-xl text-center space-y-2 group hover:border-[#F97316]/30 transition-all">
       <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-[#F97316] mb-3 shadow-inner">{icon}</div>
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
       <p className="text-2xl font-black text-[#0F172A] uppercase tracking-tighter">{val}</p>
    </div>
  )
}

function Instruction({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-4 group">
       <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#F97316] transition-colors">
          <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
       </div>
       <p className="text-slate-600 font-bold uppercase text-[11px] leading-relaxed tracking-tight">{text}</p>
    </div>
  )
}

function LangBtn({ label, val, active, onClick }: any) {
  return (
    <button 
      onClick={() => onClick(val)}
      className={cn(
        "px-10 py-4 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-sm active:scale-95",
        active ? "border-[#F97316] bg-orange-50 text-[#F97316] shadow-lg shadow-orange-500/10" : "border-slate-100 text-slate-400 hover:border-slate-300"
      )}
    >
       {label}
    </button>
  )
}
