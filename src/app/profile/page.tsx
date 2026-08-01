"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore, useAuth } from "@/firebase"
import { collection, query, where, doc, updateDoc, serverTimestamp, deleteDoc, limit } from "firebase/firestore"
import { deleteUser } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Award,
  History,
  User as UserIcon,
  ChevronRight,
  CreditCard,
  Loader2,
  X,
  Gem,
  Smartphone,
  Trash2,
  CheckCircle2,
  Clock,
  LucideIcon,
  Timer,
  AlertCircle,
  ShieldAlert,
  TrendingUp,
  BarChart3
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

/**
 * @fileOverview Institutional Profile Hub v32.0.
 * FIXED: CardTitle import and removed orderBy to resolve Firebase Index Error.
 * COMPACT: Reduced card sizes and padding for higher information density.
 */

export default function ProfilePage() {
  const { user, profile, loading, profileLoading } = useUser()
  const db = useFirestore()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [editForm, setEditForm] = useState<any>({
    name: "", email: "", phone: "", dob: "", address: "", targetExam: ""
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push("/login?returnUrl=/profile")
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      const cleanPhone = profile.phone?.replace('+91 ', '') || ""
      setEditForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: cleanPhone,
        dob: profile.dob || "",
        address: profile.address || "",
        targetExam: profile.targetExam || ""
      })
    }
  }, [profile])

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    // Removed orderBy to bypass Firebase index requirement; sorting happens client-side
    return query(collection(db, "results"), where("userId", "==", user.uid), limit(50))
  }, [db, user])

  const { data: rawResults, loading: resultsLoading } = useCollection<any>(resultsQuery)

  const results = useMemo(() => {
    if (!rawResults) return []
    return [...rawResults].sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime()
      const timeB = new Date(b.timestamp || 0).getTime()
      return timeB - timeA
    }).slice(0, 10)
  }, [rawResults])

  const aggregateStats = useMemo(() => {
    if (!profile) return { totalTests: 0, highestScore: 0, avgAccuracy: 0, avgTime: 0, bestRank: "---" }
    return {
       totalTests: profile.totalTests || 0,
       highestScore: profile.highestScore || 0,
       avgAccuracy: profile.averageAccuracy || 0,
       avgTime: profile.averageTime || 0,
       bestRank: profile.bestRank ? `#${profile.bestRank}` : "---"
    }
  }, [profile]);

  const joinDate = useMemo(() => {
    if (!profile?.createdAt) return "---";
    try {
      const dateNode = profile.createdAt;
      const date = dateNode?.seconds ? new Date(dateNode.seconds * 1000) : new Date(dateNode);
      if (isNaN(date.getTime())) return "---";
      return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    } catch (e) { return "---"; }
  }, [profile?.createdAt]);

  const handleUpdateProfile = async () => {
    if (!db || !user || !editForm) return
    setIsSaving(true)
    try {
       const digits = editForm.phone.replace(/\D/g, '');
       const finalPhone = `+91 ${digits}`;
       await updateDoc(doc(db, "users", user.uid), { ...editForm, phone: finalPhone, updatedAt: serverTimestamp() })
       toast({ title: "Profile updated" })
       setIsEditing(false)
    } catch (e: any) {
       toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
       setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
     if (deleteConfirm !== 'DELETE' || !user || !db) return;
     setIsSaving(true);
     try {
        await deleteDoc(doc(db, 'users', user.uid));
        await deleteUser(user);
        toast({ title: "Account purged", description: "All data nodes have been deleted." });
        router.push('/login');
     } catch (e: any) {
        if (e.code === 'auth/requires-recent-login') {
           toast({ variant: "destructive", title: "Security barrier", description: "Please re-login and try again immediately." });
        } else {
           toast({ variant: "destructive", title: "Deletion failed" });
        }
     } finally {
        setIsSaving(false);
     }
  };

  if (loading) return null;

  return (
    <div className="min-h-[100dvh] bg-background font-body pb-safe text-left break-words">
      <Navbar />
      
      <main className="w-full">
        <div className="bg-[#0B1528] dark:bg-slate-950 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
           <div className="container mx-auto px-4 md:px-12 max-w-6xl pt-6 md:pt-16 pb-10 md:pb-20">
              <div className="flex flex-row items-center md:items-end gap-4 md:gap-12 relative z-10">
                 <div className="relative shrink-0">
                    {profileLoading ? (
                      <Skeleton className="h-16 w-16 md:h-32 md:w-32 rounded-2xl md:rounded-[2rem] bg-white/5" />
                    ) : (
                      <div className="relative">
                        <StudentAvatar profile={profile} className="h-16 w-16 md:h-32 md:w-32 border-[2px] border-white/10 rounded-2xl md:rounded-[2rem] bg-slate-900" />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-5 w-5 md:h-10 md:w-10 rounded-lg border-[2px] border-slate-900 flex items-center justify-center text-white shadow-xl">
                          <ShieldCheck className="h-3 w-3 md:h-5 md:w-5 text-white" />
                        </div>
                      </div>
                    )}
                 </div>
                 <div className="flex-1 space-y-1 min-w-0 text-left">
                    {profileLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-8 md:h-12 w-3/4 bg-white/5 rounded-xl" />
                        <Skeleton className="h-4 md:h-6 w-1/2 bg-white/5 rounded-xl" />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                          <h1 className="text-xl md:text-5xl font-black text-white leading-none tracking-tight truncate max-w-full">
                             {profile?.name}
                          </h1>
                          <Badge className={cn("border-none text-[8px] md:text-[11px] font-black px-3 py-0.5 rounded-full shadow-2xl shrink-0", profile?.status === 'Free' ? "bg-white/10 text-slate-300" : "bg-primary text-white")}>{profile?.status || 'Free'} pass</Badge>
                        </div>
                        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-1">
                          <HeaderInfo icon={<Mail className="h-3 w-3 text-primary" />} text={profile?.email || ""} />
                          <HeaderInfo icon={<Phone className="h-3 w-3 text-primary" />} text={profile?.phone || "Not added"} />
                          <HeaderInfo icon={<GraduationCap className="h-3 w-3 text-primary" />} text={profile?.targetExam || 'General'} />
                        </div>
                      </>
                    )}
                 </div>
              </div>
           </div>
        </div>

        <div className="container mx-auto px-3 md:px-6 lg:px-12 max-w-6xl -mt-6 md:-mt-10 relative z-20">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
              <div className="lg:col-span-8 space-y-4 md:space-y-8">
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <StatsCard icon={<ClipboardList />} label="Tests" value={aggregateStats.totalTests} color="text-blue-500" bgColor="bg-blue-50" />
                    <StatsCard icon={<Target />} label="Accuracy" value={`${aggregateStats.avgAccuracy}%`} color="text-emerald-500" bgColor="bg-emerald-50" />
                    <StatsCard icon={<Trophy />} label="Peak rank" value={aggregateStats.bestRank} color="text-amber-500" bgColor="bg-amber-50" />
                    <StatsCard icon={<Zap />} label="High score" value={aggregateStats.highestScore.toFixed(1)} color="text-primary" bgColor="bg-primary/10" />
                 </div>

                 <Card className="border-none shadow-xl rounded-2xl bg-card overflow-hidden border border-border">
                    <CardHeader className="p-5 md:p-8 border-b border-border bg-muted/30">
                       <CardTitle className="text-lg md:text-xl font-black text-foreground flex items-center gap-3 tracking-tighter">
                          <History className="h-5 w-5 text-primary" /> Recent attempts
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y divide-border">
                          {resultsLoading ? (
                             Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full bg-muted" />)
                          ) : results && results.length > 0 ? (
                             results.map((res: any) => (
                                <Link key={res.id} href={`/results/view?id=${res.mockId}&attemptId=${res.attemptId}`} className="flex items-center justify-between p-4 md:p-6 hover:bg-muted/50 transition-all group">
                                   <div className="flex items-center gap-4 min-w-0">
                                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all shadow-inner"><Zap className="h-4 w-4" /></div>
                                      <div className="min-w-0">
                                         <p className="font-bold text-sm md:text-base text-foreground truncate tracking-tight">{res.mockTitle}</p>
                                         <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-bold text-muted-foreground tabular-nums">{new Date(res.timestamp).toLocaleDateString('en-GB')}</span>
                                            <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-none text-[7px] font-black px-1.5">Score: {res.score}</Badge>
                                         </div>
                                      </div>
                                   </div>
                                   <ChevronRight className="h-4 w-4 text-muted-foreground opacity-20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                             ))
                          ) : (
                             <div className="py-10 text-center opacity-20 italic font-black text-sm">No attempts recorded</div>
                          )}
                       </div>
                    </CardContent>
                 </Card>

                 <Card className="border-none shadow-xl rounded-2xl bg-card p-5 md:p-10 space-y-6 text-left border border-border">
                    <div className="flex items-center justify-between border-b border-border pb-4 md:pb-6">
                      <h3 className="font-black text-lg md:text-2xl flex items-center gap-3 text-foreground tracking-tighter">
                        <UserIcon className="h-5 w-5 md:h-7 md:w-7 text-primary" /> Profile details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                      <ProfileDataNode icon={Calendar} label="Date of birth" value={profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : "Not added"} />
                      <ProfileDataNode icon={Phone} label="Mobile number" value={profile?.phone || "Not added"} />
                      <ProfileDataNode icon={MapPin} label="Home address" value={profile?.address || "Not added"} colSpan={2} />
                      <ProfileDataNode icon={ShieldCheck} label="Account type" value={`${profile?.role || 'Student'}`} />
                      <ProfileDataNode icon={Activity} label="Joined on" value={joinDate} />
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-4 space-y-4 md:space-y-8">
                 <Card className="border-none shadow-xl rounded-2xl bg-card p-5 md:p-8 space-y-6 border border-border">
                    <h3 className="text-[10px] font-black tracking-tight text-muted-foreground uppercase">Settings hub</h3>
                    <div className="space-y-2 md:space-y-3">
                       <Button onClick={() => setIsEditing(true)} className="w-full h-11 md:h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] md:text-[11px] tracking-tight shadow-xl transition-all active:scale-95 border-none gap-2"><Edit className="h-4 w-4 text-white" /> Edit profile</Button>
                       <Button asChild variant="outline" className="w-full h-11 md:h-14 rounded-full font-black text-[10px] md:text-[11px] tracking-tight shadow-sm transition-all active:scale-95 border-2 gap-2"><Link href="/pass"><Gem className="h-4 w-4 text-primary" /> Elite pass hub</Link></Button>
                    </div>

                    <div className="pt-6 border-t border-border space-y-3">
                       <p className="text-[8px] font-black text-muted-foreground tracking-tight uppercase">Account persistence</p>
                       <Button onClick={() => setIsDeleting(true)} variant="ghost" className="w-full h-9 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-[8px] tracking-tight transition-all gap-2"><Trash2 className="h-3.5 w-3.5" /> Delete my account</Button>
                    </div>
                 </Card>

                 <Card className="border-none shadow-xl rounded-2xl bg-[#0F172A] text-white p-6 md:p-10 space-y-6 relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Award className="h-48 w-48 text-primary" /></div>
                    <div className="relative z-10 space-y-6">
                       <div className="space-y-1">
                          <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight">Certificates</h3>
                          <p className="text-[10px] font-bold text-slate-500 tracking-tight uppercase">Mastery records</p>
                       </div>
                       <div className="h-32 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center p-4 gap-3">
                          <AlertCircle className="h-6 w-6 text-slate-500" />
                          <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">No certificates awarded yet.</p>
                       </div>
                    </div>
                 </Card>
              </div>
           </div>
        </div>
      </main>
      <Footer />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
         <DialogContent className="sm:max-w-xl w-[95vw] max-h-[90vh] bg-card rounded-2xl border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-1.5 w-full bg-[#0B1528] shrink-0" />
            <DialogHeader className="p-6 md:p-10 pb-2 md:pb-4 shrink-0">
               <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl md:text-3xl font-black text-foreground flex items-center gap-3 tracking-tighter">
                     <ShieldCheck className="h-5 w-5 md:h-7 md:w-7 text-primary" /> Edit profile
                  </DialogTitle>
                  <button onClick={() => setIsEditing(false)} className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer border-none bg-transparent text-muted-foreground"><X className="h-5 w-5" /></button>
               </div>
            </DialogHeader>
            <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left"><Label className="text-[9px] font-black text-muted-foreground ml-1 uppercase">Full name</Label><Input value={editForm?.name || ""} onChange={e => setEditForm((prev: any) => ({...prev, name: e.target.value}))} className="h-11 md:h-12 rounded-xl bg-muted border-none font-bold px-4" /></div>
                  <div className="space-y-1 text-left"><Label className="text-[9px] font-black text-muted-foreground ml-1 uppercase">Email address</Label><Input type="email" value={editForm?.email || ""} onChange={e => setEditForm((prev: any) => ({...prev, email: e.target.value}))} className="h-11 md:h-12 rounded-xl bg-muted border-none font-bold px-4" /></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left"><Label className="text-[9px] font-black text-muted-foreground ml-1 uppercase">Date of birth</Label><Input type="date" value={editForm?.dob || ""} onChange={e => setEditForm((prev: any) => ({...prev, dob: e.target.value}))} className="h-11 md:h-12 rounded-xl bg-muted border-none font-bold px-4" /></div>
                  <div className="space-y-1 text-left"><Label className="text-[9px] font-black text-muted-foreground ml-1 uppercase">Target exam hub</Label><select value={editForm?.targetExam || ""} onChange={e => setEditForm((prev: any) => ({...prev, targetExam: e.target.value}))} className="w-full h-11 md:h-12 rounded-xl bg-muted border-none font-bold px-4 outline-none text-foreground"><option value="PSSSB">PSSSB</option><option value="PPSC">PPSC</option><option value="Punjab Police">Punjab Police</option><option value="Army">Indian Army</option><option value="High Court">High Court</option></select></div>
               </div>
               <div className="space-y-1 text-left">
                  <Label className="text-[9px] font-black text-muted-foreground ml-1 uppercase">Mobile number</Label>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs md:text-sm font-black text-muted-foreground/40">+91</span>
                     <Input value={editForm?.phone || ""} onChange={e => setEditForm((prev: any) => ({...prev, phone: e.target.value.replace(/\D/g, '').slice(0,10)}))} className="h-11 md:h-12 pl-12 md:pl-14 rounded-xl bg-muted border-none font-black text-sm md:text-base" />
                  </div>
               </div>
               <div className="space-y-1 text-left">
                  <Label className="text-[9px] font-black text-muted-foreground ml-1 uppercase">Home address</Label>
                  <Textarea value={editForm?.address || ""} onChange={e => setEditForm((prev: any) => ({...prev, address: e.target.value}))} className="min-h-[80px] rounded-xl bg-muted border-none font-medium p-3 shadow-inner resize-none text-sm" />
               </div>
            </div>
            <DialogFooter className="p-5 md:p-8 bg-muted border-t border-border flex flex-row gap-3 items-center justify-between">
               <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-10 px-5 font-black text-[9px] text-muted-foreground border-none uppercase">Cancel</Button>
               <Button onClick={handleUpdateProfile} disabled={isSaving} className="bg-primary hover:bg-blue-700 text-white h-10 md:h-12 px-6 rounded-full font-black text-[10px] flex-1 shadow-3xl transition-all active:scale-95 gap-2 uppercase">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save details</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
         <DialogContent className="max-w-md w-[95vw] bg-card rounded-2xl p-6 shadow-5xl border border-border text-center">
            <div className="space-y-6">
               <div className="h-14 w-14 bg-rose-50 dark:bg-rose-950/30 rounded-xl flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
                  <ShieldAlert className="h-7 w-7" />
               </div>
               <div className="space-y-1">
                  <DialogTitle className="text-xl font-black text-rose-600 tracking-tighter">Delete account</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
                     This action is permanent. Type <strong>DELETE</strong> to authorize registry purge.
                  </DialogDescription>
               </div>
               <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} className="h-11 rounded-xl bg-muted border-border text-center font-black tracking-widest text-rose-500 uppercase" placeholder="---" />
               <div className="flex gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setIsDeleting(false)} className="flex-1 rounded-xl h-11 font-black text-[9px] text-muted-foreground uppercase">Cancel</Button>
                  <Button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || isSaving} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 font-black text-[9px] shadow-lg border-none active:scale-95 transition-all uppercase">Authorize purge</Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function HeaderInfo({ icon, text }: { icon: React.ReactNode, text: string }) {
   return (<div className="flex items-center gap-2 text-white/60 font-bold text-[9px] md:text-[11px] tracking-tight shrink-0"><span className="shrink-0">{icon}</span><span className="truncate max-w-[100px] md:max-w-[280px]">{text || 'Not added'}</span></div>)
}

function StatsCard({ icon: Icon, label, value, color, bgColor, className }: { icon: React.ReactNode, label: string, value: string | number, color: string, bgColor: string, className?: string }) {
   return (
    <Card className={cn("border-none shadow-lg rounded-xl md:rounded-2xl p-3 md:p-5 bg-card group transition-all duration-500 border border-border flex-1", className)}>
      <div className="flex flex-col items-center text-center gap-2">
        <div className={cn("h-8 w-8 md:h-11 md:w-11 rounded-lg flex items-center justify-center shadow-inner shrink-0", bgColor)}>
          {React.cloneElement(Icon as React.ReactElement, { className: cn("h-4 w-4 md:h-6 md:w-6", color) })}
        </div>
        <div className="space-y-0.5 min-w-0 w-full">
          <p className="text-sm md:text-2xl font-black text-foreground tabular-nums tracking-tighter leading-none truncate">{value}</p>
          <p className="text-[7px] md:text-[8px] font-black tracking-tight text-muted-foreground uppercase mt-1 truncate">{label}</p>
        </div>
      </div>
    </Card>
   )
}

function ProfileDataNode({ icon: Icon, label, value, colSpan = 1 }: { icon: LucideIcon, label: string, value: string, colSpan?: number }) {
   return (<div className={cn("flex items-start gap-4 md:gap-6 min-w-0", colSpan > 1 ? "md:col-span-2" : "")}><div className="h-9 w-9 md:h-12 md:w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary/5 transition-colors"><Icon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" /></div><div className="min-w-0 space-y-0.5 text-left"><p className="text-[7px] md:text-[9px] font-black tracking-tight text-muted-foreground uppercase">{label}</p><p className="text-xs md:text-lg font-bold text-foreground leading-relaxed break-words tracking-tight antialiased">{value}</p></div></div>)
}
