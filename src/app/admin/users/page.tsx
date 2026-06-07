
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical, ShieldCheck, Trash2, Gift, Gem, RefreshCw, XCircle, User as UserIcon, Calendar, MapPin, Mail, Phone, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore"
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
 * @fileOverview Institutional Student Registry v10.0.
 * Enhanced: Full visibility into aspirant personal details (Phone, DOB, Address) for Admin Audit.
 */
export default function AspirantsManagement() {
  const db = useFirestore()
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [grantDialogUser, setGrantDialogUser] = useState<any>(null)
  const [grantPlanId, setGrantPlanId] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const usersQuery = useMemo(() => (db ? query(collection(db, 'users')) : null), [db])
  const { data: aspirants, loading } = useCollection<any>(usersQuery)

  const passQuery = useMemo(() => (db ? collection(db, "passes") : null), [db])
  const { data: rawPasses } = useCollection<any>(passQuery)

  const passes = useMemo(() => {
    if (!rawPasses) return []
    return [...rawPasses].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }, [rawPasses])

  const filteredAspirants = useMemo(() => {
    if (!aspirants) return []
    return aspirants
      .filter(a => 
        (a.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (a.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [aspirants, searchTerm])

  const handleGrantPass = async () => {
    if (!grantDialogUser || !db || !grantPlanId) return
    const selectedPass = passes?.find(p => p.id === grantPlanId)
    if (!selectedPass) return

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + selectedPass.durationDays)

    try {
       await updateDoc(doc(db, "users", grantDialogUser.id), {
          status: grantPlanId,
          passExpiryDate: expiryDate.toISOString(),
          updatedAt: serverTimestamp()
       })
       toast({ title: "Pass Granted", description: `User upgraded to ${selectedPass.name}.` })
       setGrantDialogUser(null)
    } catch (e: any) {
       toast({ variant: "destructive", title: "Grant Failed" })
    }
  }

  const handleRevokePass = async (userId: string) => {
    if (!db) return
    if (!confirm("CRITICAL: Revoke access node for this student?")) return
    await updateDoc(doc(db, "users", userId), { status: 'Free', passExpiryDate: null })
    toast({ title: "Pass Revoked" })
  }

  return (
    <div className="space-y-12 pb-20 text-[#0F172A] text-left">
      <div className="flex justify-between items-center px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Aspirant Audit Control Hub</span>
           </div>
          <h1 className="text-5xl font-headline font-black text-primary uppercase tracking-tight">Student Registry</h1>
          <p className="text-slate-600 mt-1 font-medium">Monitoring {aspirants?.length || 0} institutional identity nodes with live data.</p>
        </div>
      </div>

      <Card className="border-none shadow-3xl rounded-[3rem] overflow-hidden bg-white mx-4">
        <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
          <div className="relative w-full md:w-[45%]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input className="pl-14 h-16 rounded-[1.5rem] bg-white border-none shadow-inner text-lg font-medium" placeholder="Search by Name, Email or Phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Identity Node</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact & DOB</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status & Address</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={4} className="p-10"><Skeleton className="h-16 w-full rounded-2xl" /></TableCell></TableRow>)
              ) : filteredAspirants.map((aspirant: any) => (
                <TableRow key={aspirant.id} className="border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedUser(aspirant)}>
                  <TableCell className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <StudentAvatar profile={aspirant} className="h-14 w-14 border-2 border-primary/20 rounded-2xl" />
                      <div className="min-w-0">
                        <p className="font-black text-[#0F172A] text-lg uppercase tracking-tight truncate">{aspirant.name}</p>
                        <p className="text-xs font-bold text-slate-400 lowercase truncate">{aspirant.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1.5 text-left">
                       <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-emerald-500" /> {aspirant.phone || 'NO_PHONE'}</p>
                       <p className="text-[11px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest"><Calendar className="h-3.5 w-3.5 text-blue-500" /> {aspirant.dob || 'NO_DOB'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2 text-left">
                       <Badge className={cn(
                         "border-none px-3 py-1 rounded-lg text-[8px] font-black uppercase w-fit shadow-sm",
                         aspirant.status === 'Free' ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-600"
                       )}>
                         {aspirant.status || 'Free'} PASS
                       </Badge>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[180px]"><MapPin className="h-2.5 w-2.5 inline mr-1 text-rose-500" /> {aspirant.address || 'NO_ADDRESS'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className="h-12 w-12 rounded-2xl hover:bg-white shadow-sm flex items-center justify-center opacity-30 group-hover:opacity-100 transition-all"><MoreVertical className="h-6 w-6" /></button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-64 bg-[#0F172A] border-white/10 text-white rounded-[2.5rem] p-4 shadow-5xl">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-500 mb-3 px-2">Authority Controls</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setGrantDialogUser(aspirant)} className="rounded-xl px-4 py-3 gap-3 focus:bg-primary/20 text-primary">
                             <Gem className="h-4 w-4" /> Grant Premium Access
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRevokePass(aspirant.id)} className="rounded-xl px-4 py-3 gap-3 text-amber-400">
                             <XCircle className="h-4 w-4" /> Downgrade to Free
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5 my-2" />
                          <DropdownMenuItem onClick={async () => { if(confirm("Permanently purge this student identity?")) await deleteDoc(doc(db!, "users", aspirant.id)) }} className="rounded-xl px-4 py-3 gap-3 text-rose-500">
                             <Trash2 className="h-4 w-4" /> Purge Global Node
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

      {/* DETAILED AUDIT DIALOG */}
      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
         <DialogContent className="sm:max-w-xl rounded-[3rem] bg-white border-none shadow-4xl p-0 overflow-hidden text-left">
            <div className="h-2 w-full bg-[#0F172A]" />
            <DialogHeader className="p-10 pb-6">
               <DialogTitle className="text-3xl font-black font-headline uppercase text-[#0F172A]">Aspirant Profile Audit</DialogTitle>
            </DialogHeader>
            <div className="p-10 pt-0 space-y-10">
               <div className="flex items-center gap-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                  <StudentAvatar profile={selectedUser} className="h-24 w-24 border-4 border-white shadow-xl" />
                  <div className="space-y-1">
                     <h2 className="text-2xl font-black text-[#0F172A] uppercase leading-tight">{selectedUser?.name}</h2>
                     <Badge className="bg-primary text-white border-none font-black text-[9px] px-3 py-1 rounded-lg uppercase tracking-widest">{selectedUser?.status} ACCESS NODE</Badge>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AuditData icon={<Mail />} label="AUTHENTICATION EMAIL" val={selectedUser?.email} />
                  <AuditData icon={<Phone />} label="VERIFIED CONTACT HUB" val={selectedUser?.phone || "Pending Sync"} />
                  <AuditData icon={<Calendar />} label="OFFICIAL DATE OF BIRTH" val={selectedUser?.dob || "Pending Audit"} />
                  <AuditData icon={<GraduationCap />} label="PRIMARY TARGET BOARD" val={selectedUser?.targetExam} />
                  <AuditData icon={<MapPin />} label="FULL CORRESPONDENCE ADDRESS" val={selectedUser?.address || "No residential address node synced"} colSpan={2} />
               </div>
            </div>
            <DialogFooter className="p-10 pt-4 bg-slate-50">
               <Button onClick={() => setSelectedUser(null)} className="w-full h-14 bg-[#0F172A] hover:bg-black rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl">Close Registry Audit</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Dialog open={!!grantDialogUser} onOpenChange={(open) => !open && setGrantDialogUser(null)}>
         <DialogContent className="bg-[#0F172A] text-white border-white/10 rounded-[3rem] max-w-md p-10 shadow-5xl">
            <DialogHeader className="text-center space-y-4">
               <DialogTitle className="text-2xl font-headline font-black uppercase text-primary">Grant Pass Node</DialogTitle>
            </DialogHeader>
            <div className="py-8 space-y-6">
               <select value={grantPlanId} onChange={e => setGrantPlanId(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 outline-none font-bold text-white">
                  <option value="" disabled className="bg-[#0F172A]">Select Monetization Pass</option>
                  {passes?.map((p: any) => <option key={p.id} value={p.id} className="bg-[#0F172A]">{p.name} (₹{p.price})</option>)}
               </select>
            </div>
            <DialogFooter><Button onClick={handleGrantPass} className="w-full bg-primary hover:bg-orange-600 h-14 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-2xl">Activate Registry Access</Button></DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function AuditData({ icon, label, val, colSpan = 1 }: any) {
   return (
      <div className={cn("space-y-2 text-left", colSpan > 1 ? "md:col-span-2" : "")}>
         <div className="flex items-center gap-2 text-slate-400">
            {React.cloneElement(icon, { className: "h-3.5 w-3.5" })}
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">{label}</span>
         </div>
         <p className="text-sm font-bold text-[#0F172A] uppercase leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-sm break-words">{val}</p>
      </div>
   )
}
