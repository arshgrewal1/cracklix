
"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc, updateDoc, serverTimestamp, deleteDoc, limit } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Mail, 
  Phone, 
  ShieldCheck,
  ShieldAlert,
  Zap, 
  Activity,
  Trash2,
  CheckCircle2,
  Clock,
  Settings,
  X,
  Loader2,
  Save,
  Trophy,
  Target,
  History,
  ChevronRight,
  Gem,
  ClipboardList
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
 * @fileOverview Institutional Profile Hub v43.0 [Sync Fixed].
 * FIXED: Accuracy and Question stats correctly pull live from Firestore.
 * UPDATED: Standardized terminology to "Questions" and "Database".
 */

export default function ProfilePage() {
  const { user, profile, loading, profileLoading } = useUser()
  const db = useFirestore()
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
    return query(collection(db, "results"), where("userId", "==", user.uid), limit(50))
  }, [db, user])

  const { data: rawResults, loading: resultsLoading } = useCollection<any>(resultsQuery)

  const { results, aggregateStats } = useMemo(() => {
    if (!rawResults) return { results: [], aggregateStats: { totalTests: 0, highestScore: 0, avgAccuracy: 0, solvedQuestions: 0 } };
    
    const sorted = [...rawResults].sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime()
      const timeB = new Date(b.timestamp || 0).getTime()
      return timeB - timeA
    })

    const totalSolved = sorted.reduce((acc, r) => acc + (r.correctCount || 0), 0);
    const accuracyPool = sorted.map(r => r.accuracy !== undefined ? r.accuracy : r.attemptAccuracy || 0);
    const avgAccuracy = accuracyPool.length ? Math.round(accuracyPool.reduce((a, b) => a + b, 0) / accuracyPool.length) : 0;
    const highestScore = sorted.length ? Math.max(...sorted.map(r => r.score || 0)) : 0;

    return {
       results: sorted.slice(0, 10),
       aggregateStats: {
          totalTests: sorted.length,
          highestScore,
          avgAccuracy,
          solvedQuestions: totalSolved
       }
    }
  }, [rawResults]);

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
        toast({ title: "Account removed" });
        router.push('/login');
     } catch (e: any) {
        toast({ variant: "destructive", title: "Action failed" });
     } finally {
        setIsSaving(false);
     }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body pb-safe text-left">
      <Navbar />
      
      <main className="w-full">
        <div className="bg-[#0B1528] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
           <div className="container mx-auto px-4 md:px-12 max-w-6xl pt-6 md:pt-12 pb-8 md:pb-14">
              <div className="flex flex-row items-center md:items-end gap-4 md:gap-10 relative z-10">
                 <div className="relative shrink-0">
                    {profileLoading ? (
                      <Skeleton className="h-16 w-16 md:h-24 md:w-24 rounded-xl bg-white/5" />
                    ) : (
                      <div className="relative">
                        <StudentAvatar profile={profile} className="h-16 w-16 md:h-28 md:w-28 border-[2px] border-white/10 rounded-xl bg-slate-900" />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-5 w-5 md:h-8 md:w-8 rounded-lg border-[2px] border-[#0B1528] flex items-center justify-center text-white shadow-xl">
                          <ShieldCheck className="h-3 w-3 md:h-4 md:w-4 text-white" />
                        </div>
                      </div>
                    )}
                 </div>
                 <div className="flex-1 space-y-1 min-w-0 text-left">
                    {!profileLoading && (
                      <>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                          <h1 className="text-xl md:text-3xl font-black text-white leading-none tracking-tight truncate max-w-full">
                             {profile?.name}
                          </h1>
                          <Badge className={cn("border-none text-[8px] font-bold px-3 py-0.5 rounded-full shadow-2xl shrink-0", profile?.status === 'Free' ? "bg-white/10 text-slate-300" : "bg-primary text-white")}>{profile?.status || 'Free'} Pass</Badge>
                        </div>
                        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-1 pt-1">
                          <div className="flex items-center gap-2 text-white/60 font-bold text-[9px] md:text-[11px] tracking-tight shrink-0"><Mail className="h-3 w-3 text-primary" /> <span className="truncate max-w-[120px] md:max-w-[280px]">{profile?.email}</span></div>
                          <div className="flex items-center gap-2 text-white/60 font-bold text-[9px] md:text-[11px] tracking-tight shrink-0"><Phone className="h-3 w-3 text-primary" /> <span className="">{profile?.phone || "Not added"}</span></div>
                        </div>
                      </>
                    )}
                 </div>
              </div>
           </div>
        </div>

        <div className="container mx-auto px-3 md:px-6 lg:px-12 max-w-6xl -mt-6 relative z-20">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              <div className="lg:col-span-8 space-y-4 md:space-y-6">
                 
                 <div className="grid grid-cols-4 gap-2 md:gap-4">
                    <StatsNode icon={<ClipboardList className="h-4 w-4" />} label="Tests" value={aggregateStats.totalTests} color="text-blue-500" bgColor="bg-blue-50" />
                    <StatsNode icon={<Target className="h-4 w-4" />} label="Accuracy" value={`${aggregateStats.avgAccuracy}%`} color="text-emerald-500" bgColor="bg-emerald-50" />
                    <StatsNode icon={<Zap className="h-4 w-4" />} label="Questions" value={aggregateStats.solvedQuestions} color="text-amber-500" bgColor="bg-amber-50" />
                    <StatsNode icon={<Trophy className="h-4 w-4" />} label="Top score" value={aggregateStats.highestScore.toFixed(1)} color="text-primary" bgColor="bg-primary/10" />
                 </div>

                 <Card className="border-none shadow-xl rounded-2xl bg-card overflow-hidden border border-border">
                    <CardHeader className="p-5 md:p-6 border-b border-border bg-muted/30">
                       <CardTitle className="text-xl font-black text-foreground flex items-center gap-3 tracking-tighter">
                          <History className="h-6 w-6 text-primary" /> Recent attempts
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y divide-border">
                          {resultsLoading ? (
                             Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full bg-muted" />)
                          ) : results && results.length > 0 ? (
                             results.map((res: any) => (
                                <Link key={res.id} href={`/results/view?id=${res.mockId}&attemptId=${res.attemptId}`} className="flex items-center justify-between p-4 md:p-5 hover:bg-muted/50 transition-all group">
                                   <div className="flex items-center gap-4 min-w-0">
                                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all shadow-inner"><Zap className="h-4 w-4" /></div>
                                      <div className="min-w-0">
                                         <p className="font-bold text-sm md:text-lg text-foreground truncate tracking-tight">{res.mockTitle}</p>
                                         <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-bold text-muted-foreground tabular-nums">{new Date(res.timestamp).toLocaleDateString('en-GB')}</span>
                                            <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-500 border-none text-[7px] font-bold px-1.5">Score: {res.score}</Badge>
                                         </div>
                                      </div>
                                   </div>
                                   <ChevronRight className="h-4 w-4 text-muted-foreground opacity-20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                             ))
                          ) : (
                             <div className="py-8 text-center opacity-20 italic font-bold text-xs">No attempts found</div>
                          )}
                       </div>
                    </CardContent>
                 </Card>
              </div>

              <div className="lg:col-span-4 space-y-4 md:space-y-6">
                 <Card className="border-none shadow-xl rounded-2xl bg-card p-5 md:p-6 space-y-5 border border-border text-left">
                    <h3 className="text-[10px] font-black tracking-tight text-muted-foreground uppercase">Control hub</h3>
                    <div className="space-y-2">
                       <Button onClick={() => setIsEditing(true)} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] tracking-tight shadow-xl transition-all active:scale-95 border-none">Edit profile</Button>
                       <Button asChild variant="outline" className="w-full h-11 rounded-full font-bold text-[10px] tracking-tight shadow-sm transition-all active:scale-95 border-2 gap-2"><Link href="/pass"><Gem className="h-4 w-4 text-primary" /> Get Elite Pass</Link></Button>
                    </div>

                    <div className="pt-4 border-t border-border space-y-3">
                       <p className="text-[8px] font-bold text-muted-foreground tracking-tight uppercase">Account actions</p>
                       <Button onClick={() => setIsDeleting(true)} variant="ghost" className="w-full h-9 text-rose-500 hover:bg-rose-50 rounded-xl font-bold text-[8px] tracking-tight transition-all gap-2"><Trash2 className="h-3.5 w-3.5" /> Delete account</Button>
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
            <DialogHeader className="p-6 md:p-8 pb-2 shrink-0">
               <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3 tracking-tighter">
                     <ShieldCheck className="h-5 w-5 text-primary" /> Edit profile
                  </DialogTitle>
                  <button onClick={() => setIsEditing(false)} className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer border-none bg-transparent text-muted-foreground"><X className="h-5 w-5" /></button>
               </div>
            </DialogHeader>
            <div className="px-6 md:px-8 pb-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left"><Label className="text-[9px] font-bold text-muted-foreground ml-1 uppercase">Full name</Label><Input value={editForm?.name || ""} onChange={e => setEditForm((prev: any) => ({...prev, name: e.target.value}))} className="h-11 rounded-xl bg-muted border-none font-bold px-4" /></div>
                  <div className="space-y-1 text-left"><Label className="text-[9px] font-bold text-muted-foreground ml-1 uppercase">Email</Label><Input type="email" value={editForm?.email || ""} onChange={e => setEditForm((prev: any) => ({...prev, email: e.target.value}))} className="h-11 rounded-xl bg-muted border-none font-bold px-4" /></div>
               </div>
               <div className="space-y-1 text-left">
                  <Label className="text-[9px] font-bold text-muted-foreground ml-1 uppercase">Mobile number</Label>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground/40">+91</span>
                     <Input value={editForm?.phone || ""} onChange={e => setEditForm((prev: any) => ({...prev, phone: e.target.value.replace(/\D/g, '').slice(0,10)}))} className="h-11 pl-12 rounded-xl bg-muted border-none font-bold text-sm" />
                  </div>
               </div>
            </div>
            <DialogFooter className="p-5 md:p-6 bg-muted border-t border-border flex flex-row gap-3 items-center justify-between">
               <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-10 px-5 font-bold text-[9px] text-muted-foreground border-none">Cancel</Button>
               <Button onClick={handleUpdateProfile} disabled={isSaving} className="bg-primary hover:bg-blue-700 text-white h-10 px-6 rounded-full font-bold text-[10px] flex-1 shadow-3xl transition-all active:scale-95 gap-2">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save details</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
         <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl bg-card border-none shadow-5xl p-8 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 shadow-inner"><ShieldAlert className="h-8 w-8" /></div>
            <DialogHeader>
               <DialogTitle className="text-xl font-bold">Purge account</DialogTitle>
               <DialogDescription className="text-muted-foreground text-sm font-medium mt-2">Type <code className="text-rose-600 font-bold">DELETE</code> to permanently liquidate your preparation data.</DialogDescription>
            </DialogHeader>
            <div className="w-full my-6">
               <Input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} className="h-12 bg-muted border-none text-center font-bold text-rose-600" placeholder="---" />
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
               <Button variant="ghost" onClick={() => setIsDeleting(false)} className="font-bold text-[10px]">Cancel</Button>
               <Button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || isSaving} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xl">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete forever"}</Button>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function StatsNode({ icon, label, value, color, bgColor }: any) {
   return (
    <Card className="border border-border shadow-lg rounded-xl md:rounded-2xl p-2 md:p-4 bg-card flex-1">
      <div className="flex flex-col items-center text-center gap-2">
        <div className={cn("h-7 w-7 md:h-10 md:w-10 rounded-lg flex items-center justify-center shadow-inner", bgColor)}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: cn("h-4 w-4 md:h-5 md:w-5", color) }) : null}
        </div>
        <div className="space-y-0.5 min-w-0 w-full">
          <p className="text-xs md:text-xl font-black text-foreground tabular-nums tracking-tighter leading-none truncate">{value}</p>
          <p className="text-[7px] md:text-[8px] font-bold text-muted-foreground mt-1 truncate uppercase">{label}</p>
        </div>
      </div>
    </Card>
   )
}
