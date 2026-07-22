"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp, Target, Users, Clock, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart3 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useDoc, useFirestore } from "@/firebase"
import { doc } from "firebase/firestore"

/**
 * @fileOverview Result Analytics Dashboard v1.3 [STRICT REAL DATA].
 * FIXED: Removed all mock data and hardcoded trends.
 */
export default function ResultAnalytics() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground">Monitor platform-wide performance trends and student accuracy.</p>
        </div>
        {statsLoading && <RefreshCw className="h-5 w-5 text-primary animate-spin" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsStatCard 
          title="Avg. Accuracy" 
          value={`${stats?.averageAccuracy || 0}%`} 
          trend="Sync" 
          icon={<Target className="text-primary" />} 
        />
        <AnalyticsStatCard 
          title="Total Attempts" 
          value={stats?.totalAttempts?.toLocaleString() || "0"} 
          trend="Live" 
          icon={<Users className="text-secondary" />} 
        />
        <AnalyticsStatCard 
          title="Active Students" 
          value={stats?.activeStudentsToday?.toLocaleString() || "0"} 
          trend="Realtime" 
          icon={<Clock className="text-primary" />} 
        />
        <AnalyticsStatCard 
          title="Total Questions" 
          value={stats?.totalQuestions?.toLocaleString() || "0"} 
          trend="Bank" 
          icon={<TrendingUp className="text-secondary" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-foreground/5 bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline">Activity Trend</CardTitle>
            <CardDescription>Awaiting more data nodes for accurate temporal projection.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center opacity-20">
             <BarChart3 className="h-16 w-16" />
          </CardContent>
        </Card>

        <Card className="border-foreground/5 bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline">Subject Strengths</CardTitle>
            <CardDescription>Platform-wide accuracy breakdown.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="py-20 text-center opacity-30 italic font-medium">
                Analysis synchronizing...
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AnalyticsStatCard({ title, value, trend, icon, isNegativeTrend }: { title: string, value: string, trend: string, icon: React.ReactNode, isNegativeTrend?: boolean }) {
  return (
    <Card className="border-foreground/5 bg-card/50">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="h-10 w-10 rounded-xl bg-background border flex items-center justify-center">{icon}</div>
          <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-500`}>
            {trend}
          </div>
        </div>
        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-headline font-black tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}