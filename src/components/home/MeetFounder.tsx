'use client';

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * @fileOverview Meet Founder section v4.0.
 * UPDATED: Optimized with local founder asset and priority Next.js Image component.
 */

export default function MeetFounder() {
  return (
    <section className="py-8 md:py-24 bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50/50 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-4xl border border-slate-100 flex flex-col md:flex-row items-center p-6 md:p-14 gap-6 md:gap-14 group hover:border-primary/20 transition-all duration-700 max-w-4xl mx-auto">

          <div className="relative shrink-0">
            <div className="relative h-20 w-20 md:h-44 md:w-44 rounded-full overflow-hidden border-[4px] border-white shadow-2xl bg-[#0B1528] ring-1 ring-slate-200">
              <Image
                src="/founder.png"
                alt="Arsh Grewal"
                width={600}
                height={600}
                className="object-cover grayscale group-hover:grayscale-0 transition-all scale-105 group-hover:scale-100 duration-1000"
                priority
              />
            </div>

            <div className="absolute -bottom-1 -right-1 h-7 w-7 md:h-12 md:w-12 bg-emerald-500 rounded-lg border-[3px] border-white flex items-center justify-center text-white shadow-xl">
              <ShieldCheck className="h-3 w-3 md:h-6 md:w-6" />
            </div>
          </div>

          <div className="flex-1 space-y-3 md:space-y-6 text-center md:text-left">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge className="bg-[#0F172A] text-white border-none px-2.5 py-0.5 rounded-md font-bold text-[8px] md:text-[9px] uppercase tracking-tight">
                  Founder
                </Badge>
              </div>

              <h3 className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tight leading-none">
                Meet the Founder
              </h3>
            </div>

            <p className="text-[11px] md:text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto md:mx-0">
              Arsh Grewal is building Punjab's smartest platform to help every student prepare for their dream government job.
            </p>

            <div className="pt-2 md:pt-4">
              <Button
                asChild
                className="h-11 md:h-14 px-8 bg-[#0F172A] hover:bg-black text-white font-bold text-[10px] md:text-xs tracking-tight rounded-xl shadow-xl transition-all active:scale-95 border-none"
              >
                <Link href="/about" className="flex items-center gap-2">
                  Read Story <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}