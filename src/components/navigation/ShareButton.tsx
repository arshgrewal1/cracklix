
'use client';

import React, { useMemo, useState, useRef } from "react";
import { 
  Share2, 
  Loader2, 
  MessageSquare, 
  Send, 
  Copy, 
  Globe, 
  X, 
  Award, 
  Zap, 
  ShieldCheck,
  Download,
  Smartphone,
  ChevronRight
} from "lucide-react";
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
import { toPng } from 'html-to-image';
import AppShareCard from "./AppShareCard";
import { motion, AnimatePresence } from "framer-motion";

/**
 * @fileOverview Premium Social Share Hub v2.0.
 * Generates a high-fidelity Share Card PNG for social node distribution.
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
  const [isGenerating, setIsGenerating] = useState(false);
  
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const shareTitle = "Crack Punjab Government Exams with Cracklix! 🚀";
  const shareDesc = "Practice 500+ mock tests, daily quizzes, and performance analytics. Join 10,000+ successful aspirants.";
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/install` : 'https://cracklix.vercel.app/install';

  const generateCardImage = async () => {
    const node = document.getElementById('cracklix-app-share-card');
    if (!node) return null;
    try {
       return await toPng(node, {
          quality: 1,
          pixelRatio: 2,
          cacheBust: true,
          style: { visibility: 'visible', position: 'static' }
       });
    } catch (err) {
       console.error("[SHARE_GEN_ERROR]:", err);
       return null;
    }
  };

  const handleShare = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const dataUrl = await generateCardImage();
      
      const shareDataText = `${shareTitle}\n\n📚 Unlimited Mock Tests\n📝 Previous Year Papers\n⚡ Daily Quiz\n📈 Performance Analytics\n\n📲 Install Official App:\n${shareUrl}`;

      if (!dataUrl) {
         throw new Error("Card rendering failure.");
      }

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `cracklix-invite.png`, { type: 'image/png' });

      // MOBILE PROTOCOL: Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Cracklix Invite',
          text: shareDataText
        });
      } else {
        // DESKTOP FALLBACK: Show Modal
        setIsShareDialogOpen(true);
      }
    } catch (err) {
      // Emergency Fallback
      setIsShareDialogOpen(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link Copied!", description: "Invitation link saved to registry." });
    } catch (e) {
      toast({ variant: "destructive", title: "Copy Failed" });
    }
  };

  const handleDownload = async () => {
     setIsGenerating(true);
     const dataUrl = await generateCardImage();
     if (dataUrl) {
        const link = document.createElement('a');
        link.download = `cracklix-share-card.png`;
        link.href = dataUrl;
        link.click();
        toast({ title: "Share Card Saved" });
     }
     setIsGenerating(false);
  };

  return (
    <>
      {/* HIDDEN EXPORT NODE */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none opacity-0">
         <AppShareCard />
      </div>

      <div className="w-full space-y-4">
        <Button
          onClick={handleShare}
          disabled={isGenerating}
          className={cn(
            "w-full h-[60px] rounded-[24px] bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white font-black uppercase text-[11px] md:text-xs tracking-widest gap-4 shadow-xl hover:shadow-2xl transition-all active:scale-95 group relative overflow-hidden border-none",
            className
          )}
        >
          {isGenerating ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Share2 className="h-6 w-6 transition-transform group-hover:rotate-12" />
          )}
          <div className="flex flex-col items-start">
             <span>Share Cracklix</span>
             {showLabel && <span className="text-[7px] opacity-60 font-bold -mt-1">Unlock Punjab&apos;s Smartest Hub</span>}
          </div>
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight text-center px-4">Invite your friends to crack Punjab Government Exams.</p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="w-[94vw] max-w-[480px] rounded-[2.5rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left z-[2100]">
          <div className="h-2 w-full bg-[#2563EB]" />
          <DialogHeader className="p-8 md:p-12 pb-4 text-center">
             <div className="h-16 w-16 md:h-20 md:w-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto text-[#2563EB] shadow-xl mb-6 border border-blue-100">
                <Share2 className="h-8 w-8 md:h-10 md:w-10" />
             </div>
             <DialogTitle className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Share Registry</DialogTitle>
             <DialogDescription className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.3em] mt-3">Elite invitation hub</DialogDescription>
          </DialogHeader>

          <div className="px-8 md:px-12 pb-12 space-y-4">
             <div className="grid grid-cols-1 gap-3">
                <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + "\n" + shareDesc + "\n" + shareUrl)}`, '_blank')} className="w-full h-14 md:h-16 bg-[#25D366] hover:bg-[#20bd5c] text-white rounded-2xl flex items-center px-6 gap-6 shadow-lg transition-all active:scale-95 border-none group">
                   <MessageSquare className="h-6 w-6" /> <span className="font-black uppercase text-[11px] md:text-sm tracking-widest flex-1 text-left">WhatsApp Hub</span>
                   <ChevronRight className="h-4 w-4 opacity-30 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank')} className="w-full h-14 md:h-16 bg-[#0088CC] hover:bg-[#007ab8] text-white rounded-2xl flex items-center px-6 gap-6 shadow-lg transition-all active:scale-95 border-none group">
                   <Send className="h-6 w-6" /> <span className="font-black uppercase text-[11px] md:text-sm tracking-widest flex-1 text-left">Telegram Feed</span>
                   <ChevronRight className="h-4 w-4 opacity-30 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={handleDownload} className="w-full h-14 md:h-16 bg-slate-900 hover:bg-black text-white rounded-2xl flex items-center px-6 gap-6 shadow-lg transition-all active:scale-95 border-none group">
                   <Download className="h-6 w-6 text-primary" /> <span className="font-black uppercase text-[11px] md:text-sm tracking-widest flex-1 text-left">Save Share Card</span>
                   <ChevronRight className="h-4 w-4 opacity-30 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={copyToClipboard} className="w-full h-14 md:h-16 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-2xl flex items-center px-6 gap-6 border border-slate-100 transition-all active:scale-95 group">
                   <Copy className="h-6 w-6 text-slate-400" /> <span className="font-black text-[11px] md:text-sm uppercase tracking-widest truncate flex-1 text-left">Copy URL Node</span>
                </button>
             </div>
          </div>
          
          <DialogFooter className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-300">
             <ShieldCheck className="h-4 w-4" />
             <p className="text-[9px] font-black uppercase tracking-[0.3em]">Verified Distribution Protocol</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
