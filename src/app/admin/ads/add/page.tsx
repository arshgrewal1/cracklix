'use client';
import AdEntryContent from './AdEntryContent';
import { useEffect, useState } from 'react';

export default function AdEntryPage({ searchParams }: any) {
  const { id } = searchParams;
  const [existingAd, setExistingAd] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Only load from API on CLIENT-SIDE after build
        if (id) {
          const adRes = await fetch('/api/firebase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ collection: 'ads', doc: id }),
          });
          const { data } = await adRes.json();
          setExistingAd(data);
        }

        // Load exams after build
        const examsRes = await fetch('/api/firebase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ collection: 'exams' }),
        });
        const { data } = await examsRes.json();
        setExams(data);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  return (
    <AdEntryContent serverExistingAd={existingAd} serverExams={exams} serverAdId={id} loading={loading} />
  )
}
