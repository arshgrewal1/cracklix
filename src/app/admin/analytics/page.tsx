"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Target, 
  FileText, 
  Layers, 
  TrendingUp,
  Globe,
  RefreshCw,
  Search,
  Send,
  Link as LinkIcon,
  Gem,
  Medal,
  Clock,
  Instagram,
  Youtube,
  Facebook,
  Database,
  SearchCode,
  Save,
  X,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { useFirestore, useDoc } from "@/firebase"
import { collection, query, limit, onSnapshot, where, Timestamp, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Premium Real-Time Community Analytics v3.1.
 * FIXED: Imported missing Button component to resolve ReferenceError.
 */

type SocialPlatform = 'YOUTUBE' | 'TELEGRAM' | 'INSTAGRAM' | 'FACEBOOK' | 'X_PORTAL' | 'LINKEDIN';

export default function CommunityAnalyticsPage() {
  const db = useFirestore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const [liveMetrics, setLiveMetrics] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    emailUsers: 0,
    googleUsers: 0,
    proUsers: 0,
    totalAttempts: 0,
    totalResults: 0,
    totalMocks: 0,
    totalPYQs: 0,
    newToday: 0,
    activeToday: 0
  });

  // Social Config State
  const [selectedSocial, setSelectedSocial] = useState<SocialPlatform | null>(null);
  const [socialCreds, setSocialCreds] = useState({ apiKey: "", channelId: "" });
  
  const socialRef = useMemo(() => (db ? doc(db, 'settings', 'social_apis') : null), [db]);
  const { data: socialData } = useDoc<any>(socialRef);

  useEffect(() => {
    setMounted(true);
    if (!db) return;

    const todayStart = new Date(); 
    todayStart.setHours(0,0,0,0);
    const now = Date.now();

    // 1. Live Users Hub Listener
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
       const docs = snap.docs.map(d => d.data());
       
       setLiveMetrics(prev => ({
          ...prev,
          totalUsers: snap.size,
          onlineUsers: docs.filter(u => u.online === true || (u.lastSeen?.seconds && u.lastSeen.seconds * 1000 > now - 300000)).length,
          googleUsers: docs.filter(u => u.providerId === 'google.com' || u.email?.includes('gmail')).length, 
          emailUsers: docs.filter(u => !u.providerId || u.providerId === 'password').length,
          proUsers: docs.filter(u => u.passStatus === 'active').length,
          newToday: docs.filter(u => {
             const created = u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000) : new Date(u.createdAt);
             return created >= todayStart;
          }).length,
          activeToday: docs.filter(u => {
             const seen = u.lastSeen?.seconds ? new Date(u.lastSeen.seconds * 1000) : new Date(u.lastSeen);
             return seen >= todayStart;
          }).length
       }));
       setLastSync(new Date().toLocaleTimeString());
    });

    // 2. Engagement Listeners
    const unsubAttempts = onSnapshot(collection(db, "attempts"), (snap) => {
       setLiveMetrics(prev => ({ ...prev, totalAttempts: snap.size }));
    });

    const unsubResults = onSnapshot(collection(db, "results"), (snap) => {
       setLiveMetrics(prev => ({ ...prev, totalResults: snap.size }));
    });

    const unsubMocks = onSnapshot(collection(db, "mocks"), (snap) => {
       setLiveMetrics(prev => ({ ...prev, totalMocks: snap.size }));
    });

    const unsubPYQs = onSnapshot(collection(db, "pyqs"), (snap) => {
       setLiveMetrics(prev => ({ ...prev, totalPYQs: snap.size }));
    });

    return () => {
       unsubUsers(); unsubAttempts(); unsubResults(); unsubMocks(); unsubPYQs();
    };
  }, [db]);

  const handleConnectAPI = async () => {
     if (!db || !selectedSocial || isSaving) return;
     setIsSaving(true);
     try {
        await setDoc(socialRef!, {
           [selectedSocial]: {
              ...socialCreds,
              connectedAt: serverTimestamp(),
              status: 'CONNECTED'
           }
        }, { merge: true });
        toast({ title: "API Database Updated", description: `${selectedSocial} node synchronized.` });
        setSelectedSocial(null);
        setSocialCreds({ apiKey: "", channelId: "" });
     } catch (e) {
        toast({ variant: "destructive", title: "Sync failed" });
     } finally {
        setIsSaving(false);
     }
  }

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-32 text-left animate-in fade-in duration-700 px-1 md:px-4">
      
      {/* HEADER HUB */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
           <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Live Community Intelligence</span>
           </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter">Live Community</h1>
          <p className="text-slate-500 font-medium text-sm md:text-lg">Real-time database snapshots of student activity.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Database Sync</p>
              <p className="text-xs font-bold text-emerald-600 tabular-nums">Active • {lastSync}</p>
           </div>
           <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
              <RefreshCw className="h-5 w-5 animate-spin" />
           </div>
        </div>
      </div>

      {/* ASPIRANT MATRIX */}
      <section className="space-y-6">
         <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Aspirant Matrix</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <AnalyticCard label="Total Registered" value={liveMetrics.totalUsers} trend="Total" icon={<Users />} color="blue" />
            <AnalyticCard label="Online Now" value={liveMetrics.onlineUsers} trend="Live" icon={<Activity />} color="emerald" highlight={liveMetrics.onlineUsers > 0} />
            <AnalyticCard label="Elite Members" value={liveMetrics.proUsers} trend="Premium" icon={<Gem />} color="amber" />
            <AnalyticCard label="Active Today" value={liveMetrics.activeToday} trend="24h" icon={<Target />} color="indigo" />
         </div>
      </section>

      {/* ENGAGEMENT FLOW */}
      <section className="space-y-6">
         <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-orange-500" />
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Engagement Flow</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <AnalyticCard label="Mock Attempts" value={liveMetrics.totalAttempts} trend="Active" icon={<Layers />} color="orange" />
            <AnalyticCard label="Reports Generated" value={liveMetrics.totalResults} trend="Sync" icon={<FileText />} color="blue" />
            <AnalyticCard label="Mock Assets" value={liveMetrics.totalMocks} trend="Database" icon={<Database />} color="purple" />
            <AnalyticCard label="Paper Archives" value={liveMetrics.totalPYQs} trend="Vault" icon={<Clock />} color="emerald" />
         </div>
      </section>

      {/* SOCIAL COMMUNITY */}
      <section className="space-y-8 pt-10 border-t border-slate-100">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Globe className="h-5 w-5 text-blue-400" />
               <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Social Community</h3>
            </div>
            <Badge variant="outline" className="bg-slate-50 text-slate-400 font-black uppercase text-[8px] tracking-widest">External Nodes</Badge>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SocialNode 
               icon={<Youtube className="text-rose-600" />} 
               label="YouTube" 
               status={socialData?.YOUTUBE?.status}
               onClick={() => setSelectedSocial('YOUTUBE')}
            />
            <SocialNode 
               icon={<Send className="text-blue-500" />} 
               label="Telegram" 
               status={socialData?.TELEGRAM?.status}
               onClick={() => setSelectedSocial('TELEGRAM')}
            />
            <SocialNode 
               icon={<Instagram className="text-rose-500" />} 
               label="Instagram" 
               status={socialData?.INSTAGRAM?.status}
               onClick={() => setSelectedSocial('INSTAGRAM')}
            />
            <SocialNode 
               icon={<Facebook className="text-blue-700" />} 
               label="Facebook" 
               status={socialData?.FACEBOOK?.status}
               onClick={() => setSelectedSocial('FACEBOOK')}
            />
            <SocialNode 
               icon={<Activity className="text-sky-500" />} 
               label="X Portal" 
               status={socialData?.X_PORTAL?.status}
               onClick={() => setSelectedSocial('X_PORTAL')}
            />
            <SocialNode 
               icon={<LinkIcon className="text-blue-800" />} 
               label="LinkedIn" 
               status={socialData?.LINKEDIN?.status}
               onClick={() => setSelectedSocial('LINKEDIN')}
            />
         </div>
      </section>

      {/* API CONNECTOR DIALOG */}
      <Dialog open={!!selectedSocial} onOpenChange={o => !o && setSelectedSocial(null)}>
         <DialogContent className="sm:max-w-md rounded-[2rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left">
            <div className="h-1.5 w-full bg-[#0F172A]" />
            <DialogHeader className="p-8 pb-4">
               <DialogTitle className="text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3">
                  <LinkIcon className="h-6 w-6 text-primary" /> Connect {selectedSocial?.replace('_', ' ')}
               </DialogTitle>
               <DialogDescription className="text-slate-400 font-medium">Link your official social API node to the database.</DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-6">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">API Access Key</Label>
                  <Input 
                     value={socialCreds.apiKey} 
                     onChange={e => setSocialCreds({...socialCreds, apiKey: e.target.value})}
                     className="h-12 bg-slate-50 border-none rounded-xl px-4 font-mono text-xs" 
                     placeholder="Enter verified key..." 
                  />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Channel / Profile ID</Label>
                  <Input 
                     value={socialCreds.channelId} 
                     onChange={e => setSocialCreds({...socialCreds, channelId: e.target.value})}
                     className="h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm" 
                     placeholder="e.g. @cracklixapp" 
                  />
               </div>
            </div>
            <DialogFooter className="p-8 bg-slate-50">
               <Button onClick={handleConnectAPI} disabled={isSaving || !socialCreds.apiKey} className="w-full h-14 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />} Authorize Node
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function AnalyticCard({ label, value, trend, icon, color, highlight }: any) {
   const colors: any = {
      blue: "bg-blue-500/10 border-blue-500/20 text-blue-600",
      emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
      purple: "bg-purple-500/10 border-purple-500/20 text-purple-600",
      orange: "bg-orange-500/10 border-orange-500/20 text-orange-600",
      rose: "bg-rose-500/10 border-rose-500/20 text-rose-600",
      indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600",
      amber: "bg-amber-500/10 border-amber-500/20 text-amber-600",
      slate: "bg-slate-500/10 border-slate-500/20 text-slate-600"
   };

   return (
      <Card className={cn(
         "border-none shadow-xl bg-white p-6 md:p-8 rounded-[2rem] hover:translate-y-[-4px] transition-all duration-500 group border border-slate-50 text-left",
         highlight && "ring-2 ring-emerald-500/20"
      )}>
         <div className="flex items-center justify-between mb-6 md:mb-10">
            <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center border shadow-inner group-hover:scale-110 transition-transform", colors[color])}>
               {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-6 md:w-6" })}
            </div>
            <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded", colors[color].split(' ')[0], colors[color].split(' ')[2])}>
               {trend}
            </Badge>
         </div>
         <div className="space-y-1">
            <div className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tighter tabular-nums leading-none">
               {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{label}</p>
         </div>
      </Card>
   )
}

function SocialNode({ icon, label, status, onClick }: any) {
   const isConnected = status === 'CONNECTED';
   return (
      <Card className="border border-slate-100 bg-white p-6 rounded-[2rem] text-center space-y-4 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
         <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            {icon}
         </div>
         <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-[#0F172A]">{label}</p>
            <p className={cn(
               "text-[8px] font-bold uppercase tracking-widest",
               isConnected ? "text-emerald-500" : "text-rose-500"
            )}>
               {isConnected ? "Database Linked" : "Disconnected"}
            </p>
         </div>
         <button 
           onClick={onClick}
           className={cn(
              "w-full h-8 rounded-lg font-black uppercase text-[8px] tracking-tight transition-all active:scale-95 border-none shadow-sm flex items-center justify-center gap-2 cursor-pointer",
              isConnected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500 hover:bg-[#0F172A] hover:text-white"
           )}
         >
            <LinkIcon className="h-2.5 w-2.5" /> {isConnected ? "Modify API" : "Connect API"}
         </button>
      </Card>
   )
}
