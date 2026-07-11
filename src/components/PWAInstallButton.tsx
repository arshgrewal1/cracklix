'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePWAInstall } from '@/hooks/use-pwa-install';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'primary' | 'secondary' | 'dark';
  showLabel?: boolean;
}

/**
 * @fileOverview Institutional PWA Install Trigger v5.0.
 * DIRECT: Optimized labels for a "download app" feel as requested.
 */
export default function PWAInstallButton({ 
  className, 
  variant = 'primary',
  showLabel = true 
}: PWAInstallButtonProps) {
  const { canInstall, installApp, isInstalled } = usePWAInstall();

  if (isInstalled) return null;

  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        if (canInstall) {
          installApp();
        } else {
          window.location.href = '/install';
        }
      }}
      className={cn(
        "h-14 px-8 rounded-full font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-2xl transition-all active:scale-95 group border-none",
        variant === 'primary' ? "bg-primary hover:bg-blue-700 text-white" : 
        variant === 'dark' ? "bg-[#0B1528] hover:bg-black text-white" : 
        variant === 'outline' ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-[#0F172A] hover:bg-slate-50",
        className
      )}
    >
      <Smartphone className="h-4 w-4 md:h-5 md:w-5 group-hover:rotate-12 transition-transform" />
      {showLabel && <span>{canInstall ? 'Install App Now' : 'Download Official App'}</span>}
      <ArrowRight className="h-4 w-4 opacity-40 ml-1 group-hover:translate-x-1 transition-transform" />
    </Button>
  );
}
