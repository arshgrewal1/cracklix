'use client';

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * @fileOverview Meet Founder section v4.2 - Normalized Case.
 */

export default function MeetFounder() {
  return (
    <section className="py-12 md:py-24 bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50/50 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-4xl border border-slate-100 flex flex-col md:flex-row items-center p-8 md:p-20 gap-8 md:gap-20 group hover:border-primary/20 transition-all duration-700 w-full relative">

          <div className="relative shrink-0">
            <div className="relative h-32 w-32 md:h-64 md:w-64 rounded-full overflow-hidden border-[6px] md:border-[8px] border-white shadow-2xl bg-[#0B1528] ring-1 ring-slate-200">
              <Image
                src="/founder.png"
                alt="Arsh Grewal"
                width={600}
                height={600}
                className="object-cover grayscale group-hover:grayscale-0 transition-all scale-105 group-hover:scale-100 duration-1000"
                priority
              />
            </div>

            <div className="absolute -bottom-1 -right-1 h-8 w-8 md:h-16 md:w-16 bg-emerald-500 rounded-2xl border-[3px] md:border-[6px] border-white flex items-center justify-center text-white shadow-xl">
              <ShieldCheck className="h-4 w-4 md:h-8 md:w-8" />
            </div>
          </div>

          <div className="flex-1 space-y-4 md:space-y-8 text-center md:text-left">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge className="bg-[#0F172A] text-white border-none px-4 py-1.5 rounded-full font-bold text-[13px] tracking-tight">
                  Founder
                </Badge>
              </div>

              <h3 className="text-2xl md:text-6xl font-black text-[#0F172A] tracking-tight leading-none">
                Meet the Founder
              </h3>
            </div>

            <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto md:mx-0">
              Arsh Grewal is building Punjab&apos;s smartest platform to help every student prepare for their dream government job. Driven by high-fidelity preparation standards.
            </p>

            <div className="pt-2 md:pt-6">
              <Button
                asChild
                className="h-14 md:h-16 px-12 bg-[#0F172A] hover:bg-black text-white font-bold text-base rounded-full shadow-xl transition-all active:scale-95 border-none"
              >
                <Link href="/about" className="flex items-center gap-3">
                  Read My Story <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}