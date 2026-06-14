"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore"
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
  Gem
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Student Profile Center v21.3 (Hardened).
 * FIXED: Corrected setEditForm reference in profile dialog.
 */
export default function ProfilePage() {
  const { user, profile, loading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({
    name: "",
    email: "",
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
    return query(collection(db, "results"), where("userId", "==", user.uid))
  }, [db, user])

  const { data: allResults, loading: resultsLoading } = useCollection<any>(resultsQuery)

  const results = useMemo(() => {
    if (!allResults) return []
    return [...allResults].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [allResults])

  const stats = useMemo(() => {
    if (!results || results.length === 0) return { total: 0, avgAccuracy: 0, rank: "N/A" }
    const total = results.length
    const avgAccuracy = Math.round(results.reduce((acc: number, curr: any) => acc + (curr.accuracy || 0), 0) / total)
    return { total, avgAccuracy, rank: total > 5 ? "Top 12%" : "Live Rank" }
  }, [results])

  const handleUpdateProfile = async () => {
    if (!db || !user || !editForm) return

    const mandatory = ['name', 'email', 'phone', 'dob', 'address', 'targetExam'];
    const missing = mandatory.find(key => !editForm[key]?.trim());
    
    if (missing) {
      toast({ 
        variant: "destructive", 
        title: "Details Missing", 
        description: `Please enter your ${missing === 'targetExam' ? 'Target Board' : missing.toUpperCase()}.` 
      });
      return;
    }

    if (editForm.phone.replace(/\D/g, '').length < 10) {
      toast({ variant: "destructive", title: "Invalid Number", description: "Enter a 10-digit mobile number." });
      return;
    }

    setIsSaving(true)
    try {
       const digits = editForm.phone.replace(/\D/g, '');
       const finalPhone = `+91 ${digits}`;
       
       await updateDoc(doc(db, "users", user.uid), {
          ...editForm,
          phone: finalPhone,
          updatedAt: serverTimestamp()
       })
       toast({ title: "Details Saved", description: "Your profile has been updated." })
       setIsEditing(false)
    } catch (e: any) {
       toast({ variant: "destructive", title: "Save Failed", description: e.message })
    } finally {
       setIsSaving(false)
    }
  }

  const formatPhone = (phone: string) => {
    if (!phone) return "Not Added";
    if (phone.startsWith('+91')) return phone;
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `+91 ${digits}`;
    return phone;
  };

  const formatDOB = (dob: string) => {
    if (!dob) return "Not Added";
    const parts = dob.split('-'); 
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dob;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Loading Profile...</p>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-slate-50/50 font-body pb-32 text-left">
      <Navbar />
      
      <main className="w-full">
        <div className="bg-[#0B1528] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full" />
           <div className="container mx-auto px-4 md:px-6 max-w-6xl pt-6 md:pt-16 pb-12 md:pb-20">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-10 relative z-10">
                 <div className="relative group shrink-0">
                    <StudentAvatar profile={profile} className="h-20 w-20 md:h-32 md:w-32 border-[3px] border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative bg-[#0F172A]" />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-5 w-5 md:h-8 md:w-8 rounded-lg border-4 border-[#0B1528] flex items-center justify-center shadow-xl">
                       <ShieldCheck className="h-2.5 w-2.5 md:h-4 md:w-4 text-white" />
                    </div>
                 </div>
                 <div className="flex-1 space-y-2 md:space-y-3 min-w-0 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                       <h1 className="text-xl md:text-5xl font-headline font-black text-white uppercase tracking-tight truncate max-w-full">{profile.name}</h1>
                       <Badge className={cn("border-none text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-lg", profile.status === 'Free' ? "bg-white/10 text-slate-300" : "bg-primary text-white")}>{profile.status || 'Free'} Pass</Badge>
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 md:gap-x-6 gap-y-1.5">
                       <HeaderInfo icon={<Mail className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />} text={profile.email} />
                       <HeaderInfo icon={<Phone className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />} text={formatPhone(profile.phone)} />
                       <HeaderInfo icon={<GraduationCap className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />} text={`Target: ${profile.targetExam || 'General'}`} />
                    </div>
                 </div>
                 <div className="shrink-0 w-full md:w-auto pt-3 md:pt-0 flex flex-col sm:flex-row gap-2 md:gap-3">
                    <Button onClick={() => setIsEditing(true)} className="h-10 md:h-14 px-6 md:px-8 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest gap-2 shadow-2xl"><Edit className="h-3.5 w-3.5 text-primary" /> Edit</Button>
                    <Button asChild className="h-10 md:h-14 px-6 md:px-8 bg-primary hover:bg-orange-600 text-white rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest gap-2 shadow-2xl border-none"><Link href="/pass"><Gem className="h-3.5 w-3.5" /> Upgrade</Link></Button>
                 </div>
              </div>
           </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-6xl -mt-6 relative z-20">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-10">
              <div className="lg:col-span-8 space-y-5 md:space-y-8">
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-6">
                    <StatsCard icon={<ClipboardList />} label="TESTS DONE" value={stats.total} color="text-blue-500" bgColor="bg-blue-50" />
                    <StatsCard icon={<Target />} label="AVG ACCURACY" value={`${stats.avgAccuracy}%`} color="text-primary" bgColor="bg-primary/10" />
                    <StatsCard icon={<Trophy />} label="RANK" value={stats.rank} color="text-emerald-500" bgColor="bg-emerald-50" className="hidden sm:flex" />
                 </div>
                 <Card className="border-none shadow-xl rounded-[2rem] md:rounded-[2.5rem] bg-white p-6 md:p-10 space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4 md:pb-6"><h3 className="font-headline font-black text-lg md:text-2xl uppercase flex items-center gap-3 md:gap-4 text-[#0F172A]"><UserIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" /> My Profile</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                       <ProfileDataNode icon={<Calendar className="text-blue-500" />} label="DATE OF BIRTH" value={formatDOB(profile.dob)} />
                       <ProfileDataNode icon={<Phone className="text-emerald-500" />} label="MOBILE NUMBER" value={formatPhone(profile.phone)} />
                       <ProfileDataNode icon={<MapPin className="text-rose-500" />} label="HOME ADDRESS" value={profile.address || "Not Added"} colSpan={2} />
                       <ProfileDataNode icon={<ShieldCheck className="text-primary" />} label="ACCOUNT TYPE" value={`${profile.role || 'STUDENT'}`} />
                       <ProfileDataNode icon={<Activity className="text-orange-500" />} label="JOINED" value={new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} />
                    </div>
                 </Card>
                 <Card className="border-none shadow-xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="p-6 md:p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                       <h3 className="text-[11px] md:text-lg font-black uppercase tracking-tight text-[#0F172A] flex items-center gap-2"><History className="h-4 w-4 md:h-5 md:w-5 text-primary" /> History</h3>
                       <Button asChild variant="ghost" className="h-8 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-primary gap-1"><Link href="/dashboard">View All <ChevronRight className="h-3 w-3" /></Link></Button>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y divide-slate-50">
                          {resultsLoading ? (Array.from({ length: 2 }).map((_, i) => <div key={i} className="p-6"><Skeleton className="h-10 w-full rounded-xl" /></div>)) : results.length > 0 ? (results.slice(0, 3).map((r: any) => (<Link key={r.id} href={`/results/${r.mockId}`} className="p-5 md:p-10 flex items-center justify-between hover:bg-slate-50/50 transition-colors"><div className="flex items-center gap-4 md:gap-6 min-w-0"><div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0"><Zap className="h-4 w-4 md:h-6 md:w-6 text-primary" /></div><div className="min-w-0 space-y-1"><p className="font-black text-[#0B1528] text-xs md:text-lg uppercase truncate leading-none">{r.mockTitle}</p><p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(r.timestamp).toLocaleDateString()} • {r.accuracy}%</p></div></div><ChevronRight className="h-4 w-4 text-slate-200" /></Link>))) : (<div className="p-12 text-center text-slate-300 font-bold uppercase text-[10px]">No activity found.</div>)}
                       </div>
                    </CardContent>
                 </Card>
              </div>
              <div className="lg:col-span-4 space-y-5 md:space-y-8">
                 <Card className="border-none shadow-xl rounded-[2rem] bg-white p-6 md:p-8 space-y-6 md:space-y-8">
                    <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Quick Actions</h3>
                    <div className="space-y-3 md:space-y-4">
                       <Button asChild className="w-full h-11 md:h-14 bg-[#0F172A] hover:bg-black text-white rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-xl gap-2"><Link href="/pass"><CreditCard className="h-4 w-4 text-primary" /> Unlock Elite Pass</Link></Button>
                       <Button asChild variant="outline" className="w-full h-11 md:h-14 border-slate-100 bg-slate-50/50 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest text-slate-600 gap-2"><Link href="/dashboard"><History className="h-4 w-4" /> Global Report</Link></Button>
                    </div>
                 </Card>
                 <div className="bg-primary rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 text-white space-y-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform" style={{ transitionDuration: '2000ms' }}><Award className="h-32 w-32 md:h-40 md:w-40" /></div>
                    <div className="relative z-10 space-y-3 md:space-y-4">
                       <h4 className="text-xl md:text-2xl font-headline font-black uppercase leading-tight">State <br/> Rankings</h4>
                       <p className="text-white/70 text-[9px] md:text-[11px] font-bold uppercase tracking-tight">Compare with toppers.</p>
                       <Button asChild className="w-full mt-4 md:mt-8 bg-white text-primary hover:bg-slate-50 font-black h-10 md:h-12 rounded-xl text-[9px] md:text-[10px] uppercase shadow-lg"><Link href="/leaderboard">See rankings</Link></Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
      <Footer />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
         <DialogContent className="sm:max-w-xl w-[95vw] max-h-[90vh] bg-white rounded-[2.5rem] border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-1.5 w-full bg-[#0B1528] shrink-0" />
            <DialogHeader className="p-6 md:p-8 pb-2 md:pb-4 shrink-0">
               <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl md:text-3xl font-black font-headline uppercase text-[#0F172A] flex items-center gap-4">
                     <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Edit Profile
                  </DialogTitle>
                  <DialogDescription className="sr-only">Update your personal information to maintain an accurate preparation registry.</DialogDescription>
                  <button onClick={() => setIsEditing(false)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"><X className="h-5 w-5 text-slate-400" /></button>
               </div>
            </DialogHeader>
            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-4 md:space-y-5 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Full Name</Label>
                     <Input value={editForm?.name || ""} onChange={e => setEditForm(prev => ({...prev, name: e.target.value}))} className="h-10 md:h-11 rounded-xl bg-slate-50 border-none font-bold text-xs md:text-sm" />
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Email Address</Label>
                     <Input type="email" value={editForm?.email || ""} onChange={e => setEditForm(prev => ({...prev, email: e.target.value}))} className="h-10 md:h-11 rounded-xl bg-slate-50 border-none font-bold text-xs md:text-sm" />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Date of Birth</Label>
                     <Input type="date" value={editForm?.dob || ""} onChange={e => setEditForm(prev => ({...prev, dob: e.target.value}))} className="h-10 md:h-11 rounded-xl bg-slate-50 border-none font-bold text-xs md:text-sm" />
                  </div>
                  <div className="space-y-1.5 text-left">
                     <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Target Exam Board</Label>
                     <select value={editForm?.targetExam || ""} onChange={e => setEditForm(prev => ({...prev, targetExam: e.target.value}))} className="w-full h-10 md:h-11 rounded-xl bg-slate-50 border-none font-bold text-xs md:text-sm px-4 outline-none"><option value="" disabled>Select Board</option><option value="PSSSB">PSSSB</option><option value="PPSC">PPSC</option><option value="Punjab Police">Punjab Police</option><option value="Army">Indian Army</option><option value="High Court">High Court</option></select></div>
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Mobile Number</Label>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs md:text-sm font-black text-slate-400">+91</span>
                     <Input value={editForm?.phone || ""} onChange={e => setEditForm(prev => ({...prev, phone: e.target.value.replace(/\D/g, '').slice(0,10)}))} className="h-10 md:h-11 pl-12 md:pl-14 rounded-xl bg-slate-50 border-none font-black text-base md:text-lg tracking-wider" placeholder="10-digit number" />
                  </div>
               </div>
               <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Home Address</Label>
                  <Textarea value={editForm?.address || ""} onChange={e => setEditForm(prev => ({...prev, address: e.target.value}))} className="min-h-[80px] md:min-h-[120px] rounded-2xl bg-slate-50 border-none font-medium p-3 md:p-4 text-[11px] md:text-sm leading-relaxed shadow-inner resize-none" placeholder="Enter your full home address..." />
               </div>
            </div>
            <DialogFooter className="p-5 md:p-8 pt-3 md:pt-6 bg-slate-50 border-t border-slate-100 shrink-0 flex flex-row gap-3 md:gap-4 items-center justify-between">
               <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-10 md:h-14 px-4 md:px-8 font-black uppercase text-[8px] md:text-[10px] text-slate-400 tracking-widest hover:text-slate-900 transition-colors">Cancel</Button>
               <Button onClick={handleUpdateProfile} disabled={isSaving} className="bg-primary hover:bg-orange-600 text-white h-10 md:h-14 px-6 md:px-12 rounded-xl font-black uppercase text-[9px] md:text-[11px] tracking-[0.2em] flex-1 shadow-xl transition-all active:scale-95 gap-2">{isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save Profile</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function HeaderInfo({ icon, text }: { icon: React.ReactNode, text: string }) {
   return (<div className="flex items-center gap-2 text-white/60 font-bold uppercase text-[9px] md:text-[11px] tracking-tight"><span className="shrink-0">{icon}</span><span className="truncate max-w-[180px] md:max-w-[240px]">{text || 'Not Added'}</span></div>)
}
function StatsCard({ icon, label, value, color, bgColor, className }: any) {
   return (<Card className={cn("border-none shadow-lg rounded-[1.5rem] p-4 md:p-8 bg-white group hover:translate-y-[-4px] transition-all", className)}><div className="flex flex-col gap-3 md:gap-4"><div className={cn("h-8 w-8 md:h-10 md:w-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm", bgColor)}>{React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: cn("h-4 w-4 md:h-5 md:w-5", color) }) : icon}</div><div className="space-y-0.5 md:space-y-1 text-left"><p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p><p className={cn("text-lg md:text-4xl font-headline font-black leading-none", color)}>{value}</p></div></div></Card>)
}
function ProfileDataNode({ icon, label, value, colSpan = 1 }: any) {
   return (<div className={cn("flex items-start gap-4 md:gap-5", colSpan > 1 ? "md:col-span-2" : "")}><div className="h-10 w-10 md:h-12 md:w-12 rounded-[1rem] md:rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">{React.cloneElement(icon, { className: "h-4 w-4 md:h-5 md:w-5" })}</div><div className="min-w-0 space-y-0.5 md:space-y-1 text-left"><p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p><p className="text-xs md:text-base font-bold text-[#0F172A] leading-relaxed break-words uppercase">{value}</p></div></div>)
}
