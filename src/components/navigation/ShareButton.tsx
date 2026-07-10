'use client';

import React, { useMemo, useState } from "react";
import { Share2, Loader2, MessageSquare, Send, Copy, Globe, X, Award, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * @fileOverview Hardened Social Share Hub v13.2.
 * UPDATED: Share link points directly to install hub for direct distribution.
 */
export default function ShareButton({ 
  className = "", 
  variant = 'default', 
  size = 'default',
  showLabel = true 
}: any) {
  const db = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsShareDialogOpen] = useState(false);
  
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings, loading } = useDoc<any>(settingsRef);

  const shareTitle = "Cracklix Official App";
  const shareDesc = "Install the official Cracklix app for Punjab Government Exam preparation. Verified patterns, Ranks and Rationale.";
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/install` : 'https://cracklix.com/install';

  const handleShare = async () => {
    const shareData = {
      title: shareTitle,
      text: shareDesc,
      url: shareUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        setIsShareDialogOpen(true);
      }
    } catch (err) {
      setIsShareDialogOpen(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link Copied!", description: "Direct install link saved to clipboard." });
      setIsShareDialogOpen(false);
    } catch (e) {
      console.warn('[CLIPBOARD_ERROR]:', e);
      toast({ variant: "destructive", title: "Copy Failed", description: "Please copy the URL manually." });
    }
  };

  const isDark = variant === 'dark';

  return (
    <>
      <Button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleShare();
        }}
        disabled={loading}
        variant={isDark ? 'ghost' : (variant as any)}
        className={cn(
          "rounded-xl font-black uppercase text-[10px] tracking-widest gap-3 transition-all active:scale-95",
          isDark ? "bg-[#0F172A] hover:bg-black text-white shadow-xl" : "",
          className
        )}
        size={size as any}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className={cn("h-4 w-4", isDark ? "text-primary" : "")} />}
        {showLabel && <span>Share Hub</span>}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="w-[92vw] max-w-[440px] rounded-[2rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left z-[2100]">
          <div className="h-1.5 w-full bg-primary" />
          <DialogHeader className="p-6 md:p-10 pb-2 text-center">
             <div className="h-14 w-14 md:h-16 md:w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary shadow-xl mb-4 md:mb-6">
                <Share2 className="h-6 w-6 md:h-8 md:w-8" />
             </div>
             <DialogTitle className="text-2xl md:text-3xl font-black text-[#0F172A] uppercase leading-tight">Share Direct Install</DialogTitle>
             <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Give the Gift of Elite Preparation</DialogDescription>
          </DialogHeader>

          <div className="px-6 md:px-8 pb-8 space-y-3 md:space-y-4">
             <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + "\n" + shareDesc + "\n" + shareUrl)}`, '_blank')} className="w-full h-14 md:h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center px-5 gap-4 md:gap-6 shadow-lg transition-all active:scale-95 border-none">
                <MessageSquare className="h-5 w-5 md:h-6 md:w-6" /> <span className="font-black uppercase text-xs md:text-sm tracking-widest">WhatsApp</span>
             </button>
             <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank')} className="w-full h-14 md:h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center px-5 gap-4 md:gap-6 shadow-lg transition-all active:scale-95 border-none">
                <Send className="h-5 w-5 md:h-6 md:w-6" /> <span className="font-black uppercase text-xs md:text-sm tracking-widest">Telegram</span>
             </button>
             <button onClick={copyToClipboard} className="w-full h-14 md:h-16 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-full flex items-center px-5 gap-4 md:gap-6 border border-slate-100 transition-all active:scale-95">
                <Copy className="h-5 w-5 md:h-6 md:w-6 text-slate-400" /> <span className="font-black text-[10px] md:text-xs uppercase tracking-widest truncate flex-1">{shareUrl}</span>
             </button>
          </div>
          <DialogFooter className="bg-slate-50 p-4 border-t border-slate-100 text-center"><p className="text-[8px] font-black uppercase text-slate-300 w-full tracking-[0.1em]">Institutional Registry Verified</p></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
