'use client';
import AdEntryContent from './AdEntryContent';
import { useEffect, useState } from 'react';

async function getAd(id: string) {
  const res = await fetch('/api/firebase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ collection: 'ads', doc: id }),
  });
  const { data } = await res.json();
  return data;
}

async function getExams() {
  const res = await fetch('/api/firebase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ collection: 'exams' }),
  });
  const { data } = await res.json();
  return data;
}

export default function AdEntryPage({ searchParams }: any) {
  const { id } = searchParams;
  const [existingAd, setExistingAd] = useState(null);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    if (id) {
      getAd(id).then(setExistingAd);
    }
    getExams().then(setExams);
  }, [id]);

  return (
    <AdEntryContent serverExistingAd={existingAd} serverExams={exams} serverAdId={id} />
  )
}
