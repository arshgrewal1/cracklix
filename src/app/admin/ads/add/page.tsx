
'use client';

import { useEffect, useState, Suspense } from 'react';
import AdEntryContent from './AdEntryContent';
import { useFirestore } from '@/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

/**
 * @fileOverview Ad Entry Page Node v3.2 (Next.js 15 Hardened).
 * FIXED: Wrapped content in Suspense to satisfy Next.js 15 CSR bailout requirements.
 */
export default function AdEntryPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
      <AdEntryLoader />
    </Suspense>
  );
}

function AdEntryLoader() {
  const db = useFirestore();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [existingAd, setExistingAd] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!db) return;
      
      try {
        setLoading(true);

        // 1. Fetch Existing Ad node if editing
        if (id) {
          const adSnap = await getDoc(doc(db, "ads", id));
          if (adSnap.exists()) {
            setExistingAd({ ...adSnap.data(), id: adSnap.id });
          }
        }

        // 2. Fetch Exams for targeting node directly from registry
        const examsSnap = await getDocs(collection(db, "exams"));
        const examsList = examsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        setExams(examsList);

      } catch (error) {
        console.error('[AD_REGISTRY_ERROR]:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, db]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
          Synchronizing Registry...
        </p>
      </div>
    );
  }

  return (
    <AdEntryContent 
      serverExistingAd={existingAd} 
      serverExams={exams} 
      serverAdId={id} 
    />
  )
}
