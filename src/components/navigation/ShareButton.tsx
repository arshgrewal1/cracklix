'use client';

import React, { useMemo, useState } from "react";
import { Share2, Loader2, MessageSquare, Send, Copy, Globe, X, Award, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface ShareButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'dark';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'h-14';
  showLabel?: boolean;
}

/**
 * @fileOverview Hardened Social Share Hub v11.0.
 * UPDATED: Implemented high-fidelity responsive design for modal nodes.
 */
export default function ShareButton({ 
  className = "", 
  variant = 'default', 
  size = 'default',
  showLabel = true 
}: ShareButtonProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsShareDialogOpen] = useState(false);
  
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings, loading } = useDoc<any>(settingsRef);

  const shareTitle = settings?.shareTitle || "Cracklix | Punjab's Smart Mock Test Platform";
  const shareDesc = settings?.shareDescription || "Join thousands of aspirants preparing for Punjab Government Exams.";
  const shareUrl = settings?.shareUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://cracklix.com');

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
      if ((err as Error).name !== 'AbortError') {
        setIsShareDialogOpen(true);
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Registry node link saved to clipboard.",
      });
      setIsShareDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Copy Failed" });
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareTitle + "\n\n" + shareUrl)}`;
    window.open(url, '_blank');
    setIsShareDialogOpen(false);
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank');
    setIsShareDialogOpen(false);
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
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className={cn("h-4 w-4", isDark ? "text-primary" : "")} />
        )}
        {showLabel && <span>Share Cracklix</span>}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent 
          className="w-[95vw] max-w-[560px] rounded-3xl bg-white border-none shadow-5xl p-0 overflow-hidden text-left z-[2100] mx-auto"
        >
          <div className="h-1.5 w-full bg-primary" />
          <DialogHeader className="p-6 sm:p-10 pb-2 text-center">
             <div className="h-12 w-12 sm:h-16 sm:w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary shadow-xl mb-4 sm:mb-6">
                <Share2 className="h-6 w-6 sm:h-8 sm:w-8" />
             </div>
             <DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F172A] uppercase leading-tight text-center">
                Direct Share Hub
             </DialogTitle>
             <DialogDescription className="text-slate-400 text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest text-center mt-2">
                Invite fellow aspirants to the registry
             </DialogDescription>
          </DialogHeader>

          <div className="px-6 sm:px-10 pb-8 space-y-4">
             <button 
               onClick={shareToWhatsApp}
               className="w-full h-14 sm:h-16 md:h-20 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center px-5 gap-5 shadow-lg transition-all active:scale-95 group border-none"
             >
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                </div>
                <span className="font-black uppercase text-sm sm:text-base md:text-lg tracking-widest">Direct WhatsApp</span>
             </button>

             <button 
               onClick={shareToTelegram}
               className="w-full h-14 sm:h-16 md:h-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center px-5 gap-5 shadow-lg transition-all active:scale-95 group border-none"
             >
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Send className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                </div>
                <span className="font-black uppercase text-sm sm:text-base md:text-lg tracking-widest">Direct Telegram</span>
             </button>

             <div className="h-px w-full bg-slate-50 my-2" />

             <button 
               onClick={copyToClipboard}
               className="w-full min-h-[56px] sm:min-h-[64px] md:min-h-[72px] bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-full flex items-center px-5 gap-5 border border-slate-100 transition-all active:scale-95 group"
             >
                <Copy className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="font-black text-[11px] sm:text-sm md:text-base uppercase tracking-widest truncate flex-1 text-left">
                   {shareUrl}
                </span>
             </button>
          </div>

          <DialogFooter className="bg-slate-50 p-4 flex justify-center border-t border-slate-100">
             <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                <p className="text-[8px] font-black uppercase tracking-widest">Institutional Verification Complete</p>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
