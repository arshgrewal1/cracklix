
'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @fileOverview Institutional Network Monitor v1.4.
 * FIXED: Optimized for PWA safe area in standalone mode.
 */
export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setIsOnline(false);
      setShowNotification(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-[env(safe-area-inset-left,16px)] right-[env(safe-area-inset-right,16px)] z-[3000] md:left-auto md:right-8 md:w-[320px]"
        >
          <div className={`p-4 rounded-xl md:rounded-2xl shadow-5xl flex items-center justify-between border ${
            isOnline 
              ? "bg-emerald-600 border-emerald-500 text-white" 
              : "bg-[#0F172A] border-white/10 text-white"
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              {isOnline ? (
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Wifi className="h-4 w-4" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <WifiOff className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="text-left min-w-0">
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-tight truncate">
                  {isOnline ? 'Connection Restored' : 'Offline Mode'}
                </p>
                <p className="text-[8px] md:text-[9px] font-bold opacity-70 uppercase tracking-widest truncate">
                  {isOnline ? 'Database Synced' : 'Check Connectivity'}
                </p>
              </div>
            </div>
            {!isOnline && (
               <button onClick={() => setShowNotification(false)} className="p-1 hover:bg-white/5 rounded-lg transition-colors bg-transparent border-none cursor-pointer">
                  <X className="h-4 w-4 opacity-50" />
               </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
