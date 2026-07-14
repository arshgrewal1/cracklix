'use client';

import React, { useMemo, useState } from "react";
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
 * @fileOverview Premium Social Share Hub v4.2 [Security Hardened].
 * FIXED: Implemented resilient clipboard fallback for permission-restricted environments.
 */
export default function ShareButton({ 
  className = "", 
  showLabel = true 
}: any) {
  const db = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const installUrl = "https://cracklix.vercel.app/install";
  const websiteUrl = "https://cracklix.vercel.app";
  
  const shareMessage = `🚀 Crack Punjab Government Exams with Cracklix!

🎯 Prepare smarter for:

• PSSSB
• PPSC
• Punjab Police
• PSPCL
• PSTET
• SSC
• Banking
• Railways

✨ What you'll get:

📚 Unlimited Mock Tests
📝 Previous Year Papers
⚡ Daily Quiz & Current Affairs
📊 Performance Analytics
🏆 State Rank System
🎯 Punjab GK Mastery
💻 Computer
📖 Punjabi
🔤 English
➗ Mathematics

📲 Install the Official Cracklix App
${installUrl}

🌐 Website
${websiteUrl}

Join thousands of Punjab aspirants preparing smarter every day.`;

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Cracklix | Punjab Exam Prep',
          text: shareMessage,
        });
        toast({ title: "Shared successfully" });
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

  const copyToClipboard = async () => {
    try {
      if (!navigator.clipboard) {
         throw new Error('NOT_SUPPORTED');
      }
      await navigator.clipboard.writeText(installUrl);
      toast({ title: "Link copied!", description: "Invitation link saved to registry." });
    } catch (e) {
      console.warn('[Clipboard] Native API failed, attempting fallback.', e);
      // Fallback method for restricted environments (iframes/WebView without explicit policy)
      const textArea = document.createElement("textarea");
      textArea.value = installUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
           toast({ title: "Link copied!", description: "Invitation link saved to registry." });
        } else {
           throw new Error('EXEC_COMMAND_FAIL');
        }
      } catch (err) {
        toast({ 
           variant: "destructive", 
           title: "Action blocked", 
           description: "Browser policy prevents automated copying. Please share directly via WhatsApp." 
        });
      }
      document.body.removeChild(textArea);
    }
  };
  
  const copyMessageToClipboard = async () => {
    try {
      if (!navigator.clipboard) {
         throw new Error('NOT_SUPPORTED');
      }
      await navigator.clipboard.writeText(shareMessage);
      toast({ title: "Message copied!", description: "Invitation text saved to registry." });
    } catch (e) {
      const textArea = document.createElement("textarea");
      textArea.value = shareMessage;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
           toast({ title: "Message copied!", description: "Invitation text saved to registry." });
        } else {
           throw new Error('EXEC_COMMAND_FAIL');
        }
      } catch (err) {
        toast({ 
           variant: "destructive", 
           title: "Action blocked", 
           description: "Security policy denied clipboard access. Try WhatsApp share." 
        });
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <>
      <div className="w-full space-y-4">
        <Button
          onClick={handleShare}
          disabled={isSharing}
          className={cn(
            "w-full h-[60px] rounded-[24px] bg-gradient-to-r from-[#2563EB] to-[#60A5FA] text-white font-[900] uppercase text-[12px] tracking-[0.1em] gap-4 shadow-[0_12px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.35)] transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden border-none",
            className
          )}
        >
          {isSharing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Share2 className="h-6 w-6 transition-transform group-hover:rotate-12" />
          )}
          <div className="flex flex-col items-start text-left">
             <span className="text-sm">📤 Share Cracklix</span>
             {showLabel && <span className="text-[7px] opacity-70 font-bold -mt-0.5 tracking-normal lowercase first-letter:uppercase">Invite your friends to crack Punjab Government Exams.</span>}
          </div>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="w-[94vw] max-w-[480px] rounded-[2.5rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left z-[2100]">
          <div className="h-2 w-full bg-[#2563EB]" />
          <DialogHeader className="p-8 md:p-12 pb-4 text-center">
             <div className="h-16 w-16 md:h-20 md:w-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto text-[#2563EB] shadow-xl mb-6 border border-blue-100">
                <Share2 className="h-8 w-8 md:h-10 md:w-10" />
             </div>
             <DialogTitle className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Share Hub</DialogTitle>
             <DialogDescription className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.3em] mt-3">Premium invitation node</DialogDescription>
          </DialogHeader>

          <div className="px-8 md:px-12 pb-12 space-y-4">
             <div className="grid grid-cols-1 gap-3">
                <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank')} className="w-full h-14 md:h-16 bg-[#25D366] hover:bg-[#20bd5c] text-white rounded-2xl flex items-center px-6 gap-6 shadow-lg transition-all active:scale-95 border-none group">
                   <MessageSquare className="h-6 w-6" /> <span className="font-black uppercase text-[11px] md:text-sm tracking-widest flex-1 text-left">WhatsApp Hub</span>
                   <ChevronRight className="h-4 w-4 opacity-30 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={copyMessageToClipboard} className="w-full h-14 md:h-16 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-2xl flex items-center px-6 gap-6 border border-slate-100 transition-all active:scale-95 group">
                   <Send className="h-6 w-6 text-slate-400" /> <span className="font-black text-[11px] md:text-sm uppercase tracking-widest truncate flex-1 text-left">Copy full message</span>
                </button>
                <button onClick={copyToClipboard} className="w-full h-14 md:h-16 bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-2xl flex items-center px-6 gap-6 border border-slate-100 transition-all active:scale-95 group">
                   <Copy className="h-6 w-6 text-slate-400" /> <span className="font-black text-[11px] md:text-sm uppercase tracking-widest truncate flex-1 text-left">Copy install link</span>
                </button>
             </div>
          </div>
          
          <DialogFooter className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-300">
             <ShieldCheck className="h-4 w-4" />
             <p className="text-[9px] font-black uppercase tracking-[0.3em]">Verified distribution protocol</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
