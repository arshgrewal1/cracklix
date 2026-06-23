'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'primary' | 'secondary' | 'dark';
  showLabel?: boolean;
}

/**
 * @fileOverview Institutional APK Download Trigger v1.0.
 * Replaced PWA logic with direct APK download path for better user retention.
 */
export default function PWAInstallButton({ 
  className, 
  variant = 'default',
  showLabel = true 
}: PWAInstallButtonProps) {
  return (
    <Button
      asChild
      className={cn(
        "font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl transition-all active:scale-95",
        variant === 'primary' ? "bg-primary hover:bg-blue-700 text-white border-none" : 
        variant === 'dark' ? "bg-[#0B1528] hover:bg-black text-white border-none" : 
        variant === 'outline' ? "bg-white border-slate-200 text-[#0F172A] hover:bg-slate-50" : "",
        className
      )}
    >
      <Link href="/install">
        <Download className="h-4 w-4" />
        {showLabel && "Download App"}
        <Sparkles className="h-3 w-3 text-primary animate-pulse" />
      </Link>
    </Button>
  );
}