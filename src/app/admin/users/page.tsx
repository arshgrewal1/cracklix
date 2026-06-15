"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, MoreVertical, ShieldCheck, Trash2, Gem, User as UserIcon, Calendar, Unlock, Zap, Loader2, X, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, doc, updateDoc, serverTimestamp, deleteDoc, addDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Student Hub v21.0.
 * Layout refactor: Removed redundant horizontal padding.
 */
export default function AspirantsManagement() {
  const db = useFirestore()
  const { user: admin } = useUser()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [grantDialogUser, setGrantDialogUser] = useState<any>(null)
  const [grantPlanId, setGrantPlanId] = useState("")
  const [grantDuration, setGrantDuration] = useState("30")
  const [isProcessing, setIsProcessing] = useState(false)

  const usersQuery = useMemo(() => (db ? query(collection(db, 'users')) : null), [db])
  const { data: aspirants, loading } = useCollection<any>(usersQuery)

  const passQuery = useMemo(() => (db ? collection(db, "passes") : null), [db])
  const { data: passes } = useCollection<any>(passQuery)

  const filteredAspirants = useMemo(() => {
    if (!aspirants) return []
    return aspirants.filter(a => 
        (a.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (a.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [aspirants, searchTerm])

  const handleGrantPass = async () => {
    if (!grantDialogUser || !db || !grantPlanId) return
    const selectedPass = passes?.find(p => p.id === grantPlanId)
    if (!selectedPass) return

    setIsProcessing(true)
    const days = parseInt(grantDuration) || selectedPass.durationDays || 30
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)

    try {
       const userRef = doc(db, "users", grantDialogUser.id)
       await updateDoc(userRef, {
          pass: {
             active: true,
             plan: selectedPass.id.toUpperCase(),
             purchaseDate: new Date().toISOString(),
             expiryDate: expiryDate.toISOString(),
             freePassClaimed: selectedPass.id === 'free-pass'
          },
          status: selectedPass.id,
          updatedAt: serverTimestamp()
       })

       await addDoc(collection(db, "subscriptions"), {
          userId: grantDialogUser.id,
          planId: selectedPass.id,
          planName: selectedPass.name,
          status: 'active',
          startDate: serverTimestamp(),
          expiryDate: expiryDate.toISOString(),
          grantedBy: admin?.uid || "Admin",
          type: 'MANUAL_GRANT'
       })

       toast({ title: "Pass Hub Updated", description: `Aspirant upgraded to ${selectedPass.name} for ${days} days.` })
       setGrantDialogUser(null)
    } catch (e: any) {
       toast({ variant: "destructive", title: "Grant Failed" })
    } finally {
       setIsProcessing(false)
    }
  }

  const handleDeactivate = async (userId: string) => {
     if (!db) return
     if (!confirm("Deactivate active pass for this student?")) return
     try {
        await updateDoc(doc(db, "users", userId), {
           'pass.active': false,
           updatedAt: serverTimestamp()
        })
        toast({ title: "Pass Deactivated" })
     } catch (e) {
        toast({ variant: "destructive", title: "Action Failed" })
     }
  }

  return (
    <div className="space-y-12 text-[#0F172A] text-left">
      <div className="flex justify-between items-center">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Student Registry Hub</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-primary uppercase tracking-tight">Student Hub</h1>
          <p className="text-slate-600 mt-1 font-medium">Monitoring {aspirants?.length || 0} student profiles and preparation nodes.</p>
        </div>
      </div>

      <Card className="border-none shadow-3xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
          <div className="relative w-full md:w-[45%]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input className="pl-14 h-16 rounded-[1.5rem] bg-white border-none shadow-inner" placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Aspirant Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status & Expiry</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Audit Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={3} className="p-10"><Skeleton className="h-16 w-full rounded-2xl" /></TableCell></TableRow>)
              ) : filteredAspirants.map((aspirant: any) => {
                 const pass = aspirant.pass;
                 const isActive = pass?.active && new Date(pass.expiryDate) > new Date();
                 return (
                  <TableRow key={aspirant.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                    <TableCell className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <StudentAvatar profile={aspirant} className="h-14 w-14 rounded-2xl" />
                        <div>
                          <p className="font-black text-[#0F172A] text-lg uppercase leading-none">{aspirant.name}</p>
                          <p className="text-xs font-bold text-slate-400 mt-2 lowercase">{aspirant.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1">
                          <Badge className={cn("border-none px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm", isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                             {isActive ? (pass.plan || 'ACTIVE') : 'NO ACTIVE PASS'}
                          </Badge>
                          {isActive && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">EXP: {new Date(pass.expiryDate).toLocaleDateString()}</p>}
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <button className="h-12 w-12 rounded-2xl hover:bg-white shadow-sm flex items-center justify-center opacity-30 group-hover:opacity-100 transition-all"><MoreVertical className="h-6 w-6" /></button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-64 bg-[#0F172A] border-white/10 text-white rounded-[2.5rem] p-4 shadow-5xl">
                            <DropdownMenuItem onClick={() => setGrantDialogUser(aspirant)} className="rounded-xl px-4 py-3 gap-3 focus:bg-primary/20 text-primary">
                               <Gem className="h-4 w-4" /> Grant / Edit Pass
                            </DropdownMenuItem>
                            {isActive && (
                               <DropdownMenuItem onClick={() => handleDeactivate(aspirant.id)} className="rounded-xl px-4 py-3 gap-3 focus:bg-amber-500/20 text-amber-400">
                                  <X className="h-4 w-4" /> Deactivate Pass
                               </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-white/5 my-2" />
                            <DropdownMenuItem onClick={async () => { if(confirm("Permanently delete this student?")) await deleteDoc(doc(db!, "users", aspirant.id)) }} className="rounded-xl px-4 py-3 gap-3 text-rose-500">
                               <Trash2 className="h-4 w-4" /> Delete Profile
                            </DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                 )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!grantDialogUser} onOpenChange={o => !o && !isProcessing && setGrantDialogUser(null)}>
         <DialogContent className="bg-[#0F172A] text-white border-white/10 rounded-[3rem] max-w-md p-10 shadow-5xl text-left">
            <DialogHeader className="text-center space-y-4">
               <DialogTitle className="text-2xl font-headline font-black uppercase text-primary">Aspirant Pass Architect</DialogTitle>
               <DialogDescription className="text-slate-400 text-sm">Modify subscription node for {grantDialogUser?.name}.</DialogDescription>
            </DialogHeader>
            <div className="py-8 space-y-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Select Pass Registry</Label>
                  <select value={grantPlanId} onChange={e => setGrantPlanId(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 outline-none font-bold text-white">
                     <option value="" disabled className="bg-[#0F172A]">Select Plan</option>
                     {passes?.map((p: any) => <option key={p.id} value={p.id} className="bg-[#0F172A]">{p.name} (₹{p.price})</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Grant Duration (Days)</Label>
                  <Input type="number" value={grantDuration} onChange={e => setGrantDuration(e.target.value)} className="h-14 bg-white/5 border border-white/10 rounded-2xl font-black text-xl text-center" />
               </div>
               <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
                  <AlertCircle className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">
                     Activating a pass will immediately grant unrestricted access to all premium mocks. Existing pass (if any) will be replaced.
                  </p>
               </div>
            </div>
            <DialogFooter>
               <Button onClick={handleGrantPass} disabled={isProcessing} className="w-full bg-primary hover:bg-orange-600 h-14 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-2xl">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize & Sync"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
