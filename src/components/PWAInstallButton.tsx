'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePWAInstall } from '@/hooks/use-pwa-install';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'primary' | 'secondary' | 'dark';
  showLabel?: boolean;
}

/**
 * @fileOverview Institutional PWA Install Trigger v5.5.
 * REFINED: Changed label from "Install Hub" to "Install App" for clarity.
 */
export default function PWAInstallButton({ 
  className, 
  variant = 'primary',
  showLabel = true 
}: PWAInstallButtonProps) {
  const { canInstall, installApp, isInstalled } = usePWAInstall();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canInstall) {
      installApp();
    } else {
      window.location.href = '/install';
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "h-14 px-8 rounded-full font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-2xl transition-all active:scale-95 group border-none",
        variant === 'primary' ? "bg-primary hover:bg-blue-700 text-white" : 
        variant === 'dark' ? "bg-[#0B1528] hover:bg-black text-white" : 
        variant === 'outline' ? "border-2 border-slate-200 bg-white text-[#0F172A] hover:bg-slate-50" : 
        "bg-white border-slate-200 text-[#0F172A] hover:bg-slate-50",
        className
      )}
    >
      <Smartphone className="h-4 w-4 md:h-5 md:w-5 group-hover:rotate-12 transition-transform" />
      {showLabel && <span>{canInstall ? 'Install App Now' : 'Install App'}</span>}
      <ArrowRight className="h-4 w-4 opacity-40 ml-1 group-hover:translate-x-1 transition-transform" />
    </Button>
  );
}
