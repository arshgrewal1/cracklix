
'use client';

import React, { useMemo } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Megaphone, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @fileOverview Institutional Sitewide Announcement Bar v1.0.
 * Reflected from the System Portal Branding & Alerts configuration.
 */
export default function AnnouncementBar() {
  const db = useFirestore();
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings, loading } = useDoc<any>(settingsRef);

  const [isDismissed, setIsDismissed] = React.useState(false);

  // Sync dismissal with local storage to prevent annoyance
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
       const dismissedAt = localStorage.getItem('cracklix_announcement_dismissed_at');
       if (dismissedAt) {
          const hours = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
          if (hours < 24) setIsDismissed(true); // Persist dismissal for 24 hours
       }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
       localStorage.setItem('cracklix_announcement_dismissed_at', Date.now().toString());
    }
  };

  if (loading || !settings || !settings.showAnnouncement || !settings.announcement || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-[#0F172A] text-white overflow-hidden z-[1100] relative border-b border-white/5"
      >
        <div className="max-w-[1500px] mx-auto px-4 h-10 md:h-12 flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center justify-center gap-3">
             <div className="hidden sm:flex h-6 w-6 rounded-lg bg-primary/20 items-center justify-center shrink-0">
                <Megaphone className="h-3 w-3 text-primary animate-pulse" />
             </div>
             <p className="text-[10px] md:text-xs font-black uppercase tracking-widest leading-none truncate max-w-[80vw] antialiased">
               {settings.announcement}
             </p>
             <div className="hidden md:flex items-center gap-1.5 text-primary ml-2 group cursor-pointer">
                <span className="text-[9px] font-black uppercase tracking-widest">Details</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
             </div>
          </div>
          
          <button 
            onClick={handleDismiss}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0 active:scale-90"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        
        {/* Decorative Animated Glow Node */}
        <div className="absolute top-0 left-1/4 w-32 h-full bg-primary/10 blur-2xl -skew-x-12 animate-pulse pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
}
