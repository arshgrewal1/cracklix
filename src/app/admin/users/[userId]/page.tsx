
"use client"

import React, { useMemo, useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useUser, useDoc, useCollection, useFirestore } from "@/firebase"
import { doc, collection, query, where, updateDoc, serverTimestamp, deleteDoc, orderBy, limit } from "firebase/firestore"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Target, 
  ShieldCheck, 
  Zap, 
  History, 
  Gem, 
  Clock, 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ChevronLeft,
  Smartphone,
  Globe,
  Star,
  Activity,
  Award,
  AlertCircle,
  FileText,
  Bookmark,
  ExternalLink,
  MessageCircle,
  Send,
  Loader2
} from "lucide-react"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * @fileOverview Deep Institutional Aspirant Auditor v1.0.
 * Objective: 360-degree audit of a single student node from Firestore.
 */

export default function StudentDetailPage(props: { params: Promise<{ userId: string }> }) {
  const params = use(props.params);
  const userId = params.userId;
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  // 1. Core Profile Sync
  const userRef = useMemo(() => (db ? doc(db, "users", userId) : null), [db, userId]);
  const { data: profile, loading: pLoading } = useDoc<any>(userRef);

  // 2. Aggregate Data Listeners
  const resultsQuery = useMemo(() => (db ? query(collection(db, "results"), where("userId", "==", userId), orderBy("timestamp", "desc")) : null), [db, userId]);
  const sessionsQuery = useMemo(() => (db ? query(collection(db, "users", userId, "study_sessions"), orderBy("startTime", "desc"), limit(50)) : null), [db, userId]);
  const bookmarksQuery = useMemo(() => (db ? query(collection(db, "bookmarks"), where("userId", "==", userId)) : null), [db, userId]);
  const subsQuery = useMemo(() => (db ? query(collection(db, "subscriptions"), where("userId", "==", userId), orderBy("purchaseDate", "desc")) : null), [db, userId]);

  const { data: results, loading: rLoading } = useCollection<any>(resultsQuery);
  const { data: sessions } = useCollection<any>(sessionsQuery);
  const { data: bookmarks } = useCollection<any>(bookmarksQuery);
  const { data: subscriptions } = useCollection<any>(subsQuery);

  const analytics = useMemo(() => {
    if (!results || results.length === 0) return { attempted: 0, accuracy: 0, avgScore: 0, highestScore: 0, solved: 0, correct: 0, wrong: 0 };
    
    const total = results.length;
    const correct = results.reduce((acc, r) => acc + (r.correctCount || 0), 0);
    const attemptedQ = results.reduce((acc, r) => acc + (r.attemptedCount || 0), 0);
    const scores = results.map(r => r.score || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / total;
    const accuracies = results.map(r => r.accuracy || 0);
    
    return {
      attempted: total,
      accuracy: Math.round(accuracies.reduce((a, b) => a + b, 0) / total),
      avgScore: Number(avgScore.toFixed(1)),
      highestScore: Math.max(...scores),
      solved: attemptedQ,
      correct,
      wrong: results.reduce((acc, r) => acc + (r.wrongCount || 0), 0)
    };
  }, [results]);

  const handleAdminAction = async (action: string) => {
    if (!db || !profile || isProcessing) return;
    setIsProcessing(true);
    try {
      const ref = doc(db, "users", userId);
      if (action === 'TOGGLE_STATUS') {
         const next = profile.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
         await updateDoc(ref, { status: next, updatedAt: serverTimestamp() });
         toast({ title: "Authority updated" });
      } else if (action === 'VERIFY_EMAIL') {
         await updateDoc(ref, { emailVerified: true, updatedAt: serverTimestamp() });
         toast({ title: "Email verified" });
      } else if (action === 'REMOVE_PRO') {
         await updateDoc(ref, { passStatus: 'none', status: 'Free', 'pass.active': false, updatedAt: serverTimestamp() });
         toast({ title: "Membership removed" });
      }
    } catch (e) { toast({ variant: "destructive", title: "Action failed" }); }
    finally { setIsProcessing(false); }
  }

  if (pLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>;

  if (!profile) return (
     <div className="h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
        <AlertCircle className="h-16 w-16 text-slate-200" />
        <h2 className="text-2xl font-black text-[#0F172A]">Aspirant not found</h2>
        <Button onClick={() => router.back()} variant="outline">Back to registry</Button>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left pb-32">
      <div className="bg-[#0B1528] pt-12 pb-24 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
         <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10 space-y-10">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all font-bold text-xs uppercase tracking-widest"><ChevronLeft className="h-4 w-4" /> User Audit Hub</button>
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
               <div className="relative shrink-0">
                  <StudentAvatar profile={profile} className="h-24 w-24 md:h-44 md:w-44 rounded-full border-4 border-white/5 shadow-5xl bg-slate-900" />
                  <div className={cn("absolute bottom-2 right-2 h-8 w-8 md:h-12 md:w-12 rounded-full border-4 border-[#0B1528] flex items-center justify-center text-white shadow-xl", profile.online ? "bg-emerald-500" : "bg-slate-500")}><Activity className="h-4 w-4 md:h-6 md:w-6" /></div>
               </div>
               <div className="flex-1 text-center md:text-left space-y-4">
                  <div className="space-y-1">
                     <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                        <Badge className={cn("border-none px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg", profile.passStatus === 'active' ? "bg-amber-500" : "bg-white/10 text-slate-300")}>{profile.passStatus === 'active' ? 'ELITE MEMBER' : 'FREE ASPIRANT'}</Badge>
                        <Badge variant="outline" className="text-white border-white/20 text-[9px] font-bold px-3 py-1 uppercase">{profile.status}</Badge>
                     </div>
                     <h1 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-none antialiased">{profile.name}</h1>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-slate-400 font-bold text-xs md:text-base">
                     <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {profile.email}</span>
                     <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {profile.phone || "---"}</span>
                     <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> {profile.state}, {profile.district || "Punjab"}</span>
                  </div>
               </div>
               <div className="flex gap-3 shrink-0 w-full md:w-auto">
                  <Button onClick={() => handleAdminAction('TOGGLE_STATUS')} className={cn("h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex-1 md:flex-none border-none", profile.status === 'SUSPENDED' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700 text-white")}>
                     {profile.status === 'SUSPENDED' ? 'Enable Node' : 'Disable account'}
                  </Button>
               </div>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl -mt-10 relative z-20 space-y-8">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnalyticNode label="Mock attempts" val={analytics.attempted} icon={<ClipboardList />} color="text-blue-500" />
            <AnalyticNode label="Avg precision" val={`${analytics.accuracy}%`} icon={<Target />} color="text-emerald-500" />
            <AnalyticNode label="Solved items" val={analytics.solved} icon={<Zap />} color="text-amber-500" />
            <AnalyticNode label="Peak score" val={analytics.highestScore} icon={<Award />} color="text-primary" />
         </div>

         <Tabs defaultValue="PERSONAL" className="w-full space-y-8">
            <TabsList className="bg-white border border-slate-100 p-1.5 h-14 md:h-16 rounded-2xl md:rounded-full shadow-sm flex w-full md:w-fit overflow-x-auto no-scrollbar gap-2">
               <TabsTrigger value="PERSONAL" className="rounded-xl md:rounded-full px-6 md:px-10 font-black uppercase text-[9px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Identity Hub</TabsTrigger>
               <TabsTrigger value="LEARNING" className="rounded-xl md:rounded-full px-6 md:px-10 font-black uppercase text-[9px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Learning Matrix</TabsTrigger>
               <TabsTrigger value="BILLING" className="rounded-xl md:rounded-full px-6 md:px-10 font-black uppercase text-[9px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Subscription</TabsTrigger>
               <TabsTrigger value="ACTIVITY" className="rounded-xl md:rounded-full px-6 md:px-10 font-black uppercase text-[9px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Log trail</TabsTrigger>
            </TabsList>

            <TabsContent value="PERSONAL" className="space-y-6 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                  <div className="lg:col-span-8 space-y-6">
                     <SectionCard title="Personal information" icon={<User className="text-primary" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                           <DataField label="Full Name" value={profile.name} />
                           <DataField label="Email Registry" value={profile.email} />
                           <DataField label="Contact Phone" value={profile.phone} />
                           <DataField label="Date of Birth" value={profile.dob} />
                           <DataField label="Gender" value={profile.gender} />
                           <DataField label="Residential Address" value={profile.address} />
                           <DataField label="District Node" value={profile.district} />
                           <DataField label="Login Provider" value={profile.providerId || "Email/Password"} />
                        </div>
                     </SectionCard>
                     <SectionCard title="Academic settings" icon={<GraduationCap className="text-blue-500" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                           <DataField label="Target Vertical" value={profile.targetExam} />
                           <DataField label="Education Milestone" value={profile.education} />
                           <DataField label="Daily Prep Goal" value={profile.dailyGoal} />
                           <DataField label="Preferred Language" value={profile.preferredLanguage || "Bilingual"} />
                        </div>
                     </SectionCard>
                  </div>
                  <div className="lg:col-span-4 space-y-6">
                     <SectionCard title="Security metadata" icon={<ShieldCheck className="text-emerald-500" />}>
                        <div className="space-y-6">
                           <DataField label="Registry UID" value={profile.id} mono />
                           <DataField label="Account status" value={profile.status} highlight />
                           <DataField label="Verified node" value={profile.emailVerified ? 'Yes' : 'No'} />
                           <DataField label="Created at" value={new Date(profile.createdAt).toLocaleString()} />
                           <DataField label="Active Device ID" value={profile.activeDeviceId} mono />
                        </div>
                     </SectionCard>
                     <Card className="bg-[#0F172A] text-white p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Zap className="h-48 w-48 text-primary" /></div>
                        <div className="relative z-10 space-y-6 text-left">
                           <h4 className="text-xl font-black uppercase tracking-tight">Admin actions</h4>
                           <div className="space-y-2">
                              <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-[10px] uppercase gap-3 border border-white/5" onClick={() => handleAdminAction('VERIFY_EMAIL')}>Verify identity</Button>
                              <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-[10px] uppercase gap-3 border border-white/5">Transmit message</Button>
                              <Button className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[10px] uppercase gap-3 border-none shadow-xl mt-4" onClick={() => handleDelete(profile.id, profile.name)}>Purge registry node</Button>
                           </div>
                        </div>
                     </Card>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="LEARNING" className="space-y-6 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SectionCard title="Performance map" icon={<Activity className="text-primary" />}>
                     <div className="space-y-6">
                        <LearningMetric label="Precision index" val={`${analytics.accuracy}%`} color="bg-emerald-500" />
                        <LearningMetric label="Correct responses" val={analytics.correct} color="bg-blue-500" />
                        <LearningMetric label="Negative nodes" val={analytics.wrong} color="bg-rose-500" />
                        <LearningMetric label="Subject average" val={analytics.avgScore} color="bg-amber-500" />
                     </div>
                  </SectionCard>
                  <div className="md:col-span-2 space-y-6">
                     <SectionCard title="Recent attempt history" icon={<History className="text-blue-500" />}>
                        <div className="divide-y divide-slate-50">
                           {rLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : results && results.length > 0 ? results.slice(0, 10).map((r: any) => (
                              <div key={r.id} className="py-5 flex items-center justify-between group hover:bg-slate-50/50 px-4 -mx-4 rounded-xl transition-all">
                                 <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shadow-inner group-hover:bg-primary group-hover:text-white transition-all"><Zap className="h-5 w-5" /></div>
                                    <div className="min-w-0">
                                       <p className="font-bold text-[#0F172A] truncate max-w-md">{r.mockTitle}</p>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(r.timestamp).toLocaleDateString()} • {Math.round(r.accuracy)}% accuracy</p>
                                    </div>
                                 </div>
                                 <div className="text-right shrink-0">
                                    <p className="text-lg font-black text-[#0F172A] tabular-nums">{r.score}</p>
                                    <Badge variant="outline" className="text-[7px] font-black border-slate-100 text-slate-300">SYNCED</Badge>
                                 </div>
                              </div>
                           )) : <p className="py-10 text-center opacity-20 italic">No attempt nodes found</p>}
                        </div>
                     </SectionCard>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="BILLING" className="space-y-6 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-4">
                     <SectionCard title="Active pass node" icon={<Gem className="text-amber-500" />}>
                        {profile.passStatus === 'active' ? (
                           <div className="space-y-8 py-4">
                              <div className="p-8 bg-[#0F172A] rounded-[2.5rem] text-center space-y-4 shadow-2xl relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-5"><Crown className="h-20 w-20 text-primary" /></div>
                                 <h4 className="text-2xl font-black text-white uppercase tracking-tight">{profile.pass?.plan || 'ELITE'}</h4>
                                 <Badge className="bg-emerald-500 text-white border-none px-4 py-1 uppercase font-black text-[9px]">Verified active</Badge>
                              </div>
                              <div className="space-y-6">
                                 <DataField label="Registry Date" value={new Date(profile.pass?.purchaseDate || Date.now()).toLocaleDateString()} />
                                 <DataField label="Expiry node" value={new Date(profile.passExpiresAt || Date.now()).toLocaleDateString()} />
                                 <Button onClick={() => handleAdminAction('REMOVE_PRO')} variant="ghost" className="w-full h-12 text-rose-500 hover:bg-rose-50 rounded-xl font-bold gap-3"><XCircle className="h-5 w-5" /> Void membership</Button>
                              </div>
                           </div>
                        ) : (
                           <div className="py-12 text-center space-y-6">
                              <Zap className="h-12 w-12 text-slate-200 mx-auto" />
                              <p className="font-bold text-slate-400">No active premium node</p>
                              <Button className="rounded-full bg-primary hover:bg-blue-700 text-white font-bold h-12 px-10">Grant premium access</Button>
                           </div>
                        )}
                     </SectionCard>
                  </div>
                  <div className="md:col-span-8">
                     <SectionCard title="Payment audit ledger" icon={<CreditCard className="text-primary" />}>
                        <div className="divide-y divide-slate-50">
                           {subscriptions && subscriptions.length > 0 ? subscriptions.map((s: any) => (
                              <div key={s.id} className="py-6 flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shadow-inner"><ShieldCheck className="h-5 w-5" /></div>
                                    <div>
                                       <p className="font-black text-[#0F172A] uppercase leading-none">{s.planName}</p>
                                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date(s.purchaseDate).toLocaleDateString()} • UTR: {s.paymentId?.slice(-8)}</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-xl font-black text-emerald-600 tabular-nums">₹{s.amount}</p>
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase">APPROVED</Badge>
                                 </div>
                              </div>
                           )) : <p className="py-10 text-center opacity-20 italic">No transaction nodes found</p>}
                        </div>
                     </SectionCard>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="ACTIVITY" className="space-y-6 animate-in fade-in duration-500">
               <SectionCard title="Session trail" icon={<Smartphone className="text-primary" />}>
                  <div className="space-y-4">
                     {sessions && sessions.length > 0 ? sessions.map((s: any) => (
                        <div key={s.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                           <div className="flex items-center gap-6">
                              <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center text-slate-300 shadow-sm"><Clock className="h-5 w-5" /></div>
                              <div>
                                 <p className="font-bold text-[#0F172A] uppercase leading-none">{s.activityType} HUB</p>
                                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date(s.startTime?.seconds * 1000).toLocaleString()}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <span className="text-lg font-black text-[#0F172A] tabular-nums tracking-tighter">{Math.round(s.durationSeconds / 60)}m</span>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                           </div>
                        </div>
                     )) : <p className="py-10 text-center opacity-20 italic">No session trails recorded</p>}
                  </div>
               </SectionCard>
            </TabsContent>
         </Tabs>
      </div>
      <Footer />
    </div>
  )
}

function AnalyticNode({ label, val, icon, color }: any) {
   return (
      <Card className="border-none shadow-xl bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 border border-slate-50 flex flex-col items-center justify-center text-center gap-3">
         <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 shadow-inner">{React.cloneElement(icon, { className: cn("h-5 w-5 md:h-6 md:w-6", color) })}</div>
         <div className="space-y-0.5 min-w-0 w-full">
            <p className="text-base md:text-3xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none">{val}</p>
            <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         </div>
      </Card>
   )
}

function SectionCard({ title, icon, children }: any) {
   return (
      <Card className="border-none shadow-xl rounded-[2.5rem] md:rounded-[3rem] bg-white overflow-hidden border border-slate-50">
         <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center gap-4">
               {icon}
               <CardTitle className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight antialiased uppercase">{title}</CardTitle>
            </div>
         </CardHeader>
         <CardContent className="p-8 md:p-12">
            {children}
         </CardContent>
      </Card>
   )
}

function DataField({ label, value, highlight, mono }: any) {
   return (
      <div className="space-y-1.5 text-left">
         <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{label}</p>
         <p className={cn(
            "text-sm md:text-lg font-bold leading-tight break-all",
            highlight ? "text-primary" : "text-slate-700",
            mono && "font-mono text-xs text-slate-400"
         )}>{value || "---"}</p>
      </div>
   )
}

function LearningMetric({ label, val, color }: any) {
   return (
      <div className="space-y-2 text-left">
         <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <span>{label}</span>
            <span className="text-[#0F172A]">{val}</span>
         </div>
         <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div className={cn("h-full transition-all duration-1000", color)} style={{ width: String(val).includes('%') ? val : '100%' }} />
         </div>
      </div>
   )
}
