"use client"

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Institutional Category Discovery v116.0 (High Density).
 * UI UPGRADE: Card structure matched to premium PWA requirements.
 */

const STRICT_WHITELIST = [
  "punjab-government-exams",
  "punjab-teaching-exams",
  "punjab-technical-exams",
  "banking-exams",
  "punjab-health-exams",
  "judiciary-exams",
  "high-court-exams"
];

export default function FeaturedCategories() {
  const db = useFirestore();
  
  const { data: rawCategories, loading: catLoading } = useCollection<any>(useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]));
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]));
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));
  const { data: pyqs } = useCollection<any>(useMemo(() => (db ? collection(db, "pyqs") : null), [db]));

  const categories = useMemo(() => {
     if (!rawCategories) return [];
     return rawCategories.filter(c => STRICT_WHITELIST.includes(c.id));
  }, [rawCategories]);

  return (
    <section className="py-6 md:py-16 bg-white border-t border-slate-50">
      <div className="container mx-auto px-4 max-w-7xl space-y-4 md:space-y-12 text-left">
        <div className="space-y-0.5 px-1">
           <h2 className="text-xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">Choose Category</h2>
           <p className="text-slate-500 font-medium text-[10px] md:text-lg">Select a recruitment vertical to begin.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {catLoading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 md:h-96 w-full rounded-xl md:rounded-[2.5rem] bg-slate-50" />)
          ) : categories.map((cat, idx) => {
            const catExams = exams?.filter(e => e.categoryId === cat.id) || [];
            const catExamIds = catExams.map(e => e.id);
            const catBoards = boards?.filter(b => b.categoryId === cat.id) || [];
            const boardLabel = catBoards.length > 0 ? catBoards.slice(0, 2).map(b => b.abbreviation).join(", ") : "Official";
            
            const catMocksCount = mocks?.filter(m => 
              catExamIds.includes(m.examId) || 
              (m.examIds && m.examIds.some(id => catExamIds.includes(id)))
            ).length || 0;
            
            const catPyqsCount = pyqs?.filter(p => catExamIds.includes(p.examId)).length || 0;

            return (
              <motion.div 
                key={cat.id} 
                initial={{ opacity: 0, y: 15 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true }} 
                transition={{ delay: idx * 0.05 }}
              >
                 <Link href={`/exams/category/${cat.id}`}>
                    <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl md:rounded-[2.5rem] bg-white group overflow-hidden flex flex-col p-3 md:p-8 h-full min-h-[220px] relative">
                       
                       <div className="flex flex-col gap-2 mb-3 md:mb-6">
                          <AuthorityLogo category={cat} size="sm" className="w-10 h-10 md:w-16 md:h-16 bg-slate-50 rounded-lg md:rounded-2xl shadow-inner group-hover:scale-105 transition-transform" />
                          <Badge variant="outline" className="w-fit bg-blue-50/50 border-blue-100 text-blue-600 text-[7px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                             {boardLabel}
                          </Badge>
                       </div>
                       
                       <div className="space-y-1 md:space-y-4 flex-1">
                          <h3 className="text-[12px] md:text-xl font-bold text-[#0F172A] group-hover:text-primary transition-colors leading-tight line-clamp-1">{cat.title}</h3>
                          <p className="hidden md:block text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {cat.description || "Official government recruitment hub."}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 pt-1 md:pt-2">
                             <StatBadge label={`${catExams.length} Exams`} icon="📚" />
                             <StatBadge label={`${catMocksCount} Mocks`} icon="📝" />
                             <StatBadge label={`${catPyqsCount} Papers`} icon="📄" />
                          </div>
                       </div>

                       <div className="mt-4 md:mt-8 pt-3 border-t border-slate-50">
                          <Button variant="ghost" className="w-full h-8 md:h-12 rounded-lg md:rounded-xl bg-[#0F172A] text-white group-hover:bg-primary transition-all font-black text-[8px] md:text-[10px] tracking-widest uppercase border-none shadow-md gap-2 active:scale-95">
                             Open Hub <ArrowRight className="h-2.5 w-2.5 md:h-4 md:w-4" />
                          </Button>
                       </div>
                    </Card>
                 </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}

function StatBadge({ label, icon }: { label: string, icon: string }) {
   return (
      <div className="flex items-center gap-1 text-[8px] md:text-[11px] font-bold text-slate-500 whitespace-nowrap">
         <span className="text-[10px] md:text-sm">{icon}</span>
         <span className="tracking-tight">{label}</span>
      </div>
   )
}
