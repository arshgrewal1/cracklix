
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Zap, AlertCircle } from "lucide-react";

/**
 * @fileOverview Institutional 'Coming Soon' / Not Found Hub v2.0.
 * Replaced generic 404 with a preparation-focused 'Coming Soon' notice.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-body">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 md:p-16 shadow-5xl border border-slate-100 space-y-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="relative mx-auto w-24 h-24">
           <div className="h-24 w-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-primary shadow-inner border border-blue-100">
              <Zap className="h-10 w-10 animate-pulse" />
           </div>
           <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-white shadow-2xl border-4 border-white">
              <AlertCircle className="h-5 w-5 text-primary" />
           </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Coming Soon</h1>
          <p className="text-primary font-black text-[10px] md:text-xs uppercase tracking-[0.3em]">Mock available nahi hai</p>
          <p className="text-slate-500 font-medium leading-relaxed pt-4">
            This preparation node is currently being updated with the latest official patterns. Please check back later.
          </p>
        </div>

        <div className="pt-4">
           <Button asChild className="w-full bg-[#0F172A] hover:bg-black text-white h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-3xl border-none transition-all active:scale-95">
              <Link href="/"><Home className="h-4 w-4" /> Return to Hub</Link>
           </Button>
        </div>
        
        <div className="pt-6 border-t border-slate-50">
           <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.4em]">Institutional Registry v1.05</p>
        </div>
      </div>
    </div>
  );
}
