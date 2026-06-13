'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * @fileOverview Global Error Governance segment v2.0.
 * Ensures the application remains stable and recoverable during runtime failures.
 */
export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to institutional monitoring node
    console.error("[CRACKLIX_EXCEPTION]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-5xl border border-slate-100 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="h-20 w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
          <ShieldAlert className="h-10 w-10" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-headline font-black text-[#0F172A] uppercase tracking-tight">System Anomaly</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            The preparation node encountered an unexpected error. Your progress is safe. Please re-sync to continue.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={() => reset()}
            className="h-14 bg-primary hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl border-none"
          >
            <RefreshCw className="h-4 w-4" /> Re-sync Registry
          </Button>
          <Button asChild variant="ghost" className="h-12 text-slate-400 font-bold uppercase text-[10px] tracking-widest gap-2">
            <Link href="/"><Home className="h-4 w-4" /> Exit to Home</Link>
          </Button>
        </div>

        <div className="pt-6 border-t border-slate-50">
           <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.4em]">Audit Node: {error.digest || 'RUNTIME_EXC'}</p>
        </div>
      </div>
    </div>
  );
}
