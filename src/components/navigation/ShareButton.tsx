'use client';

import React, { useState } from "react";
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
import { useFirestore } from '@/firebase';
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
 * @fileOverview Premium Social Share Hub v5.0 [Alignment Fix].
 * FIXED: Resolved text overlapping and icon collision.
 * UPDATED: Standardized typography to Title Case.
 */
export default function ShareButton({ 
  className = "", 
  showLabel = true 
}: { 
  className?: string; 
  showLabel?: boolean;
}) {
  const { toast } = useToast();
  const [isDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const installUrl = "https://cracklix.com/install";
  const websiteUrl = "https://cracklix.com";
  
  const shareMessage = `🚀 Crack Punjab Government Exams with Cracklix!

🎯 Prepare smarter for:
• PSSSB, PPSC, Punjab Police, and more.

📚 Features:
• Unlimited Mock Tests
• Previous Year Papers
• Daily Quiz & Current Affairs

📲 Install the Official App: ${installUrl}
🌐 Website: ${websiteUrl}`;

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Cracklix | Punjab Exam Prep',
          text: shareMessage,
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
      // Fallback for restricted environments
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
            "w-full h-auto min-h-[58px] py-3 px-5 rounded-[20px] bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg transition-all active:scale-95 group relative overflow-hidden border-none flex items-center justify-start gap-4",
            className
          )}
        >
          <div className="shrink-0 flex items-center justify-center h-10 w-10 bg-white/10 rounded-xl">
             {isSharing ? (
               <Loader2 className="h-5 w-5 animate-spin" />
             ) : (
               <Share2 className="h-5 w-5 transition-transform group-hover:rotate-12" />
             )}
          </div>
          <div className="flex flex-col items-start text-left min-w-0 flex-1">
             <span className="text-sm md:text-base leading-tight">Share Cracklix</span>
             {showLabel && (
               <span className="text-[10px] opacity-70 font-medium mt-0.5 leading-tight line-clamp-1">
                 Invite friends to prepare smarter
               </span>
             )}
          </div>
          <ChevronRight className="h-4 w-4 opacity-30 group-hover:translate-x-1 transition-transform ml-auto shrink-0" />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="w-[94vw] max-w-[480px] rounded-[2.5rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left z-[2100]">
          <div className="h-2 w-full bg-blue-600" />
          <DialogHeader className="p-8 pb-4 text-center">
             <div className="h-16 w-16 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto text-blue-600 shadow-xl mb-6 border border-blue-100">
                <Share2 className="h-8 w-8" />
             </div>
             <DialogTitle className="text-2xl font-black text-[#0F172A] tracking-tighter uppercase">Share Hub</DialogTitle>
             <DialogDescription className="text-slate-400 font-bold text-[10px] mt-2">Premium invitation portal</DialogDescription>
          </DialogHeader>

          <div className="px-8 pb-10 space-y-3">
             <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank')} className="w-full h-14 bg-[#25D366] hover:bg-[#20bd5c] text-white rounded-2xl flex items-center px-6 gap-4 shadow-lg transition-all active:scale-95 border-none group">
                <MessageSquare className="h-6 w-6" /> <span className="font-bold text-sm flex-1 text-left">WhatsApp Hub</span>
                <ChevronRight className="h-4 w-4 opacity-30 group-hover:translate-x-1 transition-transform" />
             </button>
             <button onClick={() => copyToClipboard(shareMessage, "Message copied to registry")} className="w-full h-14 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-2xl flex items-center px-6 gap-4 border border-slate-100 transition-all active:scale-95 group">
                <Send className="h-6 w-6 text-slate-400" /> <span className="font-bold text-sm flex-1 text-left">Copy full message</span>
             </button>
             <button onClick={() => copyToClipboard(installUrl, "Link copied to registry")} className="w-full h-14 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-2xl flex items-center px-6 gap-4 border border-slate-100 transition-all active:scale-95 group">
                <Copy className="h-6 w-6 text-slate-400" /> <span className="font-bold text-sm flex-1 text-left">Copy app link</span>
             </button>
          </div>
          
          <DialogFooter className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-300">
             <ShieldCheck className="h-4 w-4" />
             <p className="text-[9px] font-black uppercase tracking-[0.3em]">Verified distribution node</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
