'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePWAInstall } from '@/hooks/use-pwa-install';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'primary' | 'secondary' | 'dark';
  showLabel?: boolean;
}

/**
 * @fileOverview Institutional One-Click Install Trigger v6.0.
 */
export default function PWAInstallButton({ 
  className, 
  variant = 'primary',
  showLabel = true 
}: PWAInstallButtonProps) {
  const { canInstall, installApp, isInstalled } = usePWAInstall();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInstalled) return;

    if (canInstall) {
      setIsProcessing(true);
      await installApp();
      setIsProcessing(false);
    } else {
      window.location.href = '/install';
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isProcessing || isInstalled}
      className={cn(
        "h-14 px-8 rounded-full font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-2xl transition-all active:scale-95 group border-none",
        isInstalled ? "bg-emerald-600 text-white cursor-default" :
        variant === 'primary' ? "bg-primary hover:bg-blue-700 text-white" : 
        variant === 'dark' ? "bg-[#0B1528] hover:bg-black text-white" : 
        variant === 'outline' ? "border-2 border-slate-200 bg-white text-[#0F172A] hover:bg-slate-50" : 
        "bg-white border-slate-200 text-[#0F172A] hover:bg-slate-50",
        className
      )}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isInstalled ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Smartphone className="h-4 w-4 md:h-5 md:w-5 group-hover:rotate-12 transition-transform" />
      )}
      
      {showLabel && (
        <span>
          {isInstalled ? 'App Installed' : isProcessing ? 'Syncing...' : 'Install Official App'}
        </span>
      )}
      
      {!isInstalled && !isProcessing && (
        <ArrowRight className="h-4 w-4 opacity-40 ml-1 group-hover:translate-x-1 transition-transform" />
      )}
    </Button>
  );
}
