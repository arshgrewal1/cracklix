
"use client"

import React, { useMemo, useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useUser, useDoc, useCollection, useFirestore } from "@/firebase"
import { 
  doc, 
  collection, 
  query, 
  where, 
  updateDoc, 
  serverTimestamp, 
  deleteDoc, 
  orderBy, 
  limit,
  getDocs
} from "firebase/firestore"
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
  Loader2,
  CreditCard,
  Crown,
  BookOpen,
  ClipboardList,
  Settings,
  Trophy
} from "lucide-react"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

/**
 * @fileOverview Deep Institutional Aspirant Auditor v2.3.
 * FIXED: ReferenceError for 'results' and 'Trophy'.
 * FIXED: Bypassed Firebase Index Error by performing client-side sorting for Subscriptions and Sessions.
 */

export default function StudentDetailPage(props: { params: Promise<{ userId: string }> }) {
  const params = use(props.params);
  const userId = params.userId;
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // 1. Core Profile Sync
  const userRef = useMemo(() => (db ? doc(db, "users", userId) : null), [db, userId]);
  const { data: profile, loading: pLoading } = useDoc<any>(userRef);

  // 2. Aggregate Data Listeners (Index Resilient)
  const resultsQuery = useMemo(() => (db ? query(collection(db, "results"), where("userId", "==", userId)) : null), [db, userId]);
  const sessionsQuery = useMemo(() => (db ? query(collection(db, "users", userId, "study_sessions"), limit(100)) : null), [db, userId]);
  const subsQuery = useMemo(() => (db ? query(collection(db, "subscriptions"), where("userId", "==", userId)) : null), [db, userId]);

  const { data: rawResults, loading: rLoading } = useCollection<any>(resultsQuery);
  const { data: rawSessions } = useCollection<any>(sessionsQuery);
  const { data: rawSubscriptions } = useCollection<any>(subsQuery);

  // CLIENT-SIDE SORTING (Registry Integrity)
  const results = useMemo(() => {
    if (!rawResults) return [];
    return [...rawResults].sort((a, b) => {
      const tA = new Date(a.timestamp || 0).getTime();
      const tB = new Date(b.timestamp || 0).getTime();
      return tB - tA;
    });
  }, [rawResults]);

  const sortedSessions = useMemo(() => {
    if (!rawSessions) return [];
    return [...rawSessions].sort((a, b) => {
      const tA = a.startTime?.seconds || new Date(a.startTime || 0).getTime();
      const tB = b.startTime?.seconds || new Date(b.startTime || 0).getTime();
      return tB - tA;
    });
  }, [rawSessions]);

  const sortedSubscriptions = useMemo(() => {
    if (!rawSubscriptions) return [];
    return [...rawSubscriptions].sort((a, b) => {
      const tA = new Date(a.purchaseDate || 0).getTime();
      const tB = new Date(b.purchaseDate || 0).getTime();
      return tB - tA;
    });
  }, [rawSubscriptions]);

  const analytics = useMemo(() => {
    if (!results || results.length === 0) return { 
       attempted: 0, accuracy: 0, avgScore: 0, highestScore: 0, solved: 0, correct: 0, wrong: 0, timeSpent: 0 
    };
    
    const total = results.length;
    const correct = results.reduce((acc, r) => acc + (r.correctCount || 0), 0);
    const wrong = results.reduce((acc, r) => acc + (r.wrongCount || 0), 0);
    const attemptedQ = results.reduce((acc, r) => acc + (r.attemptedCount || 0), 0);
    const timeSpent = results.reduce((acc, r) => acc + (r.timeTaken || 0), 0);
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
      wrong,
      timeSpent: Math.round(timeSpent / 60) // in minutes
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
         toast({ title: `Account ${next === 'ACTIVE' ? 'Enabled' : 'Disabled'}` });
      } else if (action === 'VERIFY_EMAIL') {
         await updateDoc(ref, { emailVerified: true, updatedAt: serverTimestamp() });
         toast({ title: "Email Verified Manually" });
      } else if (action === 'REMOVE_PRO') {
         await updateDoc(ref, { 
           passStatus: 'none', 
           status: 'Free', 
           pass: { active: false, plan: 'Free', expiryDate: null },
           updatedAt: serverTimestamp() 
         });
         toast({ title: "Membership Reverted to Free" });
      }
    } catch (e) { toast({ variant: "destructive", title: "Action Failed" }); }
    finally { setIsProcessing(false); }
  }

  const formatTime = (totalMinutes: number) => {
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  if (pLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Loader2 className="h-10 w-10 text-primary animate-spin" />
       <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Audit Synchronizing...</p>
    </div>
  );

  if (!profile) return (
     <div className="h-screen flex flex-col items-center justify-center p-6 text-center space-y-10">
        <AlertCircle className="h-16 w-16 text-slate-200" />
        <div className="space-y-1">
           <h2 className="text-2xl font-black text-[#0F172A]">Aspirant Record Purged</h2>
           <p className="text-slate-500 font-medium">The requested UID is not present in the master registry.</p>
        </div>
        <Button onClick={() => router.push('/admin/users')} variant="outline" className="rounded-xl border-2 h-12">Back to Registry</Button>
     </div>
  );

  return (
    <div className="space-y-10 pb-32 text-left animate-in fade-in duration-700 pt-2 px-1">
      
      {/* 1. HEADER HUB */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="h-12 w-12 rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm shrink-0 cursor-pointer">
               <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="space-y-1">
               <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Deep Profile Audit</span>
               </div>
               <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter uppercase">{profile.name}</h1>
            </div>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <Button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none h-14 px-8 bg-[#0F172A] hover:bg-black text-white font-bold rounded-2xl shadow-xl gap-2 border-none">
               <Settings className="h-4 w-4" /> Edit Profile
            </Button>
            <Button onClick={() => handleAdminAction('TOGGLE_STATUS')} className={cn("h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl border-none", profile.status === 'SUSPENDED' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white")}>
               {profile.status === 'SUSPENDED' ? 'Activate account' : 'Suspended access'}
            </Button>
         </div>
      </div>

      {/* 2. ANALYTICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <AnalyticNode label="Total Attempts" val={analytics.attempted} icon={<ClipboardList className="text-blue-500" />} />
         <AnalyticNode label="Avg Accuracy" val={`${analytics.accuracy}%`} icon={<Target className="text-emerald-500" />} />
         <AnalyticNode label="Solved Questions" val={analytics.solved} icon={<Zap className="text-amber-500" />} />
         <AnalyticNode label="Peak Score" val={analytics.highestScore} icon={<Trophy className="text-primary" />} />
      </div>

      <Tabs defaultValue="PERSONAL" className="w-full space-y-8">
         <TabsList className="bg-slate-100 p-1.5 h-14 md:h-16 rounded-2xl flex w-full md:w-fit overflow-x-auto no-scrollbar gap-2">
            <TabsTrigger value="PERSONAL" className="rounded-xl px-10 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Identity Hub</TabsTrigger>
            <TabsTrigger value="ACADEMIC" className="rounded-xl px-10 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Learning Matrix</TabsTrigger>
            <TabsTrigger value="BILLING" className="rounded-xl px-10 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Subscription</TabsTrigger>
            <TabsTrigger value="ACTIVITY" className="rounded-xl px-10 font-black uppercase text-[10px] h-full data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Activity Logs</TabsTrigger>
         </TabsList>

         <TabsContent value="PERSONAL" className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-8">
                  <SectionCard title="Personal information" icon={<User className="text-primary" />}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <DataField label="Full Name" value={profile.name} />
                        <DataField label="Username / Handle" value={profile.username || "Not Set"} />
                        <DataField label="Email Address" value={profile.email} />
                        <DataField label="Mobile Number" value={profile.phone} />
                        <DataField label="Gender" value={profile.gender} />
                        <DataField label="Date of Birth" value={profile.dob} />
                        <DataField label="State Node" value={profile.state} />
                        <DataField label="District / City" value={`${profile.district || 'All'}, ${profile.city || 'Punjab'}`} />
                        <div className="md:col-span-2">
                           <DataField label="Permanent Address" value={profile.address} />
                        </div>
                     </div>
                  </SectionCard>
               </div>
               <div className="lg:col-span-4 space-y-8">
                  <SectionCard title="Security hub" icon={<ShieldCheck className="text-emerald-500" />}>
                     <div className="space-y-8">
                        <DataField label="User UID" value={profile.id} mono />
                        <DataField label="Institutional Role" value={profile.role} highlight />
                        <DataField label="Login Provider" value={profile.providerId || "Email Node"} />
                        <DataField label="Email Verified" value={profile.emailVerified ? "Yes" : "No"} />
                        <DataField label="Account Status" value={profile.status} />
                     </div>
                  </SectionCard>
               </div>
            </div>
         </TabsContent>

         <TabsContent value="ACADEMIC" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8">
                  <SectionCard title="Academic settings" icon={<GraduationCap className="text-blue-500" />}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <DataField label="Exam Category" value={profile.examCategory || "General State"} />
                        <DataField label="Preparation Target" value={profile.targetExam} />
                        <DataField label="Education Level" value={profile.education || "Bachelor's Degree"} />
                        <DataField label="Preferred Language" value={profile.preferredLanguage || "Bilingual"} />
                        <DataField label="Daily Study Goal" value={profile.dailyGoal || "2 Hours"} />
                        <div className="md:col-span-2">
                           <DataField label="Subscribed Subject Hubs" value={profile.pinnedExams?.join(', ') || "No active pins"} />
                        </div>
                     </div>
                  </SectionCard>
               </div>
               <div className="lg:col-span-4">
                  <SectionCard title="Mastery analytics" icon={<Activity className="text-orange-500" />}>
                     <div className="space-y-8">
                        <LearningMetric label="Precision Index" val={`${analytics.accuracy}%`} color="bg-emerald-500" />
                        <LearningMetric label="Correct Volume" val={analytics.correct} color="bg-blue-500" />
                        <LearningMetric label="Total Study Time" val={formatTime(analytics.timeSpent)} color="bg-primary" />
                        <DataField label="Current Rank Node" value={profile.bestRank || "Awaiting Data"} highlight />
                     </div>
                  </SectionCard>
               </div>
            </div>
         </TabsContent>

         <TabsContent value="BILLING" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-4">
                  <SectionCard title="Access tier" icon={<Gem className="text-amber-500" />}>
                     {profile.passStatus === 'active' ? (
                        <div className="space-y-8 py-6">
                           <div className="p-10 bg-[#0F172A] rounded-[2.5rem] text-center space-y-4 shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-5"><Crown className="h-24 w-24 text-primary" /></div>
                              <h4 className="text-3xl font-black text-white uppercase tracking-tight">{profile.pass?.plan || 'PRO PASS'}</h4>
                              <Badge className="bg-emerald-50 text-white border-none px-5 py-1.5 uppercase font-black text-[9px] shadow-xl">Verified Active</Badge>
                           </div>
                           <div className="space-y-6">
                              <DataField label="Activation Date" value={new Date(profile.pass?.purchaseDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} />
                              <DataField label="Expiry node" value={new Date(profile.passExpiresAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} />
                              <Button onClick={() => handleAdminAction('REMOVE_PRO')} variant="ghost" className="w-full h-14 text-rose-500 hover:bg-rose-50 rounded-2xl font-bold gap-3"><XCircle className="h-5 w-5" /> Void Membership</Button>
                           </div>
                        </div>
                     ) : (
                        <div className="py-20 text-center space-y-8 opacity-40">
                           <Lock className="h-16 w-16 text-slate-300 mx-auto" />
                           <p className="font-black text-xl text-[#0F172A] uppercase">Free Aspirant Hub</p>
                           <Button className="rounded-full bg-primary hover:bg-blue-700 text-white font-bold h-14 px-10 border-none shadow-xl">Upgrade to Elite</Button>
                        </div>
                     )}
                  </SectionCard>
               </div>
               <div className="lg:col-span-8">
                  <SectionCard title="Transaction ledger" icon={<CreditCard className="text-primary" />}>
                     <div className="divide-y divide-slate-100">
                        {sortedSubscriptions && sortedSubscriptions.length > 0 ? sortedSubscriptions.map((s: any) => (
                           <div key={s.id} className="py-8 flex items-center justify-between group hover:bg-slate-50 transition-all rounded-xl px-4 -mx-4">
                              <div className="flex items-center gap-6">
                                 <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-primary group-hover:text-white transition-all"><ShieldCheck className="h-6 w-6" /></div>
                                 <div>
                                    <p className="font-black text-[#0F172A] text-lg uppercase leading-none">{s.planName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest flex items-center gap-3">
                                       <Calendar className="h-3 w-3" /> {new Date(s.purchaseDate).toLocaleDateString()} 
                                       <span className="h-1 w-1 rounded-full bg-slate-200" />
                                       <Smartphone className="h-3 w-3" /> UTR: {s.paymentId?.slice(-12)}
                                    </p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-2xl font-black text-emerald-600 tabular-nums tracking-tighter">₹{s.amount}</p>
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase px-3 py-1 rounded shadow-sm mt-1">APPROVED</Badge>
                              </div>
                           </div>
                        )) : <div className="py-20 text-center opacity-20 italic font-black uppercase tracking-widest">No verified transaction nodes</div>}
                     </div>
                  </SectionCard>
               </div>
            </div>
         </TabsContent>

         <TabsContent value="ACTIVITY" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8">
                  <SectionCard title="Attempt ledger" icon={<History className="text-primary" />}>
                     <div className="divide-y divide-slate-100">
                        {results && results.length > 0 ? results.slice(0, 15).map((r: any) => (
                           <div key={r.id} className="py-6 flex items-center justify-between group hover:bg-slate-50 rounded-xl px-4 -mx-4 transition-all">
                              <div className="flex items-center gap-6">
                                 <div className="h-11 w-11 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all"><Zap className="h-5 w-5" /></div>
                                 <div>
                                    <p className="font-black text-[#0F172A] text-base uppercase leading-none">{r.mockTitle}</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest flex items-center gap-3">
                                       <Clock className="h-3 w-3" /> {new Date(r.timestamp).toLocaleString()}
                                       <span className="h-1 w-1 rounded-full bg-slate-200" />
                                       <Target className="h-3 w-3" /> {r.accuracy}% Accuracy
                                    </p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-xl font-black text-[#0F172A] tabular-nums tracking-tighter">{r.score}</p>
                                 <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Net Points</p>
                              </div>
                           </div>
                        )) : <div className="py-20 text-center opacity-20 italic">No attempt logs recorded</div>}
                     </div>
                  </SectionCard>
               </div>
               <div className="lg:col-span-4 space-y-8">
                  <SectionCard title="Lifecycle hub" icon={<Clock className="text-blue-500" />}>
                     <div className="space-y-8">
                        <DataField label="Account Created" value={new Date(profile.createdAt).toLocaleString()} />
                        <DataField label="Last Login Handshake" value={profile.lastLoginAt ? new Date(profile.lastLoginAt.seconds * 1000).toLocaleString() : "Never"} />
                        <DataField label="Last Seen Heartbeat" value={profile.lastSeen ? new Date(profile.lastSeen.seconds * 1000).toLocaleString() : "Offline"} />
                        <div className="pt-4 border-t border-slate-50">
                           <DataField label="Device Blueprint" value={profile.activeDeviceId || "Legacy Session"} mono />
                        </div>
                     </div>
                  </SectionCard>
               </div>
            </div>
         </TabsContent>
      </Tabs>

      <div className="flex items-center justify-center gap-4 text-slate-300 py-12 opacity-50">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Institutional Data Registry Audited</span>
      </div>
    </div>
  )
}

function AnalyticNode({ label, val, icon }: any) {
   return (
      <Card className="border-none shadow-xl bg-white rounded-[2rem] p-6 md:p-8 border border-slate-50 flex flex-col items-center justify-center text-center gap-4 group hover:translate-y-[-4px] transition-all">
         <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" }) : null}
         </div>
         <div className="space-y-0.5 min-w-0 w-full">
            <p className="text-xs md:text-xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none truncate">{val}</p>
            <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{label}</p>
         </div>
      </Card>
   )
}

function SectionCard({ title, icon, children }: any) {
   return (
      <Card className="border-none shadow-2xl rounded-2xl md:rounded-[3rem] bg-white overflow-hidden border border-slate-50">
         <CardHeader className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/30 text-left">
            <div className="flex items-center gap-5">
               <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0">{icon}</div>
               <CardTitle className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tighter uppercase antialiased">{title}</CardTitle>
            </div>
         </CardHeader>
         <CardContent className="p-8 md:p-14">
            {children}
         </CardContent>
      </Card>
   )
}

function DataField({ label, value, highlight = false, mono = false }: any) {
   return (
      <div className="space-y-1.5 text-left group">
         <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest group-hover:text-primary transition-colors">{label}</p>
         <p className={cn(
            "text-base md:text-xl font-bold leading-tight break-words antialiased",
            highlight ? "text-primary" : "text-[#0F172A]",
            mono && "font-mono text-xs text-slate-400 tracking-tight"
         )}>{value || "Not Provided"}</p>
      </div>
   )
}

function LearningMetric({ label, val, color }: any) {
   const numericVal = typeof val === 'string' ? parseInt(val) : val;
   return (
      <div className="space-y-3 text-left">
         <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            <span className="text-sm font-black text-[#0F172A] tabular-nums">{val}</span>
         </div>
         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
            <motion.div 
               initial={{ width: 0 }} 
               whileInView={{ width: typeof val === 'string' ? val : `${Math.min(100, (numericVal / 100) * 100)}%` }} 
               transition={{ duration: 1.5, ease: "easeOut" }} 
               className={cn("h-full rounded-full shadow-lg", color)} 
            />
         </div>
      </div>
   )
}

function Trophy({ className }: { className?: string }) {
   return <Award className={className} />;
}
