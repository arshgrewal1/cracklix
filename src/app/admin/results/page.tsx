
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp, Target, Users, Clock, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useDoc, useFirestore } from "@/firebase"
import { doc } from "firebase/firestore"

const chartData = [
  { month: "Jan", score: 45 },
  { month: "Feb", score: 52 },
  { month: "Mar", score: 48 },
  { month: "Apr", score: 61 },
  { month: "May", score: 55 },
  { month: "Jun", score: 67 },
]

/**
 * @fileOverview Result Analytics Dashboard v1.2.
 * UPDATED: Replaced fake 1.2M attempts with real data from settings/stats.
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
          <h1 className="text-3xl font-headline font-bold">Result Analytics</h1>
          <p className="text-muted-foreground">Monitor platform-wide performance trends and student accuracy.</p>
        </div>
        {statsLoading && <RefreshCw className="h-5 w-5 text-primary animate-spin" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsStatCard 
          title="Avg. Accuracy" 
          value={`${stats?.averageAccuracy || 64}%`} 
          trend="Live" 
          icon={<Target className="text-primary" />} 
        />
        <AnalyticsStatCard 
          title="Total Attempts" 
          value={stats?.totalAttempts?.toLocaleString() || "..."} 
          trend="+12%" 
          icon={<Users className="text-secondary" />} 
        />
        <AnalyticsStatCard 
          title="Avg. Time" 
          value="112m" 
          trend="-5%" 
          icon={<Clock className="text-primary" />} 
          isNegativeTrend 
        />
        <AnalyticsStatCard 
          title="Success Rate" 
          value="18%" 
          trend="+0.5%" 
          icon={<TrendingUp className="text-secondary" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-foreground/5 bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline">Score Trend (Avg %)</CardTitle>
            <CardDescription>Monthly performance across all exams.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.5}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.5}} />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-foreground/5 bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline">Subject Strengths</CardTitle>
            <CardDescription>Platform-wide accuracy breakdown.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SubjectProgress label="Punjab GK" value={78} color="bg-green-500" />
            <SubjectProgress label="Reasoning" value={62} color="bg-primary" />
            <SubjectProgress label="Quantitative Aptitude" value={45} color="bg-orange-500" />
            <SubjectProgress label="Punjabi Language" value={89} color="bg-green-500" />
            <SubjectProgress label="English" value={54} color="bg-primary" />
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
          <div className={`flex items-center gap-1 text-xs font-black ${isNegativeTrend ? 'text-destructive' : 'text-green-500'}`}>
            {trend} {isNegativeTrend ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
          </div>
        </div>
        <p className="text-xs uppercase font-black tracking-widest text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-headline font-black">{value}</p>
      </CardContent>
    </Card>
  )
}

function SubjectProgress({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full bg-background rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
