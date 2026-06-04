
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreVertical, Mail, UserPlus, Filter, Phone, ShieldCheck, UserCog, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Institutional Aspirant Registry.
 * Management of student nodes and administrative permissions.
 * Fixed: High-contrast visibility for Name, Email, and Phone.
 */

export default function AspirantsManagement() {
  const db = useFirestore()
  const { user: currentUser, profile: currentProfile } = useUser()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  
  const usersQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, 'users'))
  }, [db])

  const { data: allAspirants, loading } = useCollection<any>(usersQuery)

  const aspirants = useMemo(() => {
    if (!allAspirants) return []
    return [...allAspirants].sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0
      const dateB = b.createdAt?.seconds || 0
      return dateB - dateA
    })
  }, [allAspirants])

  const filteredAspirants = useMemo(() => {
    if (!aspirants) return []
    return aspirants.filter(a => 
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone?.includes(searchTerm)
    )
  }, [aspirants, searchTerm])

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const isFounder = currentUser?.email === 'arshdeepgrewal1122@gmail.com';
    
    if (currentProfile?.role !== 'SUPER_ADMIN' && !isFounder) {
      toast({ 
        variant: "destructive", 
        title: "Access Denied", 
        description: "Only Super Admins can modify permissions." 
      })
      return
    }

    try {
      await updateDoc(doc(db!, "users", userId), { role: newRole })
      toast({ title: "Permissions Updated", description: `User role changed to ${newRole}.` })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Audit Failed", description: e.message })
    }
  }

  return (
    <div className="space-y-12 pb-20 text-[#0F172A]">
      <div className="flex justify-between items-center">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Aspirant Database Control</span>
           </div>
          <h1 className="text-4xl font-headline font-black text-primary uppercase tracking-tight">Student Registry</h1>
          <p className="text-slate-600 mt-1 font-medium">Manage institutional access for {aspirants?.length || 0} registered aspirants.</p>
        </div>
        <div className="flex gap-4">
           <Button className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-2xl shadow-primary/20">
             <UserPlus className="h-5 w-5" /> Register Manual
           </Button>
        </div>
      </div>

      <Card className="border-none shadow-3xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-[45%]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="pl-14 h-16 rounded-[1.5rem] bg-white border-slate-100 shadow-inner text-base font-medium" 
                placeholder="Search by name, email, phone or node..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 rounded-2xl border-slate-200 h-12 px-6 font-black uppercase text-[10px] tracking-widest bg-white shadow-sm">
                <Filter className="h-4 w-4" /> All Punjab
              </Button>
              <Button variant="ghost" className="rounded-2xl h-12 px-6 text-slate-400 font-black uppercase text-[10px] tracking-widest">Export Registry</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 text-left">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-20">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Aspirant Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Contact Hub</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Permissions</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50"><TableCell colSpan={5} className="px-10 py-6"><Skeleton className="h-16 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredAspirants.map((aspirant: any) => (
                <TableRow key={aspirant.id} className="border-slate-50 hover:bg-slate-50 transition-colors group">
                  <TableCell className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-14 w-14 border-2 border-primary/20 rounded-2xl shadow-sm">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${aspirant.id}`} />
                        <AvatarFallback className="font-black text-xs bg-primary/10 text-primary">{aspirant.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-black text-[#0F172A] text-lg uppercase tracking-tight leading-none">{aspirant.name}</p>
                        <p className="text-xs font-bold text-slate-500 lowercase mt-1">{aspirant.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner min-w-[160px]">
                      <div className="flex items-center gap-2 text-sm font-black text-[#0F172A]">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        {aspirant.phone || 'N/A'}
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{aspirant.state || 'Punjab'} Regional Node</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 border-none shadow-lg ${
                      aspirant.role === 'SUPER_ADMIN' ? 'bg-rose-50 text-rose-600' : 
                      aspirant.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {aspirant.role || 'STUDENT'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`border-none px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      aspirant.status === 'Pro' || aspirant.status === 'Gold' || aspirant.status === 'Premium' 
                        ? 'bg-emerald-50 text-emerald-600 shadow-emerald-500/10' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {aspirant.status || 'Free'} Plan
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white shadow-sm border border-transparent hover:border-slate-100"><MoreVertical className="h-6 w-6" /></Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-64 bg-[#0F172A] border-white/10 text-white rounded-[2rem] p-3 shadow-4xl">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 py-2">Institutional Audit</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5 mb-2" />
                            <DropdownMenuItem onClick={() => handleUpdateRole(aspirant.id, 'STUDENT')} className="rounded-xl cursor-pointer font-bold px-4 py-3 focus:bg-white/5">Mark as Student</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(aspirant.id, 'ADMIN')} className="rounded-xl cursor-pointer font-bold px-4 py-3 focus:bg-white/5">Promote to Content Admin</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(aspirant.id, 'SUPER_ADMIN')} className="rounded-xl cursor-pointer font-bold px-4 py-3 text-rose-400 focus:bg-rose-500/10">Promote to System Lead</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5 my-2" />
                            <DropdownMenuItem className="text-destructive font-bold rounded-xl cursor-pointer px-4 py-3 focus:bg-destructive/10 focus:text-destructive">
                               <Trash2 className="h-4 w-4 mr-3" /> Terminate Node
                            </DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
