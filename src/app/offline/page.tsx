import React from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { WifiOff, Home, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

/**
 * @fileOverview Institutional Offline Fallback Hub.
 * This page is served by the Service Worker when the user is offline.
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-white font-body flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-10">
        <div className="relative">
          <div className="h-32 w-32 md:h-44 md:w-44 bg-slate-50 rounded-[3rem] md:rounded-[4rem] flex items-center justify-center text-slate-300 shadow-inner">
             <WifiOff className="h-12 w-12 md:h-16 md:w-16" />
          </div>
          <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl animate-pulse">
             <RefreshCw className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-3 max-w-sm">
           <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] uppercase tracking-tight">Offline Hub</h1>
           <p className="text-slate-500 font-medium leading-relaxed">
              Connectivity lost. Please check your network to sync with the official Cracklix registry.
           </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
           <Button asChild className="h-14 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-2xl border-none">
              <Link href="/"><Home className="h-4 w-4 text-primary" /> Return Home</Link>
           </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
