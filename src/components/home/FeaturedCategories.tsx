
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Landmark, 
  GraduationCap, 
  Zap, 
  Wallet, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview Institutional Category Entry Nodes v4.1.
 * UPDATED: Locked permanent logo for Punjab Teaching.
 */

const CATEGORY_META = [
  {
    id: "punjab-govt",
    title: "Punjab Government",
    desc: "Police, PSSSB, PPSC & state board exams.",
    icon: <img src="https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png" className="h-full w-full object-contain" />,
    color: "text-primary",
    bgColor: "bg-orange-50"
  },
  {
    id: "punjab-teaching",
    title: "Punjab Teaching",
    desc: "PSTET, CTET, Master Cadre & ETT exams.",
    icon: <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSImf0nQvnFzmw2RVmPBwlZRspEC_fe2x13SGwzIbYBdw&s=10" className="h-full w-full object-contain" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    id: "punjab-technical",
    title: "Punjab Technical",
    desc: "PSPCL, PSTCL, ALM & Technical Assistant posts.",
    icon: <Zap className="h-8 w-8" />,
    color: "text-amber-500",
    bgColor: "bg-amber-50"
  },
  {
    id: "banking",
    title: "Banking Exams",
    desc: "IBPS, PO, SO, SBI & RBI special tests.",
    icon: <Wallet className="h-8 w-8" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  {
    id: "central-govt",
    title: "Central Govt",
    desc: "SSC, Railways, Army & National exams.",
    icon: <Globe className="h-8 w-8" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  }
];

export default function FeaturedCategories() {
  const db = useFirestore();
  const { data: exams, loading } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));

  const categoriesWithCounts = useMemo(() => {
    return CATEGORY_META.map(cat => {
      const count = (exams || []).filter(e => e.categoryId === cat.id).length;
      return {
        ...cat,
        countLabel: `${count} EXAMS LIVE`
      };
    });
  }, [exams]);

  return (
    <section className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
        <div className="space-y-2">
           <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">EXAM CATEGORIES</span>
           </div>
           <h2 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none">
              STUDY BY <span className="text-primary">CATEGORY</span>
           </h2>
           <p className="text-slate-500 text-sm md:text-lg font-medium">Browse tests for your target exams.</p>
        </div>
        <Button asChild variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest gap-2">
           <Link href="/exams">View All Categories <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {categoriesWithCounts.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
             <Link href={`/exams/category/${cat.id}`}>
                <Card className="border-none shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden h-full flex flex-col border border-slate-100 p-8 text-left relative">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">{cat.id !== 'punjab-govt' && cat.id !== 'punjab-teaching' && cat.icon}</div>
                   
                   <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110", cat.bgColor, cat.color)}>
                      {cat.icon}
                   </div>
                   
                   <div className="space-y-3 flex-1">
                      <h3 className="text-xl font-black text-[#0F172A] uppercase leading-tight group-hover:text-primary transition-colors">{cat.title}</h3>
                      <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-2">{cat.desc}</p>
                   </div>

                   <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                      {loading ? (
                        <Skeleton className="h-3 w-20 bg-slate-100" />
                      ) : (
                        <span className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest">{cat.countLabel}</span>
                      )}
                      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                         <ChevronRight className="h-4 w-4" />
                      </div>
                   </div>
                </Card>
             </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
