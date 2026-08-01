
'use client';

import React, { useState, useMemo } from "react";
import { 
  Share2, 
  Loader2, 
  MessageSquare, 
  Send, 
  Copy, 
  ChevronRight, 
  ShieldCheck,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DistributionSettings } from "@/types";
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * @fileOverview Institutional Share Hub v9.2.
 * FIXED: Added explicit Close button to resolve PWA overlap.
 * FIXED: Reduced modal footprint for better high-density PWA presentation.
 */

const DETAILED_SHARE_MESSAGE = `🚀 Crack Punjab Government Exams with Cracklix!

🎯 One App for Complete Punjab Exam Preparation

✨ Features:
✅ Full-Length Mock Tests
✅ Previous Year Papers (PYQs)
✅ Daily Current Affairs
✅ Detailed Solutions

📲 Install App:
{installUrl}

🌐 Visit Website:
{websiteUrl}

💙 Crack Punjab. Crack Your Dream Job.`;

export default function ShareButton({ 
  className = "", 
  showLabel = true 
}: { 
  className?: string; 
  showLabel?: boolean;
}) {
  const { toast } = useToast();
  const db = useFirestore();
  const [isDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const distRef = useMemo(() => (db ? doc(db, 'settings', 'distribution') : null), [db]);
  const { data: remoteSettings } = useDoc<DistributionSettings>(distRef);

  const activeSettings = useMemo(() => {
    const defaults = {
      primaryWebsiteUrl: "https://cracklix.in",
      installUrl: "https://cracklix.in/install",
      shareTitle: "Cracklix – Punjab Government Exam Prep",
      shareMessage: DETAILED_SHARE_MESSAGE
    };

    if (!remoteSettings) return defaults;

    return {
      primaryWebsiteUrl: remoteSettings.primaryWebsiteUrl || defaults.primaryWebsiteUrl,
      installUrl: remoteSettings.installUrl || defaults.installUrl,
      shareTitle: remoteSettings.shareTitle || defaults.shareTitle,
      shareMessage: remoteSettings.shareMessage || defaults.shareMessage
    };
  }, [remoteSettings]);

  const finalShareMessage = useMemo(() => {
    return activeSettings.shareMessage
      .replace(/{websiteUrl}/g, activeSettings.primaryWebsiteUrl)
      .replace(/{installUrl}/g, activeSettings.installUrl);
  }, [activeSettings]);

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      if (Capacitor.isNativePlatform()) {
        const canShare = await Share.canShare();
        if (canShare.value) {
          await Share.share({
            title: activeSettings.shareTitle,
            text: finalShareMessage,
            url: activeSettings.primaryWebsiteUrl,
            dialogTitle: 'Share Cracklix Hub',
          });
          return;
        }
      }

      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: activeSettings.shareTitle,
          text: finalShareMessage,
          url: activeSettings.primaryWebsiteUrl
        });
      } else {
        setIsShareDialogOpen(true);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setIsShareDialogOpen(true);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: msg });
    } catch (e) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({ title: msg });
    }
  };

  return (
    <>
      <div className="w-full">
        <Button
          onClick={handleShare}
          disabled={isSharing}
          className={cn(
            "w-full h-11 md:h-12 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg transition-all active:scale-95 group relative flex items-center justify-start gap-3 border-none",
            className
          )}
        >
          <div className="shrink-0 flex items-center justify-center h-7 w-7 bg-white/10 rounded-lg">
             {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4 transition-transform group-hover:rotate-12" />}
          </div>
          <div className="flex flex-col items-start text-left min-w-0 flex-1 overflow-hidden">
             <span className="text-xs font-bold leading-none truncate w-full uppercase tracking-tight">Share portal</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 opacity-30 group-hover:translate-x-1 transition-transform ml-auto shrink-0" />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="w-[90vw] max-w-[380px] rounded-[24px] bg-white border-none shadow-5xl p-0 overflow-hidden text-left z-[2100]">
          <div className="h-1.5 w-full bg-blue-600" />
          <DialogHeader className="p-6 pb-2 relative">
             <button 
                onClick={() => setIsShareDialogOpen(false)}
                className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-90 z-20 border-none bg-transparent"
             >
                <X className="h-5 w-5 text-slate-400" />
             </button>
             <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 shadow-inner mb-4 border border-blue-100">
                <Share2 className="h-6 w-6" />
             </div>
             <DialogTitle className="text-lg font-black text-[#0F172A] tracking-tighter uppercase text-center">Share hub</DialogTitle>
             <DialogDescription className="text-slate-400 font-bold text-[8px] mt-1 text-center uppercase tracking-widest">Select an option to share</DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-8 space-y-2">
             <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(finalShareMessage)}`, '_blank')} className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5c] text-white rounded-xl flex items-center px-5 gap-3 shadow-lg transition-all active:scale-95 border-none group cursor-pointer">
                <MessageSquare className="h-5 w-5" /> <span className="font-bold text-xs flex-1 text-left uppercase tracking-tight">WhatsApp</span>
                <ChevronRight className="h-4 w-4 opacity-30 group-hover:translate-x-1 transition-transform" />
             </button>
             <button onClick={() => copyToClipboard(finalShareMessage, "Copied to clipboard")} className="w-full h-12 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-xl flex items-center px-5 gap-3 border border-slate-100 transition-all active:scale-95 group cursor-pointer">
                <Send className="h-5 w-5 text-slate-400" /> <span className="font-bold text-xs flex-1 text-left uppercase tracking-tight">Copy message</span>
             </button>
             <button onClick={() => copyToClipboard(activeSettings.installUrl, "Link copied")} className="w-full h-12 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-xl flex items-center px-5 gap-3 border border-slate-100 transition-all active:scale-95 group cursor-pointer">
                <Copy className="h-5 w-5 text-slate-400" /> <span className="font-bold text-xs flex-1 text-left uppercase tracking-tight">Copy app link</span>
             </button>
          </div>
          
          <DialogFooter className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-300">
             <ShieldCheck className="h-3.5 w-3.5" />
             <p className="text-[8px] font-black uppercase tracking-widest">Institutional Hub verified</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
