"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
 * @fileOverview Student Hub v26.0 (PWA Optimized).
 * PWA SYNC: Removed uppercase, reduced font scales, and normalized Title Case as per screenshot.
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
    return aspirants.filter((a: any) => 
        (a.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (a.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [aspirants, searchTerm])

  const handleGrantPass = async () => {
    if (!grantDialogUser || !db || !grantPlanId) return
    const selectedPass = passes?.find((p: any) => p.id === grantPlanId)
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

       toast({ title: "Pass Activated", description: `${grantDialogUser.name} upgraded successfully.` })
       setGrantDialogUser(null)
    } catch (e: any) {
       console.error('[USER_PASS_GRANT_ERROR]:', e);
       toast({ variant: "destructive", title: "Update Failed", description: e?.message || "Could not activate pass." })
    } finally {
       setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-12 text-[#0F172A] text-left animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-1">
        <div className="space-y-1.5">
           <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Aspirant Registry Hub</span>
           </div>
          <h1 className="text-2xl md:text-5xl font-black text-primary tracking-tight">Student Hub</h1>
          <p className="text-slate-500 font-medium text-[11px] md:text-lg">Monitoring {aspirants?.length || 0} student preparation profiles.</p>
        </div>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold" 
           placeholder="Search identity..." 
           value={searchTerm} 
           onChange={e => setSearchTerm(e.target.value)} 
         />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14 md:h-20">
                <TableHead className="px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</TableHead>
                <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Status</TableHead>
                <TableHead className="text-right px-6 md:px-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRow key={i} className="border-slate-50"><TableCell colSpan={3} className="px-6 py-6 md:px-12 md:py-10"><Skeleton className="h-10 w-full rounded-xl bg-slate-50" /></TableCell></TableRow>)
              ) : filteredAspirants.map((aspirant: any) => {
                 const pass = aspirant.pass;
                 const isActive = pass?.active && new Date(pass.expiryDate) > new Date();
                 return (
                  <TableRow key={aspirant.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                    <TableCell className="px-6 md:px-12 py-5 md:py-10">
                      <div className="flex items-center gap-4 md:gap-6">
                        <StudentAvatar profile={aspirant} className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl shadow-inner bg-slate-50" />
                        <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] text-sm md:text-lg leading-tight truncate">{aspirant.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-1 truncate lowercase">{aspirant.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1">
                          <Badge className={cn("border-none px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest", isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                             {isActive ? (pass.plan || 'ELITE') : 'FREE HUB'}
                          </Badge>
                          {isActive && <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Exp: {new Date(pass.expiryDate).toLocaleDateString()}</p>}
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-6 md:px-12">
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <button className="h-9 w-9 md:h-11 md:w-11 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center justify-center text-slate-400 transition-all"><MoreVertical className="h-4 w-4 md:h-5 md:w-5" /></button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-56 md:w-64 bg-white rounded-2xl md:rounded-[2rem] p-3 md:p-4 shadow-5xl border border-slate-50 z-[2001]">
                            <DropdownMenuItem onClick={() => setGrantDialogUser(aspirant)} className="rounded-xl px-4 py-2.5 md:py-3 gap-3 focus:bg-primary/5 text-slate-600 focus:text-primary font-bold text-xs">
                               <Gem className="h-4 w-4" /> Grant Elite Pass
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50 my-2" />
                            <DropdownMenuItem onClick={async () => { if(confirm("Permanently delete profile?")) await deleteDoc(doc(db!, "users", aspirant.id)) }} className="rounded-xl px-4 py-2.5 md:py-3 gap-3 text-rose-500 focus:bg-rose-50 focus:text-rose-600 font-bold text-xs">
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
         <DialogContent className="bg-white rounded-3xl md:rounded-[3rem] max-w-md w-[95vw] p-8 md:p-10 shadow-5xl text-left border-none">
            <div className="h-2 w-full bg-primary absolute top-0 left-0" />
            <DialogHeader className="text-center space-y-3 pt-4">
               <DialogTitle className="text-xl md:text-2xl font-black text-[#0F172A]">Aspirant Registry</DialogTitle>
               <DialogDescription className="text-slate-500 font-medium text-[11px] md:text-sm">Update node status for {grantDialogUser?.name}.</DialogDescription>
            </DialogHeader>
            <div className="py-6 md:py-8 space-y-6">
               <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Plan Selection</Label>
                  <select value={grantPlanId} onChange={e => setGrantPlanId(e.target.value)} className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-5 outline-none font-bold text-[#0F172A]">
                     <option value="" disabled>Select Pass</option>
                     {passes?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Grant Days</Label>
                  <Input type="number" value={grantDuration} onChange={e => setGrantDuration(e.target.value)} className="h-12 md:h-14 bg-slate-50 border-none rounded-xl font-black text-lg md:text-xl text-center" />
               </div>
            </div>
            <DialogFooter>
               <Button onClick={handleGrantPass} disabled={isProcessing} className="w-full bg-primary hover:bg-blue-700 text-white h-12 md:h-14 rounded-full font-black uppercase tracking-widest text-[10px] border-none shadow-xl">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Commit"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
