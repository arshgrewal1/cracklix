'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useUser, useFirestore } from '@/firebase';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { Zap, Clock, Calendar, TrendingUp, BarChart2, Star, Target } from 'lucide-react';
import LiveStudyTimer from '@/components/analytics/LiveStudyTimer';

// --- Reusable Components ---

const StatCard = ({ title, value, icon: Icon, color, isloading }: { title: any, value: any, icon: any, color: any, isloading: any }) => (
  <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
    <div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-100 dark:bg-${color}-900/50 mb-4`}>
        <Icon className={`w-5 h-5 text-${color}-500 dark:text-${color}-400`} />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
      {isloading ? (
        <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mt-2"></div>
      ) : (
        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
      )}
    </div>
  </div>
);

const formatDuration = (seconds: number): string => {
    if (typeof seconds !== 'number' || seconds < 0) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
};

// --- Main Analytics Page Component ---

export default function AnalyticsPage() {
  const { user } = useUser();
  const db = useFirestore();

  // --- Data Hooks ---
  const allTimeStatsRef = user ? doc(db, 'users', user.uid, 'study_statistics', 'all_time') : null;
  const [allTimeStats, loadingAllTime] = useDocumentData(allTimeStatsRef);

  const sessionsQuery = user ? query(collection(db, 'users', user.uid, 'study_sessions'), orderBy('endTime', 'desc'), limit(5)) : null;
  const [recentSessions, loadingSessions] = useCollectionData(sessionsQuery);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Study Analytics</h1>
          <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">Your learning journey, quantified.</p>
        </header>

        {/* --- Main Grid -- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          
          <div className="lg:col-span-2 xl:col-span-2">
            <LiveStudyTimer />
          </div>

          {/* All Time Study */}
          <div className="lg:col-span-2 xl:col-span-1">
            <StatCard 
              title="All Time Study" 
              value={formatDuration(allTimeStats?.totalStudyTime || 0)}
              icon={BarChart2} 
              color="indigo" 
              isloading={loadingAllTime}
            />
           </div>

          {/* Total Sessions */}
          <StatCard 
            title="Total Sessions" 
            value={allTimeStats?.totalSessions || 0}
            icon={TrendingUp} 
            color="amber"
            isloading={loadingAllTime}
          />

          {/* Streak (Placeholder) */}
          <StatCard title="Current Streak" value="_" icon={Star} color="rose" isloading={true} />

          {/* Recent Sessions List */}
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {loadingSessions && Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 animate-pulse">
                   <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                   <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                </div>
              ))}
              {!loadingSessions && recentSessions?.map(session => (
                <div key={session.sessionId} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{session.contentType.toLowerCase()} Session</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(session.endTime).toLocaleString()}</p>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">{formatDuration(session.duration)}</p>
                </div>
              ))}
               {!loadingSessions && recentSessions?.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-slate-500 dark:text-slate-400">No study sessions recorded yet.</p>
                    </div>
               )}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
