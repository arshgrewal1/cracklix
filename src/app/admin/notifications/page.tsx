
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Send, AlertTriangle, ShieldCheck, Zap, TrendingUp, Bell } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors"

export default function AdminNotifications() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const noticeQuery = useMemo(() => (db ? query(collection(db, "notifications"), orderBy("createdAt", "desc")) : null), [db])
  const { data: notices, loading } = useCollection<any>(noticeQuery)

  const [editingNotice, setEditingNotice] = useState<any>(null)

  const handleSave = () => {
    if (!db || !editingNotice) return
    const noticeId = editingNotice.id || `notice-${Date.now()}`
    const noticeRef = doc(db, "notifications", noticeId)
    
    const payload = {
      ...editingNotice,
      id: noticeId,
      createdAt: editingNotice.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      time: editingNotice.time || "Just now"
    }

    setDoc(noticeRef, payload, { merge: true })
      .then(() => {
        toast({ title: "Broadcast Successful", description: "The notification is now live for all aspirants." })
        setEditingNotice(null)
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: noticeRef.path,
          operation: 'write',
          requestResourceData: payload,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const handleDelete = (id: string) => {
    if (!confirm("Permanently remove this broadcast?")) return
    const noticeRef = doc(db, "notifications", id)
    deleteDoc(noticeRef)
      .then(() => {
        toast({ title: "Broadcast Terminated", description: "Alert removed from all student feeds." })
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: noticeRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Official Alert Broadcast</span>
           </div>
          <h1 className="text-4xl font-black font-headline text-primary uppercase tracking-tight">Exam Gazette</h1>
          <p className="text-muted-foreground mt-1">Broadcast critical institutional updates about exams, results, and recruitments.</p>
        </div>
        <Button onClick={() => setEditingNotice({ title: "", message: "", category: "Recruitment", board: "PSSSB", time: "Just now", important: false })} className="bg-orange-50 hover:bg-orange-600 gap-2 h-12 px-8 rounded-xl font-bold shadow-xl shadow-orange-500/20">
          <Plus className="h-5 w-5" /> Deploy Alert
        </Button>
      </div>

      <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-white/5">
                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message Headline</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Board & Category</TableHead>
                <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4} className="px-8"><Skeleton className="h-14 w-full rounded-xl bg-white/5" /></TableCell></TableRow>
                ))
              ) : notices?.map((n: any) => (
                <TableRow key={n.id} className="hover:bg-white/5 group border-white/5 transition-all">
                  <TableCell className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-500">{n.time}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <p className="font-bold text-slate-100 leading-tight">{n.title}</p>
                         {n.important && <Badge className="bg-rose-500/10 text-rose-500 border-none text-[8px] font-black uppercase px-2 py-0">High Priority</Badge>}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 font-medium">{n.message}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col gap-1.5">
                        <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase w-fit rounded-lg">{n.board}</Badge>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{n.category}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-all">
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5" onClick={() => setEditingNotice(n)}>
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500" onClick={() => handleDelete(n.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingNotice} onOpenChange={(open) => !open && setEditingNotice(null)}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] bg-[#0F172A] text-white border-white/10 shadow-3xl">
          <DialogHeader className="px-2">
            <DialogTitle className="text-3xl font-black font-headline uppercase flex items-center gap-4">
               <div className="h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Send className="h-5 w-5 text-white" />
               </div>
               Alert Composition
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-8 px-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Notification Headline</Label>
              <Input value={editingNotice?.title || ""} onChange={e => setEditingNotice({...editingNotice, title: e.target.value})} className="bg-white/5 border-white/10 rounded-xl h-14 font-bold text-lg" placeholder="e.g. PSSSB Clerk Result Announced" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Detail Statement</Label>
              <Input value={editingNotice?.message || ""} onChange={e => setEditingNotice({...editingNotice, message: e.target.value})} className="bg-white/5 border-white/10 rounded-xl h-14" placeholder="Brief summary or action link..." />
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Recruitment Authority</Label>
                <select value={editingNotice?.board || "PSSSB"} onChange={e => setEditingNotice({...editingNotice, board: e.target.value})} className="w-full h-12 rounded-xl bg-white/5 border-white/10 text-white text-sm px-4 outline-none">
                  {["PSSSB", "PPSC", "Police", "Teaching", "High Court", "Institutional"].map(b => (
                    <option key={b} value={b} className="bg-[#0F172A]">{b}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Gazette Category</Label>
                <select value={editingNotice?.category || "Recruitment"} onChange={e => setEditingNotice({...editingNotice, category: e.target.value})} className="w-full h-12 rounded-xl bg-white/5 border-white/10 text-white text-sm px-4 outline-none">
                  {["Recruitment", "Admit Card", "Answer Key", "Result", "Notice"].map(c => (
                    <option key={c} value={c} className="bg-[#0F172A]">{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
               <div className="space-y-1">
                  <p className="font-black text-xs uppercase tracking-widest text-primary">High Priority Alert</p>
                  <p className="text-[10px] text-slate-500">Enable to show a "Crucial" badge and ping aspirants.</p>
               </div>
               <Switch 
                checked={editingNotice?.important || false} 
                onCheckedChange={val => setEditingNotice({...editingNotice, important: val})} 
               />
            </div>
          </div>
          <DialogFooter className="border-t border-white/5 pt-6 px-2 flex gap-3">
            <Button variant="ghost" onClick={() => setEditingNotice(null)} className="text-slate-400 hover:text-white rounded-xl">Cancel Broadcast</Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 px-10 font-bold rounded-xl shadow-2xl shadow-orange-900/40 h-12">
              <Send className="h-5 w-5 mr-3" /> Deploy Live
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
