"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  ShieldCheck, 
  Trash2, 
  Gem, 
  User as UserIcon, 
  Clock, 
  Zap, 
  Loader2, 
  X, 
  AlertCircle, 
  Filter,
  Eye,
  GraduationCap,
  Mail,
  Smartphone,
  CheckCircle2,
  Users,
  Activity,
  History,
  MoreVertical,
  ChevronRight,
  Globe
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, doc, updateDoc, serverTimestamp, deleteDoc, onSnapshot, where, limit, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AdminPageHeader, AdminSearchInput, AdminTableSkeleton } from "@/components/admin"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * @fileOverview Institutional Aspirant Dashboard v4.2 [Real-Time Presence Fix].
 * FIXED: "Online Now" strictly calculated using 5-minute heartbeat threshold.
 */

export default function StudentManagementHub() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [membershipFilter, setMembershipFilter] = useState("all")
  const [providerFilter, setProviderFilter] = useState("all")
  const [onlineFilter, setOnlineFilter] = useState("all")

  // Real-time listener for the entire users collection
  const usersQuery = useMemo(() => (db ? collection(db, 'users') : null), [db])
  const { data: aspirants, loading } = useCollection<any>(usersQuery)

  const stats = useMemo(() => {
    if (!aspirants) return { total: 0, active: 0, google: 0, email: 0, pro: 0, newToday: 0, online: 0 }
    const now = Date.now()
    const today = new Date().setHours(0,0,0,0)
    const presenceThreshold = 300000; // 5 minutes
    
    return aspirants.reduce((acc, a) => {
      acc.total++
      if (a.status !== 'SUSPENDED') acc.active++
      if (a.providerId === 'google.com' || a.email?.includes('gmail')) acc.google++
      else acc.email++
      if (a.passStatus === 'active') acc.pro++
      
      const created = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime()
      if (created >= today) acc.newToday++

      // Hardened Presence Check: online flag + lastSeen window
      const lastSeen = a.lastSeen?.seconds ? a.lastSeen.seconds * 1000 : 0
      const isActuallyOnline = a.online === true && (now - lastSeen < presenceThreshold);
      if (isActuallyOnline) acc.online++
      
      return acc
    }, { total: 0, active: 0, google: 0, email: 0, pro: 0, newToday: 0, online: 0 })
  }, [aspirants])

  const filteredAspirants = useMemo(() => {
    if (!aspirants) return []
    const now = Date.now()
    const presenceThreshold = 300000;

    return aspirants.filter((a: any) => {
      const search = searchTerm.toLowerCase().trim()
      const matchesSearch = !search || 
        a.name?.toLowerCase().includes(search) || 
        a.email?.toLowerCase().includes(search) || 
        a.id?.toLowerCase().includes(search) ||
        a.phone?.includes(search)

      const matchesStatus = statusFilter === 'all' || a.status === statusFilter
      const matchesMembership = membershipFilter === 'all' || 
        (membershipFilter === 'PRO' ? a.passStatus === 'active' : a.passStatus !== 'active')
      const matchesProvider = providerFilter === 'all' || 
        (providerFilter === 'GOOGLE' ? (a.providerId === 'google.com' || a.email?.includes('gmail')) : (a.providerId !== 'google.com' && !a.email?.includes('gmail')))
      
      const isActuallyOnline = a.online === true && (a.lastSeen?.seconds && now - a.lastSeen.seconds * 1000 < presenceThreshold);
      const matchesOnline = onlineFilter === 'all' || (onlineFilter === 'ONLINE' ? isActuallyOnline : !isActuallyOnline)

      return matchesSearch && matchesStatus && matchesMembership && matchesProvider && matchesOnline
    }).sort((a, b) => {
       const tA = a.createdAt?.seconds || 0
       const tB = b.createdAt?.seconds || 0
       return tB - tA
    })
  }, [aspirants, searchTerm, statusFilter, membershipFilter, providerFilter, onlineFilter])

  const handleStatusChange = async (uid: string, newStatus: string) => {
     if (!db) return;
     try {
        await updateDoc(doc(db, "users", uid), { status: newStatus, updatedAt: serverTimestamp() });
        toast({ title: "Registry updated", description: `Account set to ${newStatus}.` });
     } catch (e) { toast({ variant: "destructive", title: "Action failed" }); }
  }

  const handleDelete = async (uid: string, name: string) => {
     if (!db || !confirm(`Permanently purge ${name}'s preparation data?`)) return;
     try {
        await deleteDoc(doc(db, "users", uid));
        toast({ title: "Profile purged" });
     } catch (e) { toast({ variant: "destructive", title: "Action failed" }); }
  }

  return (
    <div className="space-y-6 md:space-y-10 text-left pb-32 animate-in fade-in duration-700 pt-2 px-1 w-full max-w-full">
      <AdminPageHeader
        icon={GraduationCap}
        label="Institutional Aspirant Hub"
        title="Student Manager"
        subtitle="Complete governance of student profiles, analytics and access tiers."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 px-1">
         <MetricMiniCard label="Total students" value={stats.total} icon={<Users />} color="text-blue-600" bg="bg-blue-50" />
         <MetricMiniCard label="Online now" value={stats.online} icon={<Activity />} color="text-emerald-600" bg="bg-emerald-50" highlight={stats.online > 0} />
         <MetricMiniCard label="Pro members" value={stats.pro} icon={<Gem />} color="text-amber-600" bg="bg-amber-50" />
         <MetricMiniCard label="New today" value={stats.newToday} icon={<Zap />} color="text-primary" bg="bg-primary/10" />
         <MetricMiniCard label="Google nodes" value={stats.google} icon={<Globe />} color="text-blue-500" bg="bg-slate-50" />
         <MetricMiniCard label="Email nodes" value={stats.email} icon={<Mail />} color="text-slate-500" bg="bg-slate-50" />
      </div>

      <Card className="border-none shadow-xl rounded-2xl md:rounded-[2.5rem] bg-white border border-slate-50 p-6 md:p-10 space-y-6">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FilterNode label="Status" value={statusFilter} onChange={setStatusFilter} options={[{label: 'Active', val: 'ACTIVE'}, {label: 'Suspended', val: 'SUSPENDED'}]} />
            <FilterNode label="Membership" value={membershipFilter} onChange={setMembershipFilter} options={[{label: 'Pro', val: 'PRO'}, {label: 'Free', val: 'FREE'}]} />
            <FilterNode label="Online" value={onlineFilter} onChange={setOnlineFilter} options={[{label: 'Online', val: 'ONLINE'}, {label: 'Offline', val: 'OFFLINE'}]} />
            <FilterNode label="Provider" value={providerFilter} onChange={setProviderFilter} options={[{label: 'Google', val: 'GOOGLE'}, {label: 'Email', val: 'EMAIL'}]} />
         </div>
         <AdminSearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search by name, email, UID or phone..." />
      </Card>

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white border border-slate-50 mx-1 w-full overflow-hidden">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <CardContent className="p-0">
            <Table className="min-w-[1000px] w-full">
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100 h-16 md:h-20">
                  <TableHead className="px-6 md:px-10 text-[9px] font-black uppercase text-slate-400">Aspirant identity</TableHead>
                  <TableHead className="text-[9px] font-black uppercase text-slate-400">UID node</TableHead>
                  <TableHead className="text-[9px] font-black uppercase text-slate-400 text-center">Membership</TableHead>
                  <TableHead className="text-[9px] font-black uppercase text-slate-400 text-center">Last active</TableHead>
                  <TableHead className="text-right px-6 md:px-10 text-[9px] font-black uppercase text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <AdminTableSkeleton rows={10} columns={5} />
                ) : filteredAspirants.map((a: any) => {
                   const now = Date.now();
                   const isActuallyOnline = a.online === true && (a.lastSeen?.seconds && now - a.lastSeen.seconds * 1000 < 300000);
                   return (
                    <TableRow key={a.id} className="border-slate-50 hover:bg-slate-50 transition-all group">
                      <TableCell className="px-6 md:px-10 py-5">
                         <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                               <StudentAvatar profile={a} className="h-11 w-11 rounded-xl shadow-inner bg-slate-50" />
                               <div className={cn("absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white", isActuallyOnline ? "bg-emerald-500" : "bg-slate-300")} />
                            </div>
                            <div className="min-w-0 max-w-[200px]">
                               <p className="font-bold text-[#0F172A] text-sm md:text-base leading-tight truncate">{a.name}</p>
                               <p className="text-[9px] md:text-[11px] font-medium text-slate-400 mt-1 truncate lowercase">{a.email}</p>
                            </div>
                         </div>
                      </TableCell>
                      <TableCell>
                         <code className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded truncate block max-w-[120px]">
                            {a.id}
                         </code>
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge className={cn("border-none text-[8px] font-black uppercase px-2 py-0.5 shadow-sm", a.passStatus === 'active' ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400")}>
                          {a.passStatus === 'active' ? (a.status || 'PRO') : 'FREE'}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                         <div className="flex flex-col items-center">
                            {isActuallyOnline ? (
                               <span className="text-[10px] font-black text-emerald-600 uppercase">🟢 Online</span>
                            ) : (
                               <>
                                  <span className="text-[10px] md:text-[12px] font-black text-[#0F172A] tabular-nums">
                                     {a.lastSeen ? new Date(a.lastSeen.seconds * 1000).toLocaleDateString('en-GB') : '---'}
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter mt-1">
                                     {a.lastSeen ? new Date(a.lastSeen.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                  </span>
                               </>
                            )}
                         </div>
                      </TableCell>
                      <TableCell className="text-right px-6 md:px-10">
                         <div className="flex justify-end gap-2">
                            <Button asChild size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-white shadow-sm border border-slate-100 text-primary hover:bg-primary/10">
                               <Link href={`/admin/users/${a.id}`}><Eye className="h-4 w-4" /></Link>
                            </Button>
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-slate-100 bg-white"><MoreVertical className="h-4 w-4 text-slate-400" /></Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 z-[1101]">
                                  <DropdownMenuItem onClick={() => handleStatusChange(a.id, a.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')} className="rounded-xl px-3 py-2.5 font-bold text-xs gap-3">
                                     {a.status === 'SUSPENDED' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500" />}
                                     {a.status === 'SUSPENDED' ? 'Enable account' : 'Disable account'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDelete(a.id, a.name)} className="rounded-xl px-3 py-2.5 font-bold text-xs gap-3 text-rose-500 focus:text-rose-600 focus:bg-rose-50">
                                     <Trash2 className="h-4 w-4" /> Purge profile
                                  </DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                      </TableCell>
                    </TableRow>
                   )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </div>
      </Card>
    </div>
  )
}

function MetricMiniCard({ label, value, icon, color, bg, highlight }: any) {
  return (
    <Card className={cn("border border-slate-100 shadow-sm rounded-2xl p-4 md:p-5 flex flex-col items-center justify-center text-center gap-2 group transition-all duration-300", highlight && "ring-2 ring-primary/10 bg-primary/5")}>
       <div className={cn("h-8 w-8 md:h-10 md:w-10 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform", bg, color)}>
          {React.cloneElement(icon, { className: "h-4 w-4 md:h-5 md:w-5" })}
       </div>
       <div className="space-y-0.5 min-w-0 w-full">
          <p className="text-lg md:text-2xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none">{value}</p>
          <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-tight truncate">{label}</p>
       </div>
    </Card>
  )
}

function FilterNode({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-1 text-left">
       <label className="text-[9px] font-black text-slate-400 ml-1 uppercase">{label}</label>
       <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-10 bg-slate-50 border-none rounded-xl px-3 font-bold text-xs outline-none shadow-inner cursor-pointer appearance-none">
          <option value="all">All {label}s</option>
          {options.map((o: any) => <option key={o.val} value={o.val}>{o.label}</option>)}
       </select>
    </div>
  )
}