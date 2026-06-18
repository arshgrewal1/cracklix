"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore"
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
  LucideIcon
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Student Profile Center v26.0.
 * HARDENED: Resolved type mismatches and missing React global references.
 */
export default function ProfilePage() {
  const { user, profile, loading, profileLoading, currentDeviceId } = useUser()
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

  const devicesQuery = useMemo(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "devices")
  }, [db, user])

  const { data: devices, loading: devicesLoading } = useCollection<any>(devicesQuery)

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
    return { total, avgAccuracy, rank: total > 5 ? "Top 12%" : "Awaiting" }
  }, [results])

  const handleUpdateProfile = async () => {
    if (!db || !user || !editForm) return

    const mandatory = ['name', 'email', 'phone', 'dob', 'address', 'targetExam'];
    const missing = mandatory.find(key => !editForm[key]?.trim());
    
    if (missing) {
      toast({ 
        variant: "destructive", 
        title: "Setup Blocked", 
        description: `Please enter your ${missing.toUpperCase()}.` 
      });
      return;
    }

    if (editForm.phone.replace(/\D/g, '').length < 10) {
      toast({ variant: "destructive", title: "Invalid Number", description: "10-digit mobile required." });
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
       toast({ title: "Registry Synced", description: "Your identity node has been updated." })
       setIsEditing(false)
    } catch (e: any) {
       toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    } finally {
       setIsSaving(false)
    }
  }

  const handleRemoveDevice = async (deviceId: string) => {
    if (!db || !user) return;
    if (!confirm("Remove this hardware node?")) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "devices", deviceId));
      await updateDoc(doc(db, "users", user.uid), { deviceCount: Math.max(0, (devices?.length || 1) - 1) });
      toast({ title: "Node Removed", description: "Authorized device slot cleared." });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Rejected" });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Auditing Node...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-body pb-safe text-left">
      <Navbar />
      
      <main className="w-full">
        <div className="bg-[#0B1528] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full" />
           <div className="container mx-auto px-6 md:px-12 max-w-6xl pt-8 md:pt-16 pb-12 md:pb-24">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-12 relative z-10">
                 <div className="relative group shrink-0">
                    {profileLoading ? (
                      <Skeleton className="h-28 w-28 md:h-44 md:w-44 rounded-[2.5rem] md:rounded-[4rem] bg-white/5" />
                    ) : (
                      <div className="relative">
                        <StudentAvatar profile={profile} className="h-28 w-28 md:h-44 md:w-44 border-[4px] border-white/10 rounded-[2.5rem] md:rounded-[4rem] shadow-5xl relative bg-[#0F172A]" />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-8 w-8 md:h-12 md:w-12 rounded-2xl border-[4px] border-[#0B1528] flex items-center justify-center shadow-xl">
                          <ShieldCheck className="h-4 w-4 md:h-6 md:w-6 text-white" />
                        </div>
                      </div>
                    )}
                 </div>
                 <div className="flex-1 space-y-3 md:space-y-5 min-w-0 text-center md:text-left">
                    {profileLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 md:h-16 w-3/4 bg-white/5 mx-auto md:mx-0 rounded-xl" />
                        <Skeleton className="h-6 w-1/2 bg-white/5 mx-auto md:mx-0 rounded-xl" />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5">
                          <h1 className="text-3xl md:text-6xl lg:text-7xl font-headline font-black text-white uppercase tracking-tight truncate max-w-full">{profile?.name}</h1>
                          <Badge className={cn("border-none text-[9px] md:text-[12px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl", profile?.status === 'Free' ? "bg-white/10 text-slate-300" : "bg-primary text-white")}>{profile?.status || 'Free'} Pass</Badge>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 md:gap-x-10 gap-y-2">
                          <HeaderInfo icon={<Mail className="h-4 w-4 text-primary" />} text={profile?.email || ""} />
                          <HeaderInfo icon={<Phone className="h-4 w-4 text-primary" />} text={profile?.phone || "Not Added"} />
                          <HeaderInfo icon={<GraduationCap className="h-4 w-4 text-primary" />} text={`Target: ${profile?.targetExam || 'General'}`} />
                        </div>
                      </>
                    )}
                 </div>
                 <div className="shrink-0 w-full md:w-auto pt-6 md:pt-0 flex flex-col sm:flex-row gap-3 md:gap-4">
                    <Button onClick={() => setIsEditing(true)} disabled={profileLoading} className="h-12 md:h-16 px-8 md:px-10 bg-white/10 hover:bg-white/20 text-white border-2 border-white/10 rounded-2xl font-black uppercase text-[10px] md:text-[12px] tracking-[0.2em] gap-3 shadow-4xl transition-all active:scale-95"><Edit className="h-4 w-4 text-primary" /> Edit Node</Button>
                    <Button asChild className="h-12 md:h-16 px-8 md:px-10 bg-primary hover:bg-orange-600 text-white rounded-2xl font-black uppercase text-[10px] md:text-[12px] tracking-[0.2em] gap-3 shadow-4xl border-none transition-all active:scale-95"><Link href="/pass"><Gem className="h-4 w-4" /> UPGRADE HUB</Link></Button>
                 </div>
              </div>
           </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-6xl -mt-8 md:-mt-12 relative z-20">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
              <div className="lg:col-span-8 space-y-6 md:space-y-12">
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-8">
                    <StatsCard icon={ClipboardList} label="TESTS DONE" value={resultsLoading ? "..." : stats.total} color="text-blue-500" bgColor="bg-blue-50" />
                    <StatsCard icon={Target} label="ACCURACY" value={resultsLoading ? "..." : `${stats.avgAccuracy}%`} color="text-primary" bgColor="bg-primary/10" />
                    <StatsCard icon={Trophy} label="RANK" value={resultsLoading ? "..." : stats.rank} color="text-emerald-500" bgColor="bg-emerald-50" className="hidden sm:flex" />
                 </div>

                 {/* DEVICE MANAGEMENT HUB */}
                 <Card className="border-none shadow-3xl rounded-[2.5rem] md:rounded-[3.5rem] bg-white p-8 md:p-14 space-y-8 md:space-y-12 border border-slate-100">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6 md:pb-10">
                       <div className="space-y-1.5 md:space-y-2">
                          <h3 className="font-headline font-black text-xl md:text-3xl uppercase flex items-center gap-4 md:gap-6 text-[#0F172A]">
                             <Smartphone className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Managed Nodes
                          </h3>
                          <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active hardware binding registry</p>
                       </div>
                       <Badge className="bg-primary/5 text-primary border-none text-[9px] md:text-[11px] font-black uppercase px-4 py-1.5 rounded-xl">SLOTS: 2</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                       {devicesLoading ? (
                          <Skeleton className="h-28 w-full rounded-[2rem]" />
                       ) : devices && devices.length > 0 ? (
                          devices.map((device: any) => {
                             const isCurrent = device.id === currentDeviceId;
                             return (
                                <div key={device.id} className={cn("p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-2 flex items-center justify-between transition-all duration-500", isCurrent ? "bg-primary/5 border-primary shadow-xl" : "bg-white border-slate-100 shadow-sm hover:border-primary/20")}>
                                   <div className="flex items-center gap-6 md:gap-10">
                                      <div className={cn("h-14 w-14 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner transition-transform duration-500 group-hover:scale-105", isCurrent ? "bg-primary text-white" : "bg-slate-50 text-slate-400")}>
                                         <Smartphone className="h-6 w-6 md:h-10 md:w-10" />
                                      </div>
                                      <div className="min-w-0 text-left space-y-2">
                                         <div className="flex items-center gap-3">
                                            <p className="font-black text-sm md:text-2xl text-[#0F172A] uppercase truncate">{device.deviceName || 'Authorized Node'}</p>
                                            {isCurrent && <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] md:text-[10px] font-black px-3 py-1 rounded-lg">PRIMARY</Badge>}
                                         </div>
                                         <div className="flex items-center gap-4 text-[8px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Last Signal: {device.lastActive ? new Date(device.lastActive.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                                         </div>
                                      </div>
                                   </div>
                                   <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleRemoveDevice(device.id)}
                                      className="h-12 w-12 md:h-16 md:w-16 rounded-2xl text-rose-500 hover:bg-rose-50 shrink-0 transition-all active:scale-90"
                                   >
                                      <Trash2 className="h-6 w-6 md:h-8 md:w-8" />
                                   </Button>
                                </div>
                             )
                          })
                       ) : (
                          <div className="text-center py-20 opacity-20 italic uppercase font-black text-xs tracking-[0.3em] bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">Zero active hardware nodes.</div>
                       )}
                    </div>
                 </Card>

                 <Card className="border-none shadow-3xl rounded-[2.5rem] md:rounded-[3.5rem] bg-white p-8 md:p-14 space-y-8 md:space-y-12 text-left border border-slate-100">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6 md:pb-10"><h3 className="font-headline font-black text-xl md:text-3xl uppercase flex items-center gap-4 md:gap-6 text-[#0F172A]"><UserIcon className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Registry Metadata</h3></div>
                    {profileLoading ? (
                      <div className="space-y-12">
                         <div className="grid grid-cols-2 gap-10">
                            <Skeleton className="h-14 w-full rounded-2xl" />
                            <Skeleton className="h-14 w-full rounded-2xl" />
                         </div>
                         <Skeleton className="h-32 w-full rounded-2xl" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 md:gap-y-12">
                        <ProfileDataNode icon={Calendar} label="DATE OF BIRTH" value={profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "Not Linked"} />
                        <ProfileDataNode icon={Phone} label="MOBILE NODE" value={profile?.phone || "Not Linked"} />
                        <ProfileDataNode icon={MapPin} label="HQs ADDRESS" value={profile?.address || "Not Added"} colSpan={2} />
                        <ProfileDataNode icon={ShieldCheck} label="ACCESS LEVEL" value={`${profile?.role || 'STUDENT'}`} />
                        <ProfileDataNode icon={Activity} label="REGISTRY SINCE" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : "---"} />
                      </div>
                    )}
                 </Card>
              </div>
              <div className="lg:col-span-4 space-y-6 md:space-y-10">
                 <Card className="border-none shadow-2xl rounded-[2.5rem] md:rounded-[3.5rem] bg-white p-8 md:p-12 space-y-8 md:space-y-10 border border-slate-100">
                    <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">Quick Portal</h3>
                    <div className="space-y-4 md:space-y-5">
                       <Button asChild className="w-full h-14 md:h-18 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] md:text-[12px] tracking-widest shadow-2xl transition-all active:scale-95 border-none gap-3"><Link href="/pass"><CreditCard className="h-5 w-5 text-primary" /> Unlock Elite Hub</Link></Button>
                       <Button asChild variant="outline" className="w-full h-14 md:h-18 border-2 border-slate-100 bg-slate-50/50 rounded-2xl font-black uppercase text-[10px] md:text-[12px] tracking-widest text-slate-600 hover:bg-white hover:border-primary/20 transition-all active:scale-95 gap-3"><Link href="/dashboard"><History className="h-5 w-5" /> Global Report</Link></Button>
                    </div>
                 </Card>
                 <div className="bg-primary rounded-[3rem] md:rounded-[4rem] p-10 md:p-14 text-white space-y-6 relative overflow-hidden group shadow-5xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-[2000ms]"><Award className="h-40 w-40 md:h-64 md:w-64" /></div>
                    <div className="relative z-10 space-y-4 md:space-y-6 text-left">
                       <h4 className="text-2xl md:text-4xl font-headline font-black uppercase leading-tight">Official <br/> Rankings</h4>
                       <p className="text-white/70 text-[10px] md:text-[12px] font-bold uppercase tracking-widest">Compare with toppers across Punjab.</p>
                       <Button asChild className="w-full mt-6 md:mt-12 bg-white text-primary hover:bg-slate-100 font-black h-12 md:h-16 rounded-2xl text-[10px] md:text-[12px] uppercase shadow-3xl border-none transition-all active:scale-95"><Link href="/leaderboard">See merit list</Link></Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
      <Footer />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
         <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] bg-white rounded-[2.5rem] md:rounded-[3.5rem] border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-[#0B1528] shrink-0" />
            <DialogHeader className="p-8 md:p-14 pb-4 md:pb-6 shrink-0">
               <div className="flex justify-between items-center">
                  <DialogTitle className="text-2xl md:text-4xl font-black font-headline uppercase text-[#0F172A] flex items-center gap-4 md:gap-6">
                     <ShieldCheck className="h-7 w-7 md:h-10 md:w-10 text-primary" /> Modify Profile
                  </DialogTitle>
                  <button onClick={() => setIsEditing(false)} className="p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"><X className="h-6 w-6 text-slate-400" /></button>
               </div>
               <DialogDescription className="text-slate-400 text-[10px] md:text-[12px] font-bold uppercase tracking-widest mt-2">Audit your identity node information.</DialogDescription>
            </DialogHeader>
            <div className="px-8 md:px-14 pb-8 md:pb-14 space-y-5 md:space-y-8 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Full Identity</Label>
                     <Input value={editForm?.name || ""} onChange={e => setEditForm((prev: any) => ({...prev, name: e.target.value}))} className="h-14 md:h-16 rounded-2xl bg-slate-50 border-none font-bold text-sm md:text-lg px-6 shadow-inner" />
                  </div>
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Contact String</Label>
                     <Input type="email" value={editForm?.email || ""} onChange={e => setEditForm((prev: any) => ({...prev, email: e.target.value}))} className="h-14 md:h-16 rounded-2xl bg-slate-50 border-none font-bold text-sm md:text-lg px-6 shadow-inner" />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Date of Birth</Label>
                     <Input type="date" value={editForm?.dob || ""} onChange={e => setEditForm((prev: any) => ({...prev, dob: e.target.value}))} className="h-14 md:h-16 rounded-2xl bg-slate-50 border-none font-bold text-sm md:text-lg px-6 shadow-inner" />
                  </div>
                  <div className="space-y-2 text-left">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Authority</Label>
                     <select value={editForm?.targetExam || ""} onChange={e => setEditForm((prev: any) => ({...prev, targetExam: e.target.value}))} className="w-full h-14 md:h-16 rounded-2xl bg-slate-50 border-none font-bold text-sm md:text-lg px-6 outline-none shadow-inner"><option value="" disabled>Select Board</option><option value="PSSSB">PSSSB</option><option value="PPSC">PPSC</option><option value="Punjab Police">Punjab Police</option><option value="Army">Indian Army</option><option value="High Court">High Court</option></select></div>
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Verified Mobile Node</Label>
                  <div className="relative">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm md:text-lg font-black text-slate-400">+91</span>
                     <Input value={editForm?.phone || ""} onChange={e => setEditForm((prev: any) => ({...prev, phone: e.target.value.replace(/\D/g, '').slice(0,10)}))} className="h-14 md:h-16 pl-16 md:pl-20 rounded-2xl bg-slate-50 border-none font-black text-lg md:text-2xl tracking-[0.2em]" placeholder="10-digit number" />
                  </div>
               </div>
               <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Home Hub Address</Label>
                  <Textarea value={editForm?.address || ""} onChange={e => setEditForm((prev: any) => ({...prev, address: e.target.value}))} className="min-h-[120px] md:min-h-[160px] rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-50 border-none font-medium p-5 md:p-8 text-[13px] md:text-lg leading-relaxed shadow-inner resize-none" placeholder="Enter your full HQs address..." />
               </div>
            </div>
            <DialogFooter className="p-8 md:p-14 pt-4 md:pt-6 bg-slate-50 border-t border-slate-100 shrink-0 flex flex-row gap-4 md:gap-6 items-center justify-between">
               <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-14 md:h-18 px-6 md:px-10 font-black uppercase text-[9px] md:text-[11px] text-slate-400 tracking-widest hover:text-slate-900 transition-colors">Discard</Button>
               <Button onClick={handleUpdateProfile} disabled={isSaving} className="bg-primary hover:bg-orange-600 text-white h-14 md:h-18 px-8 md:px-14 rounded-2xl font-black uppercase text-[10px] md:text-[12px] tracking-[0.3em] flex-1 shadow-3xl transition-all active:scale-95 gap-3">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Sync Registry</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function HeaderInfo({ icon, text }: { icon: React.ReactNode, text: string }) {
   return (<div className="flex items-center gap-2.5 text-white/60 font-bold uppercase text-[9px] md:text-[12px] tracking-tight"><span className="shrink-0">{icon}</span><span className="truncate max-w-[180px] md:max-w-[320px]">{text || 'Awaiting Node'}</span></div>)
}
function StatsCard({ icon: Icon, label, value, color, bgColor, className }: { icon: LucideIcon, label: string, value: string | number, color: string, bgColor: string, className?: string }) {
   return (<Card className={cn("border-none shadow-2xl rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-12 bg-white group hover:translate-y-[-6px] transition-all duration-500", className)}><div className="flex flex-col gap-5 md:gap-8"><div className={cn("h-10 w-10 md:h-16 md:w-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-inner", bgColor)}><Icon className={cn("h-5 w-5 md:h-8 md:w-8", color)} /></div><div className="space-y-1 text-left"><p className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p><p className={cn("text-xl md:text-5xl font-headline font-black leading-none tabular-nums", color)}>{value}</p></div></div></Card>)
}
function ProfileDataNode({ icon: Icon, label, value, colSpan = 1 }: { icon: LucideIcon, label: string, value: string, colSpan?: number }) {
   return (<div className={cn("flex items-start gap-5 md:gap-8", colSpan > 1 ? "md:col-span-2" : "")}><div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary/5 transition-colors"><Icon className="h-5 w-5 md:h-7 md:w-7" /></div><div className="min-w-0 space-y-1 text-left"><p className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p><p className="text-[13px] md:text-xl font-bold text-[#0F172A] leading-relaxed break-words uppercase tracking-tight">{value}</p></div></div>)
}
