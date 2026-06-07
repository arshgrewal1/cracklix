
"use client"

import { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  Trophy, 
  Target, 
  ClipboardList, 
  ShieldCheck,
  Zap,
  Activity,
  Edit,
  Save,
  TrendingUp,
  Award,
  History,
  User as UserIcon,
  ChevronRight
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import React from "react"

/**
 * @fileOverview Elite Aspirant Profile Hub v10.0.
 * Features: Mandatory Real-World Data (DOB, Address, Phone) with Admin Sync.
 */
export default function ProfilePage() {
  const { user, profile, loading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({
    name: "",
    phone: "",
    dob: "",
    address: "",
    targetExam: ""
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?returnUrl=/profile")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        phone: profile.phone || "",
        dob: profile.dob || "",
        address: profile.address || "",
        targetExam: profile.targetExam || ""
      })
    }
  }, [profile])

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid))
  }, [db, user])

  const { data: allResults, loading: resultsLoading } = useCollection<any>(resultsQuery)

  const results = useMemo(() => {
    if (!allResults) return []
    return [...allResults].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return timeB - timeA
    })
  }, [allResults])

  const stats = useMemo(() => {
    if (!results || results.length === 0) return { total: 0, avgAccuracy: 0, rank: "N/A" }
    const total = results.length
    const avgAccuracy = Math.round(results.reduce((acc: number, curr: any) => acc + (curr.accuracy || 0), 0) / total)
    return { total, avgAccuracy, rank: total > 5 ? "Top 12%" : "Audit Active" }
  }, [results])

  const handleUpdateProfile = async () => {
    if (!db || !user || !editForm) return

    // Strict Validation: Mandatory Fields
    const mandatory = ['name', 'phone', 'dob', 'address'];
    const missing = mandatory.find(key => !editForm[key]?.trim());
    
    if (missing) {
      toast({ variant: "destructive", title: "Update Blocked", description: `The field '${missing.toUpperCase()}' is mandatory for institutional records.` });
      return;
    }

    setIsSaving(true)
    try {
       await updateDoc(doc(db, "users", user.uid), {
          ...editForm,
          updatedAt: serverTimestamp()
       })
       toast({ title: "Registry Synced", description: "Your institutional details have been updated." })
       setIsEditing(false)
    } catch (e: any) {
       toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    } finally {
       setIsSaving(false)
    }
  }

  const memberSince = useMemo(() => {
     if (!profile?.createdAt) return "Registry Active";
     try {
        const date = new Date(profile.createdAt);
        if (isNaN(date.getTime())) return "Registry Node";
        return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
     } catch (e) {
        return "Active Hub";
     }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <Zap className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Syncing Aspirant Hub...</p>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-slate-50/50 font-body pb-32 text-left">
      <Navbar />
      
      <main className="w-full">
        {/* TESTBOOK STYLE HEADER */}
        <div className="bg-[#0B1528] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full" />
           <div className="container mx-auto px-4 md:px-6 max-w-6xl pt-8 md:pt-16 pb-16 md:pb-20">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 relative z-10">
                 <div className="relative group shrink-0">
                    <StudentAvatar 
                      profile={profile} 
                      className="h-24 w-24 md:h-32 md:w-32 border-4 border-white/10 rounded-[2.5rem] shadow-2xl relative bg-[#0F172A]" 
                    />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-6 w-6 md:h-8 md:w-8 rounded-lg border-4 border-[#0B1528] flex items-center justify-center shadow-xl">
                       <ShieldCheck className="h-3 w-3 md:h-4 md:w-4 text-white" />
                    </div>
                 </div>

                 <div className="flex-1 space-y-3 min-w-0 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                       <h1 className="text-2xl md:text-5xl font-headline font-black text-white uppercase tracking-tight truncate max-w-full">
                          {profile.name}
                       </h1>
                       <Badge className={cn(
                          "border-none text-[8px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-lg",
                          profile.status === 'Free' ? "bg-white/10 text-slate-300" : "bg-primary text-white"
                       )}>
                          {profile.status || 'Free'} Pass
                       </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
                       <HeaderInfo icon={<Mail className="h-3.5 w-3.5 text-primary" />} text={profile.email} />
                       <HeaderInfo icon={<Phone className="h-3.5 w-3.5 text-primary" />} text={profile.phone} />
                       <HeaderInfo icon={<GraduationCap className="h-3.5 w-3.5 text-primary" />} text={`Target: ${profile.targetExam || 'General Hub'}`} />
                    </div>
                 </div>

                 <div className="shrink-0 w-full md:w-auto pt-4 md:pt-0">
                    <Button onClick={() => setIsEditing(true)} className="w-full md:w-auto h-12 md:h-14 px-8 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-2xl">
                       <Edit className="h-4 w-4 text-primary" /> Modify Registry
                    </Button>
                 </div>
              </div>
           </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-6xl -mt-8 relative z-20">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
              
              {/* LEFT: PERFORMANCE & STATS */}
              <div className="lg:col-span-8 space-y-6 md:space-y-8">
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
                    <StatsCard icon={<ClipboardList />} label="TESTS ATTEMPTED" value={stats.total} color="text-blue-500" />
                    <StatsCard icon={<Target />} label="AVG ACCURACY" value={`${stats.avgAccuracy}%`} color="text-primary" />
                    <StatsCard icon={<Trophy />} label="STATE RANKING" value={stats.rank} color="text-emerald-500" className="hidden sm:flex" />
                 </div>

                 <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 md:p-10 space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                       <h3 className="font-headline font-black text-xl md:text-2xl uppercase flex items-center gap-4 text-[#0F172A]">
                          <UserIcon className="h-6 w-6 text-primary" /> Personal Repository
                       </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                       <ProfileDataNode icon={<Calendar className="text-blue-500" />} label="DATE OF BIRTH" value={profile.dob || "Audit Pending"} />
                       <ProfileDataNode icon={<Phone className="text-emerald-500" />} label="VERIFIED MOBILE" value={profile.phone || "Not Linked"} />
                       <ProfileDataNode icon={<MapPin className="text-rose-500" />} label="FULL CORRESPONDENCE ADDRESS" value={profile.address || "No address node synced"} colSpan={2} />
                       <ProfileDataNode icon={<ShieldCheck className="text-primary" />} label="REGISTRY STATUS" value={`${profile.role || 'STUDENT'} Node`} />
                       <ProfileDataNode icon={<Activity className="text-orange-500" />} label="MEMBER SINCE" value={memberSince} />
                    </div>
                 </Card>

                 {/* RECENT PERFORMANCE LIST */}
                 <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="p-8 md:p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                       <div className="space-y-1">
                          <CardTitle className="text-sm md:text-lg font-black uppercase tracking-tight text-[#0F172A] flex items-center gap-2">
                             <TrendingUp className="h-5 w-5 text-primary" /> Analysis History
                          </CardTitle>
                       </div>
                       <Button asChild variant="ghost" className="h-10 text-[9px] font-black uppercase tracking-widest text-primary gap-2">
                          <Link href="/dashboard">Full Audit <ChevronRight className="h-4 w-4" /></Link>
                       </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y divide-slate-50">
                          {resultsLoading ? (
                             Array.from({ length: 2 }).map((_, i) => <div key={i} className="p-8"><Skeleton className="h-12 w-full rounded-xl" /></div>)
                          ) : results.length > 0 ? (
                             results.slice(0, 3).map((r: any) => (
                                <Link key={r.id} href={`/results/${r.mockId}`} className="p-6 md:p-10 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                   <div className="flex items-center gap-6 min-w-0">
                                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                         <Zap className="h-6 w-6 text-primary" />
                                      </div>
                                      <div className="min-w-0">
                                         <p className="font-black text-[#0B1528] text-sm md:text-lg uppercase truncate leading-tight">{r.mockTitle}</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                                            {new Date(r.timestamp).toLocaleDateString()} • Accuracy: {r.accuracy}%
                                         </p>
                                      </div>
                                   </div>
                                   <ChevronRight className="h-5 w-5 text-slate-200" />
                                </Link>
                             ))
                          ) : (
                             <div className="p-20 text-center text-slate-300 font-bold uppercase text-xs">No attempt nodes synced.</div>
                          )}
                       </div>
                    </CardContent>
                 </Card>
              </div>

              {/* RIGHT: BILLING & QUICK ACTIONS */}
              <div className="lg:col-span-4 space-y-6 md:space-y-8">
                 <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tactical Access</h3>
                    <div className="space-y-4">
                       <Button asChild className="w-full h-14 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl gap-3">
                          <Link href="/pass"><CreditCard className="h-5 w-5 text-primary" /> Subscription Hub</Link>
                       </Button>
                       <Button asChild variant="outline" className="w-full h-14 border-slate-100 bg-slate-50/50 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-600 gap-3">
                          <Link href="/dashboard"><History className="h-5 w-5" /> Detailed History</Link>
                       </Button>
                    </div>
                 </Card>

                 <div className="bg-primary rounded-[3rem] p-10 text-white space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Award className="h-40 w-40" /></div>
                    <div className="relative z-10 space-y-4">
                       <h4 className="text-2xl font-headline font-black uppercase leading-tight">Mastery Index <br/> Sync High</h4>
                       <p className="text-white/70 text-[11px] font-bold uppercase tracking-tight">Your readiness audit is complete.</p>
                       <Button asChild className="w-full bg-white text-primary hover:bg-slate-100 font-black h-12 rounded-xl text-[10px] uppercase">
                          <Link href="/leaderboard">View Rankings</Link>
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <Footer />

      {/* EDIT REGISTRY DIALOG */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
         <DialogContent className="sm:max-w-2xl bg-white rounded-[2.5rem] border-none shadow-4xl p-0 overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <DialogHeader className="p-10 pb-4">
               <DialogTitle className="text-3xl font-black font-headline uppercase text-[#0F172A] flex items-center gap-4">
                  <ShieldCheck className="h-8 w-8 text-primary" /> Modify Audit Node
               </DialogTitle>
            </DialogHeader>
            <div className="px-10 pb-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Identity Name</Label>
                     <Input value={editForm?.name || ""} onChange={e => setEditForm({...editForm, name: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                  </div>
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Date of Birth</Label>
                     <Input type="date" value={editForm?.dob || ""} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                  </div>
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Verified Contact Node</Label>
                  <Input value={editForm?.phone || ""} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold" placeholder="10-digit number" />
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Permanent Correspondence Address</Label>
                  <Textarea value={editForm?.address || ""} onChange={e => setEditForm({...editForm, address: e.target.value})} className="min-h-[120px] rounded-xl bg-slate-50 border-none font-medium p-4 leading-relaxed" placeholder="Complete address for institutional records..." />
               </div>
            </div>
            <DialogFooter className="p-10 pt-4 bg-slate-50 flex gap-4">
               <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl h-14 font-black uppercase text-[10px] text-slate-400">Abort Audit</Button>
               <Button onClick={handleUpdateProfile} disabled={isSaving} className="bg-[#0F172A] hover:bg-black h-14 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest flex-1 shadow-xl">
                  {isSaving ? "Syncing..." : "Commit Changes"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function HeaderInfo({ icon, text }: { icon: React.ReactNode, text: string }) {
   return (
      <div className="flex items-center gap-3 text-white/60 font-bold uppercase text-[11px] tracking-tight">
         <span className="shrink-0">{icon}</span>
         <span className="truncate max-w-[240px]">{text || 'Pending'}</span>
      </div>
   )
}

function StatsCard({ icon, label, value, color, className }: any) {
   return (
      <Card className={cn("border-none shadow-lg rounded-[1.5rem] p-6 md:p-8 bg-white group hover:translate-y-[-4px] transition-all", className)}>
         <div className="flex flex-col gap-4">
            <div className={cn("h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center transition-all group-hover:scale-110", color.replace('text-', 'bg-').replace('500', '50'))}>
               {React.cloneElement(icon as React.ReactElement, { className: cn("h-5 w-5", color) })}
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
               <p className={cn("text-2xl md:text-4xl font-headline font-black leading-none", color)}>{value}</p>
            </div>
         </div>
      </Card>
   )
}

function ProfileDataNode({ icon, label, value, colSpan = 1 }: any) {
   return (
      <div className={cn("flex items-start gap-5", colSpan > 1 ? "md:col-span-2" : "")}>
         <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
            {React.cloneElement(icon, { className: "h-5 w-5" })}
         </div>
         <div className="min-w-0 space-y-1 text-left">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="text-sm md:text-base font-bold text-[#0F172A] leading-relaxed break-words uppercase">{value}</p>
         </div>
      </div>
   )
}
