
'use client';

import { useMemo } from "react";
import { Share2, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'dark';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'h-14';
  showLabel?: boolean;
}

/**
 * @fileOverview Institutional Share Node.
 * Fetches dynamic metadata from Firestore and executes native share or clipboard fallback.
 */
export default function ShareButton({ 
  className = "", 
  variant = 'default', 
  size = 'default',
  showLabel = true 
}: ShareButtonProps) {
  const db = useFirestore();
  const { toast } = useToast();
  
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings, loading } = useDoc<any>(settingsRef);

  const handleShare = async () => {
    if (!settings) return;

    const shareData = {
      title: settings.shareTitle || "CRACKLIX",
      text: settings.shareDescription || "Practice Mock Tests and Prepare for Punjab Government Exams",
      url: settings.shareUrl || window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied!",
          description: "Cracklix registry URL saved to clipboard.",
        });
      }
    } catch (err) {
      // User cancelled share - no action needed
    }
  };

  const isDark = variant === 'dark';

  return (
    <Button
      onClick={handleShare}
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
      {showLabel && <span>Share CRACKLIX</span>}
    </Button>
  );
}
