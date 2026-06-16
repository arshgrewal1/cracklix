
"use client"

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Landmark, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview Elite Exam Categories Hub v12.0.
 * UPDATED: Optimized icons with next/image for better performance and data usage.
 */

const CATEGORY_META = [
  {
    id: "punjab-govt",
    title: "Punjab General Exams",
    desc: "Police • PSSSB • PPSC • Revenue",
    icon: "https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg",
    color: "text-primary",
    bgColor: "bg-orange-50"
  },
  {
    id: "punjab-teaching",
    title: "Punjab Teaching Exams",
    desc: "PSTET • CTET • Master Cadre • ETT",
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbNnoge6pNWx1HZYrUJKM58qWk1dDw85xvKPBoG-O4ew&s=10",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    id: "punjab-technical",
    title: "Punjab Technical Exams",
    desc: "PSPCL • PSTCL • ALM • Technical Asst.",
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo0ZK9JI5KMfg9RoNdIwcsNlpx5IcPBWuKZw&s",
    color: "text-amber-500",
    bgColor: "bg-amber-50"
  },
  {
    id: "banking",
    title: "Punjab Banking Exams",
    desc: "Cooperative • Apex • PADB • Banks",
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7McWqZqOgKy-BakccvR02WQdEQFrwuvmHBG5rYJzuEg&s=10",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  {
    id: "central-govt",
    title: "Central Govt Exams",
    desc: "SSC • Railways • Army • National",
    icon: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Emblem_of_India.svg",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  }
];

export default function FeaturedCategories() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const examsQuery = useMemo(() => (db ? collection(db, "exams") : null), [db]);
  const { data: exams, loading } = useCollection<any>(examsQuery);

  const categoriesWithCounts = useMemo(() => {
    return CATEGORY_META.map(cat => {
      const count = (mounted && exams) ? exams.filter((e: any) => e.categoryId === cat.id).length : 0;
      return {
        ...cat,
        countLabel: `${count} Exams Live`
      };
    });
  }, [exams, mounted]);

  if (!mounted) return null;

  return (
    <section className="py-10 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8 md:space-y-12 text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
          <div className="space-y-1.5 md:space-y-2">
             <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">EXAM CATEGORIES</span>
             </div>
             <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[0.95] break-words">
                Choose Your <span className="text-primary">Category</span>
             </h2>
             <p className="text-slate-500 text-xs xs:text-sm md:text-lg font-medium">Select your field to explore preparation hubs.</p>
          </div>
          <Button asChild variant="ghost" className="text-primary font-black uppercase text-[9px] md:text-[11px] tracking-widest gap-2 hover:bg-slate-50 px-0 md:px-4">
             <Link href="/exams">View All <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {categoriesWithCounts.map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
               <Link href={`/exams/category/${cat.id}`}>
                  <Card className="border-none shadow-lg hover:shadow-3xl transition-all duration-500 rounded-[1.5rem] md:rounded-[2rem] bg-white group overflow-hidden h-[240px] xs:h-[260px] md:h-[320px] flex flex-col border border-slate-100 p-6 md:p-8 relative">
                     <div className={cn("h-10 w-10 xs:h-12 xs:w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-5 md:mb-8 shadow-inner transition-transform group-hover:scale-110 relative", cat.bgColor, cat.color)}>
                        <div className="h-full w-full flex items-center justify-center overflow-hidden rounded-lg md:rounded-xl relative">
                          <Image 
                            src={cat.icon} 
                            alt={cat.title}
                            fill
                            className="object-contain p-2 md:p-2.5"
                          />
                        </div>
                     </div>
                     
                     <div className="space-y-1 md:space-y-2 flex-1 min-w-0">
                        <h3 className="text-base xs:text-lg md:text-xl font-black text-[#0F172A] uppercase leading-[1.1] group-hover:text-primary transition-colors line-clamp-2">{cat.title}</h3>
                        <p className="text-[9px] xs:text-[10px] md:text-sm font-semibold text-slate-400 leading-tight uppercase tracking-tight line-clamp-2">{cat.desc}</p>
                     </div>

                     <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                        {loading ? (
                          <Skeleton className="h-2.5 w-16 bg-slate-50 rounded" />
                        ) : (
                          <span className="text-[8px] xs:text-[9px] md:text-[10px] font-black text-[#0F172A] uppercase tracking-widest">{cat.countLabel}</span>
                        )}
                        <div className="h-6 w-6 xs:h-7 xs:w-7 md:h-8 md:w-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-slate-300">
                           <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </div>
                     </div>
                  </Card>
               </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
