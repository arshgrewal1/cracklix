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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * @fileOverview Institutional Share Hub v6.2 [Resilient Fallbacks].
 * FIXED: Added fallback values so the button works even if Admin hasn't saved settings yet.
 */

const DEFAULT_SHARE_MESSAGE = `🚀 Crack Punjab Government Exams with Cracklix!\n\n🎯 Prepare for:\n• PSSSB\n• PPSC\n• Punjab Police\n\n📚 Features\n✅ Unlimited Mock Tests\n✅ Previous Year Papers\n✅ Daily Current Affairs\n\n📲 Install App: {installUrl}\n🌐 Website: {websiteUrl}`;

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
  const { data: remoteSettings, loading } = useDoc<DistributionSettings>(distRef);

  // Determine active settings with fallbacks
  const activeSettings = useMemo(() => {
    const defaults = {
      primaryWebsiteUrl: "https://cracklix.vercel.app",
      installUrl: "https://cracklix.vercel.app/install",
      shareTitle: "Cracklix – Punjab Government Exam Prep",
      shareMessage: DEFAULT_SHARE_MESSAGE
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
            "w-full h-auto min-h-[54px] py-2.5 px-4 rounded-[18px] bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg transition-all active:scale-95 group relative overflow-hidden border-none flex items-center justify-start gap-3",
            className
          )}
        >
          <div className="shrink-0 flex items-center justify-center h-9 w-9 bg-white/10 rounded-xl">
             {isSharing ? (
               <Loader2 className="h-4.5 w-4.5 animate-spin" />
             ) : (
               <Share2 className="h-4.5 w-4.5 transition-transform group-hover:rotate-12" />
             )}
          </div>
          <div className="flex flex-col items-start text-left min-w-0 flex-1 overflow-hidden">
             <span className="text-xs md:text-base leading-none truncate w-full">Share Cracklix</span>
             {showLabel && (
               <span className="text-[9px] opacity-70 font-medium mt-1 leading-none truncate w-full">
                 Invite friends to study
               </span>
             )}
          </div>
          <ChevronRight className="h-3.5 w-3.5 opacity-30 group-hover:translate-x-1 transition-transform ml-auto shrink-0" />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="w-[94vw] max-w-[480px] rounded-[2rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left z-[2100]">
          <div className="h-2 w-full bg-blue-600" />
          <DialogHeader className="p-8 pb-4 text-center">
             <div className="h-14 w-14 bg-blue-50 rounded-[1.5rem] flex items-center justify-center mx-auto text-blue-600 shadow-xl mb-6 border border-blue-100">
                <Share2 className="h-7 w-7" />
             </div>
             <DialogTitle className="text-xl font-black text-[#0F172A] tracking-tighter uppercase">Share Hub</DialogTitle>
             <DialogDescription className="text-slate-400 font-bold text-[9px] mt-2 text-center uppercase tracking-widest">Invite your fellow aspirants</DialogDescription>
          </DialogHeader>

          <div className="px-8 pb-10 space-y-3">
             <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(finalShareMessage)}`, '_blank')} className="w-full h-14 bg-[#25D366] hover:bg-[#20bd5c] text-white rounded-2xl flex items-center px-6 gap-4 shadow-lg transition-all active:scale-95 border-none group">
                <MessageSquare className="h-6 w-6" /> <span className="font-bold text-sm flex-1 text-left uppercase tracking-tight">WhatsApp Hub</span>
                <ChevronRight className="h-4 w-4 opacity-30 group-hover:translate-x-1 transition-transform" />
             </button>
             <button onClick={() => copyToClipboard(finalShareMessage, "Message copied to registry")} className="w-full h-14 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-2xl flex items-center px-6 gap-4 border border-slate-100 transition-all active:scale-95 group">
                <Send className="h-6 w-6 text-slate-400" /> <span className="font-bold text-sm flex-1 text-left uppercase tracking-tight">Copy message</span>
             </button>
             <button onClick={() => copyToClipboard(activeSettings.installUrl, "Link copied to registry")} className="w-full h-14 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-2xl flex items-center px-6 gap-4 border border-slate-100 transition-all active:scale-95 group">
                <Copy className="h-6 w-6 text-slate-400" /> <span className="font-bold text-sm flex-1 text-left uppercase tracking-tight">Copy app link</span>
             </button>
          </div>
          
          <DialogFooter className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-300">
             <ShieldCheck className="h-4 w-4" />
             <p className="text-[9px] font-black uppercase tracking-[0.3em]">Institutional verified portal</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
