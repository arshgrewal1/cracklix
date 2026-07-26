'use client';

import React from 'react';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { Clock, Zap } from 'lucide-react';
import { useUser } from '@/firebase';

/**
 * @fileOverview High-Fidelity Study Timer v5.0.
 * UPDATED: Optimized for Title Case and persistent counting.
 */
export default function LiveStudyTimer() {
    const { user } = useUser();
    const { displayTime } = useStudyTimer();

    if (!user) return null;

    return (
        <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[2rem] shadow-xl text-left relative overflow-hidden group h-full flex flex-col justify-center transition-all hover:shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                <Clock className="h-24 w-24" />
            </div>
            
            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                            <Zap className="h-5 w-5 fill-current animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Today's study</p>
                            <p className="text-xs font-bold text-emerald-600">Active preparation</p>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tighter tabular-nums antialiased leading-none">
                        {displayTime}
                    </h2>
                </div>
            </div>
        </div>
    );
}
