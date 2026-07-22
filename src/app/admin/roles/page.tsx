"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ShieldCheck, 
  Users, 
  Search, 
  Settings2, 
  Trash2, 
  X,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Save,
  Lock
} from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, doc, updateDoc, serverTimestamp, orderBy, deleteDoc, limit } from "firebase/firestore"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { UserProfile, UserRole, UserStatus, UserPermissions } from "@/types"
import { INITIAL_PERMISSIONS, ADMIN_BASE_PERMISSIONS, isSuperAdmin } from "@/lib/permissions"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Role & Permission Governance Console v2.2.
 * FIXED: Resolved JSX syntax error (missing TableCell closing tag).
 */

export default function RoleManagementPage() {
  const db = useFirestore()
  const { profile: currentAdmin, user } = useUser()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // 1. Fetch Users Registry (Showing all to allow promotion)
  const usersQuery = useMemo(() => {
    if (!db) return null
    return query(
      collection(db, "users"), 
      limit(100)
    )
  }, [db])

  const { data: users, loading } = useCollection<UserProfile>(usersQuery as any)

  const filteredUsers = useMemo(() => {
    if (!users) return []
    return users.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  const handleUpdateUser = async () => {
    if (!db || !selectedUser || isSaving) return
    setIsSaving(true)
    try {
      const userRef = doc(db, "users", selectedUser.id)
      
      // Ensure permissions object exists
      const finalPermissions = selectedUser.permissions || INITIAL_PERMISSIONS;
      
      await updateDoc(userRef, {
        role: selectedUser.role,
        status: selectedUser.status,
        permissions: finalPermissions,
        updatedAt: serverTimestamp()
      })
      toast({ title: "Registry Synced", description: `${selectedUser.name}'s authority updated.` })
      setSelectedUser(null)
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async (id: string, name: string) => {
    if (!db || !confirm(`Permanently purge ${name} and all associated authority?`)) return
    await deleteDoc(doc(db, "users", id))
    toast({ title: "Authority Purged" })
  }

  const userIsSuper = isSuperAdmin(currentAdmin, user?.email);

  if (!userIsSuper) {
     return (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-6">
           <div className="h-20 w-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 shadow-inner">
              <ShieldAlert className="h-10 w-10" />
           </div>
           <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight uppercase">Access Blocked</h2>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">Only the primary Super Admin can manage institutional roles and permissions.</p>
           </div>
           <Button asChild variant="outline" className="rounded-full px-10">
              <Link href="/admin">Return to Dashboard</Link>
           </Button>
        </div>
     )
  }

  return (
    <div className="space-y-10 pb-32 text-left animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1.5">
           <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Governance</span>
           </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter antialiased uppercase">Role Manager</h1>
          <p className="text-slate-500 font-medium text-sm md:text-lg">Promote students to staff roles and manage granular permissions.</p>
        </div>
      </div>

      <div className="relative group px-1 max-w-2xl">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
         <Input 
           className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-100 shadow-xl text-base md:text-lg font-bold" 
           placeholder="Search students or staff by name/email..." 
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white mx-1 border border-slate-50">
        <CardContent className="p-0 text-left overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-16 md:h-24">
                <TableHead className="px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Identity Hub</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Role & Status</TableHead>
                <TableHead className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Authority Level</TableHead>
                <TableHead className="text-right px-8 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-12 py-8"><Skeleton className="h-12 w-full rounded-2xl bg-slate-50" /></TableCell></TableRow>
                ))
              ) : filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50 border-slate-100 transition-all group">
                  <TableCell className="px-8 md:px-12 py-6 md:py-10">
                     <div className="flex items-center gap-4 md:gap-6">
                        <StudentAvatar profile={u} className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl shadow-xl bg-slate-50 border-none" />
                        <div className="min-w-0">
                           <p className="font-bold text-[#0F172A] text-sm md:text-xl leading-tight truncate">{u.name}</p>
                           <p className="text-[9px] md:text-[11px] font-bold text-slate-400 mt-1.5 truncate">{u.email}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col gap-2">
                        <Badge className={cn(
                           "w-fit border-none text-[8px] font-black tracking-widest px-3 py-1 uppercase",
                           u.role === 'SUPER_ADMIN' ? "bg-rose-500 text-white" : 
                           u.role === 'STUDENT' ? "bg-slate-100 text-slate-500" : "bg-[#0F172A] text-white"
                        )}>{u.role}</Badge>
                        <div className="flex items-center gap-1.5">
                           <div className={cn("h-2 w-2 rounded-full", u.status === 'ACTIVE' ? "bg-emerald-500" : "bg-rose-500")} />
                           <span className="text-[9px] font-bold text-slate-500 uppercase">{u.status || 'ACTIVE'}</span>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                        {u.role === 'STUDENT' ? (
                           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Standard access</span>
                        ) : (
                           <>
                              {Object.entries(u.permissions || {}).filter(([_, v]) => v).slice(0, 4).map(([k]) => (
                                 <Badge key={k} variant="outline" className="text-[7px] font-bold border-slate-200 text-slate-400 uppercase">{k.replace(/([A-Z])/g, ' $1')}</Badge>
                              ))}
                              {Object.values(u.permissions || {}).filter(v => v).length > 4 && (
                                 <span className="text-[9px] font-bold text-primary">+{Object.values(u.permissions || {}).filter(v => v).length - 4} more</span>
                              )}
                           </>
                        )}
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-8 md:px-12">
                     <div className="flex justify-end gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-all">
                        <button onClick={() => setSelectedUser({...u, permissions: u.permissions || INITIAL_PERMISSIONS})} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"><Settings2 className="h-5 w-5" /></button>
                        {u.role !== 'SUPER_ADMIN' && user?.email?.toLowerCase() === u.email?.toLowerCase() ? null : u.role !== 'SUPER_ADMIN' && (
                           <button onClick={() => handleDeleteUser(u.id, u.name)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                        )}
                     </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center opacity-10 space-y-4">
                         <Users className="h-16 w-16 text-slate-400" />
                         <p className="font-black text-xl uppercase">No users found</p>
                      </div>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 2. PERMISSION EDITOR DIALOG */}
      <Dialog open={!!selectedUser} onOpenChange={o => !o && !isSaving && setSelectedUser(null)}>
         <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[95vh] bg-white rounded-3xl md:rounded-[3rem] border-none shadow-5xl p-0 overflow-hidden flex flex-col text-left">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-6 md:p-14 pb-4 shrink-0">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 md:gap-6">
                     <StudentAvatar profile={selectedUser} className="h-12 w-12 md:h-20 md:w-20 rounded-2xl md:rounded-3xl shadow-xl bg-slate-50" />
                     <div>
                        <DialogTitle className="text-xl md:text-4xl font-black text-[#0F172A] leading-none">{selectedUser?.name}</DialogTitle>
                        <p className="text-[10px] md:text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">{selectedUser?.email}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors"><X className="h-6 w-6 text-slate-400" /></button>
               </div>
            </DialogHeader>

            <div className="px-6 md:px-14 pb-10 space-y-10 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Assigned Role</Label>
                     <select 
                        disabled={selectedUser?.role === 'SUPER_ADMIN'}
                        value={selectedUser?.role} 
                        onChange={e => setSelectedUser({...selectedUser!, role: e.target.value as UserRole})}
                        className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-5 font-black text-sm outline-none shadow-inner cursor-pointer"
                     >
                        <option value="STUDENT">Student</option>
                        <option value="ADMIN">Administrator</option>
                        <option value="CONTENT_PARTNER">Content Partner</option>
                        <option value="EDITOR">Editor Hub</option>
                        <option value="REVIEWER">Internal Reviewer</option>
                        <option value="MODERATOR">Platform Moderator</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Account Lifecycle</Label>
                     <select 
                        disabled={selectedUser?.role === 'SUPER_ADMIN'}
                        value={selectedUser?.status} 
                        onChange={e => setSelectedUser({...selectedUser!, status: e.target.value as UserStatus})}
                        className="w-full h-12 md:h-14 bg-slate-50 border-none rounded-xl px-5 font-black text-sm outline-none shadow-inner cursor-pointer"
                     >
                        <option value="ACTIVE">System Online</option>
                        <option value="SUSPENDED">Suspended Hub</option>
                        <option value="DEACTIVATED">Deactivated</option>
                     </select>
                  </div>
               </div>

               <div className="space-y-8 pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                     <h4 className="text-[11px] md:text-sm font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                        <Lock className="h-4 w-4" /> Granular Permission Matrix
                     </h4>
                     <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => setSelectedUser({...selectedUser!, permissions: INITIAL_PERMISSIONS})}
                          className="text-[9px] font-black uppercase text-slate-400 hover:text-primary"
                        >Clear All</Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setSelectedUser({...selectedUser!, permissions: ADMIN_BASE_PERMISSIONS})}
                          className="text-[9px] font-black uppercase text-slate-400 hover:text-primary"
                        >Base Admin</Button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                     {Object.keys(INITIAL_PERMISSIONS).map((permKey) => (
                        <div key={permKey} className={cn(
                           "p-4 rounded-xl border flex items-center justify-between transition-all",
                           selectedUser?.permissions?.[permKey as keyof UserPermissions] ? "bg-blue-50 border-blue-100 shadow-sm" : "bg-slate-50 border-transparent opacity-60"
                        )}>
                           <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-tight leading-tight max-w-[140px]">
                              {permKey.replace(/([A-Z])/g, ' $1')}
                           </Label>
                           <Switch 
                              checked={selectedUser?.permissions?.[permKey as keyof UserPermissions] || false} 
                              onCheckedChange={val => setSelectedUser({
                                 ...selectedUser!,
                                 permissions: { ...selectedUser!.permissions, [permKey]: val }
                              })}
                           />
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <DialogFooter className="p-6 md:p-14 pt-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center shrink-0">
               <Button variant="ghost" onClick={() => setSelectedUser(null)} className="h-12 md:h-14 px-8 font-black uppercase text-[10px] text-slate-400">Discard Changes</Button>
               <Button onClick={handleUpdateUser} disabled={isSaving} className="bg-[#0F172A] hover:bg-black text-white h-12 md:h-16 px-12 md:px-24 rounded-full font-black uppercase text-[10px] md:text-[11px] tracking-widest flex-1 shadow-3xl transition-all active:scale-95 gap-3 border-none">
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Commit Authority Update
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted rounded", className)} />
}
