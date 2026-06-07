"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, MoreVertical, ShieldCheck, Trash2, Gift, Gem, RefreshCw, XCircle, User as UserIcon, Calendar, MapPin, Mail, Phone, GraduationCap, Unlock, Zap, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, doc, updateDoc, serverTimestamp, deleteDoc, addDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { cn } from "@/lib/utils"
import React from "react"

/**
 * @fileOverview Student Registry v14.0.
 * Fixed: Added missing Label, Input, and Loader2 imports.
 * Features: Manual Pass & Test Controls with Unlock Everything logic.
 */
export default function AspirantsManagement() {
  const db = useFirestore()
  const { user: admin } = useUser()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [grantDialogUser, setGrantDialogUser] = useState<any>(null)
  const [grantPlanId, setGrantPlanId] = useState("")
  const [grantDuration, setGrantDuration] = useState("30")
  const [selectedUser, setSelectedUser] = useState<any>(null)
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
    const days = parseInt(grantDuration) || 30
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)

    try {
       const userRef = doc(db, "users", grantDialogUser.id)
       await updateDoc(userRef, {
          status: grantPlanId,
          passExpiryDate: expiryDate.toISOString(),
          updatedAt: serverTimestamp()
       })

       await addDoc(collection(db, "subscriptions"), {
          userId: grantDialogUser.id,
          planId: grantPlanId,
          planName: selectedPass.name,
          status: 'active',
          startDate: serverTimestamp(),
          expiryDate: expiryDate.toISOString(),
          grantedBy: admin?.uid || "Admin",
          type: 'MANUAL_GRANT'
       })

       toast({ title: "Pass Granted", description: `Aspirant upgraded to ${selectedPass.name} for ${days} days.` })
       setGrantDialogUser(null)
    } catch (e: any) {
       toast({ variant: "destructive", title: "Grant Failed" })
    } finally {
       setIsProcessing(false)
    }
  }

  const handleUnlockEverything = async (userId: string) => {
    if (!db) return;
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1); // 1 year access

    try {
       await updateDoc(doc(db, "users", userId), {
          status: 'PREMIUM',
          passExpiryDate: expiry.toISOString(),
          updatedAt: serverTimestamp()
       });
       toast({ title: "Master Unlock Activated", description: "Aspirant now has access to every mock list." });
    } catch (e) {
       toast({ variant: "destructive", title: "Unlock Failed" });
    }
  }

  return (
    <div className="space-y-12 pb-20 text-[#0F172A] text-left">
      <div className="flex justify-between items-center px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Student List</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-primary uppercase tracking-tight">Student Hub</h1>
          <p className="text-slate-600 mt-1 font-medium">Monitoring {aspirants?.length || 0} student profiles and pass levels.</p>
        </div>
      </div>

      <Card className="border-none shadow-3xl rounded-[3rem] overflow-hidden bg-white mx-4">
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
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Student</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact & Target</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Status</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={4} className="p-10"><Skeleton className="h-16 w-full rounded-2xl" /></TableCell></TableRow>)
              ) : filteredAspirants.map((aspirant: any) => (
                <TableRow key={aspirant.id} className="border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedUser(aspirant)}>
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
                    <div className="space-y-1 text-left">
                       <p className="text-xs font-bold text-slate-700">{aspirant.phone || 'NO_PHONE'}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{aspirant.targetExam || 'NO_TARGET'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("border-none px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm", aspirant.status === 'Free' ? "bg-slate-100 text-slate-500" : "bg-primary text-white")}>
                      {(aspirant.status || 'Free').toUpperCase()} PASS
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className="h-12 w-12 rounded-2xl hover:bg-white shadow-sm flex items-center justify-center opacity-30 group-hover:opacity-100 transition-all"><MoreVertical className="h-6 w-6" /></button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-64 bg-[#0F172A] border-white/10 text-white rounded-[2.5rem] p-4 shadow-5xl">
                          <DropdownMenuItem onClick={() => setGrantDialogUser(aspirant)} className="rounded-xl px-4 py-3 gap-3 focus:bg-primary/20 text-primary">
                             <Gem className="h-4 w-4" /> Grant Premium Pass
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUnlockEverything(aspirant.id)} className="rounded-xl px-4 py-3 gap-3 focus:bg-emerald-500/20 text-emerald-400">
                             <Unlock className="h-4 w-4" /> Pass Unlock Everything
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5 my-2" />
                          <DropdownMenuItem onClick={async () => { if(confirm("Permanently delete this student?")) await deleteDoc(doc(db!, "users", aspirant.id)) }} className="rounded-xl px-4 py-3 gap-3 text-rose-500">
                             <Trash2 className="h-4 w-4" /> Delete Profile
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* GRANT PASS DIALOG */}
      <Dialog open={!!grantDialogUser} onOpenChange={o => !o && setGrantDialogUser(null)}>
         <DialogContent className="bg-[#0F172A] text-white border-white/10 rounded-[3rem] max-w-md p-10 shadow-5xl">
            <DialogHeader className="text-center space-y-4">
               <DialogTitle className="text-2xl font-headline font-black uppercase text-primary">Manual Authorization</DialogTitle>
               <p className="text-slate-400 text-sm">Grant premium access to {grantDialogUser?.name}.</p>
            </DialogHeader>
            <div className="py-8 space-y-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Select Pass Tier</Label>
                  <select value={grantPlanId} onChange={e => setGrantPlanId(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 outline-none font-bold text-white">
                     <option value="" disabled className="bg-[#0F172A]">Select Pass</option>
                     {passes?.map((p: any) => <option key={p.id} value={p.id} className="bg-[#0F172A]">{p.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Access Duration (Days)</Label>
                  <Input type="number" value={grantDuration} onChange={e => setGrantDuration(e.target.value)} className="h-14 bg-white/5 border border-white/10 rounded-2xl font-black text-xl text-center" />
               </div>
            </div>
            <DialogFooter>
               <Button onClick={handleGrantPass} disabled={isProcessing} className="w-full bg-primary hover:bg-orange-600 h-14 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-2xl">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize Pass Access"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* STUDENT AUDIT DIALOG */}
      <Dialog open={!!selectedUser} onOpenChange={o => !o && setSelectedUser(null)}>
         <DialogContent className="sm:max-w-xl rounded-[3rem] bg-white border-none shadow-4xl p-10 overflow-hidden text-left">
            <DialogHeader>
               <DialogTitle className="text-2xl font-headline font-black uppercase">Student Details</DialogTitle>
            </DialogHeader>
            <div className="py-10 space-y-8">
               <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-[2.5rem]">
                  <StudentAvatar profile={selectedUser} className="h-20 w-20 shadow-xl" />
                  <div>
                     <h2 className="text-2xl font-black text-[#0F172A] uppercase">{selectedUser?.name}</h2>
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedUser?.status} PASS</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <AuditData label="EMAIL" val={selectedUser?.email} />
                  <AuditData label="CONTACT" val={selectedUser?.phone || "Pending"} />
                  <AuditData label="BIRTH DATE" val={selectedUser?.dob || "Pending"} />
                  <AuditData label="TARGET BOARD" val={selectedUser?.targetExam} />
                  <AuditData label="HOME ADDRESS" val={selectedUser?.address || "No address saved"} colSpan={2} />
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function AuditData({ label, val, colSpan = 1 }: any) {
   return (
      <div className={cn("space-y-1.5 text-left", colSpan > 1 ? "col-span-2" : "")}>
         <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">{label}</p>
         <p className="text-sm font-bold text-[#0F172A] leading-relaxed uppercase">{val}</p>
      </div>
   )
}
