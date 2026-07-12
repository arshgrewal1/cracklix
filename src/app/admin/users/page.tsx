
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
 * @fileOverview Student Hub v27.0 (High-Fidelity).
 * FIXED: Refined typography and increased layout breathing room for a premium SaaS look.
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
          passStatus: 'active',
          passExpiresAt: expiryDate.toISOString(),
          updatedAt: serverTimestamp()
       })

       await addDoc(collection(db, "subscriptions"), {
          userId: grantDialogUser.id,
          planId: selectedPass.id,
          planName: selectedPass.name,
          status: 'ACTIVE',
          startDate: serverTimestamp(),
          expiryDate: expiryDate.toISOString(),
          grantedBy: admin?.uid || "Admin",
          type: 'MANUAL_GRANT'
       })

       toast({ title: "Pass Activated", description: `${grantDialogUser.name} upgraded successfully.` })
       setGrantDialogUser(null)
    } catch (e: any) {
       toast({ variant: "destructive", title: "Update Failed" })
    } finally {
       setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-10 md:space-y-16 text-[#0F172A] text-left animate-in fade-in duration-500 pt-2">
      <div className="flex justify-between items-center px-1">
        <div className="space-y-3">
           <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Aspirant Registry Hub</span>
           </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-none">Student Hub</h1>
          <p className="text-slate-500 font-medium text-[13px] md:text-lg max-w-2xl leading-tight">Monitoring {aspirants?.length || 0} student preparation profiles and access tiers.</p>
        </div>
      </div>

      <div className="relative group px-1">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-16 md:h-20 pl-16 rounded-2xl md:rounded-[2rem] bg-white border-slate-100 shadow-xl text-base md:text-xl font-bold" 
           placeholder="Search by name or email node..." 
           value={searchTerm} 
           onChange={e => setSearchTerm(e.target.value)} 
         />
      </div>

      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-16 md:h-24">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Student Identity</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Registry Status</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRow key={i} className="border-slate-50"><TableCell colSpan={3} className="px-8 py-8 md:py-12"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>)
              ) : filteredAspirants.map((aspirant: any) => {
                 const pass = aspirant.pass;
                 const isActive = aspirant.passStatus === 'active';
                 return (
                  <TableRow key={aspirant.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                    <TableCell className="px-8 md:px-12 py-6 md:py-12">
                      <div className="flex items-center gap-4 md:gap-8">
                        <StudentAvatar profile={aspirant} className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl shadow-xl bg-slate-50 border-2 border-white" />
                        <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] text-base md:text-2xl leading-tight truncate">{aspirant.name}</p>
                          <p className="text-[10px] md:text-[12px] text-slate-400 font-bold mt-1.5 truncate lowercase tracking-tight">{aspirant.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-2">
                          <Badge className={cn("border-none px-4 py-1 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest shadow-sm", isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                             {isActive ? (aspirant.status || 'ELITE') : 'FREE HUB'}
                          </Badge>
                          {isActive && aspirant.passExpiresAt && (
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                               <Clock className="h-3 w-3" /> Exp: {new Date(aspirant.passExpiresAt).toLocaleDateString('en-GB')}
                            </p>
                          )}
                       </div>
                    </TableCell>
                    <TableCell className="text-right px-8 md:px-12">
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <button className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 flex items-center justify-center text-slate-400 transition-all shadow-sm active:scale-90"><MoreVertical className="h-5 w-5 md:h-6 md:w-6" /></button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-56 md:w-72 bg-white rounded-[2rem] p-3 md:p-5 shadow-5xl border border-slate-50 z-[2001]">
                            <DropdownMenuItem onClick={() => setGrantDialogUser(aspirant)} className="rounded-xl px-4 py-3 md:py-4 gap-4 focus:bg-primary/5 text-slate-600 focus:text-primary font-bold text-xs md:text-sm">
                               <Gem className="h-5 w-5" /> Grant Elite Pass
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50 my-2" />
                            <DropdownMenuItem onClick={async () => { if(confirm("Permanently delete profile?")) await deleteDoc(doc(db!, "users", aspirant.id)) }} className="rounded-xl px-4 py-3 md:py-4 gap-4 text-rose-500 focus:bg-rose-50 focus:text-rose-600 font-bold text-xs md:text-sm">
                               <Trash2 className="h-5 w-5" /> Delete Profile
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
         <DialogContent className="bg-white rounded-[2rem] md:rounded-[3rem] max-w-md w-[95vw] p-8 md:p-14 shadow-5xl text-left border-none">
            <div className="h-2 w-full bg-primary absolute top-0 left-0" />
            <DialogHeader className="text-center space-y-4 pt-4">
               <DialogTitle className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">Access Authority</DialogTitle>
               <DialogDescription className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">Modify preparation tier for {grantDialogUser?.name}.</DialogDescription>
            </DialogHeader>
            <div className="py-8 md:py-10 space-y-8">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Plan Selection</Label>
                  <select value={grantPlanId} onChange={e => setGrantPlanId(e.target.value)} className="w-full h-14 md:h-16 bg-slate-50 border-none rounded-2xl px-6 outline-none font-black text-[#0F172A] text-base shadow-inner appearance-none cursor-pointer">
                     <option value="" disabled>Select Pass</option>
                     {passes?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Validity (Days)</Label>
                  <Input type="number" value={grantDuration} onChange={e => setGrantDuration(e.target.value)} className="h-14 md:h-16 bg-slate-50 border-none rounded-2xl font-black text-xl md:text-3xl text-center text-primary shadow-inner" />
               </div>
            </div>
            <DialogFooter>
               <Button onClick={handleGrantPass} disabled={isProcessing} className="w-full bg-[#0F172A] hover:bg-black text-white h-14 md:h-18 rounded-full font-black uppercase tracking-[0.2em] text-xs border-none shadow-4xl active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize & Commit"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
