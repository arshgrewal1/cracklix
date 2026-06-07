
"use client"

import React, { useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import PopularExams from "@/components/home/PopularExams";
import LatestMocks from "@/components/home/LatestMocks";
import Features from "@/components/home/Features";
import AppPreview from "@/components/home/AppPreview";
import MeetFounder from "@/components/home/MeetFounder";
import Footer from "@/components/layout/Footer";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { BookOpen, Zap, Users, Target, ShieldCheck, ArrowRight, Code } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { motion } from "framer-motion";

/**
 * @fileOverview Institutional Landing Hub v28.0.
 * Updated: Founder identity Arsh Grewal with high-fidelity MeetFounder component.
 */

export default function HomePage() {
  const db = useFirestore();

  const usersQuery = useMemo(() => (db ? collection(db, "users") : null), [db]);
  const questionsQuery = useMemo(() => (db ? collection(db, "questions") : null), [db]);
  const mocksQuery = useMemo(() => (db ? collection(db, "mocks") : null), [db]);

  const { data: users } = useCollection<any>(usersQuery);
  const { data: questions } = useCollection<any>(questionsQuery);
  const { data: mocks } = useCollection<any>(mocksQuery);

  const formattedQCount = useMemo(() => {
    const count = questions?.length || 0;
    return count > 999 ? `${(count / 1000).toFixed(1)}k+` : count.toString();
  }, [questions]);

  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden">
      <Navbar />
      <Hero />

      <section className="bg-white py-4 md:py-12 border-b border-slate-50">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-10">
               <TrustCard icon={<BookOpen className="text-primary h-4 w-4 md:h-6 md:w-6" />} label="MCQ Bank" val={formattedQCount} />
               <TrustCard icon={<Zap className="text-blue-500 h-4 w-4 md:h-6 md:w-6" />} label="Mocks Live" val={mocks?.length || "0"} />
               <TrustCard icon={<Users className="text-emerald-500 h-4 w-4 md:h-6 md:w-6" />} label="Aspirants" val={users?.length ? users.length.toLocaleString() : "0"} />
               <TrustCard icon={<Target className="text-amber-500 h-4 w-4 md:h-6 md:w-6" />} label="Avg Accuracy" val="94%" />
            </div>
         </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl space-y-12 md:space-y-24">
         <PopularExams />
         <LatestMocks />
      </div>

      <AppPreview />
      <Features />
      
      <MeetFounder />

      <Footer />
    </main>
  );
}

function TrustCard({ icon, label, val }: any) {
   return (
      <div className="flex items-center gap-3 p-3 md:p-6 rounded-2xl bg-slate-50/50 border border-slate-50 transition-all hover:bg-white hover:shadow-xl">
         <div className="h-8 w-8 md:h-14 md:w-14 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">{icon}</div>
         <div className="text-left">
            <p className="text-sm md:text-3xl font-headline font-black text-[#0F172A] leading-none tracking-tight">{val}</p>
            <p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 truncate">{label}</p>
         </div>
      </div>
   )
}
