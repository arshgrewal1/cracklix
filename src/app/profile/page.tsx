"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore, useAuth } from "@/firebase"
import { collection, query, where, doc, updateDoc, serverTimestamp, deleteDoc, getDocs, limit, orderBy } from "firebase/firestore"
import { deleteUser } from "firebase/auth"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
 * @fileOverview Institutional Profile Hub v30.0 [Ranking Rebuilt].
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
    return query(collection(db, "results"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(10))
  }, [db, user])

  const { data: results, loading: resultsLoading } = useCollection<any>(resultsQuery)

  const aggregateStats = useMemo(() => {
    if (!profile) return { totalTests: 0, highestScore: 0, avgAccuracy: 0, avgTime: 0, bestRank: "---" }
    
    // In a real high-scale system, we'd query aggregate collections
    // For now we use the values updated by AttemptClient
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
       toast({ title: "Profile Updated" })
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
        toast({ title: "Account Purged", description: "All data nodes have been deleted." });
        router.push('/login');
     } catch (e: any) {
        if (e.code === 'auth/requires-recent-login') {
           toast({ variant: "destructive", title: "Security Barrier", description: "Please re-login and try again immediately." });
        } else {
           toast({ variant: "destructive", title: "Deletion Failed" });
        }
     } finally {
        setIsSaving(false);
     }
  };

  if (loading) return null;

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 font-body pb-safe text-left">
      <Navbar />
      
      <main className="w-full">
        <div className="bg-[#0B1528] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full" />
           <div className="container mx-auto px-4 md:px-12 max-w-6xl pt-6 md:pt-16 pb-10 md:pb-24">
              <div className="flex flex-row items-center md:items-end gap-4 md:gap-12 relative z-10">
                 <div className="relative shrink-0">
                    {profileLoading ? (
                      <Skeleton className="h-16 w-16 md:h-44 md:w-44 rounded-2xl md:rounded-[3rem] bg-white/5" />
                    ) : (
                      <div className="relative">
                        <StudentAvatar profile={profile} className="h-16 w-16 md:h-44 md:w-44 border-[2px] md:border-[4px] border-white/10 rounded-2xl md:rounded-[3rem] bg-[#0F172A]" />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-5 w-5 md:h-12 md:w-12 rounded-lg border-[2px] md:border-[4px] border-[#0B1528] flex items-center justify-center text-white shadow-xl">
                          <ShieldCheck className="h-3 w-3 md:h-6 md:w-6 text-white" />
                        </div>
                      </div>
                    )}
                 </div>
                 <div className="flex-1 space-y-1.5 md:space-y-6 min-w-0 text-left">
                    {profileLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-8 md:h-16 w-3/4 bg-white/5 rounded-xl" />
                        <Skeleton className="h-4 md:h-6 w-1/2 bg-white/5 rounded-xl" />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-5">
                          <h1 className="text-xl md:text-7xl font-black text-white leading-none tracking-tight truncate max-w-full">
                             {profile?.name}
                          </h1>
                          <Badge className={cn("border-none text-[8px] md:text-[12px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-2xl shrink-0", profile?.status === 'Free' ? "bg-white/10 text-slate-300" : "bg-primary text-white")}>{profile?.status || 'Free'} Pass</Badge>
                        </div>
                        <div className="flex flex-wrap items-center justify-start gap-x-4 md:gap-x-10 gap-y-1">
                          <HeaderInfo icon={<Mail className="h-3.5 w-3.5 text-primary" />} text={profile?.email || ""} />
                          <HeaderInfo icon={<Phone className="h-3.5 w-3.5 text-primary" />} text={profile?.phone || "Not Added"} />
                          <HeaderInfo icon={<GraduationCap className="h-3.5 w-3.5 text-primary" />} text={profile?.targetExam || 'General'} />
                        </div>
                      </>
                    )}
                 </div>
              </div>
           </div>
        </div>

        <div className="container mx-auto px-3 md:px-6 lg:px-12 max-w-6xl -mt-6 md:-mt-12 relative z-20">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-12">
              <div className="lg:col-span-8 space-y-4 md:space-y-10">
                 
                 {/* ANALYTICS HUD */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    <StatsCard icon={<ClipboardList />} label="Tests" value={aggregateStats.totalTests} color="text-blue-500" bgColor="bg-blue-50" />
                    <StatsCard icon={<Target />} label="Accuracy" value={`${aggregateStats.avgAccuracy}%`} color="text-emerald-500" bgColor="bg-emerald-50" />
                    <StatsCard icon={<Trophy />} label="Peak Rank" value={aggregateStats.bestRank} color="text-amber-500" bgColor="bg-amber-50" />
                    <StatsCard icon={<Zap />} label="High Score" value={aggregateStats.highestScore.toFixed(1)} color="text-primary" bgColor="bg-primary/10" />
                 </div>

                 {/* RECENT ATTEMPTS HUB */}
                 <Card className="border-none shadow-3xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
                    <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                       <CardTitle className="text-xl font-black text-[#0F172A] flex items-center gap-3">
                          <History className="h-6 w-6 text-primary" /> Recent Attempts
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y divide-slate-50">
                          {resultsLoading ? (
                             Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                          ) : results && results.length > 0 ? (
                             results.map((res: any) => (
                                <Link key={res.id} href={`/results/view?id=${res.mockId}&attemptId=${res.attemptId}`} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all group">
                                   <div className="flex items-center gap-4 min-w-0">
                                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/5 transition-all"><Zap className="h-5 w-5" /></div>
                                      <div className="min-w-0">
                                         <p className="font-bold text-sm md:text-lg text-[#0F172A] truncate">{res.mockTitle}</p>
                                         <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tabular-nums">{new Date(res.timestamp).toLocaleDateString('en-GB')}</span>
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black px-2">Rank #{res.rankAtSubmission || '---'}</Badge>
                                         </div>
                                      </div>
                                   </div>
                                   <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                             ))
                          ) : (
                             <div className="py-20 text-center opacity-20 italic font-black uppercase text-sm">No attempts recorded</div>
                          )}
                       </div>
                    </CardContent>
                 </Card>

                 <Card className="border-none shadow-3xl rounded-[2.5rem] bg-white p-5 md:p-14 space-y-6 md:space-y-12 text-left border border-slate-100">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4 md:pb-10"><h3 className="font-headline font-black text-lg md:text-3xl uppercase flex items-center gap-3 md:gap-6 text-[#0F172A]"><UserIcon className="h-5 w-5 md:h-8 md:w-8 text-primary" /> Profile Details</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 md:gap-y-12">
                      <ProfileDataNode icon={Calendar} label="Date of Birth" value={profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : "Not Added"} />
                      <ProfileDataNode icon={Phone} label="Mobile Number" value={profile?.phone || "Not Added"} />
                      <ProfileDataNode icon={MapPin} label="Home Address" value={profile?.address || "Not Added"} colSpan={2} />
                      <ProfileDataNode icon={ShieldCheck} label="Account Type" value={`${profile?.role || 'Student'}`} />
                      <ProfileDataNode icon={Activity} label="Joined On" value={joinDate} />
                    </div>
                 </Card>
              </div>

              <div className="lg:col-span-4 space-y-4 md:space-y-10">
                 <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-5 md:p-12 space-y-6 md:space-y-10 border border-slate-100">
                    <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">Settings Hub</h3>
                    <div className="space-y-3 md:space-y-5">
                       <Button onClick={() => setIsEditing(true)} className="w-full h-12 md:h-18 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black uppercase text-[9px] md:text-[12px] tracking-widest shadow-xl transition-all active:scale-95 border-none gap-2"><Edit className="h-4 w-4 text-white" /> Edit Profile</Button>
                       <Button asChild variant="outline" className="w-full h-12 md:h-18 rounded-full font-black uppercase text-[9px] md:text-[12px] tracking-widest shadow-sm transition-all active:scale-95 border-2 gap-2"><Link href="/pass"><Gem className="h-4 w-4 text-primary" /> Elite Pass Hub</Link></Button>
                    </div>

                    <div className="pt-8 md:pt-12 border-t border-slate-50 space-y-4">
                       <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Persistence</p>
                       <Button onClick={() => setIsDeleting(true)} variant="ghost" className="w-full h-10 text-rose-500 hover:bg-rose-50 rounded-xl font-black uppercase text-[8px] tracking-widest transition-all gap-2"><Trash2 className="h-3.5 w-3.5" /> Delete My Account</Button>
                    </div>
                 </Card>

                 <Card className="border-none shadow-xl rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Award className="h-64 w-64 text-primary" /></div>
                    <div className="relative z-10 space-y-6">
                       <div className="space-y-1">
                          <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight uppercase">Certificates</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mastery Records</p>
                       </div>
                       <div className="h-40 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center p-6 gap-3">
                          <AlertCircle className="h-8 w-8 text-slate-500" />
                          <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed">No certificates awarded yet. Reach Rank #1 to earn.</p>
                       </div>
                    </div>
                 </Card>
              </div>
           </div>
        </div>
      </main>
      <Footer />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
         <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[95vh] bg-white rounded-3xl md:rounded-[3rem] border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0B1528] shrink-0" />
            <DialogHeader className="p-6 md:p-14 pb-3 md:pb-6 shrink-0">
               <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl md:text-4xl font-black font-headline uppercase text-[#0F172A] flex items-center gap-3 md:gap-6">
                     <ShieldCheck className="h-6 w-6 md:h-10 md:w-10 text-primary" /> Edit Profile
                  </DialogTitle>
                  <button onClick={() => setIsEditing(false)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"><X className="h-6 w-6 text-slate-400" /></button>
               </div>
            </DialogHeader>
            <div className="px-6 md:px-14 pb-6 md:pb-14 space-y-4 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-1.5 text-left"><Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Full Name</Label><Input value={editForm?.name || ""} onChange={e => setEditForm((prev: any) => ({...prev, name: e.target.value}))} className="h-12 md:h-16 rounded-xl bg-slate-50 border-none font-bold px-5" /></div>
                  <div className="space-y-1.5 text-left"><Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Email Address</Label><Input type="email" value={editForm?.email || ""} onChange={e => setEditForm((prev: any) => ({...prev, email: e.target.value}))} className="h-12 md:h-16 rounded-xl bg-slate-50 border-none font-bold px-5" /></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-1.5 text-left"><Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Date of Birth</Label><Input type="date" value={editForm?.dob || ""} onChange={e => setEditForm((prev: any) => ({...prev, dob: e.target.value}))} className="h-12 md:h-16 rounded-xl bg-slate-50 border-none font-bold px-5" /></div>
                  <div className="space-y-1.5 text-left"><Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Target Exam Hub</Label><select value={editForm?.targetExam || ""} onChange={e => setEditForm((prev: any) => ({...prev, targetExam: e.target.value}))} className="w-full h-12 md:h-16 rounded-xl bg-slate-50 border-none font-bold px-5 outline-none"><option value="PSSSB">PSSSB</option><option value="PPSC">PPSC</option><option value="Punjab Police">Punjab Police</option><option value="Army">Indian Army</option><option value="High Court">High Court</option></select></div>
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Mobile Number</Label>
                  <div className="relative">
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm md:text-lg font-black text-slate-400">+91</span>
                     <Input value={editForm?.phone || ""} onChange={e => setEditForm((prev: any) => ({...prev, phone: e.target.value.replace(/\D/g, '').slice(0,10)}))} className="h-12 md:h-16 pl-14 md:pl-20 rounded-xl bg-slate-50 border-none font-black text-base md:text-2xl" />
                  </div>
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Home Address</Label>
                  <Textarea value={editForm?.address || ""} onChange={e => setEditForm((prev: any) => ({...prev, address: e.target.value}))} className="min-h-[100px] rounded-xl bg-slate-50 border-none font-medium p-4 shadow-inner resize-none" />
               </div>
            </div>
            <DialogFooter className="p-6 md:p-14 pt-3 bg-slate-50 border-t border-slate-100 flex flex-row gap-4 items-center justify-between">
               <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-12 px-6 font-black uppercase text-[9px] text-slate-400">Cancel</Button>
               <Button onClick={handleUpdateProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 rounded-full font-black uppercase text-[10px] flex-1 shadow-3xl transition-all active:scale-95 gap-2">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Details</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
         <DialogContent className="max-w-md w-[95vw] bg-white rounded-3xl p-8 shadow-5xl border-none text-center">
            <div className="space-y-6">
               <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
                  <ShieldAlert className="h-8 w-8" />
               </div>
               <div className="space-y-2">
                  <DialogTitle className="text-2xl font-black uppercase text-rose-600">Delete Account</DialogTitle>
                  <DialogDescription className="text-slate-500 text-sm leading-relaxed">
                     This action is permanent. Type <strong>DELETE</strong> to authorize full registry purge.
                  </DialogDescription>
               </div>
               <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-slate-100 text-center font-black tracking-widest text-rose-500" placeholder="---" />
               <div className="flex gap-4 pt-2">
                  <Button variant="ghost" onClick={() => setIsDeleting(false)} className="flex-1 rounded-xl h-12 font-black uppercase text-[9px] text-slate-400">Cancel</Button>
                  <Button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || isSaving} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 font-black uppercase text-[9px] shadow-lg border-none active:scale-95 transition-all">Authorize Purge</Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function HeaderInfo({ icon, text }: { icon: React.ReactNode, text: string }) {
   return (<div className="flex items-center gap-2 text-white/60 font-bold text-[9px] md:text-[12px] tracking-tight"><span className="shrink-0">{icon}</span><span className="truncate max-w-[120px] md:max-w-[320px]">{text || 'Not Added'}</span></div>)
}

function StatsCard({ icon: Icon, label, value, color, bgColor, className }: { icon: React.ReactNode, label: string, value: string | number, color: string, bgColor: string, className?: string }) {
   return (
    <Card className={cn("border-none shadow-xl rounded-2xl md:rounded-[2rem] p-4 md:p-6 bg-white group hover:translate-y-[-4px] transition-all duration-500 border border-slate-100", className)}>
      <div className="flex flex-col items-center text-center gap-3">
        <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-inner", bgColor)}>
          {React.cloneElement(Icon as React.ReactElement, { className: cn("h-5 w-5 md:h-6 md:w-6", color) })}
        </div>
        <div className="space-y-0.5">
          <p className="text-[12px] md:text-3xl font-black text-[#0F172A] tabular-nums leading-none">{value}</p>
          <p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</p>
        </div>
      </div>
    </Card>
   )
}

function ProfileDataNode({ icon: Icon, label, value, colSpan = 1 }: { icon: LucideIcon, label: string, value: string, colSpan?: number }) {
   return (<div className={cn("flex items-start gap-4 md:gap-8", colSpan > 1 ? "md:col-span-2" : "")}><div className="h-10 w-10 md:h-16 md:w-16 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary/5 transition-colors"><Icon className="h-4 w-4 md:h-7 md:w-7 text-slate-400" /></div><div className="min-w-0 space-y-0.5 text-left"><p className="text-[8px] md:text-11px font-black uppercase tracking-widest text-slate-400">{label}</p><p className="text-[11px] md:text-xl font-bold text-[#0F172A] leading-relaxed break-words tracking-tight">{value}</p></div></div>)
}
