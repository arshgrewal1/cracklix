
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

export default function AspirantsManagement() {
  const db = useFirestore()
  const { profile: currentProfile } = useUser()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  
  const usersQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, 'users'), orderBy('createdAt', 'desc'))
  }, [db])

  const { data: aspirants, loading } = useCollection<any>(usersQuery)

  const filteredAspirants = useMemo(() => {
    if (!aspirants) return []
    return aspirants.filter(a => 
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [aspirants, searchTerm])

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (currentProfile?.role !== 'SUPER_ADMIN') {
      toast({ variant: "destructive", title: "Access Denied", description: "Only Super Admins can modify permissions." })
      return
    }
    await updateDoc(doc(db, "users", userId), { role: newRole })
    toast({ title: "Permissions Updated", description: `User role changed to ${newRole}.` })
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-center">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Aspirant Database Control</span>
           </div>
          <h1 className="text-4xl font-headline font-black text-primary uppercase tracking-tight">Student Registry</h1>
          <p className="text-muted-foreground mt-1">Manage institutional access for {aspirants?.length || 0} registered aspirants.</p>
        </div>
        <div className="flex gap-4">
           <Button className="bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold gap-2 px-8">
             <UserPlus className="h-5 w-5" /> Register Manual
           </Button>
        </div>
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-3xl rounded-[3rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5 bg-muted/20">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-[45%]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="pl-14 h-14 rounded-2xl bg-background border-none shadow-inner" 
                placeholder="Search by name, email or geographic node..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 rounded-xl border-white/5 h-11">
                <Filter className="h-4 w-4" /> All Punjab
              </Button>
              <Button variant="ghost" className="rounded-xl h-11 text-slate-400 font-bold">Export Registry</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-white/5 h-16">
                <TableHead className="px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Aspirant Node</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permissions</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                <TableHead className="text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5"><TableCell colSpan={5} className="px-10 py-5"><Skeleton className="h-12 w-full rounded-xl bg-white/5" /></TableCell></TableRow>
                ))
              ) : filteredAspirants.map((user: any) => (
                <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20 rounded-2xl">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} />
                        <AvatarFallback className="font-black text-xs bg-primary/10 text-primary">{user.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-100 text-base">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        {user.phone || 'N/A'}
                      </div>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{user.state || 'Punjab'} Node</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 border-none ${
                      user.role === 'SUPER_ADMIN' ? 'bg-rose-500/10 text-rose-500' : 
                      user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-slate-500/10 text-slate-500'
                    }`}>
                      {user.role || 'STUDENT'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.status === 'Pro' ? 'bg-emerald-500/10 text-emerald-500 border-none px-3' : 'bg-muted text-muted-foreground border-none px-3'}>
                      {user.status || 'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-10">
                    <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5"><MoreVertical className="h-5 w-5" /></Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-56 bg-[#0F172A] border-white/10 text-white rounded-2xl p-2">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Institutional Audit</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'STUDENT')} className="rounded-xl cursor-pointer font-bold focus:bg-white/5">Mark as Student</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'ADMIN')} className="rounded-xl cursor-pointer font-bold focus:bg-white/5">Promote to Content Admin</DropdownMenuItem>
                            {currentProfile?.role === 'SUPER_ADMIN' && (
                              <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'SUPER_ADMIN')} className="rounded-xl cursor-pointer font-bold text-rose-400 focus:bg-rose-500/10">Promote to System Lead</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem className="text-destructive font-bold rounded-xl cursor-pointer focus:bg-destructive/10 focus:text-destructive">
                               <Trash2 className="h-4 w-4 mr-2" /> Revoke Access
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
