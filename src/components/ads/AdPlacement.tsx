'use client';

import { useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc, Query, DocumentData } from 'firebase/firestore';
import { Advertisement, AdPlacementType } from '@/types';
import { trackAdImpression, trackAdClick } from '@/app/actions/ads';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface AdPlacementProps {
  placement: AdPlacementType;
  className?: string;
  examId?: string;
}

/**
 * @fileOverview Institutional Ad-Node v1.25.
 * FIXED: Explicit type casting for Firestore queries to resolve parameter assignability errors.
 */

export default function AdPlacement({ placement, className, examId }: AdPlacementProps) {
  const db = useFirestore();
  const { profile } = useUser();
  const pathname = usePathname();

  const { data: globalSettings } = useDoc<any>(useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]));
  const { data: passes } = useCollection<any>(useMemo(() => (db ? collection(db, 'passes') : null), [db]));

  const isSafetyZone = pathname.includes('/attempt') || pathname.includes('/checkout') || pathname.startsWith('/admin');

  const isAdFree = useMemo(() => {
    if (!profile || profile.status === 'Free') return false;
    const activePass = (passes as any[])?.find((p: any) => p.id === profile.status);
    return activePass?.adFree === true;
  }, [profile, passes]);

  const adsQuery = useMemo(() => {
    if (!db || isAdFree || isSafetyZone) return null;
    const colRef = collection(db, 'ads');
    return query(colRef, where('status', '==', 'ACTIVE')) as Query<Advertisement, DocumentData>;
  }, [db, isAdFree, isSafetyZone]);

  const { data: ads, loading } = useCollection<Advertisement>(adsQuery);

  const activeAd = useMemo(() => {
    if (!ads) return null;
    const candidates = (ads as Advertisement[]).filter(ad => {
      const hasPlacement = ad.placements.includes(placement);
      if (!hasPlacement) return false;
      if (examId && ad.targeting?.examIds && ad.targeting.examIds.length > 0) {
        return ad.targeting.examIds.includes(examId);
      }
      return true;
    });
    if (candidates.length === 0) return null;
    return [...candidates].sort((a, b) => b.priority - a.priority)[0];
  }, [ads, placement, examId]);

  useEffect(() => {
    if (activeAd && db) {
      trackAdImpression(db, activeAd.id);
    }
  }, [activeAd, db]);

  if (loading || !activeAd || isAdFree || isSafetyZone) return null;

  const handleClick = () => {
    if (db && activeAd) trackAdClick(db, activeAd.id);
  };

  return (
    <div className={cn("w-full flex justify-center py-6", className)}>
      <div className="max-w-7xl w-full">
         {activeAd.type === 'ADSENSE' && globalSettings?.adSenseEnabled ? (
            <div 
              className="mx-auto bg-slate-50 border border-slate-100 rounded-xl overflow-hidden min-h-[90px] flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: activeAd.adSenseCode || '' }}
            />
         ) : activeAd.type === 'BANNER' ? (
            <a 
              href={activeAd.externalUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={handleClick}
              className="block group relative"
            >
               <picture>
                  <source media="(max-width: 768px)" srcSet={activeAd.mobileImageUrl || activeAd.desktopImageUrl} />
                  <img 
                    src={activeAd.desktopImageUrl} 
                    alt={activeAd.title} 
                    className="w-full rounded-2xl shadow-lg transition-transform group-hover:scale-[1.01]" 
                  />
               </picture>
               <span className="absolute top-2 right-2 bg-black/20 text-white/60 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded backdrop-blur-sm">Sponsored</span>
            </a>
         ) : activeAd.type === 'HTML' ? (
            <div dangerouslySetInnerHTML={{ __html: activeAd.htmlCode || '' }} />
         ) : null}
      </div>
    </div>
  );
}
